
function generateAttendanceCSV(records) {
  const headers = [
    "Date",
    "Employee Name",
    "Employee ID",
    "Department",
    "Check In",
    "Check Out",
    "Total Hours",
  ];

  const rows = records.map((rec) => {
    const date = rec.date ? new Date(rec.date).toLocaleDateString() : "";
    const name = rec.user?.name || "";
    const empId = rec.user?.employeeId || "";
    const dept = rec.user?.department || "";
    const checkIn = rec.checkInTime
      ? new Date(rec.checkInTime).toLocaleTimeString()
      : "";
    const checkOut = rec.checkOutTime
      ? new Date(rec.checkOutTime).toLocaleTimeString()
      : "";
    const hours =
      rec.totalHours !== undefined && rec.totalHours !== null
        ? rec.totalHours
        : "";

    return [date, name, empId, dept, checkIn, checkOut, hours]
      .map((val) => `"${String(val).replace(/"/g, '""')}"`)
      .join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

module.exports = { generateAttendanceCSV };
