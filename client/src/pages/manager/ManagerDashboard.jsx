import { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";

export default function ManagerDashboard() {
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [weekly, setWeekly] = useState(null);
  const [showWeekly, setShowWeekly] = useState(false); 

  
  const [tableFilters, setTableFilters] = useState({
    startDate: "",
    endDate: "",
    employeeId: "",
    department: "",
    status: "",
  });

  
  const [exportFilters, setExportFilters] = useState({
    startDate: "",
    endDate: "",
    employeeId: "",
  });

  const fetchSummary = async () => {
    try {
      setError("");
      const res = await apiClient.get("/dashboard/manager/summary");
      setSummary(res.data);
    } catch (err) {
      console.error("MANAGER SUMMARY ERROR:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load summary"
      );
    }
  };

  const fetchWeekly = async () => {
    try {
      setError("");
      const res = await apiClient.get("/dashboard/manager/weekly");
      setWeekly(res.data);
    } catch (err) {
      console.error("MANAGER WEEKLY ERROR:", err);
      
    }
  };

  const fetchAttendance = async (filtersOverride) => {
    try {
      setError("");
      const filters = filtersOverride || tableFilters;
      const params = new URLSearchParams();
      params.append("limit", "100");

      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.employeeId) params.append("employeeId", filters.employeeId);
      if (filters.department) params.append("department", filters.department);
      if (filters.status) params.append("status", filters.status);

      const res = await apiClient.get(
        `/attendance/all?${params.toString()}`
      );
      setRecords(res.data || []);
    } catch (err) {
      console.error("MANAGER ATTENDANCE ERROR:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load attendance records"
      );
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchWeekly();
    const initial = {
      startDate: "",
      endDate: "",
      employeeId: "",
      department: "",
      status: "",
    };
    fetchAttendance(initial);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleTableFilterChange = (e) => {
    const { name, value } = e.target;
    setTableFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyTableFilters = () => {
    fetchAttendance();
  };

  const clearTableFilters = () => {
    const cleared = {
      startDate: "",
      endDate: "",
      employeeId: "",
      department: "",
      status: "",
    };
    setTableFilters(cleared);
    fetchAttendance(cleared);
  };

  const handleExportFilterChange = (e) => {
    const { name, value } = e.target;
    setExportFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDownloadCSV = async () => {
    try {
      setError("");
      setMessage("");

      const { startDate, endDate, employeeId } = exportFilters;

      if (!startDate || !endDate) {
        setError("Please select both start and end dates for export");
        return;
      }

      const params = new URLSearchParams();
      params.append("startDate", startDate);
      params.append("endDate", endDate);
      if (employeeId) params.append("employeeId", employeeId);

      const res = await apiClient.get(
        `/attendance/export?${params.toString()}`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      const fileName = employeeId
        ? `attendance_${employeeId}_${startDate}_to_${endDate}.csv`
        : `attendance_${startDate}_to_${endDate}.csv`;

      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setMessage("CSV exported successfully");
    } catch (err) {
      console.error("EXPORT ERROR:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to export CSV"
      );
    }
  };

  const formatShortDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
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
        <h1>Manager Dashboard</h1>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            onClick={() => setShowWeekly((prev) => !prev)}
            style={{ padding: "0.5rem 0.75rem" }}
          >
            {showWeekly ? "Hide Weekly Trend" : "Show Weekly Trend"}
          </button>
          <a href="/manager/calendar" style={{ marginRight: "0.5rem" }}>
            Team Calendar View
          </a>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {message && (
        <p style={{ color: "lightgreen", marginBottom: "1rem" }}>{message}</p>
      )}
      {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

      {/* Export filters */}
      <div
        style={{
          border: "1px solid #444",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "2rem",
        }}
      >
        <h2>Export Attendance CSV</h2>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            alignItems: "center",
            marginTop: "0.5rem",
          }}
        >
          <div>
            <label>Start Date: </label>
            <input
              type="date"
              name="startDate"
              value={exportFilters.startDate}
              onChange={handleExportFilterChange}
            />
          </div>
          <div>
            <label>End Date: </label>
            <input
              type="date"
              name="endDate"
              value={exportFilters.endDate}
              onChange={handleExportFilterChange}
            />
          </div>
          <div>
            <label>Employee ID (optional): </label>
            <input
              type="text"
              name="employeeId"
              placeholder="EMP001"
              value={exportFilters.employeeId}
              onChange={handleExportFilterChange}
            />
          </div>
          <button onClick={handleDownloadCSV}>Download CSV</button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <div
          style={{
            padding: "1rem",
            border: "1px solid #444",
            borderRadius: "8px",
            minWidth: "150px",
          }}
        >
          <h3>Total Employees</h3>
          <p>{summary?.totalEmployees ?? "-"}</p>
        </div>
        <div
          style={{
            padding: "1rem",
            border: "1px solid #444",
            borderRadius: "8px",
            minWidth: "150px",
          }}
        >
          <h3>Present Today</h3>
          <p>{summary?.present ?? "-"}</p>
        </div>
        <div
          style={{
            padding: "1rem",
            border: "1px solid #444",
            borderRadius: "8px",
            minWidth: "150px",
          }}
        >
          <h3>Absent Today</h3>
          <p>{summary?.absent ?? "-"}</p>
        </div>
        <div
          style={{
            padding: "1rem",
            border: "1px solid #444",
            borderRadius: "8px",
            minWidth: "150px",
          }}
        >
          <h3>Late Today</h3>
          <p>{summary?.lateCount ?? "-"}</p>
        </div>
      </div>

      {/* Weekly trend chart - only when toggled ON */}
      {showWeekly && weekly?.days && weekly.days.length > 0 && (
        <div
          style={{
            border: "1px solid #444",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "2rem",
          }}
        >
          <h2>Weekly Attendance Trend (Last 7 Days)</h2>
          <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
            Stacked bar: Present (green), Late (yellow), Absent (red) –
            relative to total employees.
          </p>
          <div style={{ marginTop: "0.75rem" }}>
            {weekly.days.map((day) => {
              const total = weekly.totalEmployees || 1;
              const presentPct = (day.present / total) * 100;
              const latePct = (day.late / total) * 100;
              const absentPct = (day.absent / total) * 100;

              return (
                <div
                  key={day.date}
                  style={{
                    marginBottom: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.25rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    <span>{formatShortDate(day.date)}</span>
                    <span>
                      P:{day.present} L:{day.late} A:{day.absent}
                    </span>
                  </div>
                  <div
                    style={{
                      height: "14px",
                      width: "100%",
                      background: "#020617",
                      borderRadius: "999px",
                      overflow: "hidden",
                      display: "flex",
                    }}
                  >
                    <div
                      style={{
                        width: `${presentPct}%`,
                        background: "green",
                      }}
                    ></div>
                    <div
                      style={{
                        width: `${latePct}%`,
                        background: "goldenrod",
                      }}
                    ></div>
                    <div
                      style={{
                        width: `${absentPct}%`,
                        background: "crimson",
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Department summary */}
      <h2>Department-wise Summary (Today)</h2>
      {summary?.departmentStats && summary.departmentStats.length > 0 ? (
        <table
          style={{
            borderCollapse: "collapse",
            marginTop: "0.5rem",
            marginBottom: "2rem",
            width: "100%",
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid gray", padding: "0.5rem" }}>
                Department
              </th>
              <th style={{ borderBottom: "1px solid gray", padding: "0.5rem" }}>
                Total Employees
              </th>
              <th style={{ borderBottom: "1px solid gray", padding: "0.5rem" }}>
                Present
              </th>
              <th style={{ borderBottom: "1px solid gray", padding: "0.5rem" }}>
                Absent
              </th>
              <th style={{ borderBottom: "1px solid gray", padding: "0.5rem" }}>
                Late
              </th>
            </tr>
          </thead>
          <tbody>
            {summary.departmentStats.map((dept) => (
              <tr key={dept.department}>
                <td
                  style={{
                    borderBottom: "1px solid #333",
                    padding: "0.5rem",
                  }}
                >
                  {dept.department}
                </td>
                <td
                  style={{
                    borderBottom: "1px solid #333",
                    padding: "0.5rem",
                  }}
                >
                  {dept.totalEmployees}
                </td>
                <td
                  style={{
                    borderBottom: "1px solid #333",
                    padding: "0.5rem",
                  }}
                >
                  {dept.present}
                </td>
                <td
                  style={{
                    borderBottom: "1px solid #333",
                    padding: "0.5rem",
                  }}
                >
                  {dept.absent}
                </td>
                <td
                  style={{
                    borderBottom: "1px solid #333",
                    padding: "0.5rem",
                  }}
                >
                  {dept.late}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No department data available.</p>
      )}

      {/* Late employees list */}
      <h2>Late Employees Today</h2>
      {summary?.lateEmployees?.length ? (
        <ul>
          {summary.lateEmployees.map((emp) => (
            <li key={emp.id}>
              {emp.name} ({emp.employeeId}) - {emp.department || "N/A"} -{" "}
              {new Date(emp.checkInTime).toLocaleTimeString()} (
              {emp.status || "Late"})
            </li>
          ))}
        </ul>
      ) : (
        <p>No late employees today.</p>
      )}

      {/* Absent employees list */}
      <h2 style={{ marginTop: "2rem" }}>Absent Employees Today</h2>
      {summary?.absentEmployees?.length ? (
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            marginTop: "0.5rem",
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid gray", padding: "0.5rem" }}>
                Name
              </th>
              <th style={{ borderBottom: "1px solid gray", padding: "0.5rem" }}>
                Employee ID
              </th>
              <th style={{ borderBottom: "1px solid gray", padding: "0.5rem" }}>
                Department
              </th>
            </tr>
          </thead>
          <tbody>
            {summary.absentEmployees.map((emp) => (
              <tr key={emp.id}>
                <td style={{ padding: "0.5rem" }}>{emp.name}</td>
                <td style={{ padding: "0.5rem" }}>{emp.employeeId}</td>
                <td style={{ padding: "0.5rem" }}>{emp.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No absent employees today.</p>
      )}

      <hr style={{ margin: "2rem 0" }} />

      {/* Table filters */}
      <div
        style={{
          border: "1px solid #444",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "1rem",
        }}
      >
        <h2>Filter Attendance Records</h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            marginTop: "0.5rem",
          }}
        >
          <div>
            <label>Start Date: </label>
            <input
              type="date"
              name="startDate"
              value={tableFilters.startDate}
              onChange={handleTableFilterChange}
            />
          </div>
          <div>
            <label>End Date: </label>
            <input
              type="date"
              name="endDate"
              value={tableFilters.endDate}
              onChange={handleTableFilterChange}
            />
          </div>
          <div>
            <label>Employee ID: </label>
            <input
              type="text"
              name="employeeId"
              placeholder="EMP001"
              value={tableFilters.employeeId}
              onChange={handleTableFilterChange}
            />
          </div>
          <div>
            <label>Department: </label>
            <input
              type="text"
              name="department"
              placeholder="CSE"
              value={tableFilters.department}
              onChange={handleTableFilterChange}
            />
          </div>
          <div>
            <label>Status: </label>
            <select
              name="status"
              value={tableFilters.status}
              onChange={handleTableFilterChange}
            >
              <option value="">All</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Half Day">Half Day</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: "0.75rem" }}>
          <button onClick={applyTableFilters}>Apply Filters</button>
          <button
            onClick={clearTableFilters}
            style={{ marginLeft: "0.5rem" }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Recent attendance records */}
      <h2>Recent Attendance Records</h2>
      {records.length === 0 ? (
        <p>No attendance records found.</p>
      ) : (
        <table
          style={{
            borderCollapse: "collapse",
            marginTop: "1rem",
            width: "100%",
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid gray", padding: "0.5rem" }}>
                Date
              </th>
              <th style={{ borderBottom: "1px solid gray", padding: "0.5rem" }}>
                Employee
              </th>
              <th style={{ borderBottom: "1px solid gray", padding: "0.5rem" }}>
                Department
              </th>
              <th style={{ borderBottom: "1px solid gray", padding: "0.5rem" }}>
                Check-in
              </th>
              <th style={{ borderBottom: "1px solid gray", padding: "0.5rem" }}>
                Check-out
              </th>
              <th style={{ borderBottom: "1px solid gray", padding: "0.5rem" }}>
                Hours
              </th>
              <th style={{ borderBottom: "1px solid gray", padding: "0.5rem" }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id}>
                <td
                  style={{
                    borderBottom: "1px solid #333",
                    padding: "0.5rem",
                  }}
                >
                  {new Date(r.date).toLocaleDateString()}
                </td>
                <td
                  style={{
                    borderBottom: "1px solid #333",
                    padding: "0.5rem",
                  }}
                >
                  {r.user?.name} ({r.user?.employeeId})
                </td>
                <td
                  style={{
                    borderBottom: "1px solid #333",
                    padding: "0.5rem",
                  }}
                >
                  {r.user?.department || "N/A"}
                </td>
                <td
                  style={{
                    borderBottom: "1px solid #333",
                    padding: "0.5rem",
                  }}
                >
                  {r.checkInTime
                    ? new Date(r.checkInTime).toLocaleTimeString()
                    : "-"}
                </td>
                <td
                  style={{
                    borderBottom: "1px solid #333",
                    padding: "0.5rem",
                  }}
                >
                  {r.checkOutTime
                    ? new Date(r.checkOutTime).toLocaleTimeString()
                    : "-"}
                </td>
                <td
                  style={{
                    borderBottom: "1px solid #333",
                    padding: "0.5rem",
                  }}
                >
                  {r.totalHours !== undefined ? r.totalHours : "-"}
                </td>
                <td
                  style={{
                    borderBottom: "1px solid #333",
                    padding: "0.5rem",
                  }}
                >
                  {r.status || (r.checkInTime ? "Present" : "Absent")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
