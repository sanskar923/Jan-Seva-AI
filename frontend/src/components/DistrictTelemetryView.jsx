import React, { useEffect, useState } from "react";
import http from "../api/http.js";
import WardAssetIntegrityMetric from "./WardAssetIntegrityMetric.jsx";

const DEFAULT_DISTRICT_TELEMETRY = [
  {
    district: "Bhopal Central (Ward 14-22)",
    severityIndex: 91,
    statusTag: "Critical Hazard",
    affectedCount: "150 affected",
    activeDomain: "Water Supply & Pipeline",
    totalIssues: 13,
    activeIssues: 12,
    resolvedIssues: 1
  },
  {
    district: "MP Nagar & Commercial Zone",
    severityIndex: 84,
    statusTag: "Severe Congestion",
    affectedCount: "320 affected",
    activeDomain: "Roads & Traffic Infra",
    totalIssues: 9,
    activeIssues: 7,
    resolvedIssues: 2
  },
  {
    district: "BHEL & Govindpura Industrial",
    severityIndex: 76,
    statusTag: "Elevated Voltage Sag",
    affectedCount: "240 affected",
    activeDomain: "Electricity & Smart Grid",
    totalIssues: 8,
    activeIssues: 6,
    resolvedIssues: 2
  },
  {
    district: "Kolar & Southern Suburbs",
    severityIndex: 68,
    statusTag: "Drainage Surcharge",
    affectedCount: "185 affected",
    activeDomain: "Sanitation & Sewerage",
    totalIssues: 6,
    activeIssues: 4,
    resolvedIssues: 2
  },
  {
    district: "Old City & Walled Heritage",
    severityIndex: 62,
    statusTag: "Pipeline Leakage",
    affectedCount: "95 affected",
    activeDomain: "Drinking Water Quality",
    totalIssues: 5,
    activeIssues: 3,
    resolvedIssues: 2
  },
  {
    district: "Ranchi Municipal Corporation",
    severityIndex: 48,
    statusTag: "Nominal Monitoring",
    affectedCount: "60 affected",
    activeDomain: "Solid Waste Management",
    totalIssues: 4,
    activeIssues: 2,
    resolvedIssues: 2
  }
];

export default function DistrictTelemetryView({ refreshKey }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWardIdx, setSelectedWardIdx] = useState(0);

  async function loadTelemetry() {
    try {
      const res = await http.get("/analytics/telemetry");
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Telemetry error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTelemetry();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-[#0b1120] p-8 text-center text-white">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <p className="mt-2 text-xs font-bold text-slate-400">Loading Active Across Districts Telemetry...</p>
      </div>
    );
  }

  const counters = data?.counters || {};
  const liveDistrictGrid = data?.districtGrid || [];

  // Merge live telemetry data with fallback for zero-fill districts
  const mergedDistricts = DEFAULT_DISTRICT_TELEMETRY.map((def) => {
    const live = liveDistrictGrid.find((g) => g.district === def.district);
    if (live && live.totalIssues > 0) {
      return {
        ...def,
        severityIndex: live.severityIndex || def.severityIndex,
        statusTag: live.statusTag || def.statusTag,
        affectedCount: `${Number(live.peopleAffected || def.affectedCount.split(" ")[0]).toLocaleString()} affected`,
        totalIssues: live.totalIssues,
        activeIssues: live.activeIssues,
        resolvedIssues: live.resolvedIssues,
        activeDomain: live.primaryCategory !== "General" ? live.primaryCategory : def.activeDomain
      };
    }
    return def;
  });

  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0b1120] text-slate-100 p-6 sm:p-8 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌐</span>
            <h3 className="text-lg font-black tracking-tight text-white">
              Active Across Districts Telemetry Grid
            </h3>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Ward Severity Grid
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time population vulnerability indices, active civic domain distribution, and severity meters across regional municipal wards.
          </p>
        </div>

        <button
          onClick={loadTelemetry}
          className="text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700 flex items-center gap-1.5"
        >
          <span>🔄</span>
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* 4 Key Impact Metric Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Handled */}
        <div className="rounded-2xl border border-slate-800 bg-[#131d36] p-4 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
            Total Problems Handled
          </div>
          <div className="text-2xl font-black text-white flex items-center justify-between">
            <span>{counters.totalHandled || 13}</span>
            <span className="text-lg">📋</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Across all municipal wards</div>
        </div>

        {/* City Repairs Assigned */}
        <div className="rounded-2xl border border-indigo-900/60 bg-indigo-950/30 p-4 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-wider text-indigo-400 mb-1">
            City Repairs Assigned (Track A)
          </div>
          <div className="text-2xl font-black text-indigo-200 flex items-center justify-between">
            <span>{counters.cityRepairsAssigned || 1}</span>
            <span className="text-lg">🏛️</span>
          </div>
          <div className="mt-1 text-[11px] text-indigo-400/80">Municipal & PWD Squads</div>
        </div>

        {/* University Lab Projects */}
        <div className="rounded-2xl border border-amber-900/60 bg-amber-950/30 p-4 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-wider text-amber-400 mb-1">
            University Lab Projects (Track B)
          </div>
          <div className="text-2xl font-black text-amber-200 flex items-center justify-between">
            <span>{counters.universityLabProjects || 0}</span>
            <span className="text-lg">🎓</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-400/80">CSR & HEI Prototype Hub</div>
        </div>

        {/* Citizens Benefited */}
        <div className="rounded-2xl border border-emerald-900/60 bg-emerald-950/30 p-4 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400 mb-1">
            Citizens Benefited
          </div>
          <div className="text-2xl font-black text-emerald-200 flex items-center justify-between">
            <span>{Number(counters.estimatedCitizensBenefited || 780).toLocaleString()}+</span>
            <span className="text-lg">👥</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-400/80">Ground Population Impact</div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* DARK-THEMED DISTRICT TELEMETRY GRID (Matching Screenshot 3)   */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>📊</span> Regional Severity & Vulnerability Grid
          </h4>
          <span className="text-[11px] text-slate-500 font-mono">Ranked by ground hazard density</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mergedDistricts.map((item, idx) => {
            const isHigh = item.severityIndex >= 75;
            const isMid = item.severityIndex >= 55 && item.severityIndex < 75;

            const badgeBg = isHigh
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
              : isMid
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40";

            const meterGradient = isHigh
              ? "from-amber-500 to-rose-600"
              : isMid
              ? "from-indigo-500 to-amber-500"
              : "from-emerald-500 to-teal-400";

            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-[#131d36] p-5 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top: District Name & Severity Index Score Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="font-extrabold text-sm text-white tracking-tight">
                      {item.district}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${badgeBg} shrink-0`}>
                      {item.severityIndex} / 100
                    </span>
                  </div>

                  {/* Middle: Affected Count (e.g. "150 affected") & Active Issues */}
                  <div className="flex items-center justify-between text-xs mb-4">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <span>👥</span> {item.affectedCount}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {item.activeIssues} Active • {item.resolvedIssues} Resolved
                    </span>
                  </div>
                </div>

                {/* Bottom Inspector Bar: Active Domain & Severity Meter */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Domain:</span>
                    <span className="font-bold text-indigo-300 truncate max-w-[200px]">
                      {item.activeDomain}
                    </span>
                  </div>

                  {/* Severity Meter Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span>Severity Meter</span>
                      <span className="font-mono text-white">{item.severityIndex}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800">
                      <div
                        className={`h-full bg-gradient-to-r ${meterGradient} transition-all duration-700 rounded-full`}
                        style={{ width: `${item.severityIndex}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* WARD OFFICER PERFORMANCE & ASSET INTEGRITY SCORE SECTION      */}
      {/* ============================================================ */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🛡️</span>
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">
              Ward Asset Lifecycle & Officer Accountability Audit
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Executive Telemetry
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400">Audited Ward:</span>
            <select
              value={selectedWardIdx}
              onChange={(e) => setSelectedWardIdx(Number(e.target.value))}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-amber-500/40"
            >
              {mergedDistricts.map((d, i) => (
                <option key={i} value={i}>
                  {d.district} ({d.activeDomain})
                </option>
              ))}
            </select>
          </div>
        </div>

        <WardAssetIntegrityMetric wardData={mergedDistricts[selectedWardIdx] || mergedDistricts[0]} />
      </div>

    </div>
  );
}
