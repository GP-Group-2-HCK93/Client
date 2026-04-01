import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { url } from "../../constants/url";
import { ThemeContext } from "../../context/theme.jsx";

export default function Chats() {
  const [chatRooms, setChatRooms] = useState([]);
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

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
      <h1 className="text-3xl font-bold mb-8">Chats</h1>

<<<<<<< HEAD
      {visibleChatRooms.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
=======
      {chatRooms.length === 0 ? (
        <div className="text-center text-base-content/60 py-12">
>>>>>>> a162e25 (chore:context)
          <p className="text-lg">No chats yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleChatRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => handleOpenChat(room.id)}
              className="bg-base-100 rounded-lg border border-base-300 shadow-sm hover:shadow-md transition-all cursor-pointer p-4"
            >
              {/* Profile Section */}
              <div className="flex items-center gap-4 mb-4">
                {(
                  isDoctor
                    ? room?.User?.profilePic
                    : room?.Doctor?.User?.profilePic
                ) ? (
                  <img
                    src={
                      isDoctor
                        ? room?.User?.profilePic
                        : room?.Doctor?.User?.profilePic
                    }
                    alt={isDoctor ? room?.User?.name : room?.Doctor?.User?.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-content font-bold">
                    {(isDoctor
                      ? room?.User?.name
                      : room?.Doctor?.User?.name || "U"
                    ).charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="font-semibold text-base-content">
                    {isDoctor ? room?.User?.name : room?.Doctor?.User?.name}
                  </h2>
                  <p className="text-sm text-base-content/60">
                    {isDoctor ? room?.User?.email : room?.Doctor?.User?.email}
                  </p>
                </div>
              </div>

              {/* Doctor Info */}
              <div className="border-t border-base-300 pt-4">
                {isDoctor ? (
                  <p className="text-sm text-base-content/80">
                    <span className="font-semibold">Role:</span> Patient
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-base-content/80 mb-2">
                      <span className="font-semibold">Specialization:</span>{" "}
                      {room?.Doctor?.specialization}
                    </p>
                    <p className="text-sm text-base-content/80 mb-2">
                      <span className="font-semibold">Experience:</span>{" "}
                      {room?.Doctor?.experience} years
                    </p>
                    <p className="text-sm text-base-content/80 mb-2">
                      <span className="font-semibold">Location:</span>{" "}
                      {room?.Doctor?.location}
                    </p>
                    <p className="text-sm text-base-content/80">
                      <span className="font-semibold">Rating:</span>{" "}
                      <span className="text-warning">
                        ⭐ {room?.Doctor?.rating}
                      </span>
                    </p>
                  </>
                )}
              </div>

              {/* Status Badge */}
              <div className="mt-4 pt-4 border-t border-base-300">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
<<<<<<< HEAD
                    room.status === "Accepted"
                      ? "bg-green-100 text-green-800"
                      : room.status === "Closed"
                      ? "bg-gray-300 text-gray-800"
                      : "bg-yellow-100 text-yellow-800"
=======
                    room.status === "Active"
                      ? "bg-success/20 text-success"
                      : "bg-warning/20 text-warning"
>>>>>>> a162e25 (chore:context)
                  }`}
                >
                  {room.status}
                </span>
                <p className="text-xs text-gray-500 mt-2">
                  {room.status === "Closed"
                    ? "History only - chat is closed"
                    : "Tap card to open chat"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
