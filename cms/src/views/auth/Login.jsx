import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import Toastify from "toastify-js";
import axios from "axios";
import { url } from "../../constants/url";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${url}/login`, { email, password });

      localStorage.setItem("access_token", data.access_token);

      navigate("/");
    } catch (error) {
      Toastify({
        text: error.response.data.message,
        duration: 3000,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "center", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "#FF0000",
        },
      }).showToast();
    }
  };
  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <form onSubmit={handleSubmit}>
          <fieldset className="fieldset w-xs rounded-box border border-black p-4 shadow-sm">
            <h1 className="mb-3 text-center text-lg font-semibold">Login</h1>
            <label className="label">Email</label>
            <input
              type="email"
              className="input border-black bg-white focus:outline-none"
              placeholder="Email"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <label className="label">Password</label>
            <input
              type="password"
              className="input border-black bg-white focus:outline-none"
              placeholder="Password"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
            <button className="btn btn-neutral mt-4">Login</button>
          </fieldset>
        </form>

        <div className="mt-4">
          <h1>
            Don't have account?{" "}
            <NavLink to="/register">
              <span className="text-cyan-500">Create an account</span>{" "}
            </NavLink>
          </h1>
        </div>
      </div>
    </>
  );
}
