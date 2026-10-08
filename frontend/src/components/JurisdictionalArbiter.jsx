import React, { useState } from "react";

export function getArbiterDetails(complaint) {
  const text = String(complaint?.summary || complaint?.text || complaint?.title || "").toLowerCase();
  const cat = String(complaint?.category || "").toLowerCase();

  if (cat.includes("elect") || text.includes("light") || text.includes("power") || text.includes("transformer") || text.includes("spark")) {
    return {
      assetTag: "Asset Mapped: DISCOM 11kV Underground Feeder (Overlapping Smart City Fiber Conduit)",
      primaryAgency: "Electricity Board (DISCOM)",
      primaryTask: "12h Emergency Feeder Isolation & Burnt Transformer Lug Replacement",
      primarySla: "12h SLA",
      primaryOfficer: "Er. Vivek Malviya (AE, Feeder Division)",
      dependentAgency: "Public Works Department (PWD)",
      dependentTask: "Auto-scheduled Trench Concrete Restoration & Cable Duct Sealing upon primary sign-off",
      dependentSla: "24h Post Sign-off",
      dependentOfficer: "Er. Sandeep Joshi (EE, PWD Highways)",
      gisCoords: "23.2510° N, 77.4140° E • Feeder Zone 3",
      cadastralId: "BPL-DISCOM-ELEC-409"
    };
  }

  if (cat.includes("road") || text.includes("pothole") || text.includes("sadak") || text.includes("bridge")) {
    return {
      assetTag: "Asset Mapped: PWD Main Arterial Road (Overlapping Municipal Stormwater Drain & Jal Nigam Utility Corridor)",
      primaryAgency: "Municipal Corporation (Drainage Cell)",
      primaryTask: "24h Culvert De-clogging & Silt Clearing beneath Roadbed",
      primarySla: "24h SLA",
      primaryOfficer: "Shri Kailash Verma (Sanitary Inspector)",
      dependentAgency: "Public Works Department (PWD Highways)",
      dependentTask: "Auto-scheduled Road Patching & Bitumen Resurfacing upon primary sign-off",
      dependentSla: "48h Post Sign-off",
      dependentOfficer: "Er. Sandeep Joshi (EE, PWD Highways)",
      gisCoords: "23.2425° N, 77.4350° E • Ward 18 Junction",
      cadastralId: "BPL-PWD-HWY-712"
    };
  }

  // Default: Jal Nigam + PWD (matching standard water burst under arterial road)
  return {
    assetTag: "Asset Mapped: PWD Main Arterial Road (Overlapping Jal Nigam Water Pipeline)",
    primaryAgency: "Jal Nigam / Public Health Engineering (PHE)",
    primaryTask: "24h Emergency Burst Containment & High-Pressure Pipeline Clamping",
    primarySla: "24h SLA",
    primaryOfficer: "Er. Ramesh Chandra (Executive Engineer, Water Works)",
    dependentAgency: "Public Works Department (PWD)",
    dependentTask: "Auto-scheduled Road Patching & Asphalt Compaction upon primary sign-off",
    dependentSla: "48h Post Sign-off",
    dependentOfficer: "Er. Sandeep Joshi (Executive Engineer, PWD)",
    gisCoords: "23.2599° N, 77.4126° E • Bhopal Central Ward 14",
    cadastralId: "BPL-PHE-PWD-9821"
  };
}

export default function JurisdictionalArbiter({ complaint, compact = false }) {
  const [signedOff, setSignedOff] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(false);
  const arbiter = getArbiterDetails(complaint);

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/90 via-[#141b2d]/95 to-indigo-950/90 p-4 text-white shadow-lg space-y-3 dark:border-indigo-500/20">
      {/* Header & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚖️</span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                Department Ownership & Coordination
              </h4>
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Multi-Agency Dispatch
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Identifies whether PWD or Water Board handles the site so work is not delayed by department disputes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            Zero-Dispute Lock Active
          </span>
        </div>
      </div>

      {/* GIS Asset Boundary Tag */}
      <div className="rounded-xl bg-slate-950/70 border border-indigo-500/25 p-3 text-xs">
        <div className="flex items-start gap-2.5">
          <span className="text-base shrink-0">🛰️</span>
          <div className="space-y-1 flex-1 min-w-0">
            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
              GIS Asset Boundary Tag
            </div>
            <div className="font-extrabold text-xs text-white leading-snug">
              {arbiter.assetTag}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-mono pt-0.5">
              <span>📍 {arbiter.gisCoords}</span>
              <span>•</span>
              <span>Cadastral Asset Ref: <strong className="text-indigo-300">{arbiter.cadastralId}</strong></span>
              <span>•</span>
              <span className="text-emerald-400">Boundary Match: 98.9% Overlap</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Agency Split Flow: Primary Task -> Linked Dependent Task */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span>⚡</span> Multi-Agency Split Flow (Concurrent & Sequential Execution)
          </div>
          <button
            type="button"
            onClick={() => setSignedOff((prev) => !prev)}
            className="text-[10px] font-bold text-indigo-300 hover:text-white underline decoration-indigo-400/50 cursor-pointer"
            title="Click to simulate stage-1 primary sign-off and watch stage-2 trigger"
          >
            {signedOff ? "↺ Reset Simulation" : "⚡ Simulate Stage-1 Sign-Off"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Primary Task (Stage 1) */}
          <div
            className={`rounded-xl border p-3 transition-all ${
              signedOff
                ? "border-emerald-500/40 bg-emerald-950/20"
                : "border-amber-500/30 bg-amber-950/15"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/10 text-[9px] font-black">
                  1
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                  Primary Task
                </span>
              </div>
              <span
                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                  signedOff
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                }`}
              >
                {signedOff ? "✓ Completed & Signed-Off" : `⚡ In Progress (${arbiter.primarySla})`}
              </span>
            </div>

            <div className="font-extrabold text-xs text-white">
              {arbiter.primaryAgency}
            </div>
            <p className="text-[11px] text-slate-300 leading-snug mt-1">
              {arbiter.primaryTask}
            </p>
            <div className="text-[10px] text-slate-400 pt-2 mt-2 border-t border-white/10 flex items-center justify-between">
              <span>Lead: <strong className="text-slate-200">{arbiter.primaryOfficer}</strong></span>
              <span className="font-mono text-slate-500">Step 1 of 2</span>
            </div>
          </div>

          {/* Linked Dependent Task (Stage 2) */}
          <div
            className={`rounded-xl border p-3 transition-all ${
              signedOff
                ? "border-emerald-500/50 bg-emerald-950/30 ring-1 ring-emerald-500/30"
                : "border-indigo-500/30 bg-indigo-950/20"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/10 text-[9px] font-black">
                  2
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                  Linked Dependent Task
                </span>
              </div>
              <span
                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                  signedOff
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {signedOff ? "⚡ Auto-Triggered: In Execution" : `⏳ Queued on Primary Sign-off`}
              </span>
            </div>

            <div className="font-extrabold text-xs text-white">
              {arbiter.dependentAgency}
            </div>
            <p className="text-[11px] text-slate-300 leading-snug mt-1">
              {arbiter.dependentTask}
            </p>
            <div className="text-[10px] text-slate-400 pt-2 mt-2 border-t border-white/10 flex items-center justify-between">
              <span>Lead: <strong className="text-slate-200">{arbiter.dependentOfficer}</strong></span>
              <span className="font-mono text-slate-500">{arbiter.dependentSla}</span>
            </div>
          </div>
        </div>

        {/* Hand-Off Indicator */}
        <div className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-slate-950/40 py-1.5 px-3 border border-white/5 text-[10px] text-indigo-300">
          <span>🔗</span>
          <span>
            Automated Hand-off: <strong>{arbiter.dependentAgency}</strong> road patching triggers automatically upon <strong>{arbiter.primaryAgency}</strong> sign-off.
          </span>
        </div>
      </div>

      {/* Zero-Rejection Lock Badge */}
      <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent p-3 text-xs">
        <div className="flex items-start gap-2.5">
          <span className="text-lg shrink-0">🛡️</span>
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-400">
              Zero-Rejection Lock Badge
            </div>
            <div className="font-black text-xs text-amber-200 leading-snug">
              "Jurisdiction Dispute Locked by Arbiter — Auto-escalation active to Municipal Commissioner in 48h"
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 pt-1">
              <span>Anti-Ping-Pong Rule: Rejection option disabled for both departments.</span>
              <span>•</span>
              <span className="text-amber-300 font-mono font-bold">⏱️ 47h 58m until Municipal Commissioner Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Toggle */}
      <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
        <span>Arbiter Protocol v3.2 • Co-Jurisdiction Binding Agreement</span>
        <button
          type="button"
          onClick={() => setShowTelemetry((prev) => !prev)}
          className="text-indigo-400 hover:text-indigo-200 underline cursor-pointer"
        >
          {showTelemetry ? "Hide Cadastral Telemetry ▲" : "View Cadastral Telemetry ▼"}
        </button>
      </div>

      {showTelemetry && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 text-[10px] text-slate-300">
          <div className="rounded-lg bg-slate-950/50 p-2 border border-white/5">
            <div className="text-slate-500 uppercase font-bold text-[9px]">Cadastral Accuracy</div>
            <div className="font-mono font-black text-emerald-400">99.2% GIS</div>
          </div>
          <div className="rounded-lg bg-slate-950/50 p-2 border border-white/5">
            <div className="text-slate-500 uppercase font-bold text-[9px]">Dispute Status</div>
            <div className="font-mono font-black text-amber-400">0% (Locked)</div>
          </div>
          <div className="rounded-lg bg-slate-950/50 p-2 border border-white/5">
            <div className="text-slate-500 uppercase font-bold text-[9px]">Statutory Act</div>
            <div className="font-mono font-black text-indigo-300">MP PSGA 2010</div>
          </div>
          <div className="rounded-lg bg-slate-950/50 p-2 border border-white/5">
            <div className="text-slate-500 uppercase font-bold text-[9px]">Auto Escalation</div>
            <div className="font-mono font-black text-rose-400">Level 3 (Comm.)</div>
          </div>
        </div>
      )}
    </div>
  );
}
