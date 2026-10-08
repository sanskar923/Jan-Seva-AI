import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import http from "../api/http.js";
import { useToast } from "../state/ToastContext.jsx";
import { useAppTranslation } from "../utils/translations.js";
import { useAuth } from "../state/AuthContext.jsx";
import Card from "../ui/Card.jsx";

const DEFAULT_COMMUNITY_PROBLEMS = [
  {
    id: "UNI-9821",
    title: "Severe Waterlogging & Stormwater Drainage Choke in Low-Lying Wards",
    category: "Water Supply & Urban Hydrology",
    district: "Bhopal Central (Ward 18-22)",
    matchScore: 97,
    status: "Pending",
    summary: "Monsoon storm runoff overwhelms low-lying culverts, flooding residential roads and backflowing into open drinking water sumps.",
    skills: ["Civil Hydrology", "IoT Ultrasonic Water Level Sensors", "Embedded C++", "GIS Flow Mapping", "Python ML"],
    csrPartner: "Tata Trusts Civic Innovation Grant (₹4,80,000 allocated)",
    leadInstitute: "MANIT Bhopal • Dept. of Civil & Water Resources",
    targetDays: 45,
    equipment: "Acoustic Doppler sensors, solar-powered cellular telemetry modules, Arduino/ESP32 test rigs."
  },
  {
    id: "UNI-9822",
    title: "Recurring Transformer Overheating & Voltage Sag in Semi-Industrial Feeder",
    category: "Electricity & Smart Grid",
    district: "BHEL & Govindpura Industrial",
    matchScore: 94,
    status: "Pending",
    summary: "Unbalanced inductive commercial load causes distribution transformers to spark and trip unexpectedly during peak evening hours.",
    skills: ["Electrical Power Systems", "IoT Thermal Imaging", "Current Transformers", "Edge AI Anomaly Detection"],
    csrPartner: "Infosys Foundation Tech For Good (₹3,50,000 allocated)",
    leadInstitute: "IIT Indore • Electrical Machine Dynamics Lab",
    targetDays: 30,
    equipment: "Non-invasive Hall effect sensors, FLIR infrared sensor module, cloud MQTT telemetry gateway."
  },
  {
    id: "UNI-9823",
    title: "Subsurface Potable Water Pipeline Leakage & Microbial Contamination",
    category: "Water Quality & Public Health",
    district: "Old City & Walled Heritage",
    matchScore: 91,
    status: "Pending",
    summary: "Corroded ductile iron pipes buried 2m deep suffer negative suction pressure, drawing sewage seepage into citizen tap water supply.",
    skills: ["Environmental Biotechnology", "Acoustic Pipe Vibrometry", "Water Turbidity Sensing", "Microfluidics"],
    csrPartner: "Coal India CSR Clean Water Mission (₹5,20,000 allocated)",
    leadInstitute: "RGPV Technological University • Environmental Eng. Lab",
    targetDays: 60,
    equipment: "Ground hydrophones, multi-parameter optical water quality probes (pH, TDS, turbidity, residual chlorine)."
  },
  {
    id: "UNI-9824",
    title: "Rapid Pothole Deterioration Due to Monsoon Bitumen Stripping",
    category: "Roads & Structural Materials",
    district: "MP Nagar Commercial Zone",
    matchScore: 88,
    status: "Pending",
    summary: "Standard cold-mix asphalt patches disintegrate within 7 days of continuous rainfall, creating dangerous craters for two-wheelers.",
    skills: ["Materials Science", "Polymer Bitumen Chemistry", "Waste Plastic Asphalt Mix", "Pavement Structural Analysis"],
    csrPartner: "State Industrial Innovation Cell (₹2,90,000 allocated)",
    leadInstitute: "SGSITS Indore • Transportation Engineering Group",
    targetDays: 30,
    equipment: "Viscometer, Marshall stability tester, recycled waste PET aggregate curing chamber."
  }
];

export default function UniversityPortal() {
  const toast = useToast();
  const { dict } = useAppTranslation();
  const { isAuthed, user, canAccessUniversity, loginAsDemo } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedInstitute, setSelectedInstitute] = useState("All Institutions");
  const [activeTab, setActiveTab] = useState("all"); // "all" | "pending" | "accepted"

  async function loadProblems() {
    try {
      // Try to load any complaints assigned to university from backend
      const res = await http.get("/admin/complaints");
      const assignedToUni = (res.data?.complaints || []).filter(
        (c) => c.assignment?.assignedType === "university"
      );

      const dynamicMapped = assignedToUni.map((c, idx) => ({
        id: c.ticketId || `UNI-LIVE-${idx + 1}`,
        title: c.title || c.summary || c.text?.slice(0, 70),
        category: c.category || "Civic Innovation Challenge",
        district: c.district || c.location || "Bhopal Region",
        matchScore: 92 + (idx % 7),
        status: c.assignment?.labStatus || "Pending",
        summary: c.assignment?.researchFocus || c.text,
        skills: ["Embedded IoT", "Data Analytics", "Civil Engineering", "Cloud Telemetry"],
        csrPartner: c.assignment?.csrPartner || "Tata Trusts Civic Innovation Grant",
        leadInstitute: c.assignment?.universityName || "MANIT Bhopal Innovation Cell",
        targetDays: 30,
        equipment: "Field telemetry equipment and rapid hardware prototyping tools."
      }));

      // Merge dynamic university tickets with default community problems (avoiding duplicate IDs)
      const existingIds = new Set(dynamicMapped.map((d) => d.id));
      const remainingDefaults = DEFAULT_COMMUNITY_PROBLEMS.filter((p) => !existingIds.has(p.id));
      setProblems([...dynamicMapped, ...remainingDefaults]);
    } catch {
      setProblems(DEFAULT_COMMUNITY_PROBLEMS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (canAccessUniversity) {
      loadProblems();
    }
  }, [canAccessUniversity]);

  function handleAccept(problemId) {
    setProblems((prev) =>
      prev.map((p) => {
        if (p.id === problemId) {
          return { ...p, status: "Accepted" };
        }
        return p;
      })
    );
    toast.success(`Problem ${problemId} accepted by Engineering Lab! Research workspace created.`);
  }

  function handleReject(problemId) {
    setProblems((prev) => prev.filter((p) => p.id !== problemId));
    toast.info(`Problem ${problemId} passed back to municipal queue.`);
  }

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  // --- RBAC GATEKEEPER GUARD ---
  if (!canAccessUniversity) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.08),_transparent_70%)] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-black uppercase tracking-wider mb-6">
            <span>🔐</span> Academic Role-Based Access Control (RBAC)
          </div>

          {/* Icon + Title */}
          <div className="flex items-start gap-4 mb-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-2xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
              🎓
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Restricted Access: College Research Hub
              </h1>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mt-1">
                College Research Hub • Long-Term Solutions Gateway
              </p>
            </div>
          </div>

          {/* Message */}
          <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mt-4 mb-6">
            This portal is reserved for verified academic faculty, research scholars, and accredited college labs (e.g., BIT Mesra, NIT, IIT). Citizens can track routine repairs on their citizen dashboard.
          </p>

          {/* Dual-Track Clarification Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs mb-8">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
              <div className="font-extrabold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <span>👤</span> Citizen Workspace (Track A)
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                Report local civic issues, track municipal repairs within 24-72h SLA, and verify on-ground resolution.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
              <div className="font-extrabold text-indigo-900 dark:text-indigo-300 mb-1 flex items-center gap-1.5">
                <span>🎓</span> Engineering Colleges (Track B)
              </div>
              <p className="text-indigo-700/80 dark:text-indigo-400 text-[11px] leading-relaxed">
                Accept chronic engineering challenges, build working prototypes, and access CSR research grants.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              to={isAuthed ? "/dashboard" : "/"}
              className="w-full sm:w-auto flex-1 text-center py-3.5 px-6 rounded-2xl bg-[#141b2d] hover:bg-slate-800 text-white font-extrabold text-sm transition-all shadow-lg shadow-slate-900/10"
            >
              Switch to Citizen Workspace
            </Link>

            <Link
              to="/login?role=university"
              className="w-full sm:w-auto flex-1 text-center py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm transition-all shadow-lg shadow-indigo-600/20"
            >
              Sign in with University ID
            </Link>
          </div>

          {/* Reviewer / Evaluator Convenience Fast-Track */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                  ⚡ Evaluator & Reviewer Fast-Switch
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Instant 1-click test login as accredited faculty researcher
                </div>
              </div>
              <button
                type="button"
                onClick={() => loginAsDemo("university")}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20"
              >
                🎓 Switch to University Faculty (MANIT Lab)
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const filteredProblems = problems.filter((p) => {
    if (activeTab === "pending" && p.status !== "Pending") return false;
    if (activeTab === "accepted" && p.status !== "Accepted") return false;
    if (selectedInstitute !== "All Institutions" && !p.leadInstitute.includes(selectedInstitute)) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 py-10 px-4 transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header Banner */}
        <div className="rounded-3xl border border-slate-800/80 bg-gradient-to-r from-slate-900 via-[#10172a] to-slate-900 p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-violet-300 text-xs font-black uppercase tracking-wider mb-4">
              {dict.uniPortalBadge}
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
              {dict.uniPortalTitle}
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal mb-6">
              {dict.uniPortalSub}
            </p>

            {/* Quick Stat Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl bg-slate-900/50 p-3 border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] uppercase font-bold text-violet-400">Open City Challenges</div>
                <div className="text-xl font-black text-white">{problems.length} Challenges</div>
              </div>
              <div className="rounded-xl bg-slate-900/50 p-3 border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] uppercase font-bold text-violet-400">Projects in Progress</div>
                <div className="text-xl font-black text-emerald-400">
                  {problems.filter((p) => p.status === "Accepted").length} Projects
                </div>
              </div>
              <div className="rounded-xl bg-slate-900/50 p-3 border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] uppercase font-bold text-violet-400">Research & CSR Grants</div>
                <div className="text-xl font-black text-amber-300">₹42.5 Lakhs</div>
              </div>
              <div className="rounded-xl bg-slate-900/50 p-3 border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-[10px] uppercase font-bold text-violet-400">Partner Engineering Colleges</div>
                <div className="text-xl font-black text-white">6 Colleges</div>
              </div>
            </div>

            {/* Active Faculty Session Info & Quick Citizen Toggle */}
            {user && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-violet-500/20 border border-violet-500/30 grid place-items-center text-lg">
                    🎓
                  </div>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-2">
                      <span>{user.fullName || user.username}</span>
                      <span className="text-[10px] bg-emerald-500/80 text-white font-mono px-2 py-0.5 rounded-full">
                        {user.role === "admin" ? "Admin Supervisor" : "Verified Faculty"}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {user.institution || "MANIT Bhopal"} • {user.lab || "Accredited Innovation Lab"}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => loginAsDemo("citizen")}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Switch to Citizen View to test Gatekeeper RBAC"
                >
                  <span>🔄</span> Test Citizen RBAC Restriction
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl backdrop-blur-md">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              All Challenges ({problems.length})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "pending"
                  ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              Pending Review ({problems.filter((p) => p.status === "Pending").length})
            </button>
            <button
              onClick={() => setActiveTab("accepted")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "accepted"
                  ? "bg-emerald-600 text-white font-black shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              Projects in Progress ({problems.filter((p) => p.status === "Accepted").length})
            </button>
          </div>

          {/* Academic Partner Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Institution:</span>
            <select
              value={selectedInstitute}
              onChange={(e) => setSelectedInstitute(e.target.value)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700/80 bg-slate-950/60 text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 cursor-pointer"
            >
              <option value="All Institutions">All Institutions (All)</option>
              <option value="MANIT Bhopal">MANIT Bhopal</option>
              <option value="IIT Indore">IIT Indore</option>
              <option value="RGPV">RGPV Bhopal</option>
              <option value="SGSITS">SGSITS Indore</option>
            </select>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MATCHED COMMUNITY PROBLEMS GRID                              */}
        {/* ============================================================ */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>🔬</span> {dict.matchedProblemsTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {dict.matchedProblemsSub}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              Showing {filteredProblems.length} Problems
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs font-bold text-slate-500">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              <p className="mt-2">Matching community challenges with university labs...</p>
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="py-16 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <p className="text-sm font-bold text-slate-500">No problems found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProblems.map((p) => {
                const isExpanded = expandedId === p.id;
                const isAccepted = p.status === "Accepted";

                return (
                  <motion.div
                    key={p.id}
                    layout
                    className={`rounded-3xl border transition-all ${
                      isAccepted
                        ? "border-emerald-500/30 bg-emerald-500/10"
                        : "border-slate-800 bg-slate-900/60 backdrop-blur-md"
                    } p-6 shadow-xl hover:border-slate-700/80 flex flex-col justify-between`}
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-black text-violet-400 bg-violet-950/60 px-2.5 py-0.5 rounded-lg border border-violet-800/60">
                            {p.id}
                          </span>
                          
                          {/* AI Match Score Badge (Screenshot 2 Match) */}
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span>⚡</span> {p.matchScore}% {dict.matchBadge}
                          </span>

                          {/* Status Badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isAccepted
                                ? "bg-emerald-600 text-white"
                                : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                            }`}
                          >
                            {isAccepted ? dict.statusAccepted : dict.statusPending}
                          </span>
                        </div>

                        {/* Reject / Dismiss Action */}
                        {!isAccepted && (
                          <button
                            onClick={() => handleReject(p.id)}
                            className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-xl transition-colors cursor-pointer"
                            title={dict.rejectBtn}
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Problem Title */}
                      <h3 className="text-base font-black text-white mb-2 leading-snug">
                        {p.title}
                      </h3>

                      <p className="text-xs text-slate-300 leading-relaxed mb-4">
                        {p.summary}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-semibold mb-4">
                        <span>📍 {p.district}</span>
                        <span>•</span>
                        <span>🏛️ {p.leadInstitute}</span>
                      </div>
                    </div>

                    {/* Footer Actions & Expandable Details */}
                    <div>
                      {/* Action Button & Expand Toggle Bar */}
                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                        {/* Details & Skills Expandable Dropdown */}
                        <button
                          onClick={() => toggleExpand(p.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                        >
                          <span>{isExpanded ? `${dict.detailsSkills} ▲` : `${dict.detailsSkills} ▼`}</span>
                        </button>

                        {/* ACCEPT Action Button (Green) */}
                        {!isAccepted ? (
                          <button
                            onClick={() => handleAccept(p.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                          >
                            <span>✓</span>
                            <span>{dict.acceptBtn}</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-400 uppercase tracking-wider">
                            <span>✓ {dict.statusAccepted}</span>
                          </span>
                        )}
                      </div>

                      {/* Expandable Dropdown Content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mt-4 pt-4 border-t border-dashed border-slate-800 space-y-3 text-xs"
                          >
                            {/* Skills Required */}
                            <div>
                              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                                {dict.skillsRequired}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {p.skills.map((skill, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className="px-2.5 py-0.5 rounded-lg bg-violet-950/60 text-violet-300 font-bold text-[10px] border border-violet-800/60"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* CSR Partner & Grant */}
                            <div className="rounded-xl bg-amber-500/10 p-3 border border-amber-500/20 text-slate-200">
                              <div className="text-[10px] font-black uppercase text-amber-400 mb-1">
                                {dict.csrFunding}
                              </div>
                              <div className="font-bold text-xs">{p.csrPartner}</div>
                              <div className="text-[11px] text-slate-400 mt-1">
                                Estimated Prototype Timeline: <strong>{p.targetDays} Days</strong>
                              </div>
                            </div>

                            {/* Equipment Needed */}
                            <div>
                              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                                {dict.suggestedHardware}
                              </div>
                              <div className="text-slate-300 text-[11px] font-medium">
                                {p.equipment}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
