import React, { useEffect, useState } from "react";
import http from "../api/http.js";

const PRIORITY_BADGES = {
  Critical: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800",
  High: "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  Low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
};

export default function ProblemDnaView() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("recent"); // "recent" | "recurring"

  useEffect(() => {
    let mounted = true;
    async function loadInsights() {
      try {
        const res = await http.get("/analytics/insights");
        if (mounted && res.data?.success) {
          setInsights(res.data);
        }
      } catch (err) {
        console.error("Failed to load problem DNA insights:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadInsights();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/40 bg-white/55 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/40 text-center">
        <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#f9a61a] border-t-transparent" />
        <p className="mt-2 text-xs font-bold text-slate-500">Analyzing Problem DNA & Solution Pathways...</p>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="rounded-3xl border border-white/40 bg-white/55 p-6 shadow-soft backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/40">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🧬</span>
            <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
              AI Problem DNA & Solution Pathways
            </h3>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-[#f9a61a] border border-[#f9a61a]/20">
              SamasyaSetu Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated root cause identification, corrective resolution pathways, and SLA recommendations.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("recent")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeTab === "recent"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Active Tickets ({insights.recentPathways?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("recurring")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeTab === "recurring"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Recurring Root Causes ({insights.recurringCauses?.length || 0})
          </button>
        </div>
      </div>

      {/* Content Section */}
      {activeTab === "recent" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {insights.recentPathways?.map((item) => {
            const badgeClass =
              PRIORITY_BADGES[item.dna?.priority] || PRIORITY_BADGES.Medium;
            return (
              <div
                key={item.ticketId}
                className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950/60"
              >
                {/* Card Top */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div>
                    <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">
                      {item.ticketId}
                    </span>
                    <span className="ml-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {item.category}
                    </span>
                    {item.isEscalated && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-black uppercase text-red-500 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900">
                        ⚡ Escalated
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${badgeClass}`}
                  >
                    {item.dna?.suggestedSlaHours}h SLA • {item.dna?.priority}
                  </span>
                </div>

                {/* Complaint Summary */}
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 italic">
                  "{item.summary}"
                </p>

                {/* Problem DNA Breakdown */}
                <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800/80 text-xs">
                  {/* Root Cause */}
                  <div className="flex items-start gap-2">
                    <span className="font-black text-slate-400 text-[10px] uppercase tracking-wider min-w-[75px] pt-0.5">
                      Root Cause:
                    </span>
                    <span className="font-semibold text-rose-700 dark:text-rose-400">
                      {item.dna?.rootCause}
                    </span>
                  </div>

                  {/* AI Solution Pathway */}
                  <div className="flex items-start gap-2">
                    <span className="font-black text-slate-400 text-[10px] uppercase tracking-wider min-w-[75px] pt-0.5">
                      AI Pathway:
                    </span>
                    <span className="font-medium text-emerald-800 dark:text-emerald-300">
                      {item.dna?.solutionPathway}
                    </span>
                  </div>

                  {/* Assigned Unit */}
                  {item.dna?.departmentUnit && (
                    <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="font-black uppercase tracking-wider">Unit:</span>
                      <span className="font-mono">{item.dna?.departmentUnit}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Recurring Root Causes View */
        <div className="space-y-3">
          {insights.recurringCauses?.map((cause, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/60"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white dark:bg-white dark:text-slate-900">
                    {cause.count}
                  </span>
                  <span className="text-xs font-black text-rose-700 dark:text-rose-400">
                    {cause.rootCause}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5 pl-7">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Suggested Action:</span>
                  <span>{cause.solutionPathway}</span>
                </div>
                <div className="text-[10px] text-slate-400 pl-7">
                  Tickets: {cause.sampleTickets.join(", ")}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 md:self-center pl-7 md:pl-0">
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                  {cause.suggestedSlaHours}h SLA • {cause.priority}
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  {cause.departmentUnit}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
