const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");


router.get(
  "/employees",
  authMiddleware,
  requireRole(["manager"]),
  async (req, res) => {
    try {
      const employees = await User.find({ role: "employee" })
        .select("name employeeId department")
        .sort({ name: 1 });

      res.json(employees);
    } catch (error) {
      console.error("GET EMPLOYEES ERROR:", error);
      res.status(500).json({ message: "Failed to load employees" });
    }
  }
);

module.exports = router;
