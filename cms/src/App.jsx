import { Routes, Route, Navigate } from "react-router";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import Register from "./views/auth/Register";
import Login from "./views/auth/Login";
import RegisterDoctor from "./views/admin/RegisterDoctor";
import Home from "./views/user/Home";
import Dashboard from "./views/doctor/Dashboard";
import Chats from "./views/user/Chats";
import Bookings from "./views/user/BookingPage";
import BookingPage from "./views/user/BookingPage";
import ChatRoomPage from "./views/user/ChatRoomPage";
import ManageDoctors from './views/admin/ManageDoctors';
import ManageUsers from './views/admin/ManageUsers';
import EditProfile from './views/profile/EditProfile';
import { useContext } from "react";
import { ThemeContext } from "./context/theme.jsx";

function App() {
  const { theme } = useContext(ThemeContext);
  return (
    <div
      data-theme={theme}
    >
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/register" element={<Register />}></Route>
          <Route path="/login" element={<Login />}></Route>
        </Route>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />}></Route>
          <Route path="/doctor-register" element={<RegisterDoctor />}></Route>
          <Route path="/chats" element={<Chats />}></Route>
          <Route path="/doctors/dashboard" element={<Dashboard />}></Route>
          <Route path="/doctors/bookings" element={<Bookings />}></Route>
          <Route path="/booking/:doctorId" element={<BookingPage />} />
          <Route path="/chatRooms/:chatRoomId" element={<ChatRoomPage />} />
          <Route path="/edit-profile" element={<EditProfile />}></Route>
          <Route path="/admin" element={<Navigate to="/admin/doctors" />}></Route>
          <Route path="/admin/doctors" element={<ManageDoctors />} />
          <Route path="/admin/users" element={<ManageUsers />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
