import { useEffect, useState } from "react";
import axios from "axios";
import { url } from "../../constants/url";
import { getUserLocation } from "../../utils/geolocation";
import DoctorCard from "../../components/DoctorCard";
import Toastify from "toastify-js";

export default function Home() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [showBookingStatus, setShowBookingStatus] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchDoctors = async () => {
    try {
      const { data } = await axios.get(`${url}/doctors`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      setDoctors(data);
    } catch (error) {
      Toastify({ text: "Gagal mengambil data dokter", duration: 3000, style: { background: "#FF0000" } }).showToast();
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get(`${url}/chats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      setBookings(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchLocation = async () => {
    try {
      const loc = await getUserLocation();
      setLocation(loc);
    } catch (error) {
      console.log("Location access denied");
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchBookings();
    fetchLocation();
  }, []);

  const handleBooking = async (doctor) => {
    setSelectedDoctor(doctor);
  };

  const confirmBooking = async () => {
    try {
      setBookingLoading(true);
      await axios.post(
        `${url}/chats`,
        { DoctorId: selectedDoctor.id },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
      );
      Toastify({ text: "Booking berhasil dikirim!", duration: 3000, style: { background: "#22c55e" } }).showToast();
      setSelectedDoctor(null);
      fetchBookings();
    } catch (error) {
      Toastify({ text: error.response?.data?.message || "Booking gagal", duration: 3000, style: { background: "#FF0000" } }).showToast();
    } finally {
      setBookingLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      Pending: "badge-warning",
      Accepted: "badge-success",
      Rejected: "badge-error",
      Closed: "badge-ghost",
    };
    return map[status] || "badge-ghost";
  };

  return (
    <div className="min-h-screen bg-base-200 px-6 py-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Temukan Dokter</h1>
          <p className="text-base-content/60 text-sm mt-1">
            {location
              ? `📍 Lokasi terdeteksi: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
              : "📍 Mengambil lokasi..."}
          </p>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => { fetchBookings(); setShowBookingStatus(true); }}
        >
          My Bookings
        </button>
      </div>

      {/* Doctor List */}
      {loading ? (
        <div className="flex justify-center mt-20">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center mt-20 text-base-content/50">Tidak ada dokter yang tersedia saat ini.</div>
      ) : (
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} onBooking={handleBooking} />
          ))}
        </div>
      )}

      {/* Modal: Confirm Booking */}
      {selectedDoctor && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Konfirmasi Booking</h3>
            <p className="py-4">
              Apakah kamu yakin ingin booking dengan{" "}
              <span className="font-semibold">{selectedDoctor.User?.name}</span>?
              <br />
              <span className="text-sm text-base-content/60">{selectedDoctor.specialization}</span>
            </p>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setSelectedDoctor(null)}>Batal</button>
              <button className="btn btn-primary" onClick={confirmBooking} disabled={bookingLoading}>
                {bookingLoading ? <span className="loading loading-spinner loading-sm"></span> : "Ya, Booking"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setSelectedDoctor(null)}></div>
        </div>
      )}

      {/* Modal: Booking Status */}
      {showBookingStatus && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">My Bookings</h3>
            {bookings.length === 0 ? (
              <p className="text-base-content/50 text-center py-6">Belum ada booking.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 rounded-xl border border-base-200 bg-base-100">
                    <div>
                      <p className="font-semibold">{booking.Doctor?.User?.name}</p>
                      <p className="text-sm text-base-content/60">{booking.Doctor?.specialization}</p>
                    </div>
                    <span className={`badge ${getStatusBadge(booking.status)}`}>{booking.status}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowBookingStatus(false)}>Tutup</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowBookingStatus(false)}></div>
        </div>
      )}
    </div>
  );
}