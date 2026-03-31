import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { url } from "../../constants/url";
import { getUserLocation } from "../../utils/geolocation";
import DoctorCard from "../../components/DoctorCard";
import Toastify from "toastify-js";
import { socket } from "../../lib/socket";

const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export default function Home() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [showBookingStatus, setShowBookingStatus] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [complaint, setComplaint] = useState("");
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [recommendationMeta, setRecommendationMeta] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchDoctors = useCallback(async ({ showLoader = false } = {}) => {
    if (showLoader) setLoading(true);
    try {
      const { data } = await axios.get(`${url}/doctors`, {
        params: { _t: Date.now() },
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      const latestDoctors = [...data].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      setDoctors(latestDoctors);
    } catch (error) {
      Toastify({
        text: "Gagal mengambil data dokter",
        duration: 3000,
        style: { background: "#FF0000" },
      }).showToast();
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get(`${url}/bookings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
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
    fetchDoctors({ showLoader: true });
    fetchBookings();
    fetchLocation();
  }, [fetchDoctors]);

  useEffect(() => {
    const handleFocus = () => fetchDoctors();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchDoctors();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    const intervalId = setInterval(() => {
      fetchDoctors();
    }, 15000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(intervalId);
    };
  }, [fetchDoctors]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const user = decodeToken(token);
    const username = user?.email || user?.name || `guest-${Date.now()}`;
    
    setCurrentUser(user);

    socket.auth = { username };
    if (!socket.connected) {
      socket.connect();
    }

    const onDoctorAvailability = (payload) => {
      const doctorId = Number(payload?.doctorId);
      if (!doctorId) return;

      if (payload?.isAvailable) {
        fetchDoctors();
        return;
      }

      setDoctors((prev) => prev.filter((doctor) => doctor.id !== doctorId));
    };

    socket.on("doctor/availability", onDoctorAvailability);

    return () => {
      socket.off("doctor/availability", onDoctorAvailability);
    };
  }, [fetchDoctors]);

  const handleBooking = async (doctor) => {
    // Check if user is trying to book themselves
    if (currentUser && currentUser.id === doctor.UserId) {
      Toastify({
        text: "Anda tidak bisa booking untuk diri sendiri",
        duration: 3000,
        style: { background: "#FF0000" },
      }).showToast();
      return;
    }
    setSelectedDoctor(doctor);
  };

  const confirmBooking = async () => {
    if (bookingLoading) return;
    try {
      setBookingLoading(true);
      await axios.post(
        `${url}/bookings`,
        { DoctorId: selectedDoctor.id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );
      Toastify({
        text: "Booking berhasil dikirim!",
        duration: 3000,
        style: { background: "#22c55e" },
      }).showToast();
      setSelectedDoctor(null);
      fetchBookings();
    } catch (error) {
      Toastify({
        text: error.response?.data?.message || "Booking gagal",
        duration: 3000,
        style: { background: "#FF0000" },
      }).showToast();
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

  const handleRecommendDoctor = async (e) => {
    e.preventDefault();
    try {
      if (!complaint.trim()) {
        throw new Error("Keluhan wajib diisi");
      }

      setRecommendationLoading(true);
      const { data } = await axios.post(
        `${url}/ai/recommend-doctor`,
        { complaint: complaint.trim() },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      setRecommendedDoctors(data.recommendations || []);
      setRecommendationMeta(data.aiResult || null);
      Toastify({
        text: "Rekomendasi dokter berhasil dibuat",
        duration: 2500,
        close: true,
        gravity: "top",
        position: "center",
        stopOnFocus: true,
        style: {
          background: "#16A34A",
        },
      }).showToast();
    } catch (error) {
      Toastify({
        text:
          error.response?.data?.message ||
          error.message ||
          "Gagal mendapatkan rekomendasi dokter",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "center",
        stopOnFocus: true,
        style: {
          background: "#FF0000",
        },
      }).showToast();
    } finally {
      setRecommendationLoading(false);
    }
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
        {/* <button
          className="btn btn-outline btn-sm"
          onClick={() => {
            fetchBookings();
            setShowBookingStatus(true);
          }}
        >
          My Bookings
        </button> */}
      </div>

      {/* Doctor List */}
      {loading ? (
        <div className="flex justify-center mt-20">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center mt-20 text-base-content/50">
          Tidak ada dokter yang tersedia saat ini.
        </div>
      ) : (
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onBooking={handleBooking}
              currentUserId={currentUser?.id}
            />
          ))}
        </div>
      )}

      <div className="max-w-5xl mx-auto mt-8">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">AI Rekomendasi Dokter</h2>
            <form className="space-y-3" onSubmit={handleRecommendDoctor}>
              <textarea
                className="textarea textarea-bordered w-full"
                rows={4}
                placeholder="Contoh: Saya sakit kepala 3 hari, mual, dan susah tidur."
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={recommendationLoading}
              >
                {recommendationLoading ? "Mencari..." : "Cari Dokter Cocok"}
              </button>
            </form>
            {recommendationMeta ? (
              <div className="mt-4 space-y-2 rounded-xl border border-base-300 p-3 text-sm">
                <p>
                  <span className="font-semibold">Ringkasan:</span>{" "}
                  {recommendationMeta.summary || "-"}
                </p>
                <p>
                  <span className="font-semibold">Confidence:</span>{" "}
                  {recommendationMeta.confidence || "-"}
                </p>
              </div>
            ) : null}

            {recommendedDoctors.length > 0 ? (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Dokter yang Direkomendasikan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendedDoctors.map((doctor) => (
                    <DoctorCard
                      key={`rec-${doctor.id}`}
                      doctor={doctor}
                      onBooking={handleBooking}
                      currentUserId={currentUser?.id}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Modal: Confirm Booking */}
      {selectedDoctor && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Konfirmasi Booking</h3>
            <p className="py-4">
              Apakah kamu yakin ingin booking dengan{" "}
              <span className="font-semibold">{selectedDoctor.User?.name}</span>
              ?
              <br />
              <span className="text-sm text-base-content/60">
                {selectedDoctor.specialization}
              </span>
            </p>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setSelectedDoctor(null)}
              >
                Batal
              </button>
              <button
                className="btn btn-primary"
                onClick={confirmBooking}
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Ya, Booking"
                )}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setSelectedDoctor(null)}
          ></div>
        </div>
      )}

      {/* Modal: Booking Status */}
      {showBookingStatus && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">My Bookings</h3>
            {bookings.length === 0 ? (
              <p className="text-base-content/50 text-center py-6">
                Belum ada booking.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-base-200 bg-base-100"
                  >
                    <div>
                      <p className="font-semibold">
                        {booking.Doctor?.User?.name}
                      </p>
                      <p className="text-sm text-base-content/60">
                        {booking.Doctor?.specialization}
                      </p>
                    </div>
                    <span className={`badge ${getStatusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowBookingStatus(false)}
              >
                Tutup
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setShowBookingStatus(false)}
          ></div>
        </div>
      )}
    </div>
  );
}
