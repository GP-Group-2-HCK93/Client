import axios from "axios";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { url } from "../../constants/url";
import Toastify from "toastify-js";

export default function RegisterDoctor() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // harus dihandle karena terdapat refresh page ketika submit.
    try {
      const { data } = await axios.post(`${url}/doctor-register`, {
        email,
        name,
        password,
        profilePic,
        specialization,
        experience,
        bio,
        location
      }, {headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
      }});

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
                  htmlFor="ProfilePic"
                  className="block text-sm/6 font-medium text-black"
                >
                  Profile Picture
                </label>
                <div className="mt-2">
                  <input
                    id="profilePic"
                    type="text"
                    onChange={(e) => {
                      setProfilePic(e.target.value);
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
