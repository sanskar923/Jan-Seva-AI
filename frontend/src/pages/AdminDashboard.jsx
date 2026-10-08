import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import http from "../api/http.js";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import { useToast } from "../state/ToastContext.jsx";
import ComplaintList from "../components/ComplaintList.jsx";
import AdminCharts from "../components/AdminCharts.jsx";
import HeatmapView from "../components/HeatmapView.jsx";
import ProblemDnaView from "../components/ProblemDnaView.jsx";
import GovernmentTriageView from "../components/GovernmentTriageView.jsx";
import DistrictTelemetryView from "../components/DistrictTelemetryView.jsx";
import WardFiscalBalancer from "../components/WardFiscalBalancer.jsx";
import DashboardShell from "../components/DashboardShell.jsx";
import { statusI18nKey } from "../lib/labels.js";

const STATUSES = ["Submitted", "In Progress", "Resolved", "Rejected"];

export default function AdminDashboard() {
  const { t } = useTranslation();
  const toast = useToast();
  const [activeAdminTab, setActiveAdminTab] = useState("triage");
  const [category, setCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (category.trim()) p.set("category", category.trim());
    if (statusFilter.trim()) p.set("status", statusFilter.trim());
    const s = p.toString();
    return s ? `?${s}` : "";
  }, [category, statusFilter]);

  async function load() {
    setLoading(true);
    try {
      const res = await http.get(`/admin/complaints${query}`);
      setComplaints(res.data.complaints || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || t("admin.loadError"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function setStatus(id, status) {
    setBusyId(id);
    try {
      await http.patch(`/admin/complaints/${id}/status`, { status });
      toast.success(t("admin.statusUpdated"));
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || t("admin.statusError"));
    } finally {
      setBusyId("");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(t("list.deleteConfirm"))) return;
    setDeletingId(id);
    try {
      await http.delete(`/complaints/${id}`);
      toast.success(t("list.deleteSuccess"));
      await load();
    } catch (e) {
      const msg = e?.response?.data?.message;
      const st = e?.response?.status;
      if (!e.response) toast.error(t("list.deleteNetwork"));
      else if (st === 404) toast.error(msg || t("list.delete404"));
      else toast.error(msg || t("list.deleteError"));
    } finally {
      setDeletingId("");
    }
  }

  const ADMIN_TABS = [
    {
      id: "triage",
      label: "Live Issues & Map",
      icon: "🗺️"
    },
    {
      id: "governance",
      label: "City Review & Root Causes",
      icon: "🏛️"
    },
    {
      id: "telemetry",
      label: "Ward Severity",
      icon: "📡"
    },
    {
      id: "analytics",
      label: "Ward Budget & Expenses",
      icon: "📊"
    }
  ];

  return (
    <DashboardShell title={t("admin.title", { defaultValue: "City Operations Dashboard" })} subtitle={t("admin.subtitle")}>
      <div className="space-y-6">
        {/* Sleek Horizontal Sticky Tab Bar */}
        <div className="sticky top-0 z-30 py-1 backdrop-blur-md">
          <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/60 rounded-xl border border-slate-800 backdrop-blur w-fit mb-6 shadow-lg">
            {ADMIN_TABS.map((tab) => {
              const isActive = activeAdminTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveAdminTab(tab.id)}
                  className={
                    isActive
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20 font-medium px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 cursor-pointer"
                      : "text-slate-400 hover:text-slate-200 px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 cursor-pointer"
                  }
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: Live Triage & Map (Default) */}
        {activeAdminTab === "triage" && (
          <motion.div
            key="triage"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <HeatmapView />

            <div className="grid gap-4 lg:grid-cols-3">
              <Card glass className="p-5 lg:col-span-1">
                <div className="text-base font-extrabold">{t("admin.filters")}</div>
                <div className="mt-2 text-sm text-slate-400">{t("admin.filtersHint")}</div>
                <div className="mt-4 space-y-3">
                  <Input
                    label={t("admin.categoryOptional")}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder={t("admin.categoryPlaceholder")}
                  />
                  <label className="block">
                    <div className="mb-1 text-xs font-semibold text-slate-300">{t("admin.statusOptional")}</div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-3 py-2 text-sm font-medium text-white shadow-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    >
                      <option value="">{t("admin.statusPlaceholder")}</option>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {t(`status.${statusI18nKey(s)}`, { defaultValue: s })}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setCategory("");
                      setStatusFilter("");
                    }}
                  >
                    {t("admin.clear")}
                  </Button>
                  <Button onClick={load}>{t("admin.refresh")}</Button>
                </div>
              </Card>

              <div className="space-y-4 lg:col-span-2">
                {loading ? (
                  <Card glass className="p-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                      {t("admin.loading")}
                    </div>
                  </Card>
                ) : (
                  <ComplaintList
                    title={t("list.allComplaints")}
                    complaints={complaints}
                    onDelete={handleDelete}
                    deletingId={deletingId}
                  />
                )}

                <Card glass className="p-5">
                  <div className="text-sm font-extrabold">{t("admin.updateStatus")}</div>
                  <div className="mt-2 text-sm text-slate-400">{t("admin.updateHint")}</div>
                  <div className="mt-4 space-y-3">
                    {complaints.length === 0 ? (
                      <div className="text-sm text-slate-400">{t("admin.noneToUpdate")}</div>
                    ) : (
                      complaints.slice(0, 6).map((c) => (
                        <div
                          key={c.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-950/40 p-3"
                        >
                          <div className="min-w-[180px]">
                            <div className="text-sm font-bold">
                              {t(`categories.${c.category}`, { defaultValue: c.category })}
                            </div>
                            <div className="text-xs text-slate-400">
                              {c.ticketId ? `${c.ticketId} · ` : ""}
                              {c.username}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {STATUSES.map((s) => (
                              <Button
                                key={s}
                                variant={s === "Rejected" ? "danger" : "secondary"}
                                disabled={busyId === c.id}
                                onClick={() => setStatus(c.id, s)}
                              >
                                {t(`status.${statusI18nKey(s)}`, { defaultValue: s })}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Governance Ledger & AI DNA */}
        {activeAdminTab === "governance" && (
          <motion.div
            key="governance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800/80 bg-gradient-to-r from-slate-900 via-[#10172a] to-slate-900 p-5 text-white shadow-xl">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎓</span>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-violet-400">
                    College Research Hub • Long-Term Solutions
                  </div>
                  <div className="text-sm font-black text-white">
                    Connecting recurring city issues to engineering colleges for permanent engineering fixes
                  </div>
                </div>
              </div>
              <Link
                to="/university"
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shrink-0 cursor-pointer"
              >
                Open College Research Hub →
              </Link>
            </div>

            <GovernmentTriageView complaints={complaints} onAssigned={load} />

            <ProblemDnaView />
          </motion.div>
        )}

        {/* Tab 3: District & Regional Telemetry */}
        {activeAdminTab === "telemetry" && (
          <motion.div
            key="telemetry"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <DistrictTelemetryView refreshKey={complaints.length} />
          </motion.div>
        )}

        {/* Tab 4: Fiscal Treasury & Analytics */}
        {activeAdminTab === "analytics" && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <WardFiscalBalancer />

            <AdminCharts complaints={complaints} />
          </motion.div>
        )}
      </div>
    </DashboardShell>
  );
}
