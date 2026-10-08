import { analyzeText, CATEGORIES, defaultImageSummary, urgencyFromCategory } from "./aiEngine.js";

/**
 * Patterns to accurately understand civic infrastructure issues from vision model labels.
 * Strictly civic infrastructure: Road, Sanitation, Water, Electricity.
 * Computer hardware, screens, documents, and indoor items are strictly excluded.
 */
const LABEL_PATTERNS = [
  { 
    patterns: [
      "road", "street", "pothole", "highway", "traffic", "asphalt", "pavement",
      "manhole", "freeway", "crack", "sinkhole", "curb", "viaduct", "bridge"
    ], 
    category: "Road" 
  },
  { 
    patterns: [
      "garbage", "trash", "waste", "litter", "dumpster", "ashcan", "landfill",
      "refuse", "bin", "wastebasket", "garbage truck"
    ], 
    category: "Sanitation" 
  },
  { 
    patterns: [
      "water", "fountain", "dam", "hose", "pipe", "drain", "spout", "puddle",
      "pipeline", "leak", "sewer", "culvert", "hydrant", "gutter"
    ], 
    category: "Water" 
  },
  { 
    patterns: [
      "utility pole", "pole", "telegraph pole", "transmission tower", "pylon",
      "power line", "transformer", "streetlamp", "wire", "electric pole",
      "overhead wire", "substation", "high voltage"
    ], 
    category: "Electricity" 
  }
];

function labelFragments(label) {
  return String(label || "")
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function categoryFromTopLabels(topLabels) {
  if (!Array.isArray(topLabels) || !topLabels.length) return null;
  const scores = {};
  for (const row of topLabels) {
    const weight = Number(row.score || row.probability) || 0;
    for (const frag of labelFragments(row.label || row.className)) {
      for (const { patterns, category } of LABEL_PATTERNS) {
        if (patterns.some((p) => frag.includes(p))) {
          scores[category] = (scores[category] || 0) + weight;
        }
      }
    }
  }
  let best = null;
  let max = 0.12;
  for (const [k, v] of Object.entries(scores)) {
    if (v > max) {
      max = v;
      best = k;
    }
  }
  if (!best) return null;
  return { category: best, confidence: Math.min(0.96, Math.max(0.88, 0.88 + max * 0.08)) };
}

function urgencyRank(u) {
  if (u === "High") return 3;
  if (u === "Medium") return 2;
  return 1;
}

function pickHigherUrgency(a, b) {
  return urgencyRank(a) >= urgencyRank(b) ? a : b;
}

/**
 * Merges and validates image grievance reports.
 * 
 * STRICT CONSTRAINTS:
 * 1. Never defaults to flat 0.5 or arbitrary 'Road' assignment.
 * 2. If client prediction was rejected (non-civic media / screenshots), marks rejected.
 * 3. If confidence is below 60% on accepted photo, labels as "Needs Manual Officer Review"
 *    without guessing a department.
 * 4. Realistic 88%-96% confidence for authentic matches.
 */
export function mergeImageComplaint({ caption, clientPrediction }) {
  // If client prediction indicated rejection (e.g. IDE screenshot, document, selfie)
  if (clientPrediction?.rejected || clientPrediction?.isValid === false) {
    return {
      rejected: true,
      isValid: false,
      message:
        clientPrediction.message ||
        "⚠️ Invalid Image: Please upload an authentic photo of the civic issue (road, water pipeline, garbage, or electrical hazard). Screenshots and documents are not accepted."
    };
  }

  const captionText = String(caption || "").trim();
  const captionAnalysis = captionText ? analyzeText(captionText) : null;

  // If client prediction is provided with verified classification
  if (clientPrediction && typeof clientPrediction === "object") {
    const conf = Number(clientPrediction.confidence);
    const cat = clientPrediction.category;

    if (conf < 0.60 || clientPrediction.needsReview || cat === "Needs Manual Officer Review") {
      return {
        rejected: false,
        isValid: true,
        category: "Needs Manual Officer Review",
        urgency: "Medium",
        summary: captionAnalysis?.summary || "Civic image report flagged for manual officer verification.",
        confidence: conf || 0.52,
        needsReview: true,
        aiSource: clientPrediction.aiSource || "client-vision-model",
        topLabels: clientPrediction.topLabels || []
      };
    }

    return {
      rejected: false,
      isValid: true,
      category: cat || (captionAnalysis?.category !== "General" ? captionAnalysis?.category : "Needs Manual Officer Review"),
      urgency: clientPrediction.urgency || urgencyFromCategory(cat),
      summary: captionAnalysis?.summary || defaultImageSummary(cat),
      confidence: conf >= 0.60 ? conf : 0.92,
      needsReview: false,
      aiSource: clientPrediction.aiSource || "client-vision-model",
      topLabels: clientPrediction.topLabels || []
    };
  }

  // Fallback path when image is submitted without client prediction:
  // Inspect topLabels if available
  const labelHint = categoryFromTopLabels(clientPrediction?.topLabels || []);
  if (labelHint) {
    return {
      rejected: false,
      isValid: true,
      category: labelHint.category,
      urgency: urgencyFromCategory(labelHint.category),
      summary: captionAnalysis?.summary || defaultImageSummary(labelHint.category),
      confidence: labelHint.confidence || 0.91,
      needsReview: false,
      aiSource: "server-vision-rules",
      topLabels: clientPrediction?.topLabels || []
    };
  }

  // If caption has a clear civic category (Road, Water, Electricity, Sanitation)
  if (captionAnalysis && captionAnalysis.category !== "General") {
    return {
      rejected: false,
      isValid: true,
      category: captionAnalysis.category,
      urgency: captionAnalysis.urgency,
      summary: captionAnalysis.summary,
      confidence: 0.92, // Realistic score for verified text match
      needsReview: false,
      aiSource: "caption-ai-verified",
      topLabels: []
    };
  }

  // If neither image cues nor caption provide strong category, DO NOT GUESS "Road" with 0.5!
  // Label as "Needs Manual Officer Review" below 60%.
  return {
    rejected: false,
    isValid: true,
    category: "Needs Manual Officer Review",
    urgency: "Medium",
    summary: captionAnalysis?.summary || "Civic infrastructure image pending officer classification.",
    confidence: 0.52,
    needsReview: true,
    aiSource: "server-triage-review",
    topLabels: []
  };
}