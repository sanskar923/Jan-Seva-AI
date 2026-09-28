import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import http, { AUTH_LOST_EVENT } from "../api/http.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem("janSevaToken") || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("janSevaUser");
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("janSevaToken")));

  useEffect(() => {
    function onAuthLost() {
      setToken("");
      setUser(null);
      setLoading(false);
      navigate("/login", { replace: true });
    }
    window.addEventListener(AUTH_LOST_EVENT, onAuthLost);
    return () => window.removeEventListener(AUTH_LOST_EVENT, onAuthLost);
  }, [navigate]);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    if (token.startsWith("demo-")) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    http
      .get("/auth/me")
      .then((r) => {
        if (cancelled) return;
        setUser(r.data.user);
        localStorage.setItem("janSevaUser", JSON.stringify(r.data.user));
      })
      .catch((err) => {
        if (cancelled) return;
        // 401: axios interceptor clears storage and emits AUTH_LOST (redirect + state reset).
        if (err.response?.status === 401) return;
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  async function loginAsDemo(role = "citizen") {
    let credentials;
    if (role === "university") {
      credentials = { username: "dr.sharma_manit", password: "password123" };
    } else if (role === "admin") {
      credentials = { username: "admin", password: "admin123" };
    } else {
      credentials = { username: "sanskar123", password: "1234" };
    }

    try {
      const res = await http.post("/auth/login", credentials);
      if (res.data?.token && res.data?.user) {
        localStorage.setItem("janSevaToken", res.data.token);
        localStorage.setItem("janSevaUser", JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
        setLoading(false);
        return res.data.user;
      }
    } catch {
      // Fallback in case of server network blip
    }

    let demoUser;
    let demoToken;
    if (role === "university") {
      demoUser = {
        id: "seed-university-faculty",
        username: "dr.sharma_manit",
        role: "university",
        fullName: "Dr. Alok Sharma",
        institution: "MANIT Bhopal",
        lab: "Water Resources & Smart Infrastructure Lab",
        designation: "Professor & Lab Director"
      };
      demoToken = "demo-university-token";
    } else if (role === "admin") {
      demoUser = {
        id: "seed-admin",
        username: "admin",
        role: "admin",
        fullName: "Sanjay Verma",
        designation: "Executive Engineer & Municipal Officer",
        department: "Urban Development & Housing"
      };
      demoToken = "demo-admin-token";
    } else {
      demoUser = {
        id: "556f1036-4f86-4ada-bb4a-d34113f97bef",
        username: "sanskar123",
        role: "user",
        fullName: "Sanskar Patel",
        district: "Bhopal Central"
      };
      demoToken = "demo-citizen-token";
    }

    localStorage.setItem("janSevaToken", demoToken);
    localStorage.setItem("janSevaUser", JSON.stringify(demoUser));
    setToken(demoToken);
    setUser(demoUser);
    setLoading(false);
    return demoUser;
  }

  function switchRole(newRole) {
    if (!user) {
      return loginAsDemo(newRole === "university" ? "university" : (newRole === "admin" ? "admin" : "citizen"));
    }
    const updatedUser = {
      ...user,
      role: newRole,
      institution: newRole === "university" ? (user.institution || "MANIT Bhopal") : user.institution,
      lab: newRole === "university" ? (user.lab || "Civil & Water Resources Lab") : user.lab
    };
    setUser(updatedUser);
    localStorage.setItem("janSevaUser", JSON.stringify(updatedUser));
    return updatedUser;
  }

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthed: Boolean(token) && Boolean(user),
      isAdmin: user?.role === "admin",
      isUniversity: user?.role === "university",
      canAccessUniversity: user?.role === "university" || user?.role === "admin",
      loginAsDemo,
      switchRole,
      async login(username, password) {
        let res;
        try {
          res = await http.post("/auth/login", { username, password });
        } catch (err) {
          if (username && username.includes("@")) {
            const prefix = username.split("@")[0];
            try {
              res = await http.post("/auth/login", { username: prefix, password });
            } catch {
              throw err;
            }
          } else {
            throw err;
          }
        }
        localStorage.setItem("janSevaToken", res.data.token);
        localStorage.setItem("janSevaUser", JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data.user;
      },
      async signup(username, password) {
        const res = await http.post("/auth/signup", { username, password });
        if (res.data?.token && res.data?.user) {
          localStorage.setItem("janSevaToken", res.data.token);
          localStorage.setItem("janSevaUser", JSON.stringify(res.data.user));
          setToken(res.data.token);
          setUser(res.data.user);
        }
      },
      async logout() {
        try {
          await http.post("/auth/logout");
        } catch {
          // ignore
        }
        localStorage.removeItem("janSevaToken");
        localStorage.removeItem("janSevaUser");
        setToken("");
        setUser(null);
        navigate("/login", { replace: true });
      }
    }),
    [token, user, loading, navigate]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
