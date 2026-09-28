import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";

export default function DemoRoleToggle() {
  const [open, setOpen] = useState(false);
  const { user, isAuthed, loginAsDemo, switchRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentRole = !isAuthed
    ? "guest"
    : user?.role === "university"
    ? "university"
    : user?.role === "admin"
    ? "admin"
    : "citizen";

  function handleRoleSelect(role) {
    if (role === "guest") {
      logout();
      setOpen(false);
      return;
    }

    loginAsDemo(role);
    setOpen(false);

    // If currently on /university and switched to citizen/guest, the page gatekeeper will immediately update!
    // If currently on /login, navigate to appropriate view
    if (location.pathname === "/login") {
      if (role === "university") navigate("/university");
      else if (role === "admin") navigate("/admin");
      else navigate("/dashboard");
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans print:hidden">
      {open ? (
        <div className="w-80 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-base">⚡</span>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Evaluator Role Switcher
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Test RBAC permissions in 1 click
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="h-6 w-6 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {/* Citizen Option */}
            <button
              type="button"
              onClick={() => handleRoleSelect("citizen")}
              className={`w-full flex items-center justify-between rounded-xl p-2.5 text-left transition-all border ${
                currentRole === "citizen"
                  ? "border-[#f9a61a] bg-orange-50/60 dark:bg-orange-950/30 text-slate-900 dark:text-white"
                  : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">👤</span>
                <div>
                  <div className="text-xs font-black">Citizen View</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    sanskar123 • Gates University Portal
                  </div>
                </div>
              </div>
              {currentRole === "citizen" && (
                <span className="text-[9px] bg-[#f9a61a] text-slate-900 px-2 py-0.5 rounded-full font-black">
                  ACTIVE
                </span>
              )}
            </button>

            {/* University Faculty Option */}
            <button
              type="button"
              onClick={() => handleRoleSelect("university")}
              className={`w-full flex items-center justify-between rounded-xl p-2.5 text-left transition-all border ${
                currentRole === "university"
                  ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200"
                  : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🎓</span>
                <div>
                  <div className="text-xs font-black">University Lab Faculty</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Dr. Sharma (MANIT) • Full Access
                  </div>
                </div>
              </div>
              {currentRole === "university" && (
                <span className="text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-black">
                  ACTIVE
                </span>
              )}
            </button>

            {/* City Admin Option */}
            <button
              type="button"
              onClick={() => handleRoleSelect("admin")}
              className={`w-full flex items-center justify-between rounded-xl p-2.5 text-left transition-all border ${
                currentRole === "admin"
                  ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-slate-900 dark:text-white"
                  : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🛡️</span>
                <div>
                  <div className="text-xs font-black">City Admin View</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    admin • Dual-Track Assignment
                  </div>
                </div>
              </div>
              {currentRole === "admin" && (
                <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black">
                  ACTIVE
                </span>
              )}
            </button>

            {/* Guest / Public Option */}
            <button
              type="button"
              onClick={() => handleRoleSelect("guest")}
              className={`w-full flex items-center justify-between rounded-xl p-2 text-left transition-all border ${
                currentRole === "guest"
                  ? "border-slate-400 bg-slate-100 dark:bg-slate-800"
                  : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm">🌐</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Public Guest (Signed Out)
                </span>
              </div>
              {currentRole === "guest" && (
                <span className="text-[9px] bg-slate-400 text-white px-2 py-0.5 rounded-full font-black">
                  ACTIVE
                </span>
              )}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3.5 py-2 text-xs font-extrabold text-slate-800 shadow-xl backdrop-blur transition-all hover:scale-105 hover:bg-white dark:border-slate-800 dark:bg-slate-900/90 dark:text-white dark:hover:bg-slate-900"
          title="Click to toggle between Citizen and University Lab Faculty views"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>⚡ Demo Role:</span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-black uppercase text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">
            {currentRole === "university"
              ? "🎓 University Lab"
              : currentRole === "admin"
              ? "🛡️ Admin"
              : currentRole === "citizen"
              ? "👤 Citizen"
              : "🌐 Public Guest"}
          </span>
        </button>
      )}
    </div>
  );
}
