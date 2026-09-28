/**
 * District Telemetry & Ground Impact Helper
 * Computes regional severity indices, citizens benefited, and dual-track assignment impact.
 * Non-destructive and backward-compatible.
 */

const DISTRICT_LIST = [
  "Bhopal Central (Ward 14-22)",
  "MP Nagar & Commercial Zone",
  "Kolar & Southern Suburbs",
  "BHEL & Govindpura Industrial",
  "Old City & Walled Heritage",
  "Ranchi Municipal Corporation",
  "Dumka Civic Division"
];

/**
 * Extracts or maps district from location string.
 */
export function extractDistrict(locationString = "") {
  const loc = String(locationString).toLowerCase();
  for (const dist of DISTRICT_LIST) {
    const key = dist.split(" ")[0].toLowerCase();
    if (loc.includes(key)) return dist;
  }
  if (loc.includes("ward 14") || loc.includes("sector 4")) return DISTRICT_LIST[0];
  if (loc.includes("sector 12") || loc.includes("mp nagar")) return DISTRICT_LIST[1];
  if (loc.includes("kolar")) return DISTRICT_LIST[2];
  if (loc.includes("bhel")) return DISTRICT_LIST[3];
  if (loc.includes("ranchi")) return DISTRICT_LIST[5];
  if (loc.includes("dumka")) return DISTRICT_LIST[6];

  return DISTRICT_LIST[0]; // Default to Bhopal Central
}

/**
 * Computes telemetry metrics, district severity index, and citizen impact.
 */
export function computeTelemetryAndImpact(complaints = []) {
  let totalHandled = complaints.length;
  let cityRepairsAssigned = 0;
  let universityLabProjects = 0;
  let totalEstimatedBenefited = 0;

  // District aggregation map
  const districtMap = {};
  for (const d of DISTRICT_LIST) {
    districtMap[d] = {
      district: d,
      total: 0,
      active: 0,
      resolved: 0,
      escalated: 0,
      peopleAffected: 0,
      categories: {},
      criticalCount: 0,
      highCount: 0,
      sampleTickets: []
    };
  }

  for (const c of complaints) {
    const assignedType = c.assignment?.assignedType;
    if (assignedType === "city_team") cityRepairsAssigned++;
    else if (assignedType === "university") universityLabProjects++;

    // Calculate citizens benefited
    const affected = Number(c.peopleAffected) || (c.urgency === "Critical" ? 250 : c.urgency === "High" ? 120 : 60);
    totalEstimatedBenefited += affected;

    const district = c.district || extractDistrict(c.location);
    if (!districtMap[district]) {
      districtMap[district] = {
        district,
        total: 0,
        active: 0,
        resolved: 0,
        escalated: 0,
        peopleAffected: 0,
        categories: {},
        criticalCount: 0,
        highCount: 0,
        sampleTickets: []
      };
    }

    const dObj = districtMap[district];
    dObj.total++;
    dObj.peopleAffected += affected;

    const status = String(c.status || "").toLowerCase();
    if (status === "resolved" || status === "closed") {
      dObj.resolved++;
    } else {
      dObj.active++;
    }

    if (c.isEscalated) dObj.escalated++;
    if (c.urgency === "Critical") dObj.criticalCount++;
    if (c.urgency === "High") dObj.highCount++;

    const cat = c.category || "General";
    dObj.categories[cat] = (dObj.categories[cat] || 0) + 1;

    if (dObj.sampleTickets.length < 3 && c.ticketId) {
      dObj.sampleTickets.push(c.ticketId);
    }
  }

  // Calculate Severity Index (0 - 100) for each district
  const districtGrid = Object.values(districtMap).map((d) => {
    // Top category in this district
    let primaryCategory = "General";
    let maxCatCount = 0;
    for (const [cat, count] of Object.entries(d.categories)) {
      if (count > maxCatCount) {
        maxCatCount = count;
        primaryCategory = cat;
      }
    }

    // Formula: baseline + weighted criticals + high urgency + escalated penalty
    const baseScore = Math.min(40, d.total * 6);
    const criticalScore = d.criticalCount * 18;
    const highScore = d.highCount * 10;
    const escalationScore = d.escalated * 12;
    const rawIndex = baseScore + criticalScore + highScore + escalationScore;

    // Normalize between 15 and 96
    const severityIndex = d.total === 0 ? 12 : Math.min(96, Math.max(25, rawIndex));

    let statusTag = "Stable Operation";
    let statusColor = "emerald";
    if (severityIndex >= 70) {
      statusTag = "Critical Attention";
      statusColor = "rose";
    } else if (severityIndex >= 45) {
      statusTag = "Elevated Watch";
      statusColor = "amber";
    }

    return {
      district: d.district,
      severityIndex,
      statusTag,
      statusColor,
      totalIssues: d.total,
      activeIssues: d.active,
      resolvedIssues: d.resolved,
      escalatedCount: d.escalated,
      peopleAffected: d.peopleAffected,
      primaryCategory,
      sampleTickets: d.sampleTickets
    };
  }).sort((a, b) => b.severityIndex - a.severityIndex);

  return {
    counters: {
      totalHandled,
      cityRepairsAssigned,
      universityLabProjects,
      estimatedCitizensBenefited: totalEstimatedBenefited,
      resolvedCount: complaints.filter(c => String(c.status).toLowerCase() === "resolved").length,
      escalationRate: totalHandled > 0 ? `${((complaints.filter(c => c.isEscalated).length / totalHandled) * 100).toFixed(1)}%` : "0%"
    },
    districtGrid
  };
}
