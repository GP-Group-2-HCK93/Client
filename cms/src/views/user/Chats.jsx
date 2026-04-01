import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { url } from "../../constants/url";
import { ThemeContext } from "../../context/theme.jsx";
import { useTranslation } from "react-i18next"; // ADDED: i18n

export default function Chats() {
  const [chatRooms, setChatRooms] = useState([]);
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation(); // ADDED: i18n

  const token = localStorage.getItem("access_token");
  let currentRole = "User";
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      currentRole = payload.role || "User";
    }
  } catch {
    currentRole = "User";
  }

  const isDoctor = String(currentRole).toLowerCase() === "doctor";

  const fetchChatRooms = async () => {
    try {
      const { data } = await axios.get(`${url}/chats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      console.log(data);
      setChatRooms(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchChatRooms();
  }, []);

  const handleOpenChat = (chatRoomId) => {
    navigate(`/chatRooms/${chatRoomId}`);
  };

  const visibleChatRooms = [...chatRooms]
    .filter((room) => room.status === "Accepted" || room.status === "Closed")
    .sort((a, b) => {
      const rank = { Accepted: 0, Closed: 1 };
      return (rank[a.status] ?? 99) - (rank[b.status] ?? 99);
    });

  return (
    <div
      className="min-h-screen bg-base-200 text-base-content p-6"
      data-theme={theme}
    >
      {/* MODIFIED: Enhanced header with gradient text */}
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-2">
          {t("chats")}
        </h1>
        <p className="text-base-content/50 text-sm mb-8">
          {visibleChatRooms.length} {visibleChatRooms.length === 1 ? "conversation" : "conversations"}
        </p>
      </div>

      {visibleChatRooms.length === 0 ? (
        // MODIFIED: Enhanced empty state
        <div className="text-center text-gray-500 py-16 max-w-5xl mx-auto">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-base-100 border border-base-300 flex items-center justify-center">
            <svg className="w-10 h-10 text-base-content/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-lg font-medium">{t("noChats")}</p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleChatRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => handleOpenChat(room.id)}
              // MODIFIED: Enhanced card with hover effects and gradient accent
              className="group bg-base-100 rounded-xl border border-base-300 shadow-sm hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* ADDED: Status color bar at top */}
              <div className={`h-1 ${room.status === "Accepted" ? "bg-gradient-to-r from-emerald-400 to-teal-400" : "bg-gray-400/30"}`} />

              <div className="p-5">
                {/* Profile Section - MODIFIED: Enhanced avatar */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    {(isDoctor ? room?.User?.profilePic : room?.Doctor?.User?.profilePic) ? (
                      <img
                        src={isDoctor ? room?.User?.profilePic : room?.Doctor?.User?.profilePic}
                        alt={isDoctor ? room?.User?.name : room?.Doctor?.User?.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/20"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {(isDoctor ? room?.User?.name : room?.Doctor?.User?.name || "U").charAt(0)}
                      </div>
                    )}
                    {/* ADDED: Status dot */}
                    {room.status === "Accepted" && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-base-100 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-base-content truncate">
                      {isDoctor ? room?.User?.name : room?.Doctor?.User?.name}
                    </h2>
                    <p className="text-sm text-base-content/50 truncate">
                      {isDoctor ? room?.User?.email : room?.Doctor?.User?.email}
                    </p>
                  </div>
                </div>

                {/* Doctor Info - MODIFIED: Cleaner layout */}
                <div className="border-t border-base-200 pt-3 space-y-1.5">
                  {isDoctor ? (
                    <p className="text-sm text-base-content/70">
                      <span className="font-medium">{t("patient")}</span>
                    </p>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          {room?.Doctor?.specialization}
                        </span>
                      </div>
                      <p className="text-xs text-base-content/50">
                        📍 {room?.Doctor?.location} • {room?.Doctor?.experience} yrs • ⭐ {room?.Doctor?.rating}
                      </p>
                    </>
                  )}
                </div>

                {/* Status Badge - MODIFIED: Enhanced design */}
                <div className="mt-4 pt-3 border-t border-base-200 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      room.status === "Accepted"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-gray-500/10 text-gray-500"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${room.status === "Accepted" ? "bg-emerald-500" : "bg-gray-400"}`} />
                    {room.status}
                  </span>
                  <p className="text-xs text-base-content/40">
                    {room.status === "Closed" ? t("historyOnly") : t("tapToOpen")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
