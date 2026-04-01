import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import popupToast from "../../components/PopupToast"; // MODIFIED: replaced Toastify with PopupToast
import { url } from "../../constants/url";
import { useTranslation } from "react-i18next"; // ADDED: i18n

const HISTORY_ITEMS_PER_PAGE = 6;

const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

const formatDateTime = (dateValue) => {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function BookingPage() {
  const token = localStorage.getItem("access_token");
  const user = decodeToken(token);
  const isDoctor = user?.role === "Doctor";

  const [bookings, setBookings] = useState([]);
  const [handledBookings, setHandledBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingBookingId, setProcessingBookingId] = useState(null);
  const [ratingInputs, setRatingInputs] = useState({});
  const [ratingLoadingId, setRatingLoadingId] = useState(null);
  const [submittedRatings, setSubmittedRatings] = useState({});
  const [historyPage, setHistoryPage] = useState(1);
  const { t } = useTranslation(); // ADDED: i18n

  const dedupeDecisions = (normalizedDecisions) => {
    const seen = new Set();
    return normalizedDecisions.filter((booking) => {
      const decidedMinute = booking.decidedAt
        ? new Date(booking.decidedAt).toISOString().slice(0, 16)
        : "";
      const actorKey = booking.patientEmail || booking.doctorName || "unknown";
      const dedupeKey = `${booking.id}|${actorKey}|${booking.status}|${decidedMinute}`;
      if (seen.has(dedupeKey)) return false;
      seen.add(dedupeKey);
      return true;
    });
  };

  const fetchDoctorBookingData = async () => {
    const { data } = await axios.get(`${url}/doctors/bookings/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const normalizedBookings = (data.bookings || []).map((booking) => ({
      id: booking.id,
      patientName: booking.patient?.name || "Unknown Patient",
      patientEmail: booking.patient?.email || "-",
      requestedAt: booking.createdAt,
      status: booking.status,
    }));

    const normalizedDecisions = (data.recentDecisions || []).map((booking) => ({
      id: booking.id,
      patientName: booking.patient?.name || "Unknown Patient",
      patientEmail: booking.patient?.email || "-",
      requestedAt: booking.createdAt,
      decidedAt: booking.updatedAt,
      status: booking.status,
    }));

    setBookings(normalizedBookings);
    setHandledBookings(dedupeDecisions(normalizedDecisions));
  };

  const fetchUserBookingData = async () => {
    const { data } = await axios.get(`${url}/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const normalized = (data || []).map((booking) => ({
      id: booking.id,
      doctorName: booking.Doctor?.User?.name || "Unknown Doctor",
      doctorSpecialization: booking.Doctor?.specialization || "-",
      requestedAt: booking.createdAt,
      decidedAt: booking.updatedAt,
      status: booking.status,
      userRating: booking.userRating || null,
    }));

    const pending = normalized.filter(
      (booking) => booking.status === "Pending",
    );
    const decisions = normalized.filter(
      (booking) => booking.status !== "Pending",
    );

    setBookings(pending);
    setHandledBookings(dedupeDecisions(decisions));
  };

  const fetchBookingData = async () => {
    if (isDoctor) return fetchDoctorBookingData();
    return fetchUserBookingData();
  };

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        await fetchBookingData();
      } catch (error) {
        popupToast({
          text: error.response?.data?.message || "Failed to load booking data",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [isDoctor]);

  const pendingBookings = useMemo(() => bookings, [bookings]);

  const totalHistoryPages = useMemo(() => {
    return Math.max(
      1,
      Math.ceil(handledBookings.length / HISTORY_ITEMS_PER_PAGE),
    );
  }, [handledBookings]);

  const paginatedHandledBookings = useMemo(() => {
    const start = (historyPage - 1) * HISTORY_ITEMS_PER_PAGE;
    const end = start + HISTORY_ITEMS_PER_PAGE;
    return handledBookings.slice(start, end);
  }, [handledBookings, historyPage]);

  useEffect(() => {
    setHistoryPage(1);
  }, [isDoctor]);

  useEffect(() => {
    if (historyPage > totalHistoryPages) {
      setHistoryPage(totalHistoryPages);
    }
  }, [historyPage, totalHistoryPages]);

  const handleBookingStatus = async (bookingId, nextStatus) => {
    if (!isDoctor) return;
    try {
      setProcessingBookingId(bookingId);
      let action = "reject";
      if (nextStatus === "Accepted") action = "approve";
      if (nextStatus === "Closed") action = "close";
      const { data } = await axios.patch(
        `${url}/doctors/bookings/${bookingId}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );

      await fetchBookingData();

      const toastType = nextStatus === "Rejected" ? "warning" : "success";
      popupToast({
        text: data.message || `Booking ${nextStatus.toLowerCase()}`,
        type: toastType,
      });
    } catch (error) {
      popupToast({
        text: error.response?.data?.message || "Failed to update booking",
        type: "error",
      });
    } finally {
      setProcessingBookingId(null);
    }
  };

  const submitRating = async (bookingId) => {
    try {
      const rating = Number(ratingInputs[bookingId] || 0);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error("Rating harus 1 sampai 5");
      }

      setRatingLoadingId(bookingId);
      const { data } = await axios.patch(
        `${url}/bookings/${bookingId}/rating`,
        { rating },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      popupToast({ text: data.message || "Rating submitted", type: "success" });

      setSubmittedRatings((prev) => ({
        ...prev,
        [bookingId]: rating,
      }));
      setRatingInputs((prev) => {
        const next = { ...prev };
        delete next[bookingId];
        return next;
      });

      await fetchBookingData();
    } catch (error) {
      popupToast({
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to submit rating",
        type: "error",
      });
    } finally {
      setRatingLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl bg-base-100 p-6 shadow border border-base-200 overflow-hidden">
          {/* ADDED: Gradient accent bar */}
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 -mt-6 -mx-6 mb-6" />
          <p className="text-sm opacity-70">
            {isDoctor ? t("doctor") : "User"}
          </p>
          <h1 className="text-2xl font-bold md:text-3xl bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            {/* MODIFIED: gradient text */}
            {isDoctor ? t("bookingRequests") : t("myBookings")}
          </h1>
          <p className="mt-1 text-sm opacity-70">
            {isDoctor
              ? "Review pending requests and approve or reject each booking."
              : "See all your booking requests and latest status."}
          </p>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="card-title">Pending Bookings</h2>
              <span className="badge badge-warning">
                {pendingBookings.length} pending
              </span>
            </div>

            {isLoading ? (
              <div className="rounded-xl border border-base-300 p-6 text-center opacity-70">
                <span className="loading loading-spinner loading-md" />
                <p className="mt-2">Loading pending bookings...</p>
              </div>
            ) : pendingBookings.length ? (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    {isDoctor ? (
                      <tr>
                        <th>Patient</th>
                        <th>Email</th>
                        <th>Requested At</th>
                        <th>Action</th>
                      </tr>
                    ) : (
                      <tr>
                        <th>Doctor</th>
                        <th>Specialization</th>
                        <th>Requested At</th>
                        <th>Status</th>
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {pendingBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="font-medium">
                          {isDoctor ? booking.patientName : booking.doctorName}
                        </td>
                        <td>
                          {isDoctor
                            ? booking.patientEmail
                            : booking.doctorSpecialization}
                        </td>
                        <td>{formatDateTime(booking.requestedAt)}</td>
                        <td>
                          {isDoctor ? (
                            <div className="flex gap-2">
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() =>
                                  handleBookingStatus(booking.id, "Accepted")
                                }
                                disabled={processingBookingId === booking.id}
                              >
                                {processingBookingId === booking.id
                                  ? "Processing..."
                                  : "Approve"}
                              </button>
                              <button
                                className="btn btn-error btn-sm"
                                onClick={() =>
                                  handleBookingStatus(booking.id, "Rejected")
                                }
                                disabled={processingBookingId === booking.id}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="badge badge-warning">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-base-300 p-6 text-center opacity-70">
                No pending bookings right now.
              </div>
            )}
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Recent Decisions</h2>
            {handledBookings.length ? (
              <>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{isDoctor ? "Patient" : "Doctor"}</th>
                        <th>{isDoctor ? "Schedule" : "Updated At"}</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedHandledBookings.map((booking) => {
                        const localSubmittedRating =
                          submittedRatings[booking.id];
                        const parsedPersistedRating = Number(
                          booking.userRating,
                        );
                        const hasPersistedRating =
                          booking.userRating !== null &&
                          booking.userRating !== undefined &&
                          Number.isInteger(parsedPersistedRating) &&
                          parsedPersistedRating >= 1 &&
                          parsedPersistedRating <= 5;
                        const parsedLocalRating = Number(localSubmittedRating);
                        const hasLocalRating =
                          Number.isInteger(parsedLocalRating) &&
                          parsedLocalRating >= 1 &&
                          parsedLocalRating <= 5;
                        const ratingToShow = hasPersistedRating
                          ? parsedPersistedRating
                          : hasLocalRating
                            ? parsedLocalRating
                            : null;
                        const hasRated = ratingToShow !== null;

                        return (
                          <tr key={booking.id}>
                            <td>
                              {isDoctor
                                ? booking.patientName
                                : booking.doctorName}
                            </td>
                            <td>
                              {formatDateTime(
                                booking.decidedAt || booking.requestedAt,
                              )}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  booking.status === "Accepted"
                                    ? "badge-success"
                                    : booking.status === "Closed"
                                      ? "badge-neutral"
                                      : "badge-error"
                                }`}
                              >
                                {booking.status}
                              </span>
                            </td>
                            <td>
                              {isDoctor ? (
                                booking.status === "Accepted" ? (
                                  <button
                                    className="btn btn-sm btn-outline"
                                    onClick={() =>
                                      handleBookingStatus(booking.id, "Closed")
                                    }
                                    disabled={
                                      processingBookingId === booking.id
                                    }
                                  >
                                    Mark as Done
                                  </button>
                                ) : (
                                  "-"
                                )
                              ) : booking.status === "Closed" ? (
                                hasRated ? (
                                  <span className="badge badge-info">
                                    Rated: {ratingToShow}/5
                                  </span>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <select
                                      className="select select-bordered select-sm"
                                      value={ratingInputs[booking.id] || ""}
                                      onChange={(e) =>
                                        setRatingInputs((prev) => ({
                                          ...prev,
                                          [booking.id]: e.target.value,
                                        }))
                                      }
                                    >
                                      <option value="" disabled>
                                        Rate
                                      </option>
                                      <option value="1">1</option>
                                      <option value="2">2</option>
                                      <option value="3">3</option>
                                      <option value="4">4</option>
                                      <option value="5">5</option>
                                    </select>
                                    <button
                                      className="btn btn-primary btn-sm"
                                      onClick={() => submitRating(booking.id)}
                                      disabled={ratingLoadingId === booking.id}
                                    >
                                      {ratingLoadingId === booking.id
                                        ? "Saving..."
                                        : "Submit"}
                                    </button>
                                  </div>
                                )
                              ) : (
                                "-"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {handledBookings.length > HISTORY_ITEMS_PER_PAGE ? (
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    {Array.from({ length: totalHistoryPages }, (_, index) => {
                      const pageNumber = index + 1;
                      const isActive = pageNumber === historyPage;
                      return (
                        <button
                          key={pageNumber}
                          type="button"
                          className={`btn btn-sm ${isActive ? "btn-primary" : "btn-outline"}`}
                          onClick={() => setHistoryPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-xl border border-base-300 p-6 text-center opacity-70">
                No booking decisions yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
