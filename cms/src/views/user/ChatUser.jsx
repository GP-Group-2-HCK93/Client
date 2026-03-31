import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { socket } from "../../lib/socket";

export default function ChatUser() {
  const [messageSent, setMessageSent] = useState("");
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  const username =
    localStorage.getItem("username") ||
    localStorage.getItem("name") ||
    localStorage.getItem("email");

  function handleSubmit(e) {
    e.preventDefault();
    const msg = messageSent.trim();
    if (!msg) return;
    if (!socket.connected) return;

    socket.emit("msg/sent", msg);
    setMessageSent("");
  }

  useEffect(() => {
    if (!username) {
      navigate("/chat-user", { replace: true });
      return;
    }

    socket.auth = { username };

    const onConnectError = (err) => {
      console.error("Socket connection error:", err.message);
    };

    const onMessage = (payload) => {
      if (!payload?.msg) return;
      setMessages((prev) => [...prev, payload]);
    };

    socket.on("connect_error", onConnectError);
    socket.on("msg/all", onMessage);

    if (!socket.connected) socket.connect();

    return () => {
      socket.off("connect_error", onConnectError);
      socket.off("msg/all", onMessage);
      socket.disconnect();
    };
  }, [navigate, username]);

  return (
    <div className="flex flex-col items-center justify-center w-screen min-h-screen bg-base-200 text-gray-800 p-10">
      <div className="flex flex-col grow w-full max-w-xl bg-base-100 shadow-xl rounded-lg overflow-hidden">
        <div className="flex flex-col grow h-0 p-4 overflow-auto">
          {messages.map((el, idx) => (
            <div
              className={`chat ${el.from === username ? "chat-end" : "chat-start"} flex flex-col`}
              key={idx}
            >
              <div>{el.from === username ? "You" : el.from}</div>
              <div className="chat-bubble chat-bubble-accent">{el.msg}</div>
            </div>
          ))}
        </div>

        <form className="bg-accent p-4 flex flex-row" onSubmit={handleSubmit}>
          <input
            value={messageSent}
            onChange={(e) => setMessageSent(e.target.value)}
            className="flex items-center w-full rounded px-3"
            type="text"
            placeholder="Type your message…"
          />
          <button className="btn btn-base-100 ml-4" type="submit">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
