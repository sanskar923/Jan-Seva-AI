import React from "react";

export default function Card({ children, className = "", glass = false }) {
  const glassCls = glass
    ? "border-slate-800 bg-slate-900/60 shadow-2xl backdrop-blur-md"
    : "border-slate-800 bg-slate-900/70 shadow-xl backdrop-blur-sm";

  return (
    <div
      className={`rounded-2xl border text-slate-100 p-5 ${glassCls} ${className}`}
    >
      {children}
    </div>
  );
}
