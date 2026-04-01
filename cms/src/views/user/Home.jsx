import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { url } from "../../constants/url";
import { getUserLocation } from "../../utils/geolocation";
import DoctorCard from "../../components/DoctorCard";
import WelcomeOverlay from "../../components/WelcomeOverlay"; // ADDED: Welcome overlay
import popupToast from "../../components/PopupToast"; // MODIFIED: replaced Toastify with PopupToast
import { socket } from "../../lib/socket";
import { useTranslation } from "react-i18next"; // ADDED: i18n

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
  const [showWelcome, setShowWelcome] = useState(false); // ADDED: Welcome overlay state
  const { t } = useTranslation(); // ADDED: i18n

  // ADDED: Check if we should show welcome overlay (only after fresh login)
  useEffect(() => {
    const shouldShowWelcome = sessionStorage.getItem("showWelcome");
    if (shouldShowWelcome === "true") {
      setShowWelcome(true);
      sessionStorage.removeItem("showWelcome");
    }
  }, []);

  const fetchDoctors = useCallback(async ({ showLoader = false } = {}) => {
    if (showLoader) setLoading(true);
    try {
      const { data } = await axios.get(`${url}/doctors`, {
        params: { _t: Date.now() },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      const latestDoctors = [...data].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );
      setDoctors(latestDoctors);
    } catch (error) {
      popupToast({ text: "Gagal mengambil data dokter", type: "error" });
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
    if (currentUser && currentUser.id === doctor.UserId) {
      popupToast({
        text: "Anda tidak bisa booking untuk diri sendiri",
        type: "error",
      });
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
      popupToast({ text: t("bookingSuccess"), type: "success" });
      setSelectedDoctor(null);
      fetchBookings();
    } catch (error) {
      popupToast({
        text: error.response?.data?.message || "Booking gagal",
        type: "error",
      });
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
        },
      );

      setRecommendedDoctors(data.recommendations || []);
      setRecommendationMeta(data.aiResult || null);
      popupToast({
        text: "Rekomendasi dokter berhasil dibuat",
        type: "success",
      });
    } catch (error) {
      popupToast({
        text:
          error.response?.data?.message ||
          error.message ||
          "Gagal mendapatkan rekomendasi dokter",
        type: "error",
      });
    } finally {
      setRecommendationLoading(false);
    }
  };

  // ADDED: Get user name for welcome overlay
  const getUserName = () => {
    if (!currentUser) {
      const token = localStorage.getItem("access_token");
      const user = decodeToken(token);
      return user?.name || user?.email?.split("@")[0] || "User";
    }
    return currentUser?.name || currentUser?.email?.split("@")[0] || "User";
  };

  return (
    <div className="min-h-screen bg-base-200 px-6 py-8">
      {/* ADDED: Welcome Overlay */}
      {showWelcome && (
        <WelcomeOverlay
          userName={getUserName()}
          onComplete={() => setShowWelcome(false)}
        />
      )}

      {/* MODIFIED: Enhanced Header with gradient accent */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              {t("findDoctor")}
            </h1>
            <p className="text-base-content/60 text-sm mt-1">
              {location
                ? `📍 ${t("locationDetected")}: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                : `📍 ${t("fetchingLocation")}`}
            </p>
          </div>
          {/* ADDED: Doctor count badge */}
          {!loading && doctors.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-base-100 border border-base-300 shadow-sm">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-base-content/70">
                {doctors.length} {t("doctors").toLowerCase()}{" "}
                {t("available").toLowerCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Doctor List */}
      {loading ? (
        <div className="flex justify-center mt-20">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center mt-20 text-base-content/50">
          {t("noDoctorsAvailable")}
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

      {/* MODIFIED: Enhanced AI Recommendation section */}
      <div className="max-w-5xl mx-auto mt-8">
        <div className="card bg-base-100 shadow-md border border-base-200 overflow-hidden">
          {/* ADDED: Gradient accent bar */}
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <div className="card-body">
            <div className="flex items-center gap-3 mb-2">
              {/* ADDED: AI icon */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h2 className="card-title text-lg">{t("aiRecommendation")}</h2>
            </div>
            <form className="space-y-3" onSubmit={handleRecommendDoctor}>
              <textarea
                className="textarea textarea-bordered w-full focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                rows={4}
                placeholder={t("aiPlaceholder")}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
              />
              <button
                type="submit"
                className="btn border-0 text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-md shadow-indigo-500/25"
                disabled={recommendationLoading}
              >
                {recommendationLoading ? t("searching") : t("searchDoctor")}
              </button>
            </form>
            {recommendationMeta ? (
              <div className="mt-4 space-y-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-sm">
                <p>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {t("summary")}:
                  </span>{" "}
                  {recommendationMeta.summary || "-"}
                </p>
                <p>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {t("confidence")}:
                  </span>{" "}
                  {recommendationMeta.confidence || "-"}
                </p>
              </div>
            ) : null}

            {recommendedDoctors.length > 0 ? (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">
                  {t("recommendedDoctors")}
                </h3>
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

      {/* Modal: Confirm Booking - MODIFIED: Enhanced styling */}
      {selectedDoctor && (
        <div className="modal modal-open">
          <div className="modal-box border border-base-200">
            <h3 className="font-bold text-lg">{t("confirmBooking")}</h3>
            <p className="py-4">
              {t("confirmBookingMsg")}{" "}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {selectedDoctor.User?.name}
              </span>
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
                {t("cancel")}
              </button>
              <button
                className="btn border-0 text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                onClick={confirmBooking}
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  t("yesBook")
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
            <h3 className="font-bold text-lg mb-4">{t("myBookings")}</h3>
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
