import { useEffect, useState } from 'react';
import axios from 'axios';
import { url } from '../../constants/url';
import { NavLink } from 'react-router';
import Toastify from 'toastify-js';

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

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

      Toastify({
        text: data.message,
        duration: 3000,
        close: true,
        gravity: 'top',
        position: 'center',
        style: {
          background: '#22c55e',
        },
      }).showToast();

      fetchDoctors();
    } catch (error) {
      Toastify({
        text: error.response?.data?.message || 'Failed to delete doctor',
        duration: 3000,
        close: true,
        gravity: 'top',
        position: 'center',
        style: {
          background: '#FF0000',
        },
      }).showToast();
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
      <div className="m-10">
        {/* Tab Navigation */}
        <div className="tabs tabs-bordered mb-6">
          <NavLink to="/admin/doctors" className="tab tab-active">
            Manage Doctors
          </NavLink>
          <NavLink to="/admin/users" className="tab">
            Manage Users
          </NavLink>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">Manage Doctors</h1>
          <NavLink to="/doctor-register" className="btn btn-primary">
            + Add Doctor
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
