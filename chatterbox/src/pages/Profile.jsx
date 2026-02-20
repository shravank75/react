import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUsername(decoded.username);
    } catch {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [token, navigate]);

  // Load existing profile data
  useEffect(() => {
    if (!token) return;

    fetch("/api/profile", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.bio) setBio(data.bio);
      });
  }, [token]);

  const updateProfile = async () => {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ bio })
    });

    const data = await res.json();

    if (data.success) {
      setMessage("Profile updated successfully!");
    } else {
      setMessage(data.error || "Something went wrong");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>@{username}</h2>

        <label>Bio</label>
        <textarea
          className="input"
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
        />

        <button className="button-primary" onClick={updateProfile}>
          Save Changes
        </button>

        {message && (
          <p style={{ marginTop: "15px", color: "#22c55e" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
