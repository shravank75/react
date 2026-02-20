import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);

      fetch("/api/profile", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
        .then(res => {
          if (res.status === 401) {
            localStorage.removeItem("token");
            setUser(null);
            setLoading(false);
            return;
          }
          return res.json();
        })
        .then(data => {
          if (!data) return;

          setUser({
            username: decoded.username,
            bio: data.bio,
            avatar: data.avatar
          });

          setLoading(false);
        });

    } catch {
      localStorage.removeItem("token");
      setUser(null);
      setLoading(false);
    }

  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);

    const decoded = jwtDecode(token);

    setUser({
      username: decoded.username
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
