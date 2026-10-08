import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  useEffect(() => {
    localStorage.setItem("janSevaTheme", "dark");
    localStorage.setItem("theme", "dark");
    const root = document.documentElement;
    root.classList.remove("light");
    root.classList.add("dark");
  }, []);

  const value = useMemo(
    () => ({
      theme: "dark",
      toggle: () => {}
    }),
    []
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

