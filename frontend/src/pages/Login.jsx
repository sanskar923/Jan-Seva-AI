import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../state/AuthContext.jsx";
import { useAppTranslation } from "../utils/translations.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { login, loginAsDemo } = useAuth();
  const { dict } = useAppTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isBusy) return;
    setErrorMsg("");
    setIsBusy(true);

    try {
      const userObj = await login(email.trim(), password);
      if (userObj?.role === "admin") {
        navigate("/admin");
      } else if (userObj?.role === "university") {
        navigate("/university");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const status = err.response?.status;
      const respMsg = err.response?.data?.message;
      if (status === 404 || respMsg?.toLowerCase().includes("not found")) {
        setErrorMsg("Account not found. Please click 'Create Account' to register.");
      } else if (respMsg) {
        setErrorMsg(respMsg);
      } else {
        setErrorMsg("Account not found. Please click 'Create Account' to register.");
      }
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-[#fdfaf3] dark:bg-slate-950 px-4 py-12 font-sans transition-colors">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(249,166,26,0.06),_transparent_70%)] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-[480px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.06)] dark:shadow-none"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 text-[#f9a61a] text-[10px] font-black uppercase tracking-widest mb-3">
            Jan Seva AI • Secure Access
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-[#141b2d] dark:text-white mb-2">
            Welcome <span className="text-[#f9a61a]">back</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
            Sign in to your civic workspace
          </p>
        </div>

        {/* --- DEMO / EVALUATOR QUICK SELECTOR --- */}
        <div className="mb-6 p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span>⚡</span> Quick Demo Roles
            </span>
            <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
              Evaluator Mode
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isBusy}
              onClick={async () => {
                setIsBusy(true);
                try {
                  await loginAsDemo("citizen");
                  navigate("/dashboard");
                } finally {
                  setIsBusy(false);
                }
              }}
              className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#f9a61a] text-left transition-all text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 shadow-sm"
            >
              <span className="text-base">👤</span>
              <div className="min-w-0">
                <div className="font-black text-slate-900 dark:text-white leading-tight">Citizen (sanskar123)</div>
                <div className="text-[10px] text-slate-400">Citizen Workspace</div>
              </div>
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={async () => {
                setIsBusy(true);
                try {
                  await loginAsDemo("university");
                  navigate("/university");
                } finally {
                  setIsBusy(false);
                }
              }}
              className="py-2.5 px-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 text-left transition-all text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2 shadow-sm"
            >
              <span className="text-base">🎓</span>
              <div className="min-w-0">
                <div className="font-black text-indigo-950 dark:text-indigo-200 leading-tight">Faculty (MANIT Lab)</div>
                <div className="text-[10px] text-indigo-500 dark:text-indigo-400">University Portal</div>
              </div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-bold space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base">⚠️</span>
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
              {errorMsg.includes("Create Account") && (
                <div className="pt-1">
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141b2d] dark:bg-white text-white dark:text-slate-900 text-xs font-black hover:opacity-90 transition-opacity"
                  >
                    <span>➕</span> Create Account Now
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Email or Username Input */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 ml-1">
              Email or Username
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 focus:border-[#f9a61a] dark:focus:border-[#f9a61a] focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
              placeholder="e.g. sanskar123 or citizen@email.com"
              required
              autoComplete="username"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 ml-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 focus:border-[#f9a61a] dark:focus:border-[#f9a61a] focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {/* Main Action Button: Sign In / Login */}
          <button
            type="submit"
            disabled={isBusy}
            className={`w-full py-4 text-white text-base font-black rounded-2xl transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-wider ${
              isBusy 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-[#141b2d] hover:bg-slate-800 dark:bg-[#f9a61a] dark:hover:bg-[#e09312] dark:text-slate-950 shadow-slate-900/15 dark:shadow-orange-500/20'
            }`}
          >
            {isBusy ? "Signing in..." : (dict.navLogin || "Sign In")}
          </button>
        </form>

        {/* New citizen link */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
            New citizen?{" "}
            <Link to="/signup" className="text-[#f9a61a] font-black hover:underline underline-offset-4">
              {dict.navSignup || "Create an account"}
            </Link>
          </p>
        </div>
        
        {/* Existing Demo Credentials Helper: 1-Click Admin */}
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              City Admin Workspace
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">
              admin / admin123
            </p>
          </div>
          <button
            type="button"
            disabled={isBusy}
            onClick={async () => {
              setIsBusy(true);
              try {
                await loginAsDemo("admin");
                navigate("/admin");
              } finally {
                setIsBusy(false);
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-[#141b2d] dark:bg-white text-white dark:text-slate-900 text-xs font-black hover:opacity-90 transition-opacity shadow-sm"
          >
            🛡️ 1-Click Admin
          </button>
        </div>
      </motion.div>
    </div>
  );
}