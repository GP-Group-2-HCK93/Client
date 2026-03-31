import { useEffect, useState } from "react";
import axios from "axios";
import Toastify from "toastify-js";
import { useNavigate } from "react-router";
import { url } from "../../constants/url";

const todaySchedule = [
  { label: "Morning Session", value: "08:00 - 12:00" },
  { label: "Break", value: "12:00 - 13:00" },
  { label: "Afternoon Session", value: "13:00 - 17:00" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [summary, setSummary] = useState({
    totalPatients: 0,
    totalChats: 0,
    pendingChats: 0,
    acceptedChats: 0,
    closedChats: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [chatRoomId, setChatRoomId] = useState("");
  const [isMatchingDate, setIsMatchingDate] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const fetchDoctorDashboard = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${url}/doctors/dashboard`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      setDoctor(data.doctor);
      setSummary(data.summary);
    } catch (error) {
      Toastify({
        text: error.response?.data?.message || "Failed to load doctor dashboard",
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorDashboard();
  }, []);

  const handleToggleAvailability = async () => {
    try {
      if (!doctor) return;
      setIsToggling(true);

      const { data } = await axios.patch(
        `${url}/doctors/availability`,
        { isAvailable: !doctor.isAvailable },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      setDoctor((prev) =>
        prev
          ? {
              ...prev,
              isAvailable: data.isAvailable,
            }
          : prev
      );

      Toastify({
        text: data.message,
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
        text: error.response?.data?.message || "Failed to update availability",
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
      setIsToggling(false);
    }
  };

  const handleMatchDate = async (e) => {
    e.preventDefault();
    try {
      if (!chatRoomId) {
        throw new Error("Chat Room ID is required");
      }

      setIsMatchingDate(true);
      const { data } = await axios.post(
        `${url}/ai/match-date`,
        { chatRoomId: Number(chatRoomId) },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      setAiResult(data.aiResult);
      Toastify({
        text: "AI date matching completed",
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
          "Failed to match date with AI",
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
      setIsMatchingDate(false);
    }
  };

  const doctorName = doctor?.name || "Doctor";
  const totalPatientsToday = summary.totalPatients;
  const completedConsultations = summary.closedChats;
  const pendingLabs = summary.pendingChats;
  const averageRating = doctor?.rating || 0;

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl bg-base-100 p-6 shadow">
          <p className="text-sm opacity-70">Doctor Dashboard</p>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl">
            Welcome back, Dr. {doctorName}
          </h1>
          <p className="mt-2 text-sm opacity-70">
            {doctor?.specialization
              ? `${doctor.specialization} - ${doctor.location}`
              : "Here is your quick overview for today."}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span
              className={`badge ${
                doctor?.isAvailable ? "badge-success" : "badge-error"
              }`}
            >
              {doctor?.isAvailable ? "Available" : "Unavailable"}
            </span>
            <button
              className={`btn btn-sm ${
                doctor?.isAvailable ? "btn-error" : "btn-success"
              }`}
              onClick={handleToggleAvailability}
              disabled={!doctor || isToggling}
            >
              {isToggling
                ? "Updating..."
                : doctor?.isAvailable
                ? "Set Unavailable"
                : "Set Available"}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-2xl bg-base-100 p-8 text-center shadow">
            <span className="loading loading-spinner loading-lg" />
            <p className="mt-3 opacity-70">Loading dashboard...</p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="card bg-primary text-primary-content shadow">
            <div className="card-body">
              <p className="text-sm opacity-80">Patients Today</p>
              <p className="text-3xl font-bold">{totalPatientsToday}</p>
            </div>
          </div>
          <div className="card bg-success text-success-content shadow">
            <div className="card-body">
              <p className="text-sm opacity-80">Completed</p>
              <p className="text-3xl font-bold">{completedConsultations}</p>
            </div>
          </div>
          <div className="card bg-warning text-warning-content shadow">
            <div className="card-body">
              <p className="text-sm opacity-80">Pending Labs</p>
              <p className="text-3xl font-bold">{pendingLabs}</p>
            </div>
          </div>
          <div className="card bg-info text-info-content shadow">
            <div className="card-body">
              <p className="text-sm opacity-80">Rating</p>
              <p className="text-3xl font-bold">{averageRating}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="card bg-base-100 shadow xl:col-span-2">
            <div className="card-body">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="card-title">Chat Summary</h2>
                <span className="badge badge-outline">
                  {summary.totalChats} total chats
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Accepted Chats</td>
                      <td className="font-semibold">{summary.acceptedChats}</td>
                    </tr>
                    <tr>
                      <td>Pending Chats</td>
                      <td className="font-semibold">{summary.pendingChats}</td>
                    </tr>
                    <tr>
                      <td>Closed Chats</td>
                      <td className="font-semibold">{summary.closedChats}</td>
                    </tr>
                    <tr>
                      <td>Unique Patients</td>
                      <td className="font-semibold">{summary.totalPatients}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">AI Date Matching</h2>
                <form className="space-y-3" onSubmit={handleMatchDate}>
                  <input
                    type="number"
                    min="1"
                    className="input input-bordered w-full"
                    placeholder="Input Chat Room ID"
                    value={chatRoomId}
                    onChange={(e) => setChatRoomId(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={isMatchingDate}
                  >
                    {isMatchingDate ? "Matching..." : "Match Date with AI"}
                  </button>
                </form>
                {aiResult ? (
                  <div className="mt-4 space-y-2 rounded-xl border border-base-300 p-3 text-sm">
                    <p>
                      <span className="font-semibold">Matched Date:</span>{" "}
                      {aiResult.matchedDate || "No match"}
                    </p>
                    <p>
                      <span className="font-semibold">Confidence:</span>{" "}
                      {aiResult.confidence || "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Reason:</span>{" "}
                      {aiResult.reason || "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Alternatives:</span>{" "}
                      {Array.isArray(aiResult.alternatives) &&
                      aiResult.alternatives.length
                        ? aiResult.alternatives.join(", ")
                        : "-"}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">Today's Schedule</h2>
                <div className="space-y-3">
                  {todaySchedule.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-base-300 p-3"
                    >
                      <p className="text-sm opacity-70">{item.label}</p>
                      <p className="font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-2">
                  <button className="btn btn-outline" onClick={fetchDoctorDashboard}>
                    Refresh Dashboard
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => navigate("/doctors/bookings")}
                  >
                    Open Patient Queue
                  </button>
                  <button className="btn btn-outline btn-disabled">
                    Create Prescription
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

