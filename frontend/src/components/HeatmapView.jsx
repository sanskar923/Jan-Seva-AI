import React, { useEffect, useState, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import http from "../api/http.js";

// Standard Category Colors as per requirements
const CATEGORY_COLORS = {
  Water: "#0ea5e9", // Blue
  Electricity: "#8b5cf6", // Purple
  Road: "#f59e0b", // Yellow/Orange
  Sanitation: "#10b981", // Green
  General: "#64748b"
};

function getMarkerColor(category, isEscalated) {
  if (isEscalated) return "#ef4444"; // Red for SLA Escalated
  const cat = String(category || "").toLowerCase();
  if (cat.includes("water")) return "#0ea5e9";
  if (cat.includes("electr") || cat.includes("power")) return "#8b5cf6";
  if (cat.includes("road") || cat.includes("pothole")) return "#f59e0b";
  if (cat.includes("sanit") || cat.includes("sewage") || cat.includes("garbage")) return "#10b981";
  return "#64748b";
}

// Default 13 Grievance Nodes for instant zero-latency rendering
const DEFAULT_GRIEVANCE_POINTS = [
  { id: "p1", ticketId: "JSA-2026-001", lat: 23.2334, lng: 77.3865, category: "Electricity", urgency: "High", status: "In Progress", isEscalated: true, location: "Sector 12, Ward 14", summary: "Power outage and sparking transformer" },
  { id: "p2", ticketId: "JSA-2026-002", lat: 23.2450, lng: 77.4010, category: "Water", urgency: "Medium", status: "Pending", isEscalated: false, location: "Kolar Road, Ward 18", summary: "Broken potable water main pipeline leakage" },
  { id: "p3", ticketId: "JSA-2026-003", lat: 23.2680, lng: 77.4190, category: "Road", urgency: "High", status: "In Progress", isEscalated: false, location: "MP Nagar Zone 1", summary: "Deep potholes on commercial corridor" },
  { id: "p4", ticketId: "JSA-2026-004", lat: 23.2810, lng: 77.4320, category: "Sanitation", urgency: "Medium", status: "Pending", isEscalated: false, location: "BHEL Govindpura", summary: "Overflowing solid waste garbage dump" },
  { id: "p5", ticketId: "JSA-2026-005", lat: 23.2510, lng: 77.3950, category: "Water", urgency: "Low", status: "Resolved", isEscalated: false, location: "Old City Heritage Zone", summary: "Low pressure drinking water supply" },
  { id: "p6", ticketId: "JSA-2026-006", lat: 23.2339, lng: 77.3866, category: "General", urgency: "Medium", status: "In Progress", isEscalated: false, location: "Shahpura Lake Road", summary: "Streetlight flickering along promenade" },
  { id: "p7", ticketId: "JSA-2026-007", lat: 23.2620, lng: 77.4080, category: "Electricity", urgency: "High", status: "Pending", isEscalated: true, location: "Arera Colony", summary: "Hanging loose wire near residential park" },
  { id: "p8", ticketId: "JSA-2026-008", lat: 23.2750, lng: 77.3820, category: "Road", urgency: "Medium", status: "In Progress", isEscalated: false, location: "Hamidia Road", summary: "Damaged culvert causing traffic congestion" },
  { id: "p9", ticketId: "JSA-2026-009", lat: 23.2200, lng: 77.4250, category: "Sanitation", urgency: "High", status: "Pending", isEscalated: true, location: "Misrod Industrial Suburb", summary: "Choked stormwater drain overflowing onto road" },
  { id: "p10", ticketId: "JSA-2026-010", lat: 23.2550, lng: 77.4450, category: "Water", urgency: "Medium", status: "Pending", isEscalated: false, location: "Ayodhya Bypass", summary: "Sewage mixing with municipal water supply" },
  { id: "p11", ticketId: "JSA-2026-011", lat: 23.2900, lng: 77.4000, category: "Electricity", urgency: "Low", status: "Resolved", isEscalated: false, location: "Karond Mandi", summary: "Burnt fuse box replaced by field crew" },
  { id: "p12", ticketId: "JSA-2026-012", lat: 23.2400, lng: 77.4500, category: "Road", urgency: "High", status: "Pending", isEscalated: true, location: "Hoshangabad Road", summary: "Monsoon asphalt breakdown near flyover" },
  { id: "p13", ticketId: "JSA-2026-013", lat: 23.2700, lng: 77.3600, category: "Sanitation", urgency: "Medium", status: "In Progress", isEscalated: false, location: "Bairagarh Civic Division", summary: "Clogged sewer line causing foul odor" }
];

export default function HeatmapView() {
  const [points, setPoints] = useState(DEFAULT_GRIEVANCE_POINTS);
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedPoint, setSelectedPoint] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // 1. Ensure Leaflet CSS Link is present in document head (Safety check)
  useEffect(() => {
    const existing = document.getElementById("leaflet-cdn-css");
    if (!existing) {
      const link = document.createElement("link");
      link.id = "leaflet-cdn-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
  }, []);

  // 2. Fetch live points from backend (seamlessly updates points if available)
  useEffect(() => {
    let mounted = true;
    http
      .get("/analytics/heatmap")
      .then((res) => {
        if (mounted && res.data?.points?.length > 0) {
          setPoints(res.data.points);
        }
      })
      .catch((err) => {
        console.warn("Using offline grievance nodes for heatmap:", err.message);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredPoints = useMemo(() => {
    if (filterCategory === "all") return points;
    return points.filter((p) =>
      String(p.category || "").toLowerCase() === filterCategory.toLowerCase()
    );
  }, [points, filterCategory]);

  // 3. Initialize Leaflet Map (Explicitly centered at Bhopal [23.2599, 77.4126] with zoom 12)
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Prevent "Map container is already initialized" error
    if (container._leaflet_id) {
      container._leaflet_id = null;
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(container, {
      center: [23.2599, 77.4126],
      zoom: 12,
      scrollWheelZoom: true,
      zoomControl: true
    });

    // 4. Reliable OpenStreetMap Standard Tile Layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Delayed map.invalidateSize() calls after 250ms & 500ms to guarantee tiles stretch properly
    const timer250 = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    const timer500 = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 500);

    return () => {
      clearTimeout(timer250);
      clearTimeout(timer500);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 5. Plot Markers onto Real Map whenever filteredPoints changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    filteredPoints.forEach((pt) => {
      const lat = Number(pt.lat);
      const lng = Number(pt.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      const color = getMarkerColor(pt.category, pt.isEscalated);

      // Add outer halo for SLA escalated overdue grievances
      if (pt.isEscalated) {
        const halo = L.circleMarker([lat, lng], {
          radius: 14,
          color: "#ef4444",
          fillColor: "#ef4444",
          fillOpacity: 0.25,
          weight: 1.5,
          interactive: false
        });
        markersGroup.addLayer(halo);
      }

      // Add main circleMarker with category pin color
      const marker = L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: color,
        color: "#ffffff",
        weight: 2.5,
        opacity: 1,
        fillOpacity: 0.95
      });

      // Clean Leaflet Popup showing Ticket ID, Category, Priority, and Status
      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; color: #1e293b; min-width: 200px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 6px;">
            <span style="font-weight: 800; font-size: 13px; color: #4338ca;">#${pt.ticketId || "TICKET"}</span>
            ${
              pt.isEscalated
                ? '<span style="background: #fee2e2; color: #dc2626; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 9999px;">SLA ESCALATED</span>'
                : '<span style="background: #dcfce7; color: #15803d; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 9999px;">ACTIVE</span>'
            }
          </div>
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px; font-size: 12px; line-height: 1.4;">
            ${pt.summary || pt.text || pt.category}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; color: #64748b;">
            <div>Category: <strong style="color: #0f172a;">${pt.category}</strong></div>
            <div>Priority: <strong style="color: #0f172a;">${pt.urgency || "Normal"}</strong></div>
            <div>Status: <strong style="color: #0f172a;">${pt.status || "Open"}</strong></div>
            <div>Location: <strong style="color: #0f172a;">${pt.location || "Bhopal, MP"}</strong></div>
          </div>
          <div style="margin-top: 6px; font-family: monospace; font-size: 10px; color: #94a3b8; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            📍 ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280 });
      marker.on("click", () => {
        setSelectedPoint(pt);
      });

      markersGroup.addLayer(marker);
    });

    // Invalidate map size after markers are plotted
    map.invalidateSize();
  }, [filteredPoints]);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <span>🗺️</span> Civic Grievance Spatial Heatmap
          </h3>
          <p className="text-xs text-slate-400">
            Real Leaflet / OpenStreetMap density view across Bhopal wards & GPS reporting nodes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <span>Filter:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-xl border border-slate-700/80 bg-slate-950/60 px-2.5 py-1 text-xs font-semibold text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            >
              <option value="all">All Categories</option>
              <option value="Electricity">Electricity (Purple)</option>
              <option value="Water">Water (Blue)</option>
              <option value="Road">Road (Yellow/Orange)</option>
              <option value="Sanitation">Sanitation (Green)</option>
              <option value="General">General</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-black uppercase">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {filteredPoints.length} Points Mapped
            </span>
          </div>
        </div>
      </div>

      {/* Explicit Map Container Sizing as requested */}
      <div
        className="rounded-2xl border border-slate-800 overflow-hidden shadow-2xl"
        style={{
          height: "420px",
          width: "100%",
          position: "relative",
          zIndex: 1
        }}
      >
        <div
          ref={mapContainerRef}
          style={{
            height: "100%",
            width: "100%",
            position: "absolute",
            top: 0,
            left: 0
          }}
        />

        {/* Selected Point Floating Card */}
        {selectedPoint && (
          <div className="absolute bottom-3 right-3 max-w-xs rounded-xl border border-slate-700 bg-slate-900/95 p-3.5 text-xs text-white shadow-2xl backdrop-blur-lg z-[1000]">
            <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1.5 mb-1.5">
              <span className="font-extrabold text-indigo-400">#{selectedPoint.ticketId}</span>
              <button
                onClick={() => setSelectedPoint(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>
            <p className="font-semibold text-slate-200 text-xs mb-2 line-clamp-2">{selectedPoint.summary}</p>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-400">
              <div>Category: <span className="text-white font-bold">{selectedPoint.category}</span></div>
              <div>Priority: <span className="text-white font-bold">{selectedPoint.urgency}</span></div>
              <div>Status: <span className="text-white font-bold">{selectedPoint.status}</span></div>
              <div>
                Escalated:{" "}
                <span className={selectedPoint.isEscalated ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                  {selectedPoint.isEscalated ? "Yes (Overdue)" : "No"}
                </span>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-slate-500 font-mono">
              📍 {Number(selectedPoint.lat).toFixed(4)}° N, {Number(selectedPoint.lng).toFixed(4)}° E
            </div>
          </div>
        )}
      </div>

      {/* Legend & Summary */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex flex-wrap items-center gap-4 font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#0ea5e9] border border-white shadow-sm" /> Blue: Water
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#8b5cf6] border border-white shadow-sm" /> Purple: Electricity
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#f59e0b] border border-white shadow-sm" /> Yellow/Orange: Road
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#10b981] border border-white shadow-sm" /> Green: Sanitation
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ef4444] border-2 border-white shadow-sm animate-pulse" /> Red: SLA Escalated
          </span>
        </div>
        <div className="text-[11px] text-slate-400">Click any marker pin to view ticket details & GPS popup.</div>
      </div>
    </div>
  );
}
