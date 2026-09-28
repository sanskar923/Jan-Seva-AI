import React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../state/AuthContext.jsx";
import { useAppTranslation } from "../utils/translations.js";
import ThemeToggle from "./ThemeToggle.jsx";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import Button from "../ui/Button.jsx";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-xl px-3 py-2 text-sm font-semibold transition ${
          isActive
            ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
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
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/75 backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
            JS
          </div>
          <div>
            <div className="text-sm font-extrabold leading-4">{t("nav.brand")}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">{t("nav.portalSubtitle")}</div>
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
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition cursor-pointer"
          >
            {dict.navHowItWorks}
          </a>
          <a
            href="#impact"
            onClick={(e) => handleAnchorClick(e, "impact")}
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition cursor-pointer"
          >
            {dict.navImpact}
          </a>
          <a
            href="#about"
            onClick={(e) => handleAnchorClick(e, "about")}
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition cursor-pointer"
          >
            {dict.navAbout}
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
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
      <div className="flex md:hidden items-center justify-around border-t border-slate-100 bg-white/50 px-3 py-1.5 text-xs font-bold text-slate-600 dark:border-slate-800/60 dark:bg-slate-950/40 dark:text-slate-300">
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
