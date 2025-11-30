import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../../api/apiClient";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    employeeId: "",
    department: "",
    role: "employee",
  });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post("/auth/register", form);
      navigate("/login");
    } catch {
      setError("Registration failed. Please check details and try again.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* LEFT PANEL */}
        <div style={styles.leftPanel}>
          <div style={styles.brandTop}>
            <span style={styles.brandLogo}>AMS</span>
            <span style={styles.brandTag}>Attendance Management System</span>
          </div>

          <div style={styles.leftContent}>
            <h2 style={styles.leftTitle}>Create your workspace profile</h2>
            <p style={styles.leftText}>
              Register as an Employee or Manager and start tracking attendance
              with smart analytics and calendar-based insights.
            </p>

            <ul style={styles.leftList}>
              <li>✔ Track check-in and check-out times</li>
              <li>✔ Auto calculate total working hours</li>
              <li>✔ Visual calendars & weekly trends</li>
              <li>✔ Export attendance data for reports</li>
            </ul>
          </div>

          <div style={styles.leftFooter}>
            <span>Designed for modern organizations and smart teams.</span>
          </div>
        </div>

        {/* RIGHT PANEL - JUST REGISTER FORM */}
        <div style={styles.rightPanel}>
          <div style={{ marginBottom: "1.3rem" }}>
            <h1 style={styles.formTitle}>Create an account</h1>
            <p style={styles.formSubtitle}>
              Fill in your details to get started.
            </p>
          </div>

          {error && (
            <p style={{ color: "#f97373", marginBottom: "0.75rem" }}>{error}</p>
          )}

          <form onSubmit={handleRegister} style={{ width: "100%" }}>
            <label style={styles.label}>Full Name</label>
            <input
              name="name"
              placeholder="Your name"
              style={styles.input}
              onChange={handleChange}
            />

            <label style={styles.label}>Email</label>
            <input
              name="email"
              placeholder="you@example.com"
              style={styles.input}
              onChange={handleChange}
            />

            <label style={styles.label}>Password</label>
            <input
              name="password"
              type="password"
              placeholder="Create a password"
              style={styles.input}
              onChange={handleChange}
            />

            <label style={styles.label}>Employee ID</label>
            <input
              name="employeeId"
              placeholder="EMP001"
              style={styles.input}
              onChange={handleChange}
            />

            <label style={styles.label}>Department</label>
            <input
              name="department"
              placeholder="CSE / IT / HR etc."
              style={styles.input}
              onChange={handleChange}
            />

            <label style={styles.label}>Role</label>
            <select
              name="role"
              style={styles.input}
              value={form.role}
              onChange={handleChange}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>

            <button type="submit" style={styles.primaryButton}>
              Create account
            </button>
          </form>

          <p style={styles.switchText}>
            Already have an account?{" "}
            <Link to="/login" style={styles.link}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top left, #312e81, #020617 55%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "1rem",
  },
  card: {
    display: "flex",
    maxWidth: "960px",
    width: "100%",
    background: "#020617",
    borderRadius: "24px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.7)",
    overflow: "hidden",
    border: "1px solid rgba(148,163,184,0.25)",
  },
  leftPanel: {
    flex: 1.1,
    background:
      "linear-gradient(145deg, rgba(56,189,248,0.25), rgba(168,85,247,0.65))",
    color: "white",
    padding: "1.8rem 1.8rem 1.4rem 1.8rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  brandTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  brandLogo: {
    fontWeight: 800,
    fontSize: "1.25rem",
    letterSpacing: "0.15em",
  },
  brandTag: {
    fontSize: "0.75rem",
    padding: "0.25rem 0.75rem",
    borderRadius: "999px",
    background: "rgba(15,23,42,0.55)",
    border: "1px solid rgba(148,163,184,0.6)",
  },
  leftContent: {
    marginTop: "1rem",
    marginBottom: "1rem",
  },
  leftTitle: {
    fontSize: "1.7rem",
    marginBottom: "0.75rem",
  },
  leftText: {
    fontSize: "0.9rem",
    opacity: 0.9,
    marginBottom: "0.75rem",
  },
  leftList: {
    fontSize: "0.82rem",
    lineHeight: 1.6,
    opacity: 0.95,
    paddingLeft: "1rem",
  },
  leftFooter: {
    fontSize: "0.78rem",
    opacity: 0.9,
  },
  rightPanel: {
    flex: 1,
    padding: "2.2rem 2.3rem",
    background: "#020617",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  formTitle: {
    fontSize: "1.6rem",
    marginBottom: "0.3rem",
  },
  formSubtitle: {
    fontSize: "0.9rem",
    opacity: 0.7,
  },
  label: {
    display: "block",
    fontSize: "0.8rem",
    marginTop: "0.7rem",
    marginBottom: "0.25rem",
    opacity: 0.85,
  },
  input: {
    width: "100%",
    padding: "0.65rem 0.8rem",
    borderRadius: "12px",
    border: "1px solid rgba(148,163,184,0.7)",
    background: "#020617",
    color: "white",
    fontSize: "0.9rem",
    outline: "none",
    marginBottom: "0.15rem",
  },
  primaryButton: {
    width: "100%",
    marginTop: "1.1rem",
    padding: "0.7rem",
    borderRadius: "999px",
    border: "none",
    background: "linear-gradient(135deg, #6366f1, #a855f7)",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  switchText: {
    marginTop: "1rem",
    fontSize: "0.85rem",
    opacity: 0.9,
  },
  link: {
    color: "#6366f1",
    textDecoration: "none",
    fontWeight: 500,
  },
};
