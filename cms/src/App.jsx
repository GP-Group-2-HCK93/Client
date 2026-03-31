import { Routes, Route } from "react-router";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import Register from "./views/auth/Register";
import Login from "./views/auth/Login";
import RegisterDoctor from "./views/admin/RegisterDoctor";
import Home from "./views/user/Home";
import BookingPage from "./views/user/BookingPage";
// import Chat from "./views/user/Chat";
import Chats from "./views/user/Chats";
import ChatRoomPage from "./views/user/ChatRoomPage";

function App() {
  return (
    <>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Route>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/doctor-register" element={<RegisterDoctor />}></Route>
          <Route path="/chats" element={<Chats />} />
          {/* <Route path="/chatRooms" element={<ChatRoomPage />} /> */}
          <Route path="/booking/:doctorId" element={<BookingPage />} />
          <Route path="/chatRooms/:chatRoomId" element={<ChatRoomPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
