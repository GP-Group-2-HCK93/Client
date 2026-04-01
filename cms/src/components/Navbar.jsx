import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import axios from 'axios';
import { url } from '../constants/url';

const MediNearLogo = () => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="34" height="34" rx="10" fill="url(#grad)" />
    <defs>
      <linearGradient id="grad" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <path
      d="M17 8C12.03 8 8 12.03 8 17C8 21.97 12.03 26 17 26C21.97 26 26 21.97 26 17C26 12.03 21.97 8 17 8Z"
      fill="white"
      fillOpacity="0.15"
    />
    <path d="M17 11V23M11 17H23" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const user = decodeToken(token);
  const role = user?.role;
  const [profilePic, setProfilePic] = useState('');
  const canAccessDoctorArea = role === 'Doctor' || role === 'Admin';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`${url}/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        setProfilePic(data.profilePic || '');
      } catch {
        setProfilePic('');
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const avatarUrl =
    profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'User')}&background=6366f1&color=fff&bold=true`;

  return (
    <div className="sticky top-0 z-50 w-full border-b border-white/10 bg-gray-950/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Logo + Nav Links */}
        <div className="flex items-center gap-8">
          <NavLink to="/" className="flex items-center gap-2.5">
            <MediNearLogo />
            <span className="text-xl font-bold text-white tracking-tight">
              Medi<span className="text-indigo-400">Near</span>
            </span>
          </NavLink>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              Home
            </NavLink>
            {canAccessDoctorArea && (
              <NavLink
                to="/doctors/dashboard"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                Doctors
              </NavLink>
            )}
            <NavLink
              to="/doctors/bookings"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              My Bookings
            </NavLink>
            <NavLink
              to="/chats"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              Chats
            </NavLink>
          </nav>
        </div>

        {/* Right: Search + Avatar */}
        <div className="flex items-center gap-3">

          {/* Avatar Dropdown */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            >
              <img src={avatarUrl} alt="avatar" className="w-7 h-7 rounded-full" />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-white leading-none">
                  {user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{role || 'User'}</p>
              </div>
              <svg
                className="w-3.5 h-3.5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            <ul
              tabIndex={-1}
              className="dropdown-content mt-2 w-52 rounded-xl border border-white/10 bg-gray-900 shadow-xl p-1.5"
            >
              <li className="px-3 py-2 border-b border-white/10 mb-1 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">
                    {user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <NavLink
                  to="/edit-profile"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  ✏️
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                >
                  🏠 Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/doctor-register"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                >
                  🏠 Register Doctor
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/doctors/bookings"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                >
                  📋 My Bookings
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/chats"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                >
                  💬 Chats
                </NavLink>
              </li>
              {role === 'Admin' && (
                <li>
                  <NavLink
                    to="/admin"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all"
                  >
                    ⚙ Admin Dashboard
                  </NavLink>
                </li>
              )}
              <li className="mt-1 border-t border-white/10 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                >
                  🚪 Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
