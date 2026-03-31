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

      // Store user info for chat integration
      if (data.user) {
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("role", data.user.role);
      }

      navigate("/");
    } catch (error) {
      Toastify({
        text: error.response.data.message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "center",
        stopOnFocus: true,
        style: { background: "#FF0000" },
      }).showToast();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">MediNear</h1>
          <p className="text-base-content/50 text-sm mt-1">
            Your health, our priority
          </p>
        </div>

        <div className="bg-base-100 rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-6">
            Sign in to your account
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full focus:input-primary"
                placeholder="example@email.com"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
                type="password"
                className="input input-bordered w-full focus:input-primary"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full mt-2">
              Login
            </button>
          </form>

          <p className="text-center text-sm text-base-content/60 mt-6">
            Don't have an account?{" "}
            <NavLink
              to="/register"
              className="text-primary font-semibold hover:underline"
            >
              Create one
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}
