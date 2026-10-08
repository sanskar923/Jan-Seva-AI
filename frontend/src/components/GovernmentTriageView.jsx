import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import http from "../api/http.js";
import { useToast } from "../state/ToastContext.jsx";
import JurisdictionalArbiter from "./JurisdictionalArbiter.jsx";
import WardAssetIntegrityMetric from "./WardAssetIntegrityMetric.jsx";

const AGENCY_OPTIONS = [
  "Municipal Corporation",
  "Public Works Department (PWD)",
  "Electricity Board (DISCOM)",
  "Public Health Engineering (PHE)",
  "Pollution Control Board",
  "Urban Traffic & Transport Authority"
];

const UNIVERSITY_OPTIONS = [
  "MANIT Bhopal (Maulana Azad National Institute of Technology)",
  "RGPV Bhopal (Rajiv Gandhi Proudyogiki Vishwavidyalaya)",
  "AIIMS Bhopal (All India Institute of Medical Sciences)",
  "IISER Bhopal (Indian Institute of Science Education and Research)",
  "IIT Indore (Civic Innovation Cell)",
  "IIIT Bhopal"
];

function getAutoSuggestions(complaint) {
  const cat = String(complaint?.category || "").toLowerCase();
  const text = String(complaint?.text || "").toLowerCase();

  if (cat.includes("water") || text.includes("leak") || text.includes("pipeline")) {
    return {
      agency: "Public Health Engineering (PHE)",
      department: "Water Supply & Distribution Section",
      zone: "Bhopal Central Zone - Ward 14",
      officerName: "Er. Ramesh Chandra",
      officerDesignation: "Executive Engineer (Water Works)",
      officerPhone: "+91 98260 23456",
      officerEmail: "water.engineer@bhopal.gov.in",
      actionPlan: "Depute PHE rapid pipeline squad to excavate leak junction and install repair sleeve.",
      equipment: "Trench excavator, high-pressure bypass clamp, ultrasonic pipe leak detector."
    };
  }

  if (cat.includes("elect") || text.includes("spark") || text.includes("light") || text.includes("power")) {
    return {
      agency: "Electricity Board (DISCOM)",
      department: "Urban Feeder & Transformer Division",
      zone: "Zone 3 - Substation Hub",
      officerName: "Er. Vivek Malviya",
      officerDesignation: "Assistant Engineer (Distribution)",
      officerPhone: "+91 98261 45678",
      officerEmail: "dist.engineer@mpeb.gov.in",
      actionPlan: "Isolate local transformer branch, replace burnt cable lugs, and balance 3-phase load.",
      equipment: "Aerial bucket hoist truck, high-voltage insulation kit, thermal infrared scanner."
    };
  }

  if (cat.includes("road") || text.includes("pothole") || text.includes("sadak")) {
    return {
      agency: "Public Works Department (PWD)",
      department: "Road Infrastructure Maintenance Cell",
      zone: "North Highway Division",
      officerName: "Er. Sandeep Joshi",
      officerDesignation: "Executive Engineer (PWD Highways)",
      officerPhone: "+91 98262 67890",
      officerEmail: "pwd.highways@mp.gov.in",
      actionPlan: "Milling deteriorated sub-base, applying warm-mix asphalt patch, and roller compaction.",
      equipment: "Vibratory tandem roller, bitumen distributor, reflective traffic safety cones."
    };
  }

  if (cat.includes("sanitat") || text.includes("kachra") || text.includes("sewage")) {
    return {
      agency: "Municipal Corporation",
      department: "Solid Waste & Sewerage Management",
      zone: "Zone 1 - Civic Cleanliness Gang",
      officerName: "Shri Kailash Verma",
      officerDesignation: "Chief Sanitary Inspector",
      officerPhone: "+91 98263 78901",
      officerEmail: "sanitation.head@bhopalmunicipal.gov.in",
      actionPlan: "Mobilize super-sucker vacuum machine and dispatch dumper placer for community waste clearout.",
      equipment: "High-power sewer jetting tanker, hydraulic tipper, lime & bleaching disinfectants."
    };
  }

  return {
    agency: "Municipal Corporation",
    department: "General Civic Public Works",
    zone: "Ward Municipal Zone",
    officerName: "Er. Rajesh Kumar",
    officerDesignation: "Assistant Engineer",
    officerPhone: "+91 98260 00000",
    officerEmail: "officer@bhopal.gov.in",
    actionPlan: "Conduct on-site engineering survey and execute corrective remedial measures.",
    equipment: "Field inspection kit, standard maintenance gear."
  };
}

export default function GovernmentTriageView({ complaints = [], onAssigned }) {
  const toast = useToast();
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalType, setModalType] = useState(null); // "city" | "university" | null
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("all"); // "all" | "pending" | "assigned"

  // City Assignment Form State
  const [agency, setAgency] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [zone, setZone] = useState("");
  const [officerName, setOfficerName] = useState("");
  const [officerDesignation, setOfficerDesignation] = useState("");
  const [officerPhone, setOfficerPhone] = useState("");
  const [officerEmail, setOfficerEmail] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [actionPlan, setActionPlan] = useState("");
  const [equipmentNeeded, setEquipmentNeeded] = useState("");
  const [officerReviewNote, setOfficerReviewNote] = useState("");

  // University Assignment Form State
  const [universityName, setUniversityName] = useState(UNIVERSITY_OPTIONS[0]);
  const [researchFocus, setResearchFocus] = useState("");
  const [facultyLead, setFacultyLead] = useState("");
  const [csrPartner, setCsrPartner] = useState("Tata Trusts Civic Innovation Grant");

  function openCityModal(complaint) {
    setSelectedComplaint(complaint);
    const defaults = getAutoSuggestions(complaint);
    setAgency(complaint.assignment?.agency || defaults.agency);
    setDepartmentName(complaint.assignment?.departmentName || defaults.department);
    setZone(complaint.assignment?.zone || defaults.zone);
    setOfficerName(complaint.assignment?.officerName || defaults.officerName);
    setOfficerDesignation(complaint.assignment?.officerDesignation || defaults.officerDesignation);
    setOfficerPhone(complaint.assignment?.officerPhone || defaults.officerPhone);
    setOfficerEmail(complaint.assignment?.officerEmail || defaults.officerEmail);

    // Default target date: 3 days from now
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setTargetDate(complaint.assignment?.targetCompletionDate || d.toISOString().split("T")[0]);

    setActionPlan(complaint.assignment?.actionPlan || defaults.actionPlan);
    setEquipmentNeeded(complaint.assignment?.equipmentNeeded || defaults.equipment);
    setOfficerReviewNote(complaint.assignment?.officerReviewNote || "Field verification conducted; priority escalated for field resolution.");
    setModalType("city");
  }

  function openUniversityModal(complaint) {
    setSelectedComplaint(complaint);
    setUniversityName(complaint.assignment?.universityName || UNIVERSITY_OPTIONS[0]);
    setFacultyLead(complaint.assignment?.officerName || "Prof. Department of Civil & Environmental Eng.");
    setCsrPartner(complaint.assignment?.csrPartner || "Tata Trusts Civic Innovation Grant");
    setResearchFocus(
      complaint.assignment?.researchFocus ||
      `Prototype low-cost IoT sensor and smart automated mitigation model for ${complaint.category} civic anomalies in Bhopal.`
    );
    const d = new Date();
    d.setDate(d.getDate() + 30); // 30 day research prototype
    setTargetDate(complaint.assignment?.targetCompletionDate || d.toISOString().split("T")[0]);
    setModalType("university");
  }

  function closeModal() {
    setModalType(null);
    setSelectedComplaint(null);
  }

  // Keyboard shortcut (Escape) & body scroll-lock management
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && modalType) {
        closeModal();
      }
    }
    if (modalType) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalType]);

  const renderPortal = (content) => {
    if (typeof document !== "undefined") {
      return createPortal(content, document.body);
    }
    return content;
  };

  async function handleConfirmCityAssignment(e) {
    e.preventDefault();
    if (!selectedComplaint) return;
    setSubmitting(true);

    try {
      const payload = {
        complaintId: selectedComplaint.id,
        assignedType: "city_team",
        agency,
        departmentName,
        zone,
        officerName,
        officerDesignation,
        officerPhone,
        officerEmail,
        targetCompletionDate: targetDate,
        actionPlan,
        equipmentNeeded,
        officerReviewNote
      };

      await http.post("/admin/assign-department", payload);
      toast.success(`Assigned ${selectedComplaint.ticketId} to ${agency}!`);
      closeModal();
      onAssigned?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to confirm city assignment");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmUniversityAssignment(e) {
    e.preventDefault();
    if (!selectedComplaint) return;
    setSubmitting(true);

    try {
      const payload = {
        complaintId: selectedComplaint.id,
        assignedType: "university",
        universityName,
        officerName: facultyLead,
        csrPartner,
        researchFocus,
        targetCompletionDate: targetDate,
        agency: "Academic & Research Innovation",
        departmentName: "University Research Lab"
      };

      await http.post("/admin/assign-department", payload);
      toast.success(`Ticket ${selectedComplaint.ticketId} assigned to ${universityName}!`);
      closeModal();
      onAssigned?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to assign to university");
    } finally {
      setSubmitting(false);
    }
  }

  const filteredComplaints = complaints.filter((c) => {
    if (filter === "needs_decision") return !c.assignment;
    if (filter === "city") return c.assignment?.assignedType === "city_team";
    if (filter === "university") return c.assignment?.assignedType === "university";
    return true;
  });

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏛️</span>
            <h3 className="text-base font-black tracking-tight text-white">
              Government Review Ledger
            </h3>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
              Municipal Operations
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review reported grievances, triage with SLA recommendations, and dispatch to Municipal teams or University Research Labs.
          </p>
        </div>

        {/* 4 Filter Tabs (Matching Screenshot 1) */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-950/80 p-1.5 border border-slate-800">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filter === "all"
                ? "bg-violet-600 text-white shadow-sm font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Reports ({complaints.length})
          </button>
          <button
            onClick={() => setFilter("needs_decision")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filter === "needs_decision"
                ? "bg-amber-500 text-slate-950 shadow-sm font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Needs Decision ({complaints.filter((c) => !c.assignment).length})
          </button>
          <button
            onClick={() => setFilter("city")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filter === "city"
                ? "bg-orange-500 text-white shadow-sm font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Assigned to City/PWD ({complaints.filter((c) => c.assignment?.assignedType === "city_team").length})
          </button>
          <button
            onClick={() => setFilter("university")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filter === "university"
                ? "bg-blue-600 text-white shadow-sm font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            University Lab Projects ({complaints.filter((c) => c.assignment?.assignedType === "university").length})
          </button>
        </div>
      </div>

      {/* Triage Cards Grid */}
      <div className="space-y-3">
        {filteredComplaints.length === 0 ? (
          <div className="py-8 text-center text-xs font-bold text-slate-400">
            No complaints found in this category.
          </div>
        ) : (
          filteredComplaints.map((c) => {
            const hasAssignment = Boolean(c.assignment);
            const districtDisplay = c.district || c.location || "Bhopal Central";
            const departmentDisplay = c.assignment?.departmentName || c.category || "General Administration";

            return (
              <div
                key={c.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 shadow-sm hover:shadow-md transition-all"
              >
                {/* Left: Problem Details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* ID */}
                    <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-lg border border-indigo-200/60 dark:border-indigo-900/60">
                      ID: {c.ticketId || c.id || "JSA-NEW"}
                    </span>

                    {/* District */}
                    <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      📍 {districtDisplay}
                    </span>

                    {/* Department */}
                    <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      🏢 {departmentDisplay}
                    </span>

                    {/* Status Badge: "Needs Decision" or "Assigned" */}
                    {!hasAssignment ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                        Needs Decision
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        Assigned
                      </span>
                    )}

                    {c.isEscalated && (
                      <span className="text-[10px] font-black uppercase text-red-600 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900">
                        ⚡ Escalated ({c.slaOverdueHours || 0}h overdue)
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate mt-1">
                    {c.title ? `${c.title} — ` : ""}{c.summary || c.text}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>Citizen: <strong className="text-slate-700 dark:text-slate-300">{c.fullname || c.username}</strong></span>
                    <span>•</span>
                    <span>Urgency: <strong className="text-slate-700 dark:text-slate-300">{c.urgency || "Medium"}</strong></span>
                    {c.peopleAffected && (
                      <>
                        <span>•</span>
                        <span>Affected: <strong className="text-slate-700 dark:text-slate-300">{c.peopleAffected} citizens</strong></span>
                      </>
                    )}
                  </div>

                  {/* Active Assignment Info Banner */}
                  {hasAssignment && (
                    <div className="mt-2 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                      <span>{c.assignment.assignedType === "university" ? "🎓" : "🏛️"}</span>
                      <span>
                        <strong>{c.assignment.assignedType === "university" ? "University Research:" : "Assigned To:"}</strong>{" "}
                        {c.assignment.assignedType === "university"
                          ? `${c.assignment.universityName} (${c.assignment.csrPartner || "CSR Pilot"})`
                          : `${c.assignment.agency} • ${c.assignment.officerName} (${c.assignment.officerDesignation})`}
                      </span>
                      {c.assignment.targetCompletionDate && (
                        <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-mono">
                          [Due: {c.assignment.targetCompletionDate}]
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Action Buttons (Orange & Blue, or Update Assignment) */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {!hasAssignment ? (
                    <>
                      {/* ASSIGN TO CITY TEAM (Orange) */}
                      <button
                        onClick={() => openCityModal(c)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 text-xs font-black uppercase tracking-wider shadow-sm hover:shadow transition-all cursor-pointer"
                        title="Route to Municipal / PWD Field Department"
                      >
                        <span>🏛️</span>
                        <span>ASSIGN TO CITY TEAM</span>
                      </button>

                      {/* SEND TO UNIVERSITY (Blue) */}
                      <button
                        onClick={() => openUniversityModal(c)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-black uppercase tracking-wider shadow-sm hover:shadow transition-all cursor-pointer"
                        title="Route to College / HEI Labs for Prototyping with CSR Funding"
                      >
                        <span>🎓</span>
                        <span>SEND TO UNIVERSITY</span>
                      </button>
                    </>
                  ) : (
                    /* Update Assignment Button */
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => c.assignment?.assignedType === "university" ? openUniversityModal(c) : openCityModal(c)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider shadow-sm hover:shadow transition-all cursor-pointer"
                        title="Modify or re-assign this complaint"
                      >
                        <span>✏️</span>
                        <span>Update Assignment</span>
                      </button>
                      <button
                        onClick={() => c.assignment?.assignedType === "university" ? openCityModal(c) : openUniversityModal(c)}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-2.5 text-xs font-bold transition-all cursor-pointer"
                        title={c.assignment?.assignedType === "university" ? "Switch to City Team" : "Switch to University Lab"}
                      >
                        <span>⇄</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --- MODAL 1: ASSIGN TO LOCAL CITY DEPARTMENT --- */}
      {modalType === "city" && selectedComplaint && renderPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="relative my-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🏛️</span> Assign to Local City Department
                </h3>
                <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                  Ticket #{selectedComplaint.ticketId || selectedComplaint.id || "JSA-NEW"} • Priority: {selectedComplaint.urgency || "Medium"}
                </span>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                title="Close modal (Esc)"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmCityAssignment} className="space-y-4 text-xs">
              {/* Read-Only Grievance Context & SLA Status Card */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 dark:bg-slate-950/80 dark:border-slate-800 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    REPORTED GRIEVANCE (READ-ONLY)
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/60">
                      ID: {selectedComplaint.ticketId || selectedComplaint.id || "JSA-NEW"}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      {selectedComplaint.urgency || "Medium"} Priority
                    </span>
                    {selectedComplaint.isEscalated && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse">
                        ⚡ Escalated ({selectedComplaint.slaOverdueHours || 0}h Overdue)
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                  {selectedComplaint.summary || selectedComplaint.text}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800">
                  <span>📍 Location: <strong className="text-slate-700 dark:text-slate-300">{selectedComplaint.location || selectedComplaint.district || "Bhopal, MP"}</strong></span>
                  <span>•</span>
                  <span>Citizen: <strong className="text-slate-700 dark:text-slate-300">{selectedComplaint.fullname || selectedComplaint.username || "Citizen"}</strong></span>
                  {selectedComplaint.peopleAffected && (
                    <>
                      <span>•</span>
                      <span>Affected: <strong className="text-slate-700 dark:text-slate-300">{selectedComplaint.peopleAffected} citizens</strong></span>
                    </>
                  )}
                </div>
              </div>

              {/* Autonomous Jurisdictional Arbiter & Multi-Agency Dispatch */}
              <JurisdictionalArbiter complaint={selectedComplaint} />

              {/* Ward Officer Performance & Asset Integrity Score */}
              <WardAssetIntegrityMetric complaint={selectedComplaint} />

              {/* Responsible Agency Dropdown */}
              <div>
                <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Responsible Agency *
                </label>
                <select
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  {AGENCY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Name & Zone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Department Division *
                  </label>
                  <input
                    type="text"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    required
                    placeholder="e.g. Water Distribution & Pipeline Cell"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Ward / Zone *
                  </label>
                  <input
                    type="text"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    required
                    placeholder="e.g. Zone 4 - Ward 14"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              {/* Officer In Charge & Designation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Officer In Charge *
                  </label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    required
                    placeholder="e.g. Er. Ramesh Sharma"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Designation *
                  </label>
                  <input
                    type="text"
                    value={officerDesignation}
                    onChange={(e) => setOfficerDesignation(e.target.value)}
                    required
                    placeholder="e.g. Executive Engineer"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              {/* Phone, Email & Target Date */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Official Phone
                  </label>
                  <input
                    type="text"
                    value={officerPhone}
                    onChange={(e) => setOfficerPhone(e.target.value)}
                    placeholder="+91 98260 12345"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={officerEmail}
                    onChange={(e) => setOfficerEmail(e.target.value)}
                    placeholder="officer@bhopal.gov.in"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Target Completion Date *
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              {/* Action Plan & Equipment Needed (Auto-suggested) */}
              <div>
                <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Action Plan (Auto-Suggested)
                </label>
                <textarea
                  value={actionPlan}
                  onChange={(e) => setActionPlan(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Equipment Needed (Auto-Suggested)
                </label>
                <input
                  type="text"
                  value={equipmentNeeded}
                  onChange={(e) => setEquipmentNeeded(e.target.value)}
                  placeholder="e.g. Excavator, Pipe Clamp, Safety barricades"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Officer Review Note
                </label>
                <textarea
                  value={officerReviewNote}
                  onChange={(e) => setOfficerReviewNote(e.target.value)}
                  rows={2}
                  placeholder="Instructions for the field inspection team..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl px-4 py-2.5 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-[#141b2d] hover:bg-slate-800 text-white px-6 py-2.5 font-black uppercase tracking-wider shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Saving Assignment..." : "CONFIRM CITY ASSIGNMENT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: SEND TO UNIVERSITY --- */}
      {modalType === "university" && selectedComplaint && renderPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="relative my-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🎓</span> Send to University for Research & Prototyping
                </h3>
                <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold">
                  Ticket #{selectedComplaint.ticketId || selectedComplaint.id || "JSA-NEW"} • Priority: {selectedComplaint.urgency || "Medium"}
                </span>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                title="Close modal (Esc)"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmUniversityAssignment} className="space-y-4 text-xs">
              {/* Read-Only Grievance Context & SLA Status Card */}
              <div className="rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20 text-slate-800 dark:text-slate-200 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">
                    REPORTED GRIEVANCE (READ-ONLY) • CIVIC CHALLENGE
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      ID: {selectedComplaint.ticketId || selectedComplaint.id || "JSA-NEW"}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                      {selectedComplaint.urgency || "Medium"} Priority
                    </span>
                    {selectedComplaint.isEscalated && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse">
                        ⚡ Escalated ({selectedComplaint.slaOverdueHours || 0}h Overdue)
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs font-bold leading-relaxed">
                  {selectedComplaint.summary || selectedComplaint.text}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-amber-800/80 dark:text-amber-300/80 border-t border-amber-500/20">
                  <span>📍 Location: <strong>{selectedComplaint.location || selectedComplaint.district || "Bhopal, MP"}</strong></span>
                  <span>•</span>
                  <span>Citizen: <strong>{selectedComplaint.fullname || selectedComplaint.username || "Citizen"}</strong></span>
                  {selectedComplaint.peopleAffected && (
                    <>
                      <span>•</span>
                      <span>Affected: <strong>{selectedComplaint.peopleAffected} citizens</strong></span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Partner Academic Institution *
                </label>
                <select
                  value={universityName}
                  onChange={(e) => setUniversityName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  {UNIVERSITY_OPTIONS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Faculty / Innovation Cell Lead
                </label>
                <input
                  type="text"
                  value={facultyLead}
                  onChange={(e) => setFacultyLead(e.target.value)}
                  placeholder="Prof. Name / Research Team Lead"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  CSR Funding & Industry Partner
                </label>
                <input
                  type="text"
                  value={csrPartner}
                  onChange={(e) => setCsrPartner(e.target.value)}
                  placeholder="e.g. Tata Trusts Civic Innovation Grant, Infosys CSR"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Research Focus & Prototype Scope *
                </label>
                <textarea
                  value={researchFocus}
                  onChange={(e) => setResearchFocus(e.target.value)}
                  rows={3}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Target Prototype Date *
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl px-4 py-2.5 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 px-6 py-2.5 font-black uppercase tracking-wider shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Assigning..." : "CONFIRM UNIVERSITY ASSIGNMENT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
