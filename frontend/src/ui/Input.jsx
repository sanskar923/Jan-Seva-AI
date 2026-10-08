import React from "react";

export default function Input({ label, className = "", ...props }) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-xs font-semibold text-slate-300">{label}</div> : null}
      <input
        className={`w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500 ${className}`}
        {...props}
      />
    </label>
  );
}

