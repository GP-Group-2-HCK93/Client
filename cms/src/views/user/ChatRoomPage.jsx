import { useParams, useNavigate } from "react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { url } from "../../constants/url";
import { useTranslation } from "react-i18next"; // ADDED: i18n

export default function ChatRoomPage() {
  const { chatRoomId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(); // ADDED: i18n

  const [chatRoom, setChatRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rawMessages, setRawMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageSent, setMessageSent] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [opponentTyping, setOpponentTyping] = useState(false); // ADDED: typing indicator state

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null); // ADDED: auto-scroll ref
  const typingTimeoutRef = useRef(null); // ADDED: typing debounce ref

  const token = localStorage.getItem("access_token");

  const payload = useMemo(() => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return {};
    }
  }, [token]);

  const currentUserId = Number(
    payload.id || localStorage.getItem("userId") || 0,
  );
  const currentUserRole = payload.role || "User";
  const currentUserName = payload.name || payload.email || "You";
  const isDoctor = String(currentUserRole).toLowerCase() === "doctor";

  const getOpponentName = () => {
    if (!chatRoom) return "Unknown";
    return isDoctor
      ? chatRoom?.User?.name || "Patient"
      : chatRoom?.Doctor?.User?.name || "Doctor";
  };

  // ADDED: Get opponent avatar URL
  const getOpponentAvatar = () => {
    if (!chatRoom) return null;
    if (isDoctor) {
      return (
        chatRoom?.User?.profilePic ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(chatRoom?.User?.name || "U")}&background=6366f1&color=fff&bold=true&size=40`
      );
    }
    return (
      chatRoom?.Doctor?.User?.profilePic ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(chatRoom?.Doctor?.User?.name || "D")}&background=6366f1&color=fff&bold=true&size=40`
    );
  };

  // ADDED: Get current user avatar URL
  const getCurrentUserAvatar = () => {
    const name = currentUserName || "U";
    // return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&bold=true&size=40`;
    if (isDoctor) {
      return (
        chatRoom?.Doctor?.User?.profilePic ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(chatRoom?.Doctor?.User?.name || "D")}&background=6366f1&color=fff&bold=true&size=40`
      );
    } else {
      return (
        chatRoom?.User?.profilePic ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(chatRoom?.User?.name || "U")}&background=6366f1&color=fff&bold=true&size=40`
      );
    }
  };

  const statusRaw = String(chatRoom?.status || "").toLowerCase();
  const isClosed = statusRaw === "closed";
  const isAccepted = statusRaw === "accepted" || statusRaw === "approved";

  const normalizeMessage = (m) => {
    const senderId = Number(m.SenderId ?? m.senderId ?? 0);
    const senderRoleRaw = (m.senderRole ?? m.SenderRole ?? "").toString();
    const senderRole = senderRoleRaw.toLowerCase();
    const isCurrentDoctor = isDoctor;

    let isOwn;
    if (senderRole) {
      isOwn = isCurrentDoctor
        ? senderRole === "doctor"
        : senderRole !== "doctor";
    } else {
      isOwn = senderId === currentUserId;
    }

    if (!isOwn && senderId && currentUserId && senderId === currentUserId) {
      isOwn = true;
    }

    let senderName =
      m.senderName ||
      m.from ||
      (isOwn ? currentUserName : getOpponentName()) ||
      "Unknown";

    if (isOwn) senderName = currentUserName;

    return {
      id: m.id ?? `${senderId}-${m.createdAt ?? Date.now()}`,
      chatRoomId: String(m.ChatRoomId ?? m.chatRoomId ?? chatRoomId),
      senderId,
      senderRole,
      from: senderName,
      msg: m.message ?? m.msg ?? "",
      createdAt: m.createdAt ?? new Date().toISOString(),
      isOwn,
    };
  };

  const fetchChatRoom = async () => {
    const { data } = await axios.get(`${url}/chats/${chatRoomId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setChatRoom(data);
  };

  const fetchMessages = async () => {
    const { data } = await axios.get(`${url}/chats/${chatRoomId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRawMessages(Array.isArray(data) ? data : []);
  };

  const saveMessage = async (text) => {
    const { data } = await axios.post(
      `${url}/chats/${chatRoomId}/messages`,
      { message: text },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isClosed || !isAccepted) return;
    const text = messageSent.trim();
    if (!text) return;

    try {
      // ADDED: Stop typing indicator when sending
      if (socketRef.current) {
        socketRef.current.emit("typing:stop", {
          chatRoomId: String(chatRoomId),
        });
      }
      const saved = await saveMessage(text);
      setRawMessages((prev) => {
        const exists = prev.some((x) => String(x.id) === String(saved.id));
        return exists ? prev : [...prev, saved];
      });
      setMessageSent("");
    } catch (err) {
      console.error("Failed to save message:", err);
    }
  };

  // ADDED: Handle typing indicator emission
  const handleInputChange = (e) => {
    setMessageSent(e.target.value);

    if (socketRef.current && isAccepted && !isClosed) {
      socketRef.current.emit("typing:start", {
        chatRoomId: String(chatRoomId),
        userName: currentUserName,
      });

      // Clear existing timeout
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      // Stop typing after 2 seconds of no input
      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit("typing:stop", {
            chatRoomId: String(chatRoomId),
          });
        }
      }, 2000);
    }
  };

  // ADDED: Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, opponentTyping]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await Promise.all([fetchChatRoom(), fetchMessages()]);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [chatRoomId]);

  useEffect(() => {
    setMessages(rawMessages.map(normalizeMessage));
  }, [rawMessages, chatRoom, isDoctor, currentUserId, currentUserName]);

  useEffect(() => {
    if (!chatRoomId || isClosed) return;

    const socket = io(url, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      auth: {
        username: currentUserName,
        token,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("room:join", { chatRoomId: String(chatRoomId) });
    });

    socket.on("connect_error", (err) => {
      console.error("socket connect_error:", err.message);
      setIsConnected(false);
    });

    socket.on("disconnect", () => setIsConnected(false));

    socket.on("message:new", (payload) => {
      if (
        String(payload.ChatRoomId ?? payload.chatRoomId) !== String(chatRoomId)
      )
        return;
      setRawMessages((prev) => {
        const exists = prev.some((x) => String(x.id) === String(payload.id));
        return exists ? prev : [...prev, payload];
      });
      // ADDED: Clear typing indicator when message arrives
      setOpponentTyping(false);
    });

    // ADDED: Listen for typing events
    socket.on("typing:started", (data) => {
      if (data.chatRoomId === String(chatRoomId)) {
        setOpponentTyping(true);
      }
    });

    socket.on("typing:stopped", (data) => {
      if (data.chatRoomId === String(chatRoomId)) {
        setOpponentTyping(false);
      }
    });

    return () => {
      socket.emit("room:leave", { chatRoomId: String(chatRoomId) });
      socket.disconnect();
    };
  }, [chatRoomId, currentUserName, token, isClosed]);

  // ADDED: Format time for message timestamps
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-950">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 px-6 py-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-4 h-[calc(100vh-8rem)]">
        {/* MODIFIED: Enhanced header with gradient accent */}
        <div className="flex items-center gap-4 pb-4 border-b border-white/10">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-sm text-gray-400 hover:text-white"
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
            {/* MODIFIED: Avatar with online indicator */}
            <div className="relative">
              <img
                src={
                  !isDoctor
                    ? chatRoom?.Doctor?.User?.profilePic ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        chatRoom?.Doctor?.User?.name || "D",
                      )}&background=6366f1&color=fff&bold=true`
                    : chatRoom?.User?.profilePic ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        chatRoom?.User?.name || "U",
                      )}&background=6366f1&color=fff&bold=true`
                }
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30"
              />
              {/* ADDED: Online indicator */}
              {isConnected && !isClosed && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-gray-950 rounded-full" />
              )}
            </div>
            <div>
              <h1 className="text-white font-semibold">
                {!isDoctor
                  ? chatRoom?.Doctor?.User?.name
                  : chatRoom?.User?.name}
              </h1>
              <p className="text-gray-500 text-sm">
                {/* MODIFIED: Show typing indicator or subtitle */}
                {opponentTyping ? (
                  <span className="text-indigo-400 animate-pulse">
                    {getOpponentName()} {t("isTyping")}
                  </span>
                ) : !isDoctor ? (
                  chatRoom?.Doctor?.specialization
                ) : (
                  "Patient"
                )}
              </p>
            </div>
          </div>

          <span
            className={`ml-auto badge ${
              chatRoom?.status === "Accepted"
                ? "badge-success"
                : chatRoom?.status === "Pending"
                  ? "badge-warning"
                  : chatRoom?.status === "Rejected"
                    ? "badge-error"
                    : "badge-ghost"
            }`}
          >
            {chatRoom?.status}
          </span>
        </div>

        {/* MODIFIED: Enhanced message area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 bg-gray-900/50 rounded-xl p-4 border border-white/5">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p>{t("noMessages")}</p>
            </div>
          ) : (
            messages.map((m) => (
              // MODIFIED: Message bubbles with avatar icons (like FB/IG)
              <div
                key={m.id}
                className={`flex items-start gap-2 ${m.isOwn ? "justify-end" : "justify-start"}`}
              >
                {/* ADDED: Avatar for opponent (left side) */}
                {!m.isOwn && (
                  <img
                    src={getOpponentAvatar()}
                    alt={m.from}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 self-start mt-5"
                  />
                )}

                <div
                  className={`max-w-[78%] sm:max-w-[70%] min-w-0 ${m.isOwn ? "items-end" : "items-start"}`}
                >
                  {/* MODIFIED: Sender name */}
                  <p
                    className={`text-xs text-gray-500 mb-1 ${m.isOwn ? "text-right" : "text-left"}`}
                  >
                    {m.isOwn ? "You" : m.from}
                  </p>
                  {/* MODIFIED: Enhanced bubble styling */}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words [overflow-wrap:anywhere] ${
                      m.isOwn
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-md"
                        : "bg-gray-800 text-gray-100 rounded-bl-md border border-white/5"
                    }`}
                  >
                    {m.msg}
                  </div>
                  {/* ADDED: Timestamp */}
                  <p
                    className={`text-[10px] text-gray-600 mt-1 ${m.isOwn ? "text-right" : "text-left"}`}
                  >
                    {formatTime(m.createdAt)}
                  </p>
                </div>

                {/* ADDED: Avatar for current user (right side) */}
                {m.isOwn && (
                  <img
                    src={getCurrentUserAvatar()}
                    alt="You"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 self-start mt-5"
                  />
                )}
              </div>
            ))
          )}

          {/* ADDED: Typing indicator bubble */}
          {opponentTyping && (
            <div className="flex items-end gap-2 justify-start">
              <img
                src={getOpponentAvatar()}
                alt="typing"
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="bg-gray-800 border border-white/5 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5">
                  <span
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ADDED: Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {isClosed ? (
          <div className="alert bg-gray-800 border border-gray-700 text-gray-200">
            {t("chatClosed")}
          </div>
        ) : (
          // MODIFIED: Enhanced input area
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={messageSent}
              onChange={handleInputChange} // MODIFIED: Use new handler with typing indicator
              placeholder={t("typeMessage")}
              className="input input-bordered w-full bg-gray-800 text-white border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl transition-all"
            />
            <button
              type="submit"
              className={`btn rounded-xl ${isConnected && isAccepted ? "border-0 text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-md shadow-indigo-500/25" : "btn-disabled"}`}
              disabled={!isConnected || !isAccepted}
            >
              {t("send")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
