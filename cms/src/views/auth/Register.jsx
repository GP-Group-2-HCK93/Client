import axios from "axios";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { url } from "../../constants/url";
import popupToast from "../../components/PopupToast"; // MODIFIED: replaced Toastify with PopupToast

export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePic(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("name", name);
      formData.append("password", password);
      if (profilePic) formData.append("profilePic", profilePic);

      await axios.post(`${url}/register`, formData);
      popupToast({ text: "Registration successful", type: "success" });
      navigate("/login");
    } catch (error) {
      popupToast({
        text: error.response?.data?.message || "Registration failed",
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
            New here? <br />
            <span className="text-indigo-400">Join MediNear</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed max-w-sm">
            Find the right doctor for you. Book a consultation and get the care
            you deserve — anytime, anywhere.
          </p>

          {/* Feature list */}
          <div className="space-y-3 pt-2">
            {[
              "Find verified doctors near you",
              "Book consultations instantly",
              "Chat with doctors in real-time",
              "AI-powered health recommendations",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5L4 7L8 3"
                      stroke="#818cf8"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-gray-400 text-sm">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="relative text-gray-600 text-sm">
          © 2026 MediNear. All rights reserved.
        </p>
      </div>

      {/* Kanan — Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-900 px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-sm space-y-6">
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
              Create your account
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Your health, our priority
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-700 bg-gray-800 flex items-center justify-center">
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-8 h-8 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </div>
              <label className="cursor-pointer">
                <span className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors border border-indigo-500/30 bg-indigo-500/10 rounded-lg px-3 py-1.5">
                  {preview ? "Change Photo" : "Upload Photo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                placeholder="John Doe"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email <span className="text-red-400">*</span>
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
                Password <span className="text-red-400">*</span>
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
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm shadow-lg shadow-indigo-600/25 mt-2"
            >
              Register
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <NavLink
              to="/login"
              className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
            >
              Sign in
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}
