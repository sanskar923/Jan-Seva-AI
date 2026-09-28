/**
 * Problem DNA & Solution Pathway Helper
 * Inspired by SamasyaSetu AI grievance reasoning.
 * Analyzes civic complaint text and category to determine:
 * - Root Cause
 * - AI Suggested Solution Pathway / Action
 * - Recommended Priority & SLA
 * - Department Sub-unit & Preventive Measure
 */

const DNA_RULES = [
  // WATER SUPPLY
  {
    category: "water",
    keywords: ["burst", "leak", "pipe", "line", "paani bah raha", "tuta"],
    rootCause: "Sub-surface pipeline rupture due to pressure surge or joint corrosion",
    solutionPathway: "Dispatch PHE rapid-action repair crew with trenchless valve replacement kit",
    departmentUnit: "PHE Distribution & Maintenance Squad",
    suggestedSlaHours: 24,
    priority: "Critical",
    preventativeAction: "Conduct acoustic pipeline leak detection and pressure sensor calibration"
  },
  {
    category: "water",
    keywords: ["dirty", "ganda", "smell", "contaminat", "muddy", "peene ka paani", "yellow", "badbu"],
    rootCause: "Cross-contamination from nearby sewer infiltration or stagnant trunk line",
    solutionPathway: "Isolate affected sector feeder, flush supply pipeline, and conduct chlorination sampling",
    departmentUnit: "Water Quality Testing & Disinfection Cell",
    suggestedSlaHours: 24,
    priority: "Critical",
    preventativeAction: "Inspect adjacent drainage lines for sub-soil breaches"
  },
  {
    category: "water",
    keywords: ["pressure", "low pressure", "nahi aa raha", "tanker", "no water"],
    rootCause: "Secondary booster pump failure or distribution line air-locking",
    solutionPathway: "Bleed air locks from distribution line and dispatch emergency civic water tanker",
    departmentUnit: "Municipal Tanker Logistics & Pump Section",
    suggestedSlaHours: 24,
    priority: "High",
    preventativeAction: "Automate pump telemetry monitoring and install pressure transducers"
  },

  // ELECTRICITY & POWER
  {
    category: "electricity",
    keywords: ["spark", "wire", "taar", "live wire", "danger", "gira", "shock", "current"],
    rootCause: "Overhead distribution conductor snap or tree branch friction breakdown",
    solutionPathway: "Trigger immediate 11kV substation feeder trip and dispatch bucket truck emergency crew",
    departmentUnit: "DISCOM Emergency Line Safety Squad",
    suggestedSlaHours: 12,
    priority: "Critical",
    preventativeAction: "Implement tree trimming corridor clearance along overhead HT/LT lines"
  },
  {
    category: "electricity",
    keywords: ["transformer", "blast", "smoke", "dhuwan", "aag"],
    rootCause: "Phase overload and dielectric oil temperature escalation leading to bushing blowout",
    solutionPathway: "Isolate distribution transformer, replace blown unit, and balance feeder phase loads",
    departmentUnit: "Substation Transformer Engineering Division",
    suggestedSlaHours: 24,
    priority: "Critical",
    preventativeAction: "Thermal infrared scan of transformer bushings under peak hour load"
  },
  {
    category: "electricity",
    keywords: ["outage", "blackout", "cut", "no power", "light nahi", "andhera"],
    rootCause: "Tripped 415V distribution pillar box fuse or feeder breaker lockout",
    solutionPathway: "Inspect neighborhood pillar box, replace HRC fuses, and restore feeder section",
    departmentUnit: "Urban Feeder Maintenance Unit",
    suggestedSlaHours: 24,
    priority: "High",
    preventativeAction: "Upgrade distribution pillar switches to smart reclosers"
  },
  {
    category: "electricity",
    keywords: ["street light", "pole", "khamba", "bulb", "lamp"],
    rootCause: "Photocell twilight controller malfunction or LED luminaire driver failure",
    solutionPathway: "Replace burned-out LED luminaire driver and calibrate automatic astronomical timer",
    departmentUnit: "Public Lighting & Energy Efficiency Cell",
    suggestedSlaHours: 48,
    priority: "Medium",
    preventativeAction: "Transition to centralized CCMS (Centralized Control & Monitoring System)"
  },

  // ROADS & INFRASTRUCTURE
  {
    category: "road",
    keywords: ["pothole", "gaddha", "broken", "tooti", "sadak", "pit"],
    rootCause: "Sub-base asphalt binder stripping caused by water seepage under dynamic vehicle loads",
    solutionPathway: "Apply rapid cold-mix bitumen patch followed by vibratory roller compaction",
    departmentUnit: "Roads & Highways Rapid Repair Gang",
    suggestedSlaHours: 48,
    priority: "High",
    preventativeAction: "Seal surface micro-cracks before monsoon using elastomeric sealants"
  },
  {
    category: "road",
    keywords: ["waterlog", "water log", "paani bhara", "pond", "flood"],
    rootCause: "Inadequate surface camber gradient and stormwater catch-basin gully choke",
    solutionPathway: "Clear street catch-basin grates and deploy diesel dewatering pump set",
    departmentUnit: "Stormwater Drainage & Flood Control Team",
    suggestedSlaHours: 24,
    priority: "High",
    preventativeAction: "Re-grade asphalt shoulder to guide runoff toward underground drainage boxes"
  },

  // SANITATION & WASTE
  {
    category: "sanitation",
    keywords: ["sewage", "gutter", "drain", "naali", "overflow", "choke"],
    rootCause: "Heavy silt deposition combined with non-biodegradable debris choke in sewer line",
    solutionPathway: "Deploy high-pressure super-sucker vacuum jetting vehicle to clear sewer trunk choke",
    departmentUnit: "Sewerage Jetting & Sanitation Operations",
    suggestedSlaHours: 24,
    priority: "Critical",
    preventativeAction: "Schedule pre-monsoon desilting and enforce illegal trash disposal checks"
  },
  {
    category: "sanitation",
    keywords: ["garbage", "kachra", "dump", "dustbin", "waste", "trash", "badbu"],
    rootCause: "Missed secondary compactor collection cycle leading to open bin overflow",
    solutionPathway: "Dispatch hydraulic tipper dumper to clear waste and sanitize spot with lime/bleaching powder",
    departmentUnit: "Solid Waste Management Logistics Cell",
    suggestedSlaHours: 24,
    priority: "High",
    preventativeAction: "Mount IoT ultrasonic level sensors on community collection bins"
  }
];

const DEFAULT_DNA = {
  rootCause: "Civic infrastructure component aging or service operational bottleneck",
  solutionPathway: "Assign ward supervisor for on-site inspection and issue corrective work order",
  departmentUnit: "Ward Municipal Administration",
  suggestedSlaHours: 48,
  priority: "Medium",
  preventativeAction: "Incorporate location into routine municipal bi-weekly inspection schedule"
};

/**
 * Analyzes a single complaint to determine its Problem DNA and Solution Pathway.
 */
export function analyzeProblemDna(complaint = {}) {
  const text = `${complaint.text || ""} ${complaint.summary || ""} ${complaint.caption || ""}`.toLowerCase();
  const category = String(complaint.category || "").toLowerCase();

  // Try category + keyword match
  for (const rule of DNA_RULES) {
    const catMatch = !rule.category || category.includes(rule.category);
    if (catMatch) {
      for (const kw of rule.keywords) {
        if (text.includes(kw)) {
          return {
            ticketId: complaint.ticketId,
            category: complaint.category || "General",
            identifiedKeyword: kw,
            rootCause: rule.rootCause,
            solutionPathway: rule.solutionPathway,
            departmentUnit: rule.departmentUnit,
            suggestedSlaHours: rule.suggestedSlaHours,
            priority: rule.priority,
            preventativeAction: rule.preventativeAction
          };
        }
      }
    }
  }

  // Fallback to category-only rule if any keyword didn't explicitly match
  for (const rule of DNA_RULES) {
    if (rule.category && category.includes(rule.category)) {
      return {
        ticketId: complaint.ticketId,
        category: complaint.category || "General",
        identifiedKeyword: "category-inferred",
        rootCause: rule.rootCause,
        solutionPathway: rule.solutionPathway,
        departmentUnit: rule.departmentUnit,
        suggestedSlaHours: rule.suggestedSlaHours,
        priority: rule.priority,
        preventativeAction: rule.preventativeAction
      };
    }
  }

  return {
    ticketId: complaint.ticketId,
    category: complaint.category || "General",
    identifiedKeyword: "general-civic",
    ...DEFAULT_DNA
  };
}

/**
 * Generates aggregated problem DNA insights across all active complaints.
 */
export function generateInsights(complaints = []) {
  const analyzed = complaints.map(c => ({
    ...c,
    dna: analyzeProblemDna(c)
  }));

  // Count recurring root causes
  const rootCauseCounts = {};
  for (const item of analyzed) {
    const rc = item.dna.rootCause;
    if (!rootCauseCounts[rc]) {
      rootCauseCounts[rc] = {
        rootCause: rc,
        count: 0,
        category: item.category,
        solutionPathway: item.dna.solutionPathway,
        priority: item.dna.priority,
        suggestedSlaHours: item.dna.suggestedSlaHours,
        departmentUnit: item.dna.departmentUnit,
        sampleTickets: []
      };
    }
    rootCauseCounts[rc].count += 1;
    if (rootCauseCounts[rc].sampleTickets.length < 3 && item.ticketId) {
      rootCauseCounts[rc].sampleTickets.push(item.ticketId);
    }
  }

  const recurringCauses = Object.values(rootCauseCounts).sort((a, b) => b.count - a.count);

  return {
    totalComplaints: complaints.length,
    distinctRootCausesCount: recurringCauses.length,
    recurringCauses,
    recentPathways: analyzed.slice(-6).reverse().map(item => ({
      ticketId: item.ticketId,
      category: item.category,
      urgency: item.urgency,
      summary: item.summary || item.text?.slice(0, 60),
      isEscalated: Boolean(item.isEscalated),
      location: item.location,
      dna: item.dna
    }))
  };
}
