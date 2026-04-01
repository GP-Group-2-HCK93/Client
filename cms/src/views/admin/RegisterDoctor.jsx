import axios from "axios";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { url } from "../../constants/url";
import Toastify from "toastify-js";

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

      navigate("/");
    } catch (error) {
      Toastify({
        text: error.response?.data?.message,
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
      <form onSubmit={handleSubmit}>
        <div className="space-y-12 m-10">
          <div className="rounded-lg border border-black p-6 shadow-sm">
            <div>
              <h1 className="text-4xl font-semibold text-black flex justify-center">
                Add Doctor
              </h1>
            </div>
            <h2 className="text-base/7 font-semibold text-black">
              Personal Information
            </h2>
            <h4 className="font-extralight text-(--coastal-muted)">
              *required field
            </h4>
            <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label
                  htmlFor="ProfilePic"
                  className="block text-sm/6 font-medium text-black"
                >
                  Profile Picture
                </label>
                <div className="mt-2 rounded-md border border-dashed border-gray-400 p-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-base-300 bg-base-200 flex items-center justify-center">
                      {preview ? (
                        <img src={preview} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-8 h-8 text-base-content/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <label className="cursor-pointer">
                      <span className="rounded-md bg-cyan-400 px-3 py-2 text-sm font-semibold text-black shadow-xs inline-block">
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
                  className="block text-sm/6 font-medium text-black"
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
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-(--coastal-border) placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-(--coastal-primary) sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="email"
                  className="block text-sm/6 font-medium text-black"
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
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-(--coastal-border) placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-(--coastal-primary) sm:text-sm/6"
                  />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium text-black"
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
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-(--coastal-border) placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-(--coastal-primary) sm:text-sm/6"
                  />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="specialization"
                  className="block text-sm/6 font-medium text-black"
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
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-(--coastal-border) placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-(--coastal-primary) sm:text-sm/6"
                  />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="experience"
                  className="block text-sm/6 font-medium text-black"
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
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-(--coastal-border) placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-(--coastal-primary) sm:text-sm/6"
                  />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="bio"
                  className="block text-sm/6 font-medium text-black"
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
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-(--coastal-border) placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-(--coastal-primary) sm:text-sm/6"
                  />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="location"
                  className="block text-sm/6 font-medium text-black"
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
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-(--coastal-border) placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-(--coastal-primary) sm:text-sm/6"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between gap-x-6">
              <NavLink
                to="/"
                className="rounded-md bg-cyan-400 px-3 py-2 text-sm font-semibold text-black shadow-xs cursor-pointer"
              >
                Back
              </NavLink>
              <button
                type="submit"
                className="rounded-md bg-cyan-400 px-3 py-2 text-sm font-semibold text-black shadow-xs cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
