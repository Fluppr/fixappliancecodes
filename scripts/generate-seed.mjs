import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const outputPath = resolve("data/error-codes.json");

const brands = [
  { name: "Samsung", slug: "samsung", appliances: ["washer", "dryer", "dishwasher", "refrigerator", "ac"] },
  { name: "LG", slug: "lg", appliances: ["washer", "dryer", "dishwasher", "refrigerator", "ac"] },
  { name: "Whirlpool", slug: "whirlpool", appliances: ["washer", "dryer", "dishwasher", "refrigerator"] },
  { name: "GE", slug: "ge", appliances: ["washer", "dryer", "dishwasher", "refrigerator", "oven"] },
  { name: "Bosch", slug: "bosch", appliances: ["dishwasher", "refrigerator", "oven", "washer"] },
  { name: "Frigidaire", slug: "frigidaire", appliances: ["dishwasher", "refrigerator", "oven", "washer", "dryer"] },
  { name: "Maytag", slug: "maytag", appliances: ["washer", "dryer", "dishwasher"] },
  { name: "KitchenAid", slug: "kitchenaid", appliances: ["dishwasher", "refrigerator", "oven"] },
  { name: "Kenmore", slug: "kenmore", appliances: ["washer", "dryer", "dishwasher", "refrigerator"] },
  { name: "Electrolux", slug: "electrolux", appliances: ["washer", "dryer", "dishwasher", "refrigerator", "oven"] },
  { name: "Haier", slug: "haier", appliances: ["washer", "dryer", "refrigerator", "ac"] },
  { name: "Midea", slug: "midea", appliances: ["washer", "dishwasher", "ac", "refrigerator"] }
];

const modelFamilies = ["Series 100", "Series 200", "Series 300"];

const blueprint = {
  washer: [
    ["OE", "Drain timeout detected"],
    ["IE", "Water fill delay"],
    ["UE", "Load imbalance detected"],
    ["LE", "Motor lock detected"],
    ["DE", "Door latch signal missing"],
    ["E1", "Water level pressure mismatch"],
    ["E2", "Temperature sensor range issue"],
    ["E3", "Excess suds condition"],
    ["F5", "Control board communication fault"],
    ["F9", "Drain performance low"],
    ["H2", "Heater response delay"],
    ["C1", "Cycle interruption detected"]
  ],
  dryer: [
    ["D80", "Restricted airflow warning"],
    ["D90", "Severe vent blockage"],
    ["E1", "Thermistor value out of range"],
    ["E2", "Thermistor short/open"],
    ["F1", "Control relay fault"],
    ["F3", "Heating circuit issue"],
    ["PF", "Power interruption detected"],
    ["tE", "Temperature reading fault"],
    ["nP", "No line power detected"],
    ["L2", "Line voltage imbalance"],
    ["C9", "Door switch inconsistency"],
    ["H1", "Overheat protection event"]
  ],
  dishwasher: [
    ["E15", "Leak protection activated"],
    ["E22", "Filter or drain blockage"],
    ["E24", "Drain path restriction"],
    ["E25", "Drain pump obstruction"],
    ["IE", "Inlet water timeout"],
    ["LE", "Water leak sensor trigger"],
    ["F2", "Overflow state detected"],
    ["F6", "Water distribution fault"],
    ["H3", "Heater not reaching target"],
    ["C1", "Cycle canceled by safety logic"],
    ["E1", "Door switch/lock state issue"],
    ["E4", "Spray arm performance low"]
  ],
  refrigerator: [
    ["ER IF", "Ice fan speed fault"],
    ["ER FF", "Freezer fan speed fault"],
    ["ER RF", "Refrigerator fan speed fault"],
    ["ER DH", "Defrost cycle did not complete"],
    ["ER DS", "Defrost sensor issue"],
    ["E1", "Ambient sensor value invalid"],
    ["E2", "Freezer sensor value invalid"],
    ["E5", "Ice maker sensor issue"],
    ["H1", "High compartment temperature"],
    ["C3", "Compressor protection active"],
    ["F1", "Control communication fault"],
    ["dF", "Defrost drain concern"]
  ],
  ac: [
    ["P1", "Drain or condensate protection"],
    ["P2", "High pressure protection"],
    ["E1", "Indoor/ambient sensor issue"],
    ["E5", "Current overload protection"],
    ["F0", "Refrigerant protection logic"],
    ["F1", "Indoor coil sensor issue"],
    ["F2", "Outdoor coil sensor issue"],
    ["H3", "Compressor overload protection"],
    ["C5", "Inverter module alert"],
    ["dF", "Defrost in progress/abnormal"],
    ["L3", "Fan speed feedback fault"],
    ["U8", "Communication retry lockout"]
  ],
  oven: [
    ["F1", "Control key input fault"],
    ["F2", "Over-temperature detected"],
    ["F3", "Sensor open circuit"],
    ["F4", "Sensor short circuit"],
    ["F5", "Control board communication issue"],
    ["F7", "Latch motor feedback issue"],
    ["E1", "Temperature calibration drift"],
    ["E2", "Cooling fan response low"],
    ["E6", "Door lock timing issue"],
    ["C1", "Cycle canceled by safety"],
    ["H0", "Heating relay check failed"],
    ["P0", "Power integrity event"]
  ]
};

function toTitle(input) {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function createEntry(brand, appliance, modelFamily, code, summary) {
  const modelTag = modelFamily.replace(/\s+/g, "");
  const pageSlug = `${brand.slug}-${appliance}-${slugify(modelTag)}-${slugify(code)}`;

  const causes = [
    `Intermittent ${appliance} sensor reading outside expected range.`,
    `Temporary power-state mismatch after a surge or abrupt cycle interruption.`,
    `Mechanical restriction in a core ${appliance} subsystem (airflow, drain, or movement).`,
    `Wiring harness connection seated loosely due to vibration over time.`
  ];

  const steps = [
    "Power-cycle the unit for 3 minutes, then restart a short test cycle.",
    `Inspect accessible filters, vents, or drains specific to your ${appliance} and clear debris.`,
    "Confirm the appliance is level and stable to avoid false sensor triggers.",
    "Run one empty maintenance cycle and observe whether the code returns.",
    "If repeated, inspect harness connections and service documentation for continuity checks."
  ];

  return {
    id: pageSlug,
    slug: pageSlug,
    brand: brand.name,
    brandSlug: brand.slug,
    appliance,
    applianceSlug: slugify(appliance),
    modelFamily,
    code,
    title: `${brand.name} ${toTitle(appliance)} ${code} Error Code: Causes and Fixes`,
    summary,
    symptom: `${toTitle(appliance)} stops cycle and shows ${code}.`,
    severity: ["low", "medium", "high"][Math.floor((pageSlug.length + code.length) % 3)],
    causes,
    steps,
    tools: ["Flashlight", "Microfiber cloth", "Small brush", "Screwdriver set"],
    preventiveTips: [
      "Run monthly maintenance cycles and clean filters on schedule.",
      "Avoid overloading and keep installation clearances within manufacturer guidance.",
      "Use surge protection where local power quality is inconsistent."
    ],
    estimatedFixTime: "10-35 minutes",
    whenToStop: "Stop and call a licensed technician if the code reappears after two full restart attempts or if you detect heat, smoke, or water leakage.",
    updatedAt: "2026-02-20"
  };
}

const entries = [];

for (const brand of brands) {
  for (const appliance of brand.appliances) {
    for (const family of modelFamilies) {
      for (const [code, summary] of blueprint[appliance]) {
        entries.push(createEntry(brand, appliance, family, code, summary));
      }
    }
  }
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(entries, null, 2));

console.log(`Generated ${entries.length} error-code pages at data/error-codes.json`);
