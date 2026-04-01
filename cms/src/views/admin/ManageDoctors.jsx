import { useEffect, useState } from 'react';
import axios from 'axios';
import { url } from '../../constants/url';
import { NavLink } from 'react-router';
import popupToast from "../../components/PopupToast"; // MODIFIED: replaced Toastify with PopupToast
import { useTranslation } from 'react-i18next'; // ADDED: i18n

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation(); // ADDED: i18n

  const fetchDoctors = async () => {
    try {
      const { data } = await axios.get(`${url}/doctors`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      setDoctors(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(`${url}/doctors/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      popupToast({ text: data.message, type: "success" });

      fetchDoctors();
    } catch (error) {
      popupToast({ text: error.response?.data?.message || 'Failed to delete doctor', type: "error" });
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
      {/* MODIFIED: Enhanced admin layout with max-width and better spacing */}
      <div className="max-w-6xl mx-auto p-6 md:p-10">
        {/* Tab Navigation */}
        <div className="tabs tabs-bordered mb-6">
          <NavLink to="/admin/doctors" className="tab tab-active">
            {t("manageDoctors")}
          </NavLink>
          <NavLink to="/admin/users" className="tab">
            {t("manageUsers")}
          </NavLink>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">{t("manageDoctors")}</h1>{/* MODIFIED: gradient text */}
          <NavLink to="/doctor-register" className="btn border-0 text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-md shadow-indigo-500/25">{/* MODIFIED: gradient button */}
            {t("addDoctor")}
          </NavLink>
        </div>

        <div className="overflow-x-auto rounded-lg border border-base-300">
          <table className="table table-zebra">
            <thead>
              <tr className="bg-base-200">
                <th>No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Specialization</th>
                <th>Experience</th>
                <th>Location</th>
                <th>Available</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    No doctors found
                  </td>
                </tr>
              ) : (
                doctors.map((doctor, index) => (
                  <tr key={doctor.id}>
                    <td>{index + 1}</td>
                    <td>{doctor.User?.name}</td>
                    <td>{doctor.User?.email}</td>
                    <td>{doctor.specialization}</td>
                    <td>{doctor.experience} years</td>
                    <td>{doctor.location}</td>
                    <td>
                      <span
                        className={`badge ${doctor.isAvailable ? 'badge-success' : 'badge-error'}`}
                      >
                        {doctor.isAvailable ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>{doctor.rating}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(doctor.id)}
                        className="btn btn-sm btn-error"
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
