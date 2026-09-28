import { Router } from "express";
import { getComplaints, saveComplaints } from "../utils/storage.js";
import { extractCoordinates, getBhopalFallbackCoordinates, clusterComplaintsByProximity } from "../utils/geoDeduplicator.js";
import { generateInsights } from "../utils/problemDna.js";
import { predictCategoryAndRootCause } from "../utils/modelPredictor.js";
import { computeTelemetryAndImpact } from "../utils/telemetryHelper.js";

const router = Router();

const URGENCY_WEIGHTS = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1
};

/**
 * GET /api/analytics/heatmap
 * Returns spatial coordinate points with intensity weights for map overlays.
 */
router.get("/heatmap", (req, res) => {
  try {
    const complaints = getComplaints();
    const points = [];
    let exactGpsCount = 0;
    let estimatedCount = 0;

    for (const c of complaints) {
      let coords = extractCoordinates(c.location);
      let isExactGps = true;

      if (!coords) {
        coords = getBhopalFallbackCoordinates(c.ticketId || c.id || c.text);
        isExactGps = false;
        estimatedCount++;
      } else {
        exactGpsCount++;
      }

      const urgencyKey = String(c.urgency || "medium").toLowerCase();
      let weight = URGENCY_WEIGHTS[urgencyKey] || 2;
      if (c.isEscalated) weight += 2; // Extra intensity weight for overdue/escalated complaints

      points.push({
        id: c.id,
        ticketId: c.ticketId,
        lat: coords.lat,
        lng: coords.lng,
        isExactGps,
        weight,
        category: c.category || "General",
        urgency: c.urgency || "Medium",
        status: c.status || "Submitted",
        isEscalated: Boolean(c.isEscalated),
        location: c.location || "Bhopal, MP",
        summary: c.summary || c.text?.slice(0, 60),
        createdAt: c.createdAt
      });
    }

    res.json({
      success: true,
      totalComplaints: complaints.length,
      pointsCount: points.length,
      exactGpsCount,
      estimatedCount,
      points
    });
  } catch (error) {
    console.error("[Analytics] Heatmap error:", error);
    res.status(500).json({ success: false, message: "Failed to generate heatmap data" });
  }
});

/**
 * GET /api/analytics/duplicates
 * Returns spatial duplicate clusters detected within radius meters (default: 100m).
 */
router.get("/duplicates", (req, res) => {
  try {
    const complaints = getComplaints();
    const radiusMeters = parseFloat(req.query.radius) || 100;
    const clusters = clusterComplaintsByProximity(complaints, radiusMeters);

    res.json({
      success: true,
      radiusMeters,
      totalClusters: clusters.length,
      clusters
    });
  } catch (error) {
    console.error("[Analytics] Duplicates error:", error);
    res.status(500).json({ success: false, message: "Failed to detect spatial duplicates" });
  }
});

/**
 * GET /api/analytics/sla-summary
 * Returns SLA metrics and escalation rate.
 */
router.get("/sla-summary", (req, res) => {
  try {
    const complaints = getComplaints();
    let escalatedCount = 0;
    let onTimeCount = 0;
    let resolvedCount = 0;

    for (const c of complaints) {
      const status = String(c.status || "").toLowerCase();
      if (status === "resolved" || status === "closed") {
        resolvedCount++;
        continue;
      }

      if (c.isEscalated) {
        escalatedCount++;
      } else {
        onTimeCount++;
      }
    }

    res.json({
      success: true,
      total: complaints.length,
      active: escalatedCount + onTimeCount,
      escalated: escalatedCount,
      onTime: onTimeCount,
      resolved: resolvedCount,
      escalationRate: complaints.length > 0 ? `${((escalatedCount / (escalatedCount + onTimeCount || 1)) * 100).toFixed(1)}%` : "0%"
    });
  } catch (error) {
    console.error("[Analytics] SLA summary error:", error);
    res.status(500).json({ success: false, message: "Failed to compute SLA analytics" });
  }
});

/**
 * GET /api/analytics/insights
 * Returns AI Problem DNA: recurring root causes, suggested action pathways, and SLA recommendations.
 */
router.get("/insights", (req, res) => {
  try {
    const complaints = getComplaints();
    const insights = generateInsights(complaints);
    res.json({
      success: true,
      ...insights
    });
  } catch (error) {
    console.error("[Analytics] Insights error:", error);
    res.status(500).json({ success: false, message: "Failed to generate problem DNA insights" });
  }
});

/**
 * POST /api/analytics/predict (also supports GET ?text=...)
 * Predicts category and root_cause using backend/model.pkl
 */
router.all("/predict", async (req, res) => {
  try {
    const text = req.body?.text || req.query?.text || "";
    const prediction = await predictCategoryAndRootCause(text);
    res.json({
      success: true,
      text,
      ...prediction
    });
  } catch (error) {
    console.error("[Analytics] Predict error:", error);
    res.status(500).json({ success: false, message: "Prediction failed" });
  }
});

/**
 * POST /api/admin/assign-department (also accessible via /api/analytics/assign-department)
 * Saves government review, triage, and officer assignment details.
 */
router.post("/assign-department", (req, res) => {
  try {
    const {
      complaintId,
      assignedType = "city_team",
      agency,
      departmentName,
      zone,
      officerName,
      officerDesignation,
      officerPhone,
      officerEmail,
      targetCompletionDate,
      actionPlan,
      equipmentNeeded,
      officerReviewNote,
      universityName,
      researchFocus
    } = req.body || {};

    if (!complaintId) {
      return res.status(400).json({ success: false, message: "complaintId is required" });
    }

    const complaints = getComplaints();
    const complaint = complaints.find(
      (c) => c.id === complaintId || c.ticketId === complaintId
    );

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    // Attach assignment metadata non-destructively
    complaint.assignment = {
      assignedType, // "city_team" | "university"
      agency: agency || "Municipal Corporation",
      departmentName: departmentName || complaint.category || "General Administration",
      zone: zone || "Bhopal Central Zone",
      officerName: officerName || "Unassigned Officer",
      officerDesignation: officerDesignation || "Executive Engineer",
      officerPhone: officerPhone || "",
      officerEmail: officerEmail || "",
      targetCompletionDate: targetCompletionDate || null,
      actionPlan: actionPlan || "",
      equipmentNeeded: equipmentNeeded || "",
      officerReviewNote: officerReviewNote || "",
      universityName: universityName || "",
      researchFocus: researchFocus || "",
      assignedAt: new Date().toISOString()
    };

    // If status is still 'Submitted', update to 'In Progress' upon assignment
    if (complaint.status === "Submitted") {
      complaint.status = "In Progress";
    }

    saveComplaints(complaints);

    res.json({
      success: true,
      message:
        assignedType === "university"
          ? "Problem successfully assigned to University Research Team"
          : "City department officer assignment confirmed",
      complaint
    });
  } catch (error) {
    console.error("[Analytics] Assign department error:", error);
    res.status(500).json({ success: false, message: "Failed to save assignment details" });
  }
});

/**
 * GET /api/analytics/telemetry
 * Returns District Telemetry, Severity Grid, and Citizen Impact statistics.
 */
router.get("/telemetry", (req, res) => {
  try {
    const complaints = getComplaints();
    const data = computeTelemetryAndImpact(complaints);
    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    console.error("[Analytics] Telemetry error:", error);
    res.status(500).json({ success: false, message: "Failed to compute telemetry and impact" });
  }
});

export default router;
