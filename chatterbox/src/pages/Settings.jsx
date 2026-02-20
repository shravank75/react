import { useState } from "react";

export default function Settings() {
  const token = localStorage.getItem("token");

  const [newPassword, setNewPassword] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* ---------------- Reset Password ---------------- */
  const resetPassword = async () => {
    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          newPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Password reset failed.");
        return;
      }

      setMessage("Password updated successfully!");
      setError("");
      setNewPassword("");

    } catch {
      setError("Server error.");
    }
  };

  /* ---------------- Upload Avatar ---------------- */
  const uploadAvatar = async () => {
    if (!file) {
      setError("Please select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("/api/avatar", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed.");
        return;
      }

      setMessage("Profile photo updated!");
      setError("");

    } catch {
      setError("Server error.");
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2>Account Settings</h2>

        {/* Password Section */}
        <div style={{ marginTop: "20px" }}>
          <label>New Password</label>
          <input
            style={styles.input}
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <button style={styles.button} onClick={resetPassword}>
            Update Password
          </button>
        </div>

        {/* Avatar Section */}
        <div style={{ marginTop: "30px" }}>
          <label>Update Profile Photo</label>
          <input
            style={styles.input}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button style={styles.button} onClick={uploadAvatar}>
            Upload Photo
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.success}>{message}</p>}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80vh",
    padding: "20px"
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    padding: "40px",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "450px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
    color: "white"
  },

  input: {
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "none"
  },

  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "white",
    cursor: "pointer"
  },

  error: {
    color: "#ef4444",
    marginTop: "15px"
  },

  success: {
    color: "#22c55e",
    marginTop: "15px"
  }
};
