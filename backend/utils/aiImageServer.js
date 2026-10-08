import fs from "fs";
import { classifyComplaintText, classifyImageUpload, CATEGORIES, urgencyFromCategory } from "./classify.js";

const ROAD_LABEL_HINTS = [
  "street",
  "road",
  "highway",
  "traffic",
  "asphalt",
  "pavement",
  "manhole",
  "guardrail",
  "viaduct",
  "pothole"
];

function normalizeImagenetCategory(label) {
  const l = String(label || "").toLowerCase();
  if (
    l.includes("garbage") ||
    l.includes("trash") ||
    l.includes("ashcan") ||
    l.includes("wastebasket") ||
    l.includes("dumpster") ||
    l.includes("landfill")
  ) {
    return "Sanitation";
  }
  if (
    l.includes("street") ||
    l.includes("highway") ||
    l.includes("pavement") ||
    l.includes("asphalt") ||
    l.includes("manhole") ||
    l.includes("pothole")
  ) {
    return "Road";
  }
  if (
    l.includes("water spout") ||
    l.includes("fountain") ||
    l.includes("fire hydrant") ||
    l.includes("drain") ||
    l.includes("sewer") ||
    l.includes("culvert") ||
    l.includes("gutter")
  ) {
    return "Water";
  }
  if (
    l.includes("utility pole") ||
    l.includes("power line") ||
    l.includes("transmission tower") ||
    l.includes("transformer") ||
    l.includes("streetlamp")
  ) {
    return "Electricity";
  }
  return "General";
}

function roadHintScoreFromTopLabels(topLabels) {
  if (!Array.isArray(topLabels) || !topLabels.length) return 0;
  let s = 0;
  for (const row of topLabels) {
    const raw = String(row.label || "").toLowerCase();
    const weight = Number(row.score) || 0;
    const parts = raw
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    for (const part of parts) {
      if (ROAD_LABEL_HINTS.some((h) => part.includes(h))) s += weight;
    }
  }
  return s;
}

function scoreLabels(labels) {
  const scores = { Electricity: 0, Water: 0, Road: 0, Sanitation: 0, Billing: 0, General: 0 };
  for (const row of labels) {
    const cat = normalizeImagenetCategory(row.label);
    const s = Number(row.score) || 0;
    scores[cat] += s;
  }
  let best = "General";
  let max = scores.General;
  for (const c of CATEGORIES) {
    if (scores[c] > max) {
      max = scores[c];
      best = c;
    }
  }
  const top = Number(labels[0]?.score) || 0;
  const confidence = Math.min(0.92, Math.max(0.28, max > 0 ? max : top * 0.45));
  return { category: best, confidence, topLabels: labels };
}

export async function classifyImageWithHuggingFace(filePath) {
  const key = process.env.HF_API_KEY;
  const model = process.env.HF_IMAGE_MODEL || "google/vit-base-patch16-224";
  if (!key || !filePath) return null;

  const buf = fs.readFileSync(filePath);
  const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/octet-stream"
    },
    body: buf
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data)) return null;

  const labels = data
    .slice(0, 8)
    .map((x) => ({ label: String(x.label || x.class || ""), score: Number(x.score || x.confidence || 0) }))
    .filter((x) => x.label);

  if (!labels.length) return null;

  const { category, confidence, topLabels } = scoreLabels(labels);
  return {
    category,
    confidence,
    topLabels,
    urgency: urgencyFromCategory(category),
    aiSource: "huggingface-image"
  };
}

export function mergeImageSignals({ fileMeta, caption, clientPrediction, serverPrediction }) {
  const filenameGuess = classifyImageUpload({
    originalname: fileMeta.originalname,
    mimetype: fileMeta.mimetype
  });

  const captionText = String(caption || "").trim();
  const captionGuess = captionText ? classifyComplaintText(captionText) : null;

  const candidates = [];

  if (clientPrediction?.category) {
    const conf = Number(clientPrediction.confidence);
    candidates.push({
      category: conf < 0.60 ? "Needs Manual Officer Review" : clientPrediction.category,
      confidence: conf >= 0.60 ? conf : (conf || 0.52),
      urgency: clientPrediction.urgency || urgencyFromCategory(clientPrediction.category),
      topLabels: clientPrediction.topLabels || [],
      aiSource: clientPrediction.aiSource || "client-vision-model"
    });
  }

  if (serverPrediction?.category) {
    const conf = Number(serverPrediction.confidence);
    candidates.push({
      category: conf < 0.60 ? "Needs Manual Officer Review" : serverPrediction.category,
      confidence: conf >= 0.60 ? conf : (conf || 0.54),
      urgency: serverPrediction.urgency || urgencyFromCategory(serverPrediction.category),
      topLabels: serverPrediction.topLabels || [],
      aiSource: serverPrediction.aiSource || "huggingface-image"
    });
  }

  if (captionGuess && captionGuess.category !== "General") {
    candidates.push({
      category: captionGuess.category,
      confidence: 0.89,
      urgency: captionGuess.urgency,
      topLabels: [],
      aiSource: "caption-keywords"
    });
  }

  const labelRoadHint = roadHintScoreFromTopLabels(clientPrediction?.topLabels || serverPrediction?.topLabels);
  if (labelRoadHint >= 0.25) {
    candidates.push({
      category: "Road",
      confidence: Math.min(0.94, 0.88 + labelRoadHint * 0.06),
      urgency: urgencyFromCategory("Road"),
      topLabels: clientPrediction?.topLabels || serverPrediction?.topLabels || [],
      aiSource: "image-label-hint"
    });
  }

  if (!candidates.length) {
    candidates.push({
      category: "Needs Manual Officer Review",
      confidence: 0.52,
      urgency: "Medium",
      topLabels: [],
      aiSource: "manual-review-fallback"
    });
  }

  candidates.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
  const best = candidates[0];

  const assignedCategory =
    best.confidence < 0.60 || best.category === "General"
      ? "Needs Manual Officer Review"
      : best.category;

  const summary =
    captionText ||
    `Image complaint classified as ${assignedCategory} (${best.aiSource}).`;

  return {
    category: assignedCategory,
    urgency: best.urgency,
    confidence: Math.min(0.97, Math.max(0.42, best.confidence)),
    summary: summary.slice(0, 280),
    aiSource: best.aiSource,
    topLabels: best.topLabels || [],
    signalsTried: candidates.map((c) => c.aiSource)
  };
}
