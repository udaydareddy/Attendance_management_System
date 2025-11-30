import { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";

export default function AttendanceHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiClient.get("/attendance/my?limit=30");
      setRecords(res.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load history"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>My Attendance History</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && records.length === 0 && <p>No records found.</p>}

      {!loading && records.length > 0 && (
        <table style={{ width: "100%", marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id}>
                <td>{new Date(r.date).toLocaleDateString()}</td>
                <td>
                  {r.checkInTime
                    ? new Date(r.checkInTime).toLocaleTimeString()
                    : "-"}
                </td>
                <td>
                  {r.checkOutTime
                    ? new Date(r.checkOutTime).toLocaleTimeString()
                    : "-"}
                </td>
                <td>{r.totalHours ?? "-"}</td>
                <td>{r.status || (r.checkInTime ? "Present" : "Absent")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
