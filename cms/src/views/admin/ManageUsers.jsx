import { useEffect, useState } from 'react';
import axios from 'axios';
import { url } from '../../constants/url';
import { NavLink } from 'react-router';
import popupToast from "../../components/PopupToast"; // MODIFIED: replaced Toastify with PopupToast
import { useTranslation } from 'react-i18next'; // ADDED: i18n

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation(); // ADDED: i18n

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${url}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      setUsers(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(`${url}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      popupToast({ text: data.message, type: "success" });

      fetchUsers();
    } catch (error) {
      popupToast({ text: error.response?.data?.message || 'Failed to delete user', type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <>
      {/* MODIFIED: Enhanced admin layout */}
      <div className="max-w-6xl mx-auto p-6 md:p-10">
        {/* Tab Navigation */}
        <div className="tabs tabs-bordered mb-6">
          <NavLink to="/admin/doctors" className="tab">
            {t("manageDoctors")}
          </NavLink>
          <NavLink to="/admin/users" className="tab tab-active">
            {t("manageUsers")}
          </NavLink>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">{t("manageUsers")}</h1>{/* MODIFIED: gradient text */}
        </div>

        <div className="overflow-x-auto rounded-lg border border-base-300">
          <table className="table table-zebra">
            <thead>
              <tr className="bg-base-200">
                <th>No</th>
                <th>Profile</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="avatar">
                        <div className="w-10 rounded-full">
                          <img
                            src={
                              user.profilePic ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`
                            }
                            alt={user.name}
                          />
                        </div>
                      </div>
                    </td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={`badge ${
                          user.role === 'Admin'
                            ? 'badge-error'
                            : user.role === 'Doctor'
                              ? 'badge-info'
                              : 'badge-success'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="btn btn-sm btn-error"
                        disabled={user.role === 'Admin'}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
