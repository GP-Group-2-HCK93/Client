import { Routes, Route } from "react-router";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import Register from "./views/auth/Register";
import Login from "./views/auth/Login";
import RegisterDoctor from "./views/admin/RegisterDoctor";
import Home from "./views/user/Home";
import Dashboard from "./views/doctor/Dashboard";

function App() {
  return <>
  <Routes>
    <Route element={<AuthLayout/>}>
      <Route path="/register" element={<Register/>}></Route>
      <Route path="/login" element={<Login/>}></Route>
    </Route>
    <Route element={<MainLayout/>}>
      <Route path="/" element={<Home/>}></Route>
      <Route path="/doctor-register" element={<RegisterDoctor/>}></Route>
      <Route path="/doctors/dashboard" element={<Dashboard/>}></Route>
    </Route>
  </Routes>
  </>;
}

export default App;
