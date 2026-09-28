import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getComplaints, saveComplaints } from "../utils/storage.js";
import { analyzeText } from "../utils/aiEngine.js";
import { mergeImageComplaint } from "../utils/imageClassifier.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Deletes an image file from the server when a complaint is deleted.
 */
function unlinkComplaintImage(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.startsWith("/uploads/")) return;
  const baseRoot = path.join(__dirname, "..");
  const abs = path.resolve(baseRoot, imageUrl.replace(/^\//, ""));
  const uploadsRoot = path.resolve(baseRoot, "uploads");
  if (!abs.startsWith(uploadsRoot)) return;
  try {
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch { /* ignore */ }
}

function safeParseClientPrediction(raw) {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try { return JSON.parse(String(raw)); } catch { return null; }
}

/**
 * Generates the next sequential Ticket ID for the current year.
 */
function nextTicketId(complaints) {
  const year = new Date().getFullYear();
  let max = 0;
  const re = new RegExp(`^JSA-${year}-(\\d+)$`);
  for (const c of complaints) {
    const m = String(c.ticketId || "").match(re);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `JSA-${year}-${String(max + 1).padStart(3, "0")}`;
}

export function listMyComplaints(req, res) {
  const complaints = getComplaints().filter((c) => c.userId === req.user.id);
  complaints.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ complaints });
}

/**
 * Handles Text Complaints with Citizen Profile & Location
 */
export async function submitTextComplaint(req, res) {
  const { 
    text, 
    description,
    title,
    fullname, 
    name,
    citizenName,
    occupation, 
    employmentType, 
    location,
    ward,
    district,
    affectedPeople,
    peopleAffected,
    category: explicitCategory,
    urgency: explicitUrgency
  } = req.body || {};
  
  const complaintText = String(text || description || title || "").trim();
  if (!complaintText) return res.status(400).json({ message: "Complaint text required" });
  
  const resolvedFullname = String(
    fullname || name || citizenName || req.user?.fullName || req.user?.username || "Citizen"
  ).trim();

  try {
    const analysis = analyzeText(complaintText);
    const complaints = getComplaints();
    const ticketId = nextTicketId(complaints);
    
    const complaint = {
      id: crypto.randomUUID(),
      ticketId,
      userId: req.user.id,
      username: req.user.username,
      
      // Captured Citizen Profile
      fullname: resolvedFullname,
      occupation: String(occupation || "Not Specified").trim(),
      employmentType: employmentType || "Other",
      location: location || district || "Bhopal, MP",
      ward: ward || district || "Bhopal Central",
      district: district || ward || "Bhopal Central",
      affectedPeople: affectedPeople ? Number(affectedPeople) : (peopleAffected ? Number(peopleAffected) : null),
      title: title ? String(title).trim() : analysis.summary,
      
      method: "text",
      text: complaintText,
      category: explicitCategory || analysis.category,
      urgency: explicitUrgency || analysis.urgency,
      status: "Submitted",
      imageUrl: null,
      confidence: analysis.confidence,
      summary: analysis.summary,
      aiSource: analysis.aiSource,
      topLabels: [],
      createdAt: new Date().toISOString()
    };

    complaints.push(complaint);
    saveComplaints(complaints);
    res.status(201).json({ complaint });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to classify complaint" });
  }
}

/**
 * Handles Image Complaints with Multimodal AI & Citizen Profile
 */
export async function submitImageComplaint(req, res) {
  const file = req.file;
  const { 
    caption, 
    text,
    description,
    title,
    fullname, 
    name,
    citizenName,
    occupation, 
    employmentType, 
    location, 
    ward,
    district,
    affectedPeople,
    peopleAffected,
    category: explicitCategory,
    urgency: explicitUrgency,
    clientPrediction: clientPredictionRaw 
  } = req.body || {};

  if (!file) return res.status(400).json({ message: "Image file required" });
  
  const resolvedFullname = String(
    fullname || name || citizenName || req.user?.fullName || req.user?.username || "Citizen"
  ).trim();

  const clientPrediction = safeParseClientPrediction(clientPredictionRaw);

  const merged = mergeImageComplaint({
    caption: caption || text || title,
    clientPrediction
  });

  const complaints = getComplaints();
  const ticketId = nextTicketId(complaints);

  const complaint = {
    id: crypto.randomUUID(),
    ticketId,
    userId: req.user.id,
    username: req.user.username,

    // Captured Citizen Profile
    fullname: resolvedFullname,
    occupation: String(occupation || "Not Specified").trim(),
    employmentType: employmentType || "Other",
    location: location || district || "Bhopal, MP",
    ward: ward || district || "Bhopal Central",
    district: district || ward || "Bhopal Central",
    affectedPeople: affectedPeople ? Number(affectedPeople) : (peopleAffected ? Number(peopleAffected) : null),
    title: title ? String(title).trim() : (caption || merged.summary),

    method: "image",
    text: String(caption || text || title || "").trim() || merged.summary,
    category: explicitCategory || merged.category,
    urgency: explicitUrgency || merged.urgency,
    status: "Submitted",
    imageUrl: `/uploads/${file.filename}`,
    confidence: merged.confidence,
    summary: merged.summary,
    aiSource: merged.aiSource,
    topLabels: merged.topLabels,
    createdAt: new Date().toISOString()
  };

  complaints.push(complaint);
  saveComplaints(complaints);
  res.status(201).json({ complaint });
}

export function deleteComplaint(req, res) {
  const { id } = req.params;
  const complaints = getComplaints();
  const idx = complaints.findIndex((c) => c.id === id);
  if (idx === -1) return res.status(404).json({ message: "Complaint not found" });

  const c = complaints[idx];
  const isOwner = c.userId === req.user.id;
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) return res.status(403).json({ message: "Not allowed to delete this complaint" });

  unlinkComplaintImage(c.imageUrl);
  complaints.splice(idx, 1);
  saveComplaints(complaints);
  res.json({ ok: true });
}