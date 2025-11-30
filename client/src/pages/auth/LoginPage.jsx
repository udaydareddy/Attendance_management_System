import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../../api/apiClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.user.role === "manager") navigate("/manager/dashboard");
      else navigate("/employee/dashboard");
    } catch {
      setError("Invalid email or password");
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
            <h2 style={styles.leftTitle}>Smart Workday Tracking</h2>
            <p style={styles.leftText}>
              A unified platform for{" "}
              <strong>Employees</strong> and <strong>Managers</strong> to manage
              daily check-ins, attendance status, and performance insights.
            </p>

            <ul style={styles.leftList}>
              <li>✔ Employee Check-In & Check-Out</li>
              <li>✔ Auto Present / Late / Half-Day / Absent</li>
              <li>✔ Manager analytics & CSV export</li>
              <li>✔ Monthly calendar & weekly trend</li>
            </ul>
          </div>

          <div style={styles.leftFooter}>
            <span>Built for teams that value time.</span>
          </div>
        </div>

        {/* RIGHT PANEL - JUST LOGIN FORM */}
        <div style={styles.rightPanel}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h1 style={styles.formTitle}>Welcome back</h1>
            <p style={styles.formSubtitle}>
              Login using your registered email and password.
            </p>
          </div>

          {error && (
            <p style={{ color: "#f97373", marginBottom: "0.75rem" }}>{error}</p>
          )}

          <form onSubmit={handleLogin} style={{ width: "100%" }}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" style={styles.primaryButton}>
              Sign in
            </button>
          </form>

          <p style={styles.switchText}>
            New here?{" "}
            <Link to="/register" style={styles.link}>
              Create an account
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
    maxWidth: "950px",
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
      "linear-gradient(145deg, rgba(59,130,246,0.25), rgba(147,51,234,0.6))",
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
    marginTop: "0.75rem",
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
