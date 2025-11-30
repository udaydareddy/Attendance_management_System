const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const { generateAttendanceCSV } = require("../utils/csvExport");


router.post("/checkin", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
      user: userId,
      date: today,
    });

    if (existing && existing.checkInTime) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    let record;

    if (!existing) {
      record = await Attendance.create({
        user: userId,
        date: today,
        checkInTime: new Date(),
      });
    } else {
      existing.checkInTime = new Date();
      await existing.save();
      record = existing;
    }

    res.json({ message: "Check-in successful", attendance: record });
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({ message: "Check-in failed" });
  }
});


router.post("/checkout", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      user: userId,
      date: today,
    });

    if (!attendance || !attendance.checkInTime) {
      return res.status(400).json({ message: "You have not checked in today" });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ message: "Already checked out" });
    }

    const checkOut = new Date();
    attendance.checkOutTime = checkOut;

    const hours =
      (checkOut - attendance.checkInTime) / (1000 * 60 * 60);
    attendance.totalHours = Number(hours.toFixed(2));

    const officeStart = new Date(attendance.date);
    officeStart.setHours(9, 30, 0, 0);

    const isLate = attendance.checkInTime > officeStart;
    attendance.isLate = isLate;

    let status = "Present";
    if (attendance.totalHours < 4) {
      status = "Half Day";
    } else if (isLate) {
      status = "Late";
    }

    attendance.status = status;

    await attendance.save();

    res.json({
      message: "Check-out successful",
      totalHours: attendance.totalHours,
      status: attendance.status,
      isLate: attendance.isLate,
      attendance,
    });
  } catch (error) {
    console.error("Check-out error:", error);
    res.status(500).json({ message: "Check-out failed" });
  }
});


router.get("/today", authMiddleware, async (req, res) => {
  try {
    const today = new Date().setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      user: req.user.id,
      date: today,
    });

    res.json(attendance || {});
  } catch (error) {
    console.error("Today status error:", error);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
});


router.get("/my", authMiddleware, async (req, res) => {
  try {
    const { limit = 30 } = req.query;

    const records = await Attendance.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(Number(limit));

    res.json(records);
  } catch (error) {
    console.error("My history error:", error);
    res.status(500).json({ message: "Failed to fetch history" });
  }
});


router.get("/my-summary", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.query; 

    const now = new Date();

    let year = now.getFullYear();
    let m = now.getMonth(); 

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      year = Number(month.split("-")[0]);
      m = Number(month.split("-")[1]) - 1;
    }

    const start = new Date(year, m, 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(year, m + 1, 0); 
    end.setHours(23, 59, 59, 999);

    const records = await Attendance.find({
      user: userId,
      date: { $gte: start, $lte: end },
    });

    let presentDays = 0;
    let lateDays = 0;
    let halfDays = 0;
    let totalHours = 0;

    const daysWithRecord = new Set();

    records.forEach((rec) => {
      const dKey = new Date(rec.date).toISOString().slice(0, 10);
      daysWithRecord.add(dKey);

      if (rec.totalHours) {
        totalHours += rec.totalHours;
      }

      const status = rec.status || (rec.checkInTime ? "Present" : "Absent");

      if (status === "Present") presentDays++;
      if (status === "Late") lateDays++;
      if (status === "Half Day") halfDays++;
    });


    const firstDay = new Date(start);
    const lastDay =
      year === now.getFullYear() && m === now.getMonth()
        ? new Date(now) 
        : new Date(end);

    let absentDays = 0;

    for (
      let d = new Date(firstDay);
      d <= lastDay;
      d.setDate(d.getDate() + 1)
    ) {
      const key = d.toISOString().slice(0, 10);
      if (!daysWithRecord.has(key)) {
        absentDays++;
      }
    }

    res.json({
      month: `${year}-${String(m + 1).padStart(2, "0")}`,
      presentDays,
      lateDays,
      halfDays,
      absentDays,
      totalHours: Number(totalHours.toFixed(2)),
    });
  } catch (error) {
    console.error("My summary error:", error);
    res.status(500).json({ message: "Failed to fetch summary" });
  }
});


router.get(
  "/all",
  authMiddleware,
  requireRole(["manager"]),
  async (req, res) => {
    try {
      const {
        limit = 50,
        startDate,
        endDate,
        employeeId,
        department,
        status,
      } = req.query;

      const query = {};

      if (startDate || endDate) {
        const start = startDate ? new Date(startDate) : new Date("1970-01-01");
        start.setHours(0, 0, 0, 0);
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);
        query.date = { $gte: start, $lte: end };
      }

      if (status) {
        query.status = status;
      }

      if (employeeId) {
        const user = await User.findOne({ employeeId });
        if (!user) {
          return res.json([]);
        }
        query.user = user._id;
      }

      if (department) {
        const usersInDept = await User.find({
          department,
          role: "employee",
        }).select("_id");

        const ids = usersInDept.map((u) => u._id);
        if (!ids.length) {
          return res.json([]);
        }

        if (query.user) {
          if (!ids.includes(query.user)) {
            return res.json([]);
          }
        } else {
          query.user = { $in: ids };
        }
      }

      const records = await Attendance.find(query)
        .populate("user", "name employeeId department role")
        .sort({ date: -1 })
        .limit(Number(limit));

      res.json(records);
    } catch (error) {
      console.error("All attendance error:", error);
      res.status(500).json({ message: "Failed to fetch all attendance" });
    }
  }
);


router.get(
  "/export",
  authMiddleware,
  requireRole(["manager"]),
  async (req, res) => {
    try {
      const { startDate, endDate, employeeId } = req.query;

      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ message: "startDate and endDate are required" });
      }

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const query = {
        date: { $gte: start, $lte: end },
      };

      if (employeeId) {
        const user = await User.findOne({ employeeId });
        if (!user) {
          return res
            .status(404)
            .json({ message: "Employee with given ID not found" });
        }
        query.user = user._id;
      }

      const records = await Attendance.find(query).populate(
        "user",
        "name employeeId department"
      );

      if (!records.length) {
        return res
          .status(404)
          .json({ message: "No attendance records for given filters" });
      }

      const csv = generateAttendanceCSV(records);

      const fileName = employeeId
        ? `attendance_${employeeId}_${startDate}_to_${endDate}.csv`
        : `attendance_${startDate}_to_${endDate}.csv`;

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );

      res.send(csv);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ message: "Failed to export attendance" });
    }
  }
);
// ✅ GET MONTH DATA (for calendar view)
router.get("/month", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.query; // YYYY-MM

    const now = new Date();
    let year = now.getFullYear();
    let m = now.getMonth();

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      year = Number(month.split("-")[0]);
      m = Number(month.split("-")[1]) - 1;
    }

    const start = new Date(year, m, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(year, m + 1, 0);
    end.setHours(23, 59, 59, 999);

    const records = await Attendance.find({
      user: userId,
      date: { $gte: start, $lte: end },
    });

    const map = {};
    records.forEach((rec) => {
      const key = rec.date.toISOString().slice(0, 10);
      map[key] = {
        status: rec.status || "Present",
        checkInTime: rec.checkInTime,
        checkOutTime: rec.checkOutTime,
        totalHours: rec.totalHours,
      };
    });

    res.json(map);
  } catch (error) {
    console.error("Calendar month error:", error);
    res.status(500).json({ message: "Failed to load month data" });
  }
});


module.exports = router;
