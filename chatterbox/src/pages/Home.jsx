import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      setUsername(decoded.username);

      fetch("/api/profile", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.avatar) setAvatar(data.avatar);
        });
    } catch {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [token, navigate]);

  /* ---------------- Logged Out View ---------------- */
  if (!token) {
    return (
      <div style={styles.container}>
        <div style={styles.heroCard}>
          <h1 style={styles.title}>Welcome to ChatterBox</h1>
          <p style={styles.subtitle}>
            The next-generation social platform for developers and creators.
          </p>

          <div style={{ marginTop: "30px" }}>
            <Link to="/register">
              <button style={styles.primary}>Get Started</button>
            </Link>

            <Link to="/login">
              <button style={styles.secondary}>Login</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- Logged In View ---------------- */
  return (
    <div style={styles.container}>
      <div style={styles.dashboardCard}>
        {avatar && (
          <img
            src={avatar}
            alt="profile"
            style={styles.avatar}
          />
        )}

        <h1 style={{ marginTop: "20px" }}>
          Welcome back, {username} 👋
        </h1>

        <p style={{ color: "#cbd5e1" }}>
          Ready to connect and share something amazing today?
        </p>

        <div style={{ marginTop: "30px" }}>
          <Link to="/app/feed">
            <button style={styles.primary}>Go to Feed</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80vh",
    padding: "20px"
  },

  heroCard: {
    textAlign: "center",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    padding: "60px",
    borderRadius: "20px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
    color: "white"
  },

  dashboardCard: {
    textAlign: "center",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    padding: "60px",
    borderRadius: "20px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
    color: "white"
  },

  title: {
    fontSize: "42px",
    marginBottom: "15px"
  },

  subtitle: {
    fontSize: "18px",
    color: "#cbd5e1"
  },

  primary: {
    padding: "12px 24px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "white",
    cursor: "pointer",
    marginRight: "15px"
  },

  secondary: {
    padding: "12px 24px",
    borderRadius: "12px",
    border: "none",
    background: "#e2e8f0",
    cursor: "pointer"
  },

  avatar: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #3b82f6"
  }
};
