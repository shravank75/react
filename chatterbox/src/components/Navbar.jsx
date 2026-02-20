import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) =>
    location.pathname === path ? styles.activeLink : styles.link;

  if (loading) return null;

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        <Link to="/" style={styles.logoText}>
          ChatterBox
        </Link>
      </div>

      <div style={styles.links}>

        {/* Public Links */}
        {!user && (
          <>
            <Link to="/" style={isActive("/")}>Home</Link>
            <Link to="/login" style={isActive("/login")}>Login</Link>
            <Link to="/register" style={isActive("/register")}>Register</Link>
          </>
        )}

        {/* Private Links */}
        {user && (
          <>
            <Link to="/" style={isActive("/")}>Home</Link>
            <Link to="/app/feed" style={isActive("/app/feed")}>Feed</Link>
            <Link to="/app/profile" style={isActive("/app/profile")}>Profile</Link>
            <Link to="/app/settings" style={isActive("/app/settings")}>Settings</Link>

            {user.avatar && (
              <img
                src={user.avatar}
                alt="avatar"
                style={styles.avatar}
              />
            )}

            <span style={styles.username}>
              {user.username}
            </span>

            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </>
        )}

      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 40px",
    background: "rgba(15, 23, 42, 0.9)",
    backdropFilter: "blur(12px)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
  },
  logo: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "white"
  },
  logoText: {
    textDecoration: "none",
    color: "white"
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "25px"
  },
  link: {
    textDecoration: "none",
    color: "#cbd5e1",
    fontWeight: 500
  },
  activeLink: {
    textDecoration: "none",
    color: "#3b82f6",
    fontWeight: 600
  },
  username: {
    color: "#e2e8f0",
    fontWeight: 600
  },
  avatar: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #3b82f6"
  },
  logoutBtn: {
    padding: "8px 14px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "white",
    cursor: "pointer"
  }
};
