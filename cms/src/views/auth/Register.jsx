import axios from "axios";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { url } from "../../constants/url";
import Toastify from "toastify-js";

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
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("name", name);
      formData.append("password", password);

      if (profilePic) {
        formData.append("profilePic", profilePic);
      }

      await axios.post(`${url}/register`, formData);
      navigate("/login");
    } catch (error) {
      Toastify({
        text: error.response?.data?.message,
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
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">MediNear</h1>
          <p className="text-base-content/50 text-sm mt-1">Your health, our priority</p>
        </div>

        <div className="bg-base-100 rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-6">Create your account</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Profile Picture Upload */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Profile Picture</span>
              </label>
              <div className="flex flex-col items-center gap-3">
                {/* Preview */}
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-base-300 bg-base-200 flex items-center justify-center">
                  {preview ? (
                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-base-content/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                {/* Upload Button */}
                <label className="cursor-pointer">
                  <span className="btn btn-outline btn-sm">
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
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Full Name <span className="text-error">*</span></span>
              </label>
              <input
                type="text"
                required
                className="input input-bordered w-full focus:input-primary"
                placeholder="John Doe"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email <span className="text-error">*</span></span>
              </label>
              <input
                type="email"
                required
                className="input input-bordered w-full focus:input-primary"
                placeholder="example@email.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password <span className="text-error">*</span></span>
              </label>
              <input
                type="password"
                required
                className="input input-bordered w-full focus:input-primary"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary w-full mt-2">
              Register
            </button>
          </form>

          <p className="text-center text-sm text-base-content/60 mt-6">
            Already have an account?{" "}
            <NavLink to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}