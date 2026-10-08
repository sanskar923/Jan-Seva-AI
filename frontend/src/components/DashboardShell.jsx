import React from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "../state/AuthContext.jsx";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import Button from "../ui/Button.jsx";

function SideLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition ${
          isActive
            ? "bg-violet-600/20 text-violet-300 border border-violet-500/30 shadow-sm"
            : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function DashboardShell({ title, subtitle, children }) {
  const { t } = useTranslation();
  const { user, isAdmin, logout } = useAuth();

  return (
    <div className="min-h-[calc(100vh-0px)] bg-[#0B0F17] text-slate-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
        <motion.aside
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="sticky top-24 hidden h-[calc(100vh-7rem)] w-64 shrink-0 flex-col rounded-3xl border border-slate-800/80 bg-slate-900/40 p-4 shadow-2xl backdrop-blur-md lg:flex"
        >
          <div className="flex items-center gap-3 px-1">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-sm font-black text-white shadow-lg shadow-indigo-500/25">
              JS
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold">{t("nav.brand")}</div>
              <div className="truncate text-xs text-slate-400">{user?.username}</div>
            </div>
          </div>

          <div className="mt-6 space-y-1">
            <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">{t("shell.workspace")}</div>
            <SideLink to="/dashboard">{t("shell.submitTrack")}</SideLink>
            {isAdmin ? <SideLink to="/admin">{t("shell.adminAnalytics")}</SideLink> : null}
            <Link
              to="/"
              className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            >
              {t("shell.landing")}
            </Link>
          </div>

          <div className="mt-auto space-y-3 border-t border-slate-800/80 pt-4">
            <LanguageSwitcher className="flex-col items-stretch gap-1 px-1" />
            <Button variant="secondary" className="w-full" onClick={logout}>
              {t("nav.logout")}
            </Button>
          </div>
        </motion.aside>

        <div className="min-w-0 flex-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md lg:hidden"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold">{t("shell.mobileTitle")}</div>
                <div className="text-xs text-slate-400">{user?.username}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <LanguageSwitcher />
                <Button variant="secondary" onClick={logout}>
                  {t("nav.logout")}
                </Button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `rounded-2xl px-3 py-2 text-xs font-bold transition ${
                    isActive ? "bg-violet-600/20 text-violet-300 border border-violet-500/30" : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
                  }`
                }
              >
                {t("nav.dashboard")}
              </NavLink>
              {isAdmin ? (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `rounded-2xl px-3 py-2 text-xs font-bold transition ${
                      isActive ? "bg-violet-600/20 text-violet-300 border border-violet-500/30" : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
                    }`
                  }
                >
                  {t("nav.admin")}
                </NavLink>
              ) : null}
            </div>
          </motion.div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-violet-400">
              {t("dashboard.sectionLabel")}
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">{title}</h1>
            {subtitle ? <p className="mt-2 max-w-2xl text-sm text-slate-400">{subtitle}</p> : null}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
