const express = require("express");
const router = express.Router();
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const Attendance = require("../models/Attendance");
const User = require("../models/User");


router.get(
  "/manager/summary",
  authMiddleware,
  requireRole(["manager"]),
  async (req, res) => {
    try {
      const today = new Date().setHours(0, 0, 0, 0);

      
      const employees = await User.find({ role: "employee" }).select(
        "_id name employeeId department"
      );
      const totalEmployees = employees.length;

      const employeeMap = {};
      employees.forEach((emp) => {
        employeeMap[emp._id.toString()] = emp;
      });

      // Today's attendance
      const todaysRecords = await Attendance.find({ date: today }).populate(
        "user",
        "name employeeId department"
      );

      const present = todaysRecords.filter(
        (r) => r.checkInTime || r.status
      ).length;

      const absentCount = Math.max(totalEmployees - present, 0);

      const officeStart = new Date();
      officeStart.setHours(9, 30, 0, 0);

      const lateEmployees = todaysRecords.filter((r) => {
        if (typeof r.isLate === "boolean") return r.isLate;
        return r.checkInTime && new Date(r.checkInTime) > officeStart;
      });

      // Absent list: employees with no record today
      const presentIds = new Set(
        todaysRecords.map((r) => r.user._id.toString())
      );
      const absentEmployees = employees.filter(
        (emp) => !presentIds.has(emp._id.toString())
      );

      // Department stats
      const deptTotals = {};
      employees.forEach((emp) => {
        const dept = emp.department || "Unknown";
        deptTotals[dept] = (deptTotals[dept] || 0) + 1;
      });

      const deptPresent = {};
      const deptLate = {};

      todaysRecords.forEach((rec) => {
        const dept = rec.user?.department || "Unknown";
        deptPresent[dept] = (deptPresent[dept] || 0) + 1;

        const isLate =
          typeof rec.isLate === "boolean"
            ? rec.isLate
            : rec.checkInTime && new Date(rec.checkInTime) > officeStart;

        if (isLate) {
          deptLate[dept] = (deptLate[dept] || 0) + 1;
        }
      });

      const departmentStats = Object.keys(deptTotals).map((dept) => ({
        department: dept,
        totalEmployees: deptTotals[dept],
        present: deptPresent[dept] || 0,
        late: deptLate[dept] || 0,
        absent:
          deptTotals[dept] - (deptPresent[dept] || 0),
      }));

      res.json({
        totalEmployees,
        present,
        absent: absentCount,
        lateCount: lateEmployees.length,
        lateEmployees: lateEmployees.map((r) => ({
          id: r.user._id,
          name: r.user.name,
          employeeId: r.user.employeeId,
          department: r.user.department,
          checkInTime: r.checkInTime,
          status: r.status || "Late",
        })),
        absentEmployees: absentEmployees.map((e) => ({
          id: e._id,
          name: e.name,
          employeeId: e.employeeId,
          department: e.department,
        })),
        departmentStats,
      });
    } catch (error) {
      console.error("Manager summary error:", error);
      res.status(500).json({ message: "Failed to load dashboard summary" });
    }
  }
);


router.get(
  "/manager/weekly",
  authMiddleware,
  requireRole(["manager"]),
  async (req, res) => {
    try {
      const totalEmployees = await User.countDocuments({ role: "employee" });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const officeStartTemplate = new Date();
      officeStartTemplate.setHours(9, 30, 0, 0);

      const result = [];

      // Last 7 days (oldest first)
      for (let i = 6; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);

        const records = await Attendance.find({ date: dayStart });

        const presentCount = records.filter(
          (r) => r.checkInTime || r.status
        ).length;

        let lateCount = 0;
        records.forEach((r) => {
          const officeStart = new Date(dayStart);
          officeStart.setHours(9, 30, 0, 0);

          const isLate =
            typeof r.isLate === "boolean"
              ? r.isLate
              : r.checkInTime && new Date(r.checkInTime) > officeStart;

          if (isLate) lateCount++;
        });

        const absentCount = Math.max(totalEmployees - presentCount, 0);

        result.push({
          date: dayStart.toISOString().slice(0, 10),
          present: presentCount,
          late: lateCount,
          absent: absentCount,
        });
      }

      res.json({
        totalEmployees,
        days: result,
      });
    } catch (error) {
      console.error("Manager weekly error:", error);
      res
        .status(500)
        .json({ message: "Failed to load weekly attendance trend" });
    }
  }
);

module.exports = router;
