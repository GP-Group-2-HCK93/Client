import { Routes, Route } from "react-router";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import Register from "./views/auth/Register";
import Login from "./views/auth/Login";
import RegisterDoctor from "./views/admin/RegisterDoctor";
import Home from "./views/user/Home";
import BookingPage from "./views/user/BookingPage";
import Chat from "./views/user/Chat";

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
          <Route path="/doctor-register" element={<RegisterDoctor />} />
          <Route path="/booking/:doctorId" element={<BookingPage />} />
          <Route path="/chat/:chatRoomId" element={<Chat />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;