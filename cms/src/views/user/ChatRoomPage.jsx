import { useParams, useNavigate } from "react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { url } from "../../constants/url";

export default function ChatRoomPage() {
  const { chatRoomId } = useParams();
  const navigate = useNavigate();

  const [chatRoom, setChatRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rawMessages, setRawMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageSent, setMessageSent] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef(null);

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
    });

    return () => {
      socket.emit("room:leave", { chatRoomId: String(chatRoomId) });
      socket.disconnect();
    };
  }, [chatRoomId, currentUserName, token, isClosed]);

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
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-sm text-gray-400 hover:text-white"
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
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
              className="w-9 h-9 rounded-full object-cover"
            />
            <div>
              <h1 className="text-white font-semibold">
                {!isDoctor
                  ? chatRoom?.Doctor?.User?.name
                  : chatRoom?.User?.name}
              </h1>
              <p className="text-gray-500 text-sm">
                {!isDoctor ? chatRoom?.Doctor?.specialization : "Patient"}
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

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 bg-gray-900 rounded-lg p-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`chat ${m.isOwn ? "chat-end" : "chat-start"}`}
              >
                <div className="chat-header text-xs text-gray-400 mb-1">
                  {m.isOwn ? "You" : m.from}
                </div>
                <div
                  className={`chat-bubble ${
                    m.isOwn
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-100"
                  }`}
                >
                  {m.msg}
                </div>
              </div>
            ))
          )}
        </div>

        {isClosed ? (
          <div className="alert bg-gray-800 border border-gray-700 text-gray-200">
            This chat is closed. You can only view chat history.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={messageSent}
              onChange={(e) => setMessageSent(e.target.value)}
              placeholder="Type a message..."
              className="input input-bordered w-full bg-gray-800 text-white border-gray-600"
            />
            <button
              type="submit"
              className={`btn ${isConnected && isAccepted ? "btn-primary" : "btn-disabled"}`}
              disabled={!isConnected || !isAccepted}
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
