import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Toastify from "toastify-js";
import { url } from "../../constants/url";

const formatDateTime = (dateValue) => {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [handledBookings, setHandledBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingBookingId, setProcessingBookingId] = useState(null);

  const fetchPendingBookings = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${url}/doctors/bookings/pending`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      const normalizedBookings = (data.bookings || []).map((booking) => ({
        id: booking.id,
        patientName: booking.patient?.name || "Unknown Patient",
        patientEmail: booking.patient?.email || "-",
        requestedAt: booking.createdAt,
        status: booking.status,
      }));

      setBookings(normalizedBookings);
    } catch (error) {
      Toastify({
        text: error.response?.data?.message || "Failed to load pending bookings",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "center",
        stopOnFocus: true,
        style: {
          background: "#DC2626",
        },
      }).showToast();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const pendingBookings = useMemo(
    () => bookings,
    [bookings]
  );

  const handleBookingStatus = async (bookingId, nextStatus) => {
    try {
      setProcessingBookingId(bookingId);
      const action = nextStatus === "Accepted" ? "approve" : "reject";
      const { data } = await axios.patch(
        `${url}/doctors/bookings/${bookingId}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      setBookings((prev) => {
        const currentBooking = prev.find((booking) => booking.id === bookingId);
        if (currentBooking) {
          setHandledBookings((previousHandled) => [
            {
              ...currentBooking,
              status: nextStatus,
              decidedAt: data.booking?.updatedAt || new Date().toISOString(),
            },
            ...previousHandled,
          ]);
        }
        return prev.filter((booking) => booking.id !== bookingId);
      });

      Toastify({
        text: data.message || `Booking ${nextStatus.toLowerCase()}`,
        duration: 2200,
        close: true,
        gravity: "top",
        position: "center",
        stopOnFocus: true,
        style: {
          background: nextStatus === "Accepted" ? "#16A34A" : "#DC2626",
        },
      }).showToast();
    } catch (error) {
      Toastify({
        text: error.response?.data?.message || "Failed to update booking",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "center",
        stopOnFocus: true,
        style: {
          background: "#DC2626",
        },
      }).showToast();
    } finally {
      setProcessingBookingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl bg-base-100 p-6 shadow">
          <p className="text-sm opacity-70">Doctor</p>
          <h1 className="text-2xl font-bold md:text-3xl">Booking Requests</h1>
          <p className="mt-1 text-sm opacity-70">
            Review pending requests and approve or reject each booking.
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
                    <tr>
                      <th>Patient</th>
                      <th>Email</th>
                      <th>Requested At</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="font-medium">{booking.patientName}</td>
                        <td>{booking.patientEmail}</td>
                        <td>{formatDateTime(booking.requestedAt)}</td>
                        <td>
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
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Schedule</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {handledBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>{booking.patientName}</td>
                        <td>{formatDateTime(booking.decidedAt || booking.requestedAt)}</td>
                        <td>
                          <span
                            className={`badge ${
                              booking.status === "Accepted"
                                ? "badge-success"
                                : "badge-error"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
