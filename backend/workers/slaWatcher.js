/**
 * SLA Auto-Escalation Engine (Modular Worker)
 * Periodically monitors civic grievances and flags overdue tickets with isEscalated: true.
 * Designed to augment complaints non-destructively without schema disruption.
 */

import { getComplaints, saveComplaints } from "../utils/storage.js";

const SLA_HOURS_MAP = {
  critical: 24,
  high: 48,
  medium: 72,
  low: 96
};

const DEFAULT_SLA_HOURS = 72;
const WATCHER_INTERVAL_MS = 60 * 1000; // Check every 60 seconds

export function getSlaHoursForComplaint(complaint) {
  const urgencyKey = String(complaint?.urgency || "").trim().toLowerCase();
  return SLA_HOURS_MAP[urgencyKey] || DEFAULT_SLA_HOURS;
}

export function checkAndEscalateComplaints() {
  try {
    const complaints = getComplaints();
    if (!Array.isArray(complaints) || complaints.length === 0) return { checked: 0, newlyEscalated: 0 };

    const now = Date.now();
    let newlyEscalated = 0;
    let modified = false;

    for (const complaint of complaints) {
      // Skip completed or rejected tickets
      const status = String(complaint.status || "").toLowerCase();
      if (status === "resolved" || status === "closed" || status === "rejected") {
        continue;
      }

      const createdAtMs = new Date(complaint.createdAt).getTime();
      if (isNaN(createdAtMs)) continue;

      const ageHours = (now - createdAtMs) / (1000 * 60 * 60);
      const slaHours = getSlaHoursForComplaint(complaint);

      if (ageHours > slaHours && !complaint.isEscalated) {
        complaint.isEscalated = true;
        complaint.escalatedAt = new Date().toISOString();
        complaint.slaHours = slaHours;
        complaint.slaOverdueHours = Math.max(1, Math.round(ageHours - slaHours));
        newlyEscalated++;
        modified = true;
      }
    }

    if (modified) {
      saveComplaints(complaints);
      console.log(`[SLA Watcher] Auto-escalated ${newlyEscalated} overdue complaints.`);
    }

    return { checked: complaints.length, newlyEscalated };
  } catch (err) {
    console.error("[SLA Watcher] Error executing SLA check:", err.message);
    return { error: err.message };
  }
}

let timer = null;

export function startSlaWatcher(intervalMs = WATCHER_INTERVAL_MS) {
  if (timer) clearInterval(timer);

  // Run initial check immediately
  checkAndEscalateComplaints();

  // Schedule recurring checks
  timer = setInterval(() => {
    checkAndEscalateComplaints();
  }, intervalMs);

  if (timer.unref) timer.unref(); // Avoid holding the Node.js event loop open if server closes
  console.log(`[SLA Watcher] Worker initialized (Interval: ${intervalMs / 1000}s).`);
}

// Auto-start worker when imported
startSlaWatcher();
