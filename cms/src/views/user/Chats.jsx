import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { url } from "../../constants/url";

export default function Chats() {
  const [chatRooms, setChatRooms] = useState([]);
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Chats</h1>

      {chatRooms.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg">No chats yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chatRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => handleOpenChat(room.id)}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-4"
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
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {(isDoctor
                      ? room?.User?.name
                      : room?.Doctor?.User?.name || "U"
                    ).charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-800">
                    {isDoctor ? room?.User?.name : room?.Doctor?.User?.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {isDoctor ? room?.User?.email : room?.Doctor?.User?.email}
                  </p>
                </div>
              </div>

              {/* Doctor Info */}
              <div className="border-t border-gray-200 pt-4">
                {isDoctor ? (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Role:</span> Patient
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-semibold">Specialization:</span>{" "}
                      {room?.Doctor?.specialization}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-semibold">Experience:</span>{" "}
                      {room?.Doctor?.experience} years
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-semibold">Location:</span>{" "}
                      {room?.Doctor?.location}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Rating:</span>{" "}
                      <span className="text-yellow-500">
                        ⭐ {room?.Doctor?.rating}
                      </span>
                    </p>
                  </>
                )}
              </div>

              {/* Status Badge */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    room.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {room.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
