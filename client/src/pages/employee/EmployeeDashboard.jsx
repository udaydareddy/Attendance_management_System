import { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";

function getMonthString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}

export default function EmployeeDashboard() {
  const [status, setStatus] = useState(null);
  const [summary, setSummary] = useState(null);
  const [calendarData, setCalendarData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [month, setMonth] = useState(getMonthString(new Date()));
  const [message, setMessage] = useState("");

  const fetchStatus = async () => {
    const res = await apiClient.get("/attendance/today");
    setStatus(res.data || null);
  };

  const fetchSummary = async () => {
    const res = await apiClient.get("/attendance/my-summary");
    setSummary(res.data);
  };

  const fetchMonth = async () => {
    const res = await apiClient.get(`/attendance/month?month=${month}`);
    setCalendarData(res.data || {});
  };

  useEffect(() => {
    fetchStatus();
    fetchSummary();
    fetchMonth();
  }, [month]);

  const handleCheckIn = async () => {
    const res = await apiClient.post("/attendance/checkin");
    setMessage(res.data.message);
    fetchStatus();
    fetchSummary();
    fetchMonth();
  };

  const handleCheckOut = async () => {
    const res = await apiClient.post("/attendance/checkout");
    setMessage(res.data.message);
    fetchStatus();
    fetchSummary();
    fetchMonth();
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const [y, m] = month.split("-").map(Number);
  const total = daysInMonth(y, m - 1);

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Employee Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {message && <p style={{ color: "lightgreen" }}>{message}</p>}

      <button onClick={handleCheckIn}>Check In</button>
      <button onClick={handleCheckOut} style={{ marginLeft: "1rem" }}>
        Check Out
      </button>

      <hr />

      <h3>Today's Status</h3>
      {status?.checkInTime && <p>In: {new Date(status.checkInTime).toLocaleTimeString()}</p>}
      {status?.checkOutTime && <p>Out: {new Date(status.checkOutTime).toLocaleTimeString()}</p>}
      {status?.status && <p>Status: {status.status}</p>}

      <hr />

      <h3>Monthly Summary</h3>
      {summary && (
        <ul>
          <li>Present: {summary.presentDays}</li>
          <li>Late: {summary.lateDays}</li>
          <li>Half Day: {summary.halfDays}</li>
          <li>Absent: {summary.absentDays}</li>
          <li>Total Hours: {summary.totalHours}</li>
        </ul>
      )}

      <hr />

      <h3>Attendance Calendar</h3>
      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem", marginTop: "1rem" }}>
        {[...Array(total)].map((_, i) => {
          const d = `${month}-${String(i + 1).padStart(2, "0")}`;
          const rec = calendarData[d];

          let bg = "#1f2933";
          if (rec?.status === "Present") bg = "green";
          if (rec?.status === "Late") bg = "goldenrod";
          if (rec?.status === "Half Day") bg = "orange";

          return (
            <div
              key={d}
              onClick={() => setSelectedDate({ date: d, ...rec })}
              style={{
                padding: "0.5rem",
                background: bg,
                cursor: "pointer",
                borderRadius: "6px",
              }}
            >
              {i + 1}
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div style={{ marginTop: "1rem" }}>
          <h4>{selectedDate.date}</h4>
          <p>Status: {selectedDate.status || "Absent"}</p>
          <p>In: {selectedDate.checkInTime && new Date(selectedDate.checkInTime).toLocaleTimeString()}</p>
          <p>Out: {selectedDate.checkOutTime && new Date(selectedDate.checkOutTime).toLocaleTimeString()}</p>
          <p>Total Hours: {selectedDate.totalHours || 0}</p>
        </div>
      )}
    </div>
  );
}
