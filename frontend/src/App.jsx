import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import UniversityPortal from "./pages/UniversityPortal.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DemoRoleToggle from "./components/DemoRoleToggle.jsx";
import { useAuth } from "./state/AuthContext.jsx";

function Shell() {
  const { isAuthed } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light");
    root.classList.add("dark");
    localStorage.setItem("theme", "dark");
    localStorage.setItem("janSevaTheme", "dark");
  }, []);

  const hideNav = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 selection:bg-violet-500 selection:text-white transition-colors duration-300">
      {!hideNav ? (
        <Navbar />
      ) : null}

      <main className="relative">
        <Routes>
          <Route path="/" element={<Landing />} />
          
          <Route 
            path="/login" 
            element={isAuthed ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
          <Route 
            path="/signup" 
            element={isAuthed ? <Navigate to="/dashboard" replace /> : <Signup />} 
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/university" element={<UniversityPortal />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <DemoRoleToggle />
    </div>
  );
}

export default function App() {
  return <Shell />;
}
