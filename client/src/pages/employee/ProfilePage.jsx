import { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    try {
      setError("");
      const res = await apiClient.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      console.error("PROFILE ERROR:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to load profile"
      );
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleBack = () => {
    window.location.href = "/employee/dashboard";
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>My Profile</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!user && !error && <p>Loading...</p>}

      {user && (
        <div style={{ marginTop: "1rem" }}>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Employee ID:</strong> {user.employeeId}
          </p>
          <p>
            <strong>Department:</strong> {user.department}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
          {user.createdAt && (
            <p>
              <strong>Joined:</strong>{" "}
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          )}

          <button
            onClick={handleBack}
            style={{ marginTop: "1rem" }}
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
