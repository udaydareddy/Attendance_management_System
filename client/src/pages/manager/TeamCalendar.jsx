import { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";

function getMonthString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function daysInMonth(y, mIndex) {
  // mIndex is 0-based (0 = Jan)
  return new Date(y, mIndex + 1, 0).getDate();
}

export default function TeamCalendar() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [month, setMonth] = useState(getMonthString(new Date()));
  const [calendarData, setCalendarData] = useState({});
  const [selectedDayInfo, setSelectedDayInfo] = useState(null);
  const [error, setError] = useState("");

  const fetchEmployees = async () => {
    try {
      setError("");
      const res = await apiClient.get("/users/employees");
      setEmployees(res.data || []);
    } catch (err) {
      console.error("EMPLOYEES ERROR:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load employees"
      );
    }
  };

  const fetchMonthData = async () => {
    try {
      setError("");

      if (!selectedEmployeeId) {
        setCalendarData({});
        return;
      }

      const [yearStr, monthStr] = month.split("-");
      const year = Number(yearStr);
      const monthIndex = Number(monthStr) - 1; // 0-based

      // Correct start & end of the month
      const start = new Date(year, monthIndex, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(year, monthIndex + 1, 0);
      end.setHours(23, 59, 59, 999);

      const startDate = start.toISOString().slice(0, 10);
      const endDate = end.toISOString().slice(0, 10);

      const params = new URLSearchParams();
      params.append("employeeId", selectedEmployeeId);
      params.append("startDate", startDate);
      params.append("endDate", endDate);
      params.append("limit", "200");

      const res = await apiClient.get(`/attendance/all?${params.toString()}`);
      const records = res.data || [];

      const map = {};
      records.forEach((rec) => {
        const key = new Date(rec.date).toISOString().slice(0, 10);

        // normalise status to one of Present / Late / Half Day / Absent
        let status =
          rec.status || (rec.checkInTime ? "Present" : "Absent");

        // handle accidentally lowercase "present", etc.
        const s = status.toLowerCase();
        if (s === "present") status = "Present";
        else if (s === "late") status = "Late";
        else if (s === "half day" || s === "halfday") status = "Half Day";
        else if (s === "absent") status = "Absent";

        map[key] = {
          status,
          checkInTime: rec.checkInTime,
          checkOutTime: rec.checkOutTime,
          totalHours: rec.totalHours,
        };
      });

      setCalendarData(map);
    } catch (err) {
      console.error("TEAM CALENDAR ERROR:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load team calendar data"
      );
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchMonthData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, selectedEmployeeId]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const [y, m] = month.split("-").map(Number);
  const monthIndex = m - 1;
  const totalDays = daysInMonth(y, monthIndex);

  const getCellColor = (status) => {
    switch (status) {
      case "Present":
        return "green";
      case "Late":
        return "goldenrod";
      case "Half Day":
        return "orange";
      case "Absent":
        return "crimson";
      default:
        return "#1f2933";
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1rem",
          alignItems: "center",
        }}
      >
        <h1>Team Attendance Calendar</h1>
        <div>
          <a href="/manager/dashboard" style={{ marginRight: "1rem" }}>
            Back to Dashboard
          </a>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Employee + Month selectors */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <div>
          <label>Employee: </label>
          <select
            value={selectedEmployeeId}
            onChange={(e) => {
              setSelectedEmployeeId(e.target.value);
              setSelectedDayInfo(null);
            }}
          >
            <option value="">Select employee</option>
            {employees.map((emp) => (
              <option key={emp.employeeId} value={emp.employeeId}>
                {emp.name} ({emp.employeeId}) - {emp.department}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Month: </label>
          <input
            type="month"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setSelectedDayInfo(null);
            }}
          />
        </div>
      </div>

      {/* Calendar grid */}
      {!selectedEmployeeId ? (
        <p>Select an employee to view calendar.</p>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "0.5rem",
              marginTop: "1rem",
            }}
          >
            {[...Array(totalDays)].map((_, i) => {
              const day = i + 1;
              const dateKey = `${month}-${String(day).padStart(2, "0")}`;
              const rec = calendarData[dateKey];
              const status = rec?.status || "Absent";
              const bg = getCellColor(status);

              return (
                <div
                  key={dateKey}
                  onClick={() =>
                    setSelectedDayInfo({
                      date: dateKey,
                      status,
                      checkInTime: rec?.checkInTime,
                      checkOutTime: rec?.checkOutTime,
                      totalHours: rec?.totalHours || 0,
                    })
                  }
                  style={{
                    padding: "0.5rem",
                    background: bg,
                    borderRadius: "6px",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                  title={status}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginTop: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <span
                style={{
                  display: "inline-block",
                  width: "14px",
                  height: "14px",
                  background: "green",
                  marginRight: "4px",
                }}
              ></span>
              Present
            </div>
            <div>
              <span
                style={{
                  display: "inline-block",
                  width: "14px",
                  height: "14px",
                  background: "goldenrod",
                  marginRight: "4px",
                }}
              ></span>
              Late
            </div>
            <div>
              <span
                style={{
                  display: "inline-block",
                  width: "14px",
                  height: "14px",
                  background: "orange",
                  marginRight: "4px",
                }}
              ></span>
              Half Day
            </div>
            <div>
              <span
                style={{
                  display: "inline-block",
                  width: "14px",
                  height: "14px",
                  background: "crimson",
                  marginRight: "4px",
                }}
              ></span>
              Absent
            </div>
          </div>

          {/* Day details */}
          {selectedDayInfo && (
            <div style={{ marginTop: "1rem" }}>
              <h3>Details for {selectedDayInfo.date}</h3>
              <p>Status: {selectedDayInfo.status}</p>
              <p>
                Check-in:{" "}
                {selectedDayInfo.checkInTime
                  ? new Date(
                      selectedDayInfo.checkInTime
                    ).toLocaleTimeString()
                  : "-"}
              </p>
              <p>
                Check-out:{" "}
                {selectedDayInfo.checkOutTime
                  ? new Date(
                      selectedDayInfo.checkOutTime
                    ).toLocaleTimeString()
                  : "-"}
              </p>
              <p>Total Hours: {selectedDayInfo.totalHours}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
