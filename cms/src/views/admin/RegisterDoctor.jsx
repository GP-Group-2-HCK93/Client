import axios from "axios";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { url } from "../../constants/url";
import popupToast from "../../components/PopupToast"; // MODIFIED: replaced Toastify with PopupToast

export default function RegisterDoctor() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
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
    e.preventDefault(); // harus dihandle karena terdapat refresh page ketika submit.
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("name", name);
      formData.append("password", password);
      formData.append("specialization", specialization);
      formData.append("experience", experience);
      formData.append("bio", bio);
      formData.append("location", location);

      if (profilePic) {
        formData.append("profilePic", profilePic);
      }

      await axios.post(`${url}/doctor-register`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      popupToast({ text: "Doctor added successfully", type: "success" });
      navigate("/");
    } catch (error) {
      popupToast({
        text: error.response?.data?.message || "Failed to add doctor",
        type: "error",
      });
    }
  };
  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="min-h-[calc(100vh-4rem)] bg-base-200 py-8 px-4 md:px-8"
      >
        <div className="space-y-8">
          <div className="rounded-2xl border border-base-200 bg-base-100 p-6 md:p-8 shadow-md max-w-5xl mx-auto overflow-hidden">
            {/* ADDED: Gradient accent bar */}
            <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 -mt-6 -mx-6 md:-mt-8 md:-mx-8 mb-6" />
            <div>
              <h1 className="text-4xl font-bold text-base-content flex justify-center bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                {/* MODIFIED: gradient text */}
                Add Doctor
              </h1>
            </div>
            <h2 className="text-base/7 font-semibold text-base-content mt-6">
              Personal Information
            </h2>
            <h4 className="font-extralight text-base-content/60">
              *required field
            </h4>
            <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label
                  htmlFor="profilePic"
                  className="block text-sm/6 font-medium text-base-content"
                >
                  Profile Picture
                </label>
                <div className="mt-2 rounded-xl border border-dashed border-base-300 bg-base-200/60 p-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-base-300 bg-base-200 flex items-center justify-center">
                      {preview ? (
                        <img
                          src={preview}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg
                          className="w-8 h-8 text-base-content/30"
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
                      <span className="btn btn-primary btn-sm">
                        {preview ? "Change Photo" : "Upload Photo"}
                      </span>
                      <input
                        id="profilePic"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="name"
                  className="block text-sm/6 font-medium text-base-content"
                >
                  Name*
                </label>
                <div className="mt-2">
                  <input
                    id="name"
                    type="text"
                    required
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                    className="input input-bordered w-full bg-base-100"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="email"
                  className="block text-sm/6 font-medium text-base-content"
                >
                  Email Address*
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    type="email"
                    required
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    className="input input-bordered w-full bg-base-100"
                  />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium text-base-content"
                >
                  Password*
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    type="password"
                    required
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    className="input input-bordered w-full bg-base-100"
                  />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="specialization"
                  className="block text-sm/6 font-medium text-base-content"
                >
                  Specialization*
                </label>
                <div className="mt-2">
                  <input
                    id="specialization"
                    type="text"
                    required
                    onChange={(e) => {
                      setSpecialization(e.target.value);
                    }}
                    className="input input-bordered w-full bg-base-100"
                  />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="experience"
                  className="block text-sm/6 font-medium text-base-content"
                >
                  Experience*
                </label>
                <div className="mt-2">
                  <input
                    id="experience"
                    type="number"
                    required
                    onChange={(e) => {
                      setExperience(e.target.value);
                    }}
                    className="input input-bordered w-full bg-base-100"
                  />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="bio"
                  className="block text-sm/6 font-medium text-base-content"
                >
                  Bio*
                </label>
                <div className="mt-2">
                  <input
                    id="bio"
                    type="text"
                    required
                    onChange={(e) => {
                      setBio(e.target.value);
                    }}
                    className="input input-bordered w-full bg-base-100"
                  />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="location"
                  className="block text-sm/6 font-medium text-base-content"
                >
                  Location*
                </label>
                <div className="mt-2">
                  <input
                    id="location"
                    type="text"
                    required
                    onChange={(e) => {
                      setLocation(e.target.value);
                    }}
                    className="input input-bordered w-full bg-base-100"
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between gap-x-4">
              <NavLink to="/" className="btn btn-ghost border border-base-300">
                Back
              </NavLink>
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
