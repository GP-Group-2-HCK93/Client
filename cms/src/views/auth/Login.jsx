import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import popupToast from "../../components/PopupToast"; // MODIFIED: replaced Toastify with PopupToast
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

      sessionStorage.setItem("showWelcome", "true"); // ADDED: trigger welcome overlay
      navigate("/");
    } catch (error) {
      // MODIFIED: replaced Toastify with popupToast
      popupToast({
        text: error.response?.data?.message || "Login failed",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Kiri — Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gray-950 px-14 py-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path
                d="M11 4V18M4 11H18"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            Medi<span className="text-indigo-400">Near</span>
          </span>
        </div>

        {/* Center content */}
        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            <span className="text-indigo-300 text-sm font-medium">
              Your health, our priority
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Welcome back <br />
            <span className="text-indigo-400">MediNear</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed max-w-sm">
            Find the right doctor for you. Book a consultation and get the care
            you deserve — anytime, anywhere.
          </p>

          {/* Stats */}
          <div className="flex items-center gap-8 pt-4">
            <div>
              <p className="text-2xl font-bold text-white">500+</p>
              <p className="text-gray-500 text-sm">Doctors</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-white">10K+</p>
              <p className="text-gray-500 text-sm">Patients</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-white">4.9★</p>
              <p className="text-gray-500 text-sm">Rating</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <p className="relative text-gray-600 text-sm">
          © 2026 MediNear. All rights reserved.
        </p>
      </div>

      {/* Kanan — Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-900 px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                <path
                  d="M11 4V18M4 11H18"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">
              Medi<span className="text-indigo-400">Near</span>
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Sign in to your account
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Your health, our priority
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                placeholder="example@email.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm shadow-lg shadow-indigo-600/25"
            >
              Login
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <NavLink
              to="/register"
              className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
            >
              Create one
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}
