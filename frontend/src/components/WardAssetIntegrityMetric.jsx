import React, { useState } from "react";
import { Link } from "react-router-dom";

export function getWardMetricDetails(complaint, wardData) {
  const text = String(complaint?.summary || complaint?.text || complaint?.title || "").toLowerCase();
  const cat = String(complaint?.category || "").toLowerCase();
  const district = complaint?.district || complaint?.location || wardData?.district || "Bhopal Central (Ward 14-22)";

  if (cat.includes("elect") || text.includes("light") || text.includes("power") || text.includes("transformer")) {
    return {
      wardName: district,
      score: 64,
      statusLabel: "Elevated Thermal & Load Drain",
      scoreColor: "amber",
      recurrenceText: "3rd Recurrence on this asset segment within 90 days.",
      executiveAlert: "Alert triggered to Municipal Commissioner & Assistant Engineer (Distribution) for repeat maintenance expenditure.",
      trackBBadge: "Structural threshold breached — Auto-flagged to University Innovation Portal for root-cause audit.",
      assetSegment: "Substation Feeder Transformer Branch #4 (Zone 3)",
      assetAge: "12 Years",
      cumulativeDrain: "₹3.8 Lakhs (FY 2025-26)",
      officerInCharge: complaint?.assignment?.officerName || "Er. Vivek Malviya (AE, Distribution)",
      officerSlaRate: "72.8%",
      anomalyTimeline: [
        { date: "74 days ago", issue: "Transformer Oil Overheating & Neutral Sparking", cost: "₹95,000" },
        { date: "41 days ago", issue: "Phase Cable Lug Burnout & High Surcharge", cost: "₹1,40,000" },
        { date: "Current Ticket", issue: "Feeder Trip & Chronic Insulation Degradation", cost: "₹1,45,000" }
      ]
    };
  }

  if (cat.includes("road") || text.includes("pothole") || text.includes("sadak")) {
    return {
      wardName: district,
      score: 59,
      statusLabel: "Severe Bitumen Stripping & Sub-base Failure",
      scoreColor: "rose",
      recurrenceText: "3rd Recurrence on this asset segment within 90 days.",
      executiveAlert: "Alert triggered to Municipal Commissioner & Assistant Engineer (Distribution) for repeat maintenance expenditure.",
      trackBBadge: "Structural threshold breached — Auto-flagged to University Innovation Portal for root-cause audit.",
      assetSegment: "PWD Arterial Corridor (Km 4.2 to 5.8)",
      assetAge: "8 Years",
      cumulativeDrain: "₹5.1 Lakhs (FY 2025-26)",
      officerInCharge: complaint?.assignment?.officerName || "Er. Sandeep Joshi (EE, PWD Highways)",
      officerSlaRate: "69.5%",
      anomalyTimeline: [
        { date: "82 days ago", issue: "Cold-mix Bitumen Patch (Monsoon Degradation)", cost: "₹1,20,000" },
        { date: "39 days ago", issue: "Deep Crater Pothole Compaction Failure", cost: "₹1,85,000" },
        { date: "Current Ticket", issue: "Sub-grade Settlement & Recurring Pavement Void", cost: "₹2,05,000" }
      ]
    };
  }

  // Default Standard Metric (matching prompt's exact water pipeline & drainage segment)
  return {
    wardName: district,
    score: 68,
    statusLabel: "Moderate Chronic Drain",
    scoreColor: "amber",
    recurrenceText: "3rd Recurrence on this asset segment within 90 days.",
    executiveAlert: "Alert triggered to Municipal Commissioner & Assistant Engineer (Distribution) for repeat maintenance expenditure.",
    trackBBadge: "Structural threshold breached — Auto-flagged to University Innovation Portal for root-cause audit.",
    assetSegment: "Ductile Iron Main Water Trunk Line (Bhopal Ward 14)",
    assetAge: "14 Years",
    cumulativeDrain: "₹4.2 Lakhs (FY 2025-26)",
    officerInCharge: complaint?.assignment?.officerName || "Er. Ramesh Chandra (EE, Water Works)",
    officerSlaRate: "76.4%",
    anomalyTimeline: [
      { date: "68 days ago", issue: "Excavation Patch & Emergency Pipe Clamp", cost: "₹1,10,000" },
      { date: "34 days ago", issue: "Flange Joint Seepage & Pressure Blowout", cost: "₹1,80,000" },
      { date: "Current Ticket", issue: "Structural Pipe Rupture beneath Arterial Road", cost: "₹1,30,000" }
    ]
  };
}

export default function WardAssetIntegrityMetric({ complaint, wardData, compact = false }) {
  const [showHistory, setShowHistory] = useState(false);
  const metric = getWardMetricDetails(complaint, wardData);

  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-[#0d1527] via-[#131d36] to-[#0f172a] p-4 text-white shadow-xl space-y-3.5">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-sm">
            📈
          </div>
          <div>
            <h4 className="text-xs font-black tracking-tight text-white flex items-center gap-2">
              <span>Asset Lifecycle & Officer Performance Metric</span>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Audited Metric
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">
              Ward Segment: <strong className="text-slate-200">{metric.wardName}</strong> • {metric.assetSegment}
            </p>
          </div>
        </div>

        {/* Metric Badge: "Ward Integrity Score: 68/100 (Moderate Chronic Drain)" */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wide text-amber-200">
              Ward Integrity Score: {metric.score}/100 ({metric.statusLabel})
            </span>
          </div>
        </div>
      </div>

      {/* Repeat Anomaly Tracker & Chronic Drain Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Repeat Anomaly Tracker */}
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <span>🔁</span> Repeat Anomaly Tracker
            </span>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
              Threshold Alert
            </span>
          </div>
          <div className="font-extrabold text-xs text-rose-200 leading-snug">
            "{metric.recurrenceText}"
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-rose-500/20">
            <span>Cumulative Drain: <strong className="text-rose-300">{metric.cumulativeDrain}</strong></span>
            <span>Asset Age: <strong className="text-slate-300">{metric.assetAge}</strong></span>
          </div>
        </div>

        {/* Officer Performance Context */}
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <span>👤</span> Officer Accountability Scorecard
            </span>
            <span className="text-[9px] font-bold text-emerald-400">
              SLA Adherence: {metric.officerSlaRate}
            </span>
          </div>
          <div className="font-extrabold text-xs text-slate-100">
            Lead Officer: {metric.officerInCharge}
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-indigo-500/20">
            <span>Resolution Rating: <strong className="text-amber-300">Needs Structural Overhaul</strong></span>
            <span className="font-mono text-indigo-300">Level 2 Audit</span>
          </div>
        </div>
      </div>

      {/* Executive Flag */}
      <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent p-3 text-xs">
        <div className="flex items-start gap-2.5">
          <span className="text-base shrink-0">⚠️</span>
          <div className="space-y-0.5">
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-400">
              Executive Expenditure Flag
            </div>
            <div className="font-bold text-xs text-amber-100 leading-snug">
              "{metric.executiveAlert}"
            </div>
            <div className="text-[10px] text-slate-400 pt-0.5">
              Cost of 3 field repairs (₹4.2L) exceeds 45% of capital asset replacement value. Direct investigation summoned.
            </div>
          </div>
        </div>
      </div>

      {/* Automated Track B Handover Badge */}
      <div className="rounded-xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/60 p-3 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-[240px]">
          <span className="text-base shrink-0">🎓</span>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-300 flex items-center gap-1.5">
              <span>Automated Track B Handover Badge</span>
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
            </div>
            <div className="font-extrabold text-xs text-white leading-snug mt-0.5">
              "{metric.trackBBadge}"
            </div>
          </div>
        </div>

        <Link
          to="/university"
          className="shrink-0 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-wider transition-all shadow-md flex items-center gap-1"
        >
          <span>Open Track B Audit</span>
          <span>→</span>
        </Link>
      </div>

      {/* Toggle Anomaly Timeline */}
      <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
        <span>Ward Cadastral Ref: BPL-ASSET-W14-REC3 • Statutory Audit Lock</span>
        <button
          type="button"
          onClick={() => setShowHistory((prev) => !prev)}
          className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
        >
          {showHistory ? "Hide 90-Day Anomaly Log ▲" : "Inspect 90-Day Anomaly Log (3 Events) ▼"}
        </button>
      </div>

      {showHistory && (
        <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 space-y-2 text-xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
            Recorded 90-Day Recurrence Ledger (Municipal PWD & Jal Nigam Logs)
          </div>
          {metric.anomalyTimeline.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px]"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500/20 text-rose-300 text-[9px] font-black">
                  {idx + 1}
                </span>
                <span className="font-mono text-slate-400 text-[10px]">{item.date}</span>
                <span className="text-slate-200 font-medium">{item.issue}</span>
              </div>
              <span className="font-mono font-bold text-amber-300 shrink-0">{item.cost}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
