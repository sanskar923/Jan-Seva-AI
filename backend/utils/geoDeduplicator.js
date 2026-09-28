/**
 * Geo-Deduplication Helper (Modular)
 * Identifies spatial duplicates within 100 meters using the Haversine formula.
 */

const EARTH_RADIUS_METERS = 6371000;
const BHOPAL_CENTER = { lat: 23.2599, lng: 77.4126 };

/**
 * Parses numeric latitude and longitude from strings or coordinate objects.
 * Supports patterns:
 * - "📍 Lat: 23.2599, Lng: 77.4126 (Bhopal)"
 * - "23.2599, 77.4126"
 * - { lat: 23.2599, lng: 77.4126 }
 */
export function extractCoordinates(location) {
  if (!location) return null;

  // Case 1: Object input
  if (typeof location === "object") {
    const lat = Number(location.lat ?? location.latitude);
    const lng = Number(location.lng ?? location.lon ?? location.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }

  if (typeof location !== "string") return null;

  // Case 2: "Lat: 23.2599, Lng: 77.4126" or similar
  const labeledRegex = /(?:lat|latitude)[:\s=]+([+-]?\d+(?:\.\d+)?)[,\s]+(?:lng|long|longitude)[:\s=]+([+-]?\d+(?:\.\d+)?)/i;
  const labeledMatch = location.match(labeledRegex);
  if (labeledMatch) {
    const lat = parseFloat(labeledMatch[1]);
    const lng = parseFloat(labeledMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // Case 3: "23.2599, 77.4126" format
  const rawPairRegex = /([+-]?\d{1,2}(?:\.\d+)?)[,\s]+([+-]?\d{1,3}(?:\.\d+)?)/;
  const rawPairMatch = location.match(rawPairRegex);
  if (rawPairMatch) {
    const lat = parseFloat(rawPairMatch[1]);
    const lng = parseFloat(rawPairMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  return null;
}

/**
 * Generates deterministic coordinates around Bhopal for complaints without GPS.
 */
export function getBhopalFallbackCoordinates(seed = "") {
  let hash = 0;
  const str = String(seed);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((Math.abs(hash) % 600) - 300) / 10000;
  const lngOffset = ((Math.abs(hash >> 4) % 600) - 300) / 10000;
  return {
    lat: Number((BHOPAL_CENTER.lat + latOffset).toFixed(4)),
    lng: Number((BHOPAL_CENTER.lng + lngOffset).toFixed(4)),
    isEstimated: true
  };
}

/**
 * Computes great-circle distance between two points in meters using Haversine formula.
 */
export function haversineDistanceMeters(coordA, coordB) {
  if (!coordA || !coordB) return Infinity;

  const lat1 = (coordA.lat * Math.PI) / 180;
  const lat2 = (coordB.lat * Math.PI) / 180;
  const deltaLat = ((coordB.lat - coordA.lat) * Math.PI) / 180;
  const deltaLng = ((coordB.lng - coordA.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Checks if two complaints are geographic duplicates within radius (default 100m).
 */
export function isGeoDuplicate(complaintA, complaintB, radiusMeters = 100, requireSameCategory = true) {
  if (!complaintA || !complaintB) return false;
  if (complaintA.id === complaintB.id) return false;

  if (requireSameCategory) {
    const catA = String(complaintA.category || "").toLowerCase();
    const catB = String(complaintB.category || "").toLowerCase();
    if (catA && catB && catA !== catB) return false;
  }

  const coordA = extractCoordinates(complaintA.location);
  const coordB = extractCoordinates(complaintB.location);

  if (!coordA || !coordB) return false;

  const dist = haversineDistanceMeters(coordA, coordB);
  return dist <= radiusMeters;
}

/**
 * Finds all complaints within radiusMeters of targetComplaint.
 */
export function findNearbyDuplicates(targetComplaint, allComplaints = [], radiusMeters = 100) {
  const coordTarget = extractCoordinates(targetComplaint?.location);
  if (!coordTarget) return [];

  const matches = [];

  for (const c of allComplaints) {
    if (c.id === targetComplaint.id) continue;
    const coordOther = extractCoordinates(c.location);
    if (!coordOther) continue;

    const dist = haversineDistanceMeters(coordTarget, coordOther);
    if (dist <= radiusMeters) {
      matches.push({
        complaint: c,
        distanceMeters: Math.round(dist * 10) / 10,
        sameCategory: String(c.category || "").toLowerCase() === String(targetComplaint.category || "").toLowerCase()
      });
    }
  }

  return matches.sort((a, b) => a.distanceMeters - b.distanceMeters);
}

/**
 * Groups a collection of complaints into spatial clusters within radiusMeters.
 */
export function clusterComplaintsByProximity(complaints = [], radiusMeters = 100) {
  const clusters = [];
  const visited = new Set();

  for (let i = 0; i < complaints.length; i++) {
    const a = complaints[i];
    if (visited.has(a.id)) continue;

    const coordA = extractCoordinates(a.location) || getBhopalFallbackCoordinates(a.ticketId || a.id);

    const currentCluster = [a];

    for (let j = i + 1; j < complaints.length; j++) {
      const b = complaints[j];
      if (visited.has(b.id)) continue;

      const coordB = extractCoordinates(b.location) || getBhopalFallbackCoordinates(b.ticketId || b.id);
      const dist = haversineDistanceMeters(coordA, coordB);
      if (dist <= radiusMeters) {
        currentCluster.push(b);
        visited.add(b.id);
      }
    }

    if (currentCluster.length > 1) {
      visited.add(a.id);
      clusters.push({
        anchorTicketId: a.ticketId,
        center: coordA,
        count: currentCluster.length,
        complaints: currentCluster.map(c => ({
          id: c.id,
          ticketId: c.ticketId,
          category: c.category,
          urgency: c.urgency,
          summary: c.summary || c.text?.slice(0, 50)
        }))
      });
    }
  }

  return clusters;
}
