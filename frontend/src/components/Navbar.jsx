import React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../state/AuthContext.jsx";
import { useAppTranslation } from "../utils/translations.js";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import Button from "../ui/Button.jsx";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-xl px-3 py-2 text-sm font-semibold transition ${
          isActive
            ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
            : "text-slate-400 hover:bg-slate-800/60 hover:text-white border border-transparent"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const { t } = useTranslation();
  const { dict } = useAppTranslation();
  const { isAuthed, user, isAdmin, canAccessUniversity, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function handleAnchorClick(e, targetId) {
    e.preventDefault();
    if (location.pathname === "/") {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    }
  }

  return (
    <div className="sticky top-0 z-40 border-b border-slate-800 bg-[#0B0F17]/85 backdrop-blur-md text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/20">
            JS
          </div>
          <div>
            <div className="text-sm font-extrabold leading-4 text-white">{t("nav.brand")}</div>
            <div className="text-[11px] text-slate-400">{t("nav.portalSubtitle")}</div>
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavItem to="/">{dict.navHome}</NavItem>
          {canAccessUniversity ? <NavItem to="/university">{dict.navUniPortal}</NavItem> : null}
          {isAuthed ? <NavItem to="/dashboard">{t("nav.dashboard")}</NavItem> : null}
          {isAuthed && isAdmin ? <NavItem to="/admin">{t("nav.admin")}</NavItem> : null}

          <a
            href="#how-it-works"
            onClick={(e) => handleAnchorClick(e, "how-it-works")}
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-400 hover:bg-slate-800/60 hover:text-white transition cursor-pointer"
          >
            {dict.navHowItWorks}
          </a>
          <a
            href="#impact"
            onClick={(e) => handleAnchorClick(e, "impact")}
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-400 hover:bg-slate-800/60 hover:text-white transition cursor-pointer"
          >
            {dict.navImpact}
          </a>
          <a
            href="#about"
            onClick={(e) => handleAnchorClick(e, "about")}
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-400 hover:bg-slate-800/60 hover:text-white transition cursor-pointer"
          >
            {dict.navAbout}
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <LanguageSwitcher />
          {!isAuthed ? (
            <>
              <Link to="/login">
                <Button variant="secondary">{dict.navLogin}</Button>
              </Link>
              <Link to="/signup" className="hidden sm:block">
                <Button>{dict.navSignup}</Button>
              </Link>
            </>
          ) : (
            <>
              <div className="hidden items-center gap-1.5 sm:flex">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {user?.fullName || user?.username}
                </span>
                {user?.role === "university" && (
                  <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-black uppercase text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                    🎓 Faculty
                  </span>
                )}
                {user?.role === "admin" && (
                  <span className="rounded-md bg-orange-100 px-2 py-0.5 text-[10px] font-black uppercase text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
                    🛡️ Admin
                  </span>
                )}
              </div>
              <Button variant="secondary" onClick={logout}>
                {t("nav.logout")}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Links */}
      <div className="flex md:hidden items-center justify-around border-t border-slate-800 bg-[#0B0F17]/90 px-3 py-1.5 text-xs font-bold text-slate-400">
        {canAccessUniversity && (
          <>
            <Link
              to="/university"
              className="px-2 py-1 rounded-lg text-indigo-600 dark:text-indigo-400 font-extrabold hover:text-slate-900 dark:hover:text-white"
            >
              {dict.navUniPortal}
            </Link>
            <span>•</span>
          </>
        )}
        <a
          href="#how-it-works"
          onClick={(e) => handleAnchorClick(e, "how-it-works")}
          className="px-2 py-1 rounded-lg hover:text-slate-900 dark:hover:text-white"
        >
          {dict.navHowItWorks}
        </a>
        <span>•</span>
        <a
          href="#impact"
          onClick={(e) => handleAnchorClick(e, "impact")}
          className="px-2 py-1 rounded-lg hover:text-slate-900 dark:hover:text-white"
        >
          {dict.navImpact}
        </a>
        <span>•</span>
        <a
          href="#about"
          onClick={(e) => handleAnchorClick(e, "about")}
          className="px-2 py-1 rounded-lg hover:text-slate-900 dark:hover:text-white"
        >
          {dict.navAbout}
        </a>
      </div>
    </div>
  );
}
