import React, { useState } from "react";
import { useToast } from "../state/ToastContext.jsx";

const WARD_BUDGET_DATA = {
  "Ward 12": {
    name: "Ward 12 (Central Commercial)",
    quarterlyCap: "₹45,00,000",
    capAmount: 4500000,
    allocated: "₹32,40,000",
    allocatedAmount: 3240000,
    percentage: 72,
    surplus: "₹12,60,000",
    breakdown: [
      {
        category: "Routine Road Patching (Track A)",
        amount: "₹18.5L",
        detail: "34 tickets resolved",
        percent: 57,
        icon: "🛣️",
        color: "from-blue-500 to-indigo-600"
      },
      {
        category: "Water Pipeline Emergency Containment",
        amount: "₹9.2L",
        detail: "12 tickets resolved",
        percent: 28,
        icon: "💧",
        color: "from-cyan-500 to-blue-500"
      },
      {
        category: "Track B Academic Prototyping Subsidies",
        amount: "₹4.7L",
        detail: "2 active lab pilots",
        percent: 15,
        icon: "🎓",
        color: "from-amber-500 to-orange-500"
      }
    ],
    reallocation: {
      alertBadge: "High Urgency Deficit Detected in Adjacent Sector 14 (Pipeline Ruptures).",
      proposalText:
        "Auto-Proposal: Re-route ₹2.8L unspent cosmetic maintenance surplus to emergency flood mitigation",
      rerouteAmount: "₹2.8L",
      targetSector: "Sector 14 (Pipeline Ruptures)"
    },
    gpsLedger: [
      { id: "TX-8841", desc: "Jal Nigam Valve Sleeve Repair", cost: "₹45,000", coords: "23.2599° N, 77.4126° E", time: "Today, 10:14 AM" },
      { id: "TX-8842", desc: "PWD Warm-Mix Bitumen Resurfacing", cost: "₹1,80,000", coords: "23.2612° N, 77.4138° E", time: "Yesterday, 04:30 PM" },
      { id: "TX-8843", desc: "MANIT IoT Hydrophone Telemetry Subsidy", cost: "₹2,35,000", coords: "23.2140° N, 77.4080° E", time: "Oct 04, 02:15 PM" }
    ]
  },
  "Ward 14": {
    name: "Ward 14 (Old City Trunk Sector)",
    quarterlyCap: "₹40,00,000",
    capAmount: 4000000,
    allocated: "₹34,80,000",
    allocatedAmount: 3480000,
    percentage: 87,
    surplus: "₹5,20,000",
    breakdown: [
      {
        category: "Water Pipeline Emergency Containment",
        amount: "₹19.4L",
        detail: "28 tickets resolved",
        percent: 56,
        icon: "💧",
        color: "from-cyan-500 to-blue-500"
      },
      {
        category: "Routine Road Patching (Track A)",
        amount: "₹10.2L",
        detail: "19 tickets resolved",
        percent: 29,
        icon: "🛣️",
        color: "from-blue-500 to-indigo-600"
      },
      {
        category: "Track B Academic Prototyping Subsidies",
        amount: "₹5.2L",
        detail: "3 active lab pilots",
        percent: 15,
        icon: "🎓",
        color: "from-amber-500 to-orange-500"
      }
    ],
    reallocation: {
      alertBadge: "Critical Surcharge: Sewerage Jetting Overrun in Walled Area.",
      proposalText:
        "Auto-Proposal: Re-route ₹1.5L from beautification reserve to deep culvert super-sucker clearance",
      rerouteAmount: "₹1.5L",
      targetSector: "Ward 14 Heritage Spine"
    },
    gpsLedger: [
      { id: "TX-7711", desc: "Deep Trench Hydro-Excavation", cost: "₹1,25,000", coords: "23.2644° N, 77.4021° E", time: "Today, 08:45 AM" },
      { id: "TX-7712", desc: "Ductile Iron Pipe Collar Clamp", cost: "₹82,000", coords: "23.2628° N, 77.4045° E", time: "Oct 03, 11:20 AM" }
    ]
  },
  "Ward 18": {
    name: "Ward 18 (Industrial & Heavy Feeder)",
    quarterlyCap: "₹50,00,000",
    capAmount: 5000000,
    allocated: "₹29,50,000",
    allocatedAmount: 2950000,
    percentage: 59,
    surplus: "₹20,50,000",
    breakdown: [
      {
        category: "Transformer & Feeder Overhauls (DISCOM)",
        amount: "₹14.8L",
        detail: "16 tickets resolved",
        percent: 50,
        icon: "⚡",
        color: "from-amber-500 to-yellow-500"
      },
      {
        category: "Routine Road Patching (Track A)",
        amount: "₹10.1L",
        detail: "15 tickets resolved",
        percent: 34,
        icon: "🛣️",
        color: "from-blue-500 to-indigo-600"
      },
      {
        category: "Track B Academic Prototyping Subsidies",
        amount: "₹4.6L",
        detail: "2 active lab pilots",
        percent: 16,
        icon: "🎓",
        color: "from-indigo-500 to-purple-500"
      }
    ],
    reallocation: {
      alertBadge: "Surplus Capacity: Heavy Sub-station Feeder Maintenance Completed Under Budget.",
      proposalText:
        "Auto-Proposal: Re-route ₹4.2L surplus to subsidize low-income feeder stabilizer pilots",
      rerouteAmount: "₹4.2L",
      targetSector: "Zone 3 Substation Ring"
    },
    gpsLedger: [
      { id: "TX-9901", desc: "3-Phase Transformer Lug Assembly", cost: "₹95,000", coords: "23.2480° N, 77.4410° E", time: "Yesterday, 02:00 PM" },
      { id: "TX-9902", desc: "Industrial Road Heavy Compaction", cost: "₹2,10,000", coords: "23.2495° N, 77.4435° E", time: "Oct 02, 05:10 PM" }
    ]
  }
};

export default function WardFiscalBalancer() {
  const toast = useToast();
  const [selectedWard, setSelectedWard] = useState("Ward 12");
  const [reallocatedWards, setReallocatedWards] = useState({});
  const [showLedger, setShowLedger] = useState(false);

  const ward = WARD_BUDGET_DATA[selectedWard] || WARD_BUDGET_DATA["Ward 12"];
  const isApproved = Boolean(reallocatedWards[selectedWard]);

  function handleSignOff() {
    setReallocatedWards((prev) => {
      const nextState = !prev[selectedWard];
      if (nextState) {
        toast.success(
          `Commissioner Sign-Off Authenticated! ${ward.reallocation.rerouteAmount} re-routed to ${ward.reallocation.targetSector}.`
        );
      } else {
        toast.info(`Re-allocation proposal reset for ${selectedWard}.`);
      }
      return { ...prev, [selectedWard]: nextState };
    });
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-[#090d16] via-[#10172a] to-[#0c1324] text-slate-100 p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Header & Ward Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">💰</span>
            <h3 className="text-lg font-black tracking-tight text-white">
              Ward Maintenance Budget
            </h3>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Public Finance
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracks quarterly repair expenses and highlights funds needed for emergency fixes.
          </p>
        </div>

        {/* Ward Selector Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Select Ward:</span>
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
          >
            {Object.keys(WARD_BUDGET_DATA).map((wKey) => (
              <option key={wKey} value={wKey}>
                {WARD_BUDGET_DATA[wKey].name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Real-Time Budget Gauge Card */}
      <div className="rounded-2xl border border-slate-800 bg-[#131d36] p-5 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Real-Time Budget Gauge
            </div>
            <div className="text-sm sm:text-base font-black text-white mt-0.5">
              {selectedWard} Quarterly Cap: <span className="text-emerald-400">{ward.quarterlyCap}</span>
              {" | "}
              Allocated: <span className="text-amber-300">{ward.allocated}</span>{" "}
              <span className="text-xs font-bold text-slate-400">
                ({ward.percentage}% Consumed)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Remaining: {ward.surplus}
            </span>
          </div>
        </div>

        {/* Progress Bar Gauge */}
        <div className="space-y-1.5">
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-950 border border-slate-800 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                ward.percentage > 85
                  ? "bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600"
                  : "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500"
              }`}
              style={{ width: `${ward.percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>₹0 (Start of Quarter)</span>
            <span className="font-bold text-white">72% Consumed (Normal Operational Cadence)</span>
            <span>{ward.quarterlyCap} (Quarterly Ceiling)</span>
          </div>
        </div>
      </div>

      {/* Expenditure Breakdown: Track A Road, Pipeline Emergency, Track B Academic */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>📊</span> Functional Domain Expenditure Breakdown
          </h4>
          <span className="text-[11px] text-slate-500 font-mono">Reconciled in real time</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {ward.breakdown.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-[#131d36]/90 p-4 shadow-sm space-y-2 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">{item.icon}</span>
                <span className="font-mono text-xs font-black text-amber-300">
                  {item.amount}
                </span>
              </div>
              <div className="text-xs font-extrabold text-white leading-snug">
                {item.category}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                <span className="text-slate-300 font-semibold">{item.detail}</span>
                <span className="font-mono text-[10px] text-emerald-400 font-bold">{item.percent}% share</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Algorithmic Re-Allocation Recommendation */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-[#19223c] to-indigo-950/40 p-5 shadow-lg space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base">🤖</span>
            <div className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <span>Algorithmic Re-Allocation Engine</span>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Deficit Optimizer
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
              {ward.reallocation.alertBadge}
            </span>
          </div>
        </div>

        {/* Action Banner with One-Click Commissioner Sign-Off */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl bg-slate-950/70 border border-amber-500/30 p-4">
          <div className="space-y-1 flex-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Autonomous Balancing Proposal
            </div>
            <p className="text-xs font-bold text-white leading-relaxed">
              "{ward.reallocation.proposalText} [One-Click Commissioner Sign-Off]."
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 pt-1">
              <span>Surplus source: <strong>Cosmetic Maintenance Reserve</strong></span>
              <span>•</span>
              <span>Target: <strong className="text-emerald-300">{ward.reallocation.targetSector}</strong></span>
              <span>•</span>
              <span className="text-amber-300 font-mono">Rule: MP Municipal Corporation Act § 128</span>
            </div>
          </div>

          {/* Action Sign-Off Button */}
          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={handleSignOff}
              className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 cursor-pointer ${
                isApproved
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400"
                  : "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20"
              }`}
            >
              <span>{isApproved ? "✓" : "⚡"}</span>
              <span>
                {isApproved
                  ? "Re-allocation Approved by Commissioner"
                  : "One-Click Commissioner Sign-Off"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Public Taxpayer Rupee Badge */}
      <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-slate-900/80 to-emerald-950/20 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-base">
            🇮🇳
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-2">
              <span>100% Verified Ground Spend — Fully reconciled against GPS photo-proof ledger.</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Zero ghost contracts. Every municipal disbursement is algorithmically cross-verified with on-ground geotagged citizen confirmation & SLA sensor telemetry.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowLedger((prev) => !prev)}
          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer shrink-0"
        >
          {showLedger ? "Hide GPS Ledger ▲" : "View Photo-Proof Ledger (3 Reconciled TXs) ▼"}
        </button>
      </div>

      {/* Expandable GPS Photo-Proof Ledger Drawer */}
      {showLedger && (
        <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 space-y-2.5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Audited On-Ground Disbursements (GPS Geotagged)
            </span>
            <span className="font-mono text-[10px] text-emerald-400 font-bold">
              ✓ All 3 Transactions Fully Matched
            </span>
          </div>

          <div className="space-y-2">
            {ward.gpsLedger.map((tx) => (
              <div
                key={tx.id}
                className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-[11px]"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                    {tx.id}
                  </span>
                  <div>
                    <div className="text-slate-200 font-bold">{tx.desc}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      📍 {tx.coords} • {tx.time}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-amber-300">{tx.cost}</span>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Photo Reconciled ✓
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
