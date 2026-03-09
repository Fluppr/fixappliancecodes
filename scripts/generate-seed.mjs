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
  { name: "Midea", slug: "midea", appliances: ["washer", "dishwasher", "ac", "refrigerator"] },
  // High US market share
  { name: "Amana", slug: "amana", appliances: ["washer", "dryer", "dishwasher", "refrigerator", "ac"] },
  { name: "Hotpoint", slug: "hotpoint", appliances: ["washer", "dryer", "dishwasher", "refrigerator", "oven"] },
  // Strong in specific appliance categories
  { name: "Miele", slug: "miele", appliances: ["washer", "dryer", "dishwasher", "refrigerator", "oven"] },
  { name: "Fisher & Paykel", slug: "fisher-paykel", appliances: ["washer", "dryer", "dishwasher", "refrigerator"] },
  { name: "Thermador", slug: "thermador", appliances: ["dishwasher", "refrigerator", "oven"] },
  // European brands
  { name: "AEG", slug: "aeg", appliances: ["washer", "dryer", "dishwasher", "refrigerator", "oven"] },
  { name: "Zanussi", slug: "zanussi", appliances: ["washer", "dryer", "dishwasher", "refrigerator", "oven"] },
  { name: "Beko", slug: "beko", appliances: ["washer", "dryer", "dishwasher", "refrigerator", "oven"] },
  { name: "Indesit", slug: "indesit", appliances: ["washer", "dryer", "dishwasher", "refrigerator", "oven"] },
  { name: "Smeg", slug: "smeg", appliances: ["dishwasher", "refrigerator", "oven"] }
];



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

// Per-brand, per-appliance notes — rendered as a highlighted callout on every code page.
// Provides genuine differentiation between e.g. samsung-washer-oe and lg-washer-oe.
const brandApplianceNotes = {
  samsung: {
    washer: "Samsung front-load pump filters (WF series) are behind a push-open panel at the lower-right of the front fascia; top-load models (WA series) have no user-accessible filter. The SmartThings app can read active error codes on Wi-Fi-enabled models and often clarifies which sub-component triggered the fault.",
    dryer: "The lint filter sits in the door opening on all Samsung DV series dryers. The exhaust duct exits at the lower-rear. Samsung's Vent Sensor actively measures airflow restriction throughout the cycle and directly generates D80/D90 readings when blockage reaches threshold.",
    dishwasher: "The Samsung filter is a two-part assembly under the lower spray arm: a fine cylindrical inner filter and a flat outer mesh screen — clean both together. Samsung's AutoRelease door opens a few centimetres automatically at cycle end; this is an intentional dry-assist feature, not a fault.",
    refrigerator: "On most Samsung French-door models, condenser coils are behind a grille at the lower-rear. Samsung ice makers in the freezer door (RF series) are a known reliability point; the ice maker assembly can be replaced as a complete unit without specialist tools. Family Hub display faults are separate from refrigeration faults.",
    ac: "Samsung Wind-Free models distribute air through micro-perforations rather than a traditional vane — airflow that seems weak with the vane closed is normal. The washable filter is behind the front panel: lift the bottom edge of the panel and slide the filter forward."
  },
  lg: {
    washer: "LG front-load pump filters (WM series) are behind a small rectangular cover at the lower-left of the front panel. Top-load LG washers (WT series) have no user-serviceable pump filter. The LG ThinQ Smart Diagnosis feature transmits fault data by holding a phone to the power button — use this before disassembling.",
    dryer: "The lint filter is at the top of the door opening on most LG DLE/DLGX models. LG's FlowSense sensor measures exhaust restriction and contributes to vent alerts. LG TurboSteam models have a water inlet valve; if a water-adjacent fault appears on a vented dryer, check whether the steam line is intact.",
    dishwasher: "The LG filter is a twist-out assembly under the lower spray arm — rotate anticlockwise to remove. QuadWash models use four spray arms; check all four for limescale blockages when diagnosing spray-related codes. TrueSteam condensation during the cycle is normal, not a leak.",
    refrigerator: "Most LG refrigerators use a Linear Compressor rated for 10 years. The compressor runs quieter than a conventional unit — brief silence during what should be a cooling cycle is itself a diagnostic signal. Condenser coils are behind the lower-rear panel.",
    ac: "LG Dual Inverter compressor models run continuously at variable speed rather than cycling on/off — sustained low-level operation is normal. The washable filter slides out from the top-rear of the indoor unit housing."
  },
  whirlpool: {
    washer: "Many Whirlpool top-load washers (Cabrio, Impeller-drum models) have no user-accessible pump filter; debris reaches the pump housing directly. Front-load Duet models have a coin-trap filter behind a lower-right service panel. The OE drain fault may also display as F9 E1 on Whirlpool-platform machines.",
    dryer: "The lint screen sits in the door opening. Whirlpool, Maytag, Amana, and many Kenmore dryers share the same platform — parts and diagnostic steps are interchangeable across these brands. The thermal fuse is mounted on the exhaust duct, accessible from inside the back panel.",
    dishwasher: "Most Whirlpool dishwashers use a self-cleaning filter grinder and require no manual filter cleaning. Drain issues therefore almost always point to the garbage disposal inlet, under-sink air gap, or drain-hose routing rather than the machine's own filter.",
    refrigerator: "Condenser coils on most Whirlpool models are underneath the unit, behind the front kick grille at floor level. French-door models route the defrost drain to a pan above the compressor; water pooling on the floor may indicate a blocked drain tube rather than a sealed-system failure."
  },
  ge: {
    washer: "GE top-load washers route drain blockages to a pump housing accessed by removing the rear panel. Front-load GE washers (GFWS series) have a coin-trap filter behind the lower kick panel. The tech sheet for most GE washers is taped inside the cabinet, visible after removing the top panel.",
    dryer: "The lint screen is in the door opening. The thermal fuse on GE dryers is mounted on the exhaust housing inside the rear panel. GE Profile and Café dryers have additional moisture-sensor bars in the drum that can be cleaned with rubbing alcohol when drying performance degrades.",
    dishwasher: "GE introduced a manual filter assembly around 2010; earlier models had a self-cleaning grinder. On manual-filter models, lift off the lower spray arm, then twist out the cylindrical filter and remove the flat mesh screen beneath it — clean both. Check the model year before disassembling.",
    refrigerator: "Most GE side-by-side and French-door models have condenser coils at the back; top-freezer models typically have coils underneath. The tech sheet is behind the bottom storage drawer. GE Profile and Café models support self-diagnostics from the control panel.",
    oven: "The RTD temperature probe on GE ovens mounts at the back wall of the cavity and unscrews from inside — no rear panel removal needed. Diagnostic mode on most GE ranges: hold Bake + Broil Hi simultaneously for 5 seconds. The tech sheet is inside the frame behind the storage drawer."
  },
  bosch: {
    washer: "Bosch front-load washers (WAx/WGx in Europe; 300/500/800 series in North America) have a two-part filter: a flat mesh pre-filter and a cylindrical coin-trap, both behind the lower-front service flap. The EcoSilence brushless motor runs quietly — lower vibration than typical is normal, not a fault.",
    dishwasher: "Bosch dishwashers have a three-stage filter: coarse screen, flat micro-filter, and cylindrical fine filter under the lower spray arm. Remove and clean all three together. Bosch drains actively using a pump — any standing water in the sump at mid-cycle is a blockage indicator, not normal residual water.",
    refrigerator: "Bosch refrigerators are predominantly counter-depth or integrated models requiring the unit to be slid forward on telescopic rails for condenser access. Most North American Bosch fridges have condenser coils at the rear. No built-in ice maker is included on most North American Bosch models.",
    oven: "Bosch displays temperatures in Celsius by default; verify the °C/°F setting before diagnosing apparent temperature errors. The temperature probe connects at the rear cavity wall. The PerfectRoast meat probe (sold separately on some models) is a different connector — do not confuse it with the RTD fault sensor."
  },
  frigidaire: {
    washer: "Frigidaire front-load washers share the Electrolux platform (Affinity, Gallery series). The pump filter is behind the lower-right removable kick panel. Parts and service documentation are shared with equivalent Electrolux washer models.",
    dryer: "Lint filter is in the door opening. The thermal fuse is on the exhaust housing inside the rear panel. Frigidaire and Electrolux dryers share the same platform — ELFE steam models have an additional water inlet that should be checked if water-adjacent faults appear on a vented dryer.",
    dishwasher: "Frigidaire dishwashers share the Electrolux platform. The filter is a twist-out two-piece assembly under the lower spray arm. OrbiClean spray arms rotate differently from standard arms — ensure both the main arm and the satellite arm rotate freely when diagnosing spray-performance codes.",
    refrigerator: "Most Frigidaire models have condenser coils underneath behind the front kick grille. Frigidaire Gallery and Professional series share the Electrolux platform. The water filter housing is behind the lower crisper on some models — a stuck filter housing can cause apparent ice or water faults.",
    oven: "The temperature probe mounts at the rear cavity wall. Frigidaire Ready-Select capacitive touch controls can lock up after surges — power-cycle before replacing the board. Gallery series models with QuickClean enamel are more susceptible to F7 latch-code faults if self-clean is used frequently."
  },
  maytag: {
    washer: "Maytag Bravos X and Centennial top-load washers have no user-accessible pump filter. Maytag Maxima front-loaders have a coin-trap filter behind the lower-right service panel. Maytag is Whirlpool-owned — parts and procedures are identical to the equivalent Whirlpool model.",
    dryer: "Same platform as Whirlpool. Lint filter in door opening; thermal fuse on the exhaust duct inside the back panel. Maytag Bravos MCT models use a direct-drive motor with no belt — a belt-break diagnosis does not apply to these units.",
    dishwasher: "Maytag dishwashers share the Whirlpool platform and mostly use a self-cleaning filter grinder. The PowerBlast cycle uses higher temperature and pressure; if it consistently triggers drain codes, check first for a partially blocked garbage disposal inlet."
  },
  kitchenaid: {
    dishwasher: "KitchenAid dishwashers share the Whirlpool platform. Most models have a manual filter assembly under the lower spray arm. Models with the ProScrub option have 40 additional spray nozzles on the lower rack; ensure the rotating satellite arm on the ProWash zone is also free of limescale blockages.",
    refrigerator: "KitchenAid refrigerators share the Whirlpool platform and are predominantly counter-depth or built-in. The ExtendFresh temperature management system uses a separate fresh-food section sensor — relevant when diagnosing sensor-range codes.",
    oven: "KitchenAid ovens use the Whirlpool Even-Heat True Convection system, which adds a third heating element at the rear wall. The temperature probe is at the rear cavity wall. KitchenAid commercial-style dual-fuel ranges have separate oven and broil igniter circuits."
  },
  kenmore: {
    washer: "Kenmore washers are manufactured by Whirlpool (model prefix 110.xxx) or LG (796.xxx) — identify the platform before ordering parts. 110.xxx Whirlpool-based: Duet front-loaders have a filter behind the lower-right panel; top-loaders have no user filter. 796.xxx LG-based: filter behind the lower-left front panel.",
    dryer: "Same platform identification as washers: 110.xxx = Whirlpool; 796.xxx = LG. Lint filter in the door opening on all models. Access the rear panel for the thermal fuse.",
    dishwasher: "Kenmore dishwashers are manufactured by Whirlpool (665.xxx) or Bosch (587.xxx) — confirm the platform from the model number before ordering parts or following service steps.",
    refrigerator: "Kenmore refrigerators are manufactured by Whirlpool (106.xxx), LG (795.xxx), or Frigidaire (253.xxx). LG 795.xxx: linear compressor, coils at lower rear. Whirlpool 106.xxx: coils under front grille."
  },
  electrolux: {
    washer: "Electrolux front-load washers have the pump filter behind the lower-right removable kick panel. The MaxFill water-level control system sets a higher drum fill level than most brands — this is normal. IQ-Touch and Wave-Touch control boards may show codes as both alphanumeric and icon formats.",
    dryer: "Electrolux offers both vented and condenser dryer models. Condenser models have a secondary lint filter in the lower plinth (pull the cover down to access) that must be cleaned every 5 cycles. Vented models have only the door-opening lint filter. Check the model label to determine which type you have.",
    dishwasher: "Electrolux and AEG dishwashers are the same internal product. The filter is a twist-out two-piece assembly. The condensation-dry system leaves dishes slightly warm-damp at cycle end — this is normal, not a heater fault.",
    refrigerator: "Most Electrolux refrigerators have condenser coils behind the lower front kick grille. IQ-Touch and Wave-Touch displays may show fault codes in a slightly different format — cross-reference with the model-specific service sheet if a code is not on this page.",
    oven: "The temperature probe is at the rear cavity wall. Electrolux Perfect Turkey and Perfect Bake auto-cook programmes use a separate wired meat probe — do not confuse the RTD and the meat-probe connectors when diagnosing probe faults."
  },
  haier: {
    washer: "Haier front-load washers have the pump filter behind a lower-front access flap. Haier owns GE Appliances (since 2016) — GE-branded machines made after 2016 are Haier-manufactured and share the same platform for many models.",
    dryer: "The lint filter is in the door opening. Haier dryers are sold under the GE label in North America on some model lines.",
    refrigerator: "Haier refrigerators commonly use a bottom-mount freezer layout. Condenser coils are at the rear. Haier owns Fisher & Paykel and GE Appliances — service documentation for overlap models may be cross-branded."
  },
  midea: {
    washer: "Midea front-load washers have the pump filter behind the lower-right or lower-front service cover. Midea is one of the largest OEM washer manufacturers globally — several budget brands you may not recognise are built on the Midea platform.",
    dishwasher: "Midea dishwashers have the filter under the lower spray arm, twist-out removal. Midea is a major OEM dishwasher manufacturer whose platform underlies several other brands sold in North America and Europe.",
    refrigerator: "Midea refrigerators have condenser coils at the rear. Midea also manufactures refrigerators under U-Line and other premium brand names.",
    ac: "Midea manufactures the distinctive U-shaped window AC design that installs with a window sash closed against it. The filter is behind the front panel grille on all Midea residential AC units."
  },
  amana: {
    washer: "Amana is a Whirlpool-owned brand. All Amana washers share the Whirlpool platform — use Whirlpool service documentation. Top-load Amana washers have no user-accessible pump filter.",
    dryer: "Amana dryers share the Whirlpool platform, including the same thermal fuse location and lint-filter position in the door opening.",
    dishwasher: "Amana dishwashers share the Whirlpool platform. Most models use a self-cleaning filter grinder and do not require manual filter cleaning.",
    refrigerator: "Amana refrigerators share the Whirlpool platform. The straightforward top-freezer layout is most common; condenser coils are under the front grille.",
    ac: "Amana PTAC (packaged terminal) units are a separate commercial product line. For residential Amana window or portable ACs, the washable filter is behind the front grille — remove by pulling down the grille."
  },
  hotpoint: {
    washer: "Hotpoint is a GE-owned brand in North America. Hotpoint washers share the GE platform — service procedures and parts are identical to the equivalent GE model.",
    dryer: "Hotpoint dryers share the GE platform. Lint filter in the door opening; thermal fuse at the back of the exhaust housing inside the rear panel.",
    dishwasher: "Hotpoint dishwashers share the GE platform. Filter access and cleaning procedures are the same as GE dishwashers.",
    refrigerator: "Hotpoint refrigerators share the GE platform. Hotpoint is the budget-tier version of an equivalent GE model — internal components are the same.",
    oven: "Hotpoint ovens share the GE platform. Temperature probe at the rear cavity wall. Diagnostic mode access is the same as GE (hold Bake + Broil Hi for 5 seconds)."
  },
  miele: {
    washer: "Miele washers have a fine lint filter and a separate drain pump cover, accessed via the lower-front service flap. Miele's EcoTechnology motor is rated for 20 years — repeated faults on a relatively new Miele warrant professional attention rather than DIY. Miele recommends UltraPhase 1+2 liquid detergents; powder tablets can reduce filter life.",
    dryer: "Miele heat-pump and condenser dryers do not vent externally; condensate drains to a collection tank or a direct-drain connection. The door-opening lint filter is the primary filter, but there is a secondary condenser fluff filter in the lower plinth that must be cleaned monthly. A full condensate tank will pause the cycle without an explicit error.",
    dishwasher: "Miele dishwashers use a three-stage filter system — clean all three parts together every 4–6 weeks. Miele strongly recommends Miele UltraTabs; generic tablets can leave a residue on sensors that triggers false spray-performance codes.",
    refrigerator: "Miele refrigerators are predominantly built-in integrated designs. Access for condenser cleaning requires sliding the unit forward on its integrated telescopic runners — do not pull by the door handle. Miele's DynaCool circulation system maintains even temperature without a visible fan.",
    oven: "Miele ovens hide the bake element beneath a removable oven floor — lift the floor out for cleaning. The RTD temperature probe is at the rear cavity wall. The MasterChef automatic programmes use a separate wired meat probe (sold as an accessory) — do not confuse this probe connector with the RTD fault sensor."
  },
  "fisher-paykel": {
    washer: "Fisher & Paykel SmartDrive top-load washers use a direct-drive brushless motor with no belt or transmission. There is no user-accessible pump filter; access the pump from the front after removing the outer cabinet. Fisher & Paykel is owned by Haier Group.",
    dryer: "Fisher & Paykel dryers use an auto-sensing moisture system. The lint filter is in the door opening. The brand is owned by Haier Group — some service documentation is cross-referenced between brands.",
    dishwasher: "Fisher & Paykel's DishDrawer is a single- or double-drawer dishwasher unique in the market. Each drawer operates independently with its own filter, spray arm, water inlet, and drain pump. When diagnosing, treat each drawer as a completely separate appliance.",
    refrigerator: "Fisher & Paykel refrigerators use ActiveSmart technology, which adjusts cooling based on usage patterns and ambient temperature. Variable compressor run times are normal and are not indicative of a fault unless accompanied by a temperature warning code."
  },
  thermador: {
    dishwasher: "Thermador is owned by the Bosch Group and shares the Bosch dishwasher platform. The three-stage filter system is identical to Bosch. Thermador dishwashers are typically flush-installed in cabinetry — pull forward carefully on the levelling feet to access drain and inlet connections.",
    refrigerator: "Thermador refrigerators are professional-grade built-in column designs. The condenser is behind the hinged front grille at the bottom of the unit. Professional service is recommended for all sealed-system faults on Thermador due to the complexity of cabinetry integration.",
    oven: "Thermador professional ranges use Star Burners on gas models and an ExtraLow simmer feature. The oven temperature probe is at the rear cavity wall. Thermador wall ovens have a Soft Close door mechanism; if the oven door does not latch cleanly for self-clean, check whether the closer mechanism has disengaged."
  },
  aeg: {
    washer: "AEG is owned by Electrolux and shares the same platform. The pump filter is behind the lower-right service panel. AEG's ÖKOMix technology pre-mixes detergent with water before the main cycle — the brief agitation before fill begins is a designed pre-wash, not a fault.",
    dryer: "AEG heat-pump dryers have two lint filters: the primary in the door opening and a secondary condenser filter in the lower plinth (pull the plinth cover down to access). Clean the secondary filter every 5 cycles. Vented AEG dryers have only the door-opening filter.",
    dishwasher: "AEG and Electrolux dishwashers are the same internal product. The filter is a twist-out two-piece assembly under the lower spray arm. AEG's ComfortLift lower basket raises for easier loading — ensure the lift is fully lowered before running a cycle.",
    refrigerator: "AEG refrigerators are predominantly built-in integrated models sold in the EU. NoFrost technology prevents freezer frost buildup; visible frost in a NoFrost model is a confirmed defrost-system fault, not a normal condition.",
    oven: "AEG ovens include Pyrolytic self-cleaning (reaching 480°C/900°F). Do not attempt to override the electronic door lock during pyrolysis. SteamBake models have a front-left water reservoir — empty it before running a pyrolysis cycle to prevent steam-system fault codes."
  },
  zanussi: {
    washer: "Zanussi is Electrolux-owned. The pump filter is behind a lower-front circular coin-trap cover. Zanussi is a budget-tier version of the Electrolux platform — parts and diagnostics are shared with equivalent Electrolux and AEG models.",
    dryer: "Zanussi condenser dryers have a primary lint filter in the door opening and a secondary condenser filter in the lower plinth. Clean the plinth filter monthly. Vented models have only the door filter.",
    dishwasher: "Zanussi dishwashers are Electrolux-platform. The filter is in the centre of the tub floor, twist-out removal.",
    refrigerator: "Zanussi refrigerators are Electrolux-platform. Most are basic freestanding models sold in the EU market. Condenser coils at the rear.",
    oven: "Zanussi ovens share the Electrolux platform. Standard temperature probe at the rear cavity wall. Catalytic self-cleaning liners (on models without Pyrolytic) should be wiped at 220°C — do not use oven cleaners on catalytic panels."
  },
  beko: {
    washer: "Beko front-load washers have a coin-trap filter behind a circular cover at the lower-front of the machine. Beko is part of the Turkish Arçelik Group. SteamCure models have a steam inlet — if a water-adjacent fault appears, check the steam supply line as well as the main inlet.",
    dryer: "Beko heat-pump and condenser dryers have a primary door-opening lint filter and a secondary condenser filter in the lower plinth. Clean both every 5 cycles. Vented Beko dryers have only the door filter.",
    dishwasher: "Beko dishwashers have the filter in the centre of the tub floor — twist anticlockwise to remove. Beko's AquaIntense option raises wash pressure; E4/spray-performance codes on models with AquaIntense often point to a partially clogged inlet filter rather than a blocked spray arm.",
    refrigerator: "Beko refrigerators have condenser coils at the rear. HarvestFresh models cycle internal LED lighting between light spectra to extend fresh food life — changing light colours inside the fridge are a designed feature, not a fault.",
    oven: "Beko ovens have a standard temperature probe at the rear cavity wall. SteamRoast models have a front water tank — empty before cleaning. Beko AeroPerfect fan-assisted models circulate air with a rear-wall fan; fan noise during cooking is normal."
  },
  indesit: {
    washer: "Indesit has been owned by Whirlpool since 2014. The pump filter is behind a lower-front coin-trap cover. In the UK and EU, Indesit service documentation overlaps with Hotpoint EU models — both are Whirlpool-owned brands on the same platform.",
    dryer: "Indesit dryers have the lint filter in the door opening. Indesit condenser dryers have a secondary plinth filter. Vented models have only the door filter.",
    dishwasher: "Indesit dishwashers share the Whirlpool EU platform — parts and service documentation are shared with Hotpoint EU models. The filter is in the centre of the tub floor.",
    refrigerator: "Indesit refrigerators have condenser coils at the rear. Indesit offers a wide range of budget freestanding top-freezer and fridge-only models across the UK and EU.",
    oven: "Indesit ovens are budget-tier freestanding models. Standard temperature probe at the rear cavity wall. Most Indesit ovens use catalytic self-cleaning panels rather than pyrolytic — do not use spray oven cleaners on the catalytic panels."
  },
  smeg: {
    dishwasher: "Smeg dishwashers have a stainless-steel tub interior. The filter is in the centre of the tub floor, twist-out. The retro colour finishes (Cream, Pastel Blue, Pink, etc.) are cosmetic — the internal components are identical across all SMEG dishwasher colours and finishes.",
    refrigerator: "Smeg retro refrigerators have condenser coils at the back of the unit. The compressor compartment is at the lower rear. The 50s Retro Style and Victoria ranges use standard refrigeration components underneath the distinctive styling — diagnosis proceeds the same as any rear-condenser fridge.",
    oven: "Smeg ovens have a temperature probe at the rear cavity wall. The Portofino and Victoria ranges are dual-fuel (gas hob, electric oven). Smeg's rapid pre-heat mode activates multiple elements simultaneously — a louder-than-expected preheat phase is a normal behaviour of this feature."
  }
};

// Per-code content: keyed by appliance then code.
// Each entry provides causes, steps, symptom, tools, estimatedFixTime, whenToStop, preventiveTips.
const codeContent = {
  washer: {
    OE: {
      symptom: "Washer fills but water does not drain within the expected time; cycle halts mid-wash.",
      causes: ["Clogged pump filter (most common — check this first)", "Kinked or pinched drain hose behind the machine", "Drain hose end inserted too far into standpipe, creating an airtight seal", "Blocked household drain or standpipe"],
      steps: ["Cancel the cycle, unplug the machine, and place towels on the floor.", "Locate and open the coin filter/pump filter access panel (usually front lower-right).", "Slowly unscrew the filter cap and drain water into a shallow container.", "Inspect and clear any lint, coins, or debris from the filter and filter housing.", "Check the drain hose at the back — straighten any kinks and ensure it is not inserted more than 6 inches into the standpipe.", "Reconnect and run a short spin/drain cycle to confirm water clears."],
      tools: ["Shallow tray or towels", "Pliers (to loosen filter cap if stiff)", "Small brush"],
      estimatedFixTime: "10–20 minutes",
      whenToStop: "Stop and call a technician if the pump hums but no water moves after clearing the filter — the pump impeller may be jammed or the pump motor has failed.",
      preventiveTips: ["Clean the pump filter every 1–2 months.", "Never insert the drain hose more than 6 inches into the standpipe.", "Check pockets before loading — coins and hair clips are the leading cause."]
    },
    IE: {
      symptom: "Washer does not fill to the required level within the allotted time; cycle pauses at the start.",
      causes: ["Shut-off valve behind the machine partially or fully closed", "Kinked water inlet hose", "Clogged inlet filter screens at the back of the machine", "Low household water pressure (below 0.5 bar / 7 psi)"],
      steps: ["Check that both hot and cold shut-off valves are fully open.", "Inspect the inlet hoses for kinks.", "Turn off the water, disconnect the hoses at the back of the machine, and pull out the small mesh filter screens with needle-nose pliers.", "Rinse the screens under running water and reinstall.", "Reconnect hoses, restore water, and run a quick cycle."],
      tools: ["Needle-nose pliers", "Small brush", "Bucket"],
      estimatedFixTime: "10–15 minutes",
      whenToStop: "Call a technician if pressure and filters are fine but the machine still won't fill — the inlet solenoid valve may need replacement.",
      preventiveTips: ["Leave shut-off valves fully open when the machine is in use.", "Replace inlet hoses every 5 years — older rubber hoses can collapse internally.", "Fit braided steel hoses to reduce kink risk."]
    },
    UE: {
      symptom: "Washer drum stops spinning or spins only slowly; machine may thump or rock.",
      causes: ["Load is unevenly distributed — all heavy items on one side", "Single bulky item (duvet, rug) acting as a single unbalanced mass", "Machine not level on the floor", "Worn suspension rods or shock absorbers (recurring issue)"],
      steps: ["Open the door and redistribute items evenly around the drum.", "For a single bulky item, add two or three towels to balance the load.", "Close the door and restart the spin cycle.", "If the problem recurs, check that all four levelling feet touch the floor firmly and adjust as needed."],
      tools: ["Spirit level", "Spanner (to adjust levelling feet)"],
      estimatedFixTime: "5 minutes",
      whenToStop: "Call a technician if the drum shakes violently on every cycle regardless of load — suspension components may need replacement.",
      preventiveTips: ["Mix large and small items in each load.", "Wash single heavy items with a balancing item.", "Check floor levelness when moving the machine."]
    },
    LE: {
      symptom: "Washer drum stops mid-cycle; motor protection activates; no spin.",
      causes: ["Severely overloaded drum stalling the motor", "Foreign object jamming the drum or spider arm", "Worn or seized motor brushes (on brushed motors)", "Drive belt slipped off or broken"],
      steps: ["Stop the cycle and remove half the load.", "Check inside the drum for any object caught between the drum and the tub seal.", "Restart with the reduced load.", "If the code recurs with a normal-sized load, the issue is mechanical and requires disassembly."],
      tools: ["Flashlight"],
      estimatedFixTime: "5–10 minutes (load adjustment); 60+ minutes if mechanical",
      whenToStop: "Stop immediately if you smell burning. A seized motor or snapped belt requires a technician.",
      preventiveTips: ["Do not exceed the rated load capacity.", "Check the drum for loose items before starting.", "Service the machine if it becomes increasingly loud during spin."]
    },
    DE: {
      symptom: "Washer will not start or interrupts a cycle because the door-latch signal is absent.",
      causes: ["Door not closed firmly enough to engage the latch", "Object caught in the door seal preventing full closure", "Worn or broken door latch/catch", "Door lock wiring harness loose"],
      steps: ["Open the door and check the rubber seal for small items of clothing caught in it.", "Close the door firmly — listen for a click.", "Inspect the latch hook and catch for visible damage.", "If the door closes but the error persists, the door lock module may need replacement."],
      tools: ["Flashlight", "Screwdriver set (if replacing lock)"],
      estimatedFixTime: "5 minutes (seal/close check); 30 minutes (lock replacement)",
      whenToStop: "Call a technician if the lock clicks but the machine still shows the error — the lock module's internal microswitch has likely failed.",
      preventiveTips: ["Check the door seal for small items after each load.", "Do not overstuff the drum, which puts pressure on the door seal."]
    },
    E1: {
      symptom: "Washer halts during fill or mid-cycle; water level pressure sensor is reading outside expected range.",
      causes: ["Pressure sensor hose kinked, disconnected, or split", "Small amount of water or debris in the pressure sensor port", "Faulty pressure sensor"],
      steps: ["Unplug the machine.", "Locate the pressure sensor (usually a small round component connected by a thin clear hose, near the top of the machine).", "Check that the hose is connected at both ends and has no kinks or cracks.", "Blow gently through the hose to clear any water.", "Reconnect, power on, and run a test cycle."],
      tools: ["Screwdriver set", "Flashlight"],
      estimatedFixTime: "20–30 minutes",
      whenToStop: "Replace the pressure sensor if the hose is intact but the error recurs across multiple cycles.",
      preventiveTips: ["Use the correct HE detergent dose — excess suds can force water into the pressure hose.", "Descale the machine every 3–6 months to keep sensors clear."]
    },
    E2: {
      symptom: "Water temperature does not reach the set value; wash halts or runs cold.",
      causes: ["NTC temperature sensor reading outside calibrated range", "Heater element failed (machine can't raise temperature)", "Sensor wiring harness loose"],
      steps: ["Run a cold wash cycle — if it completes normally, the issue is heating-specific.", "Check for a tripped thermal protector on the heater element.", "Test NTC resistance with a multimeter if you have one (typically 10–50 kΩ at room temperature depending on brand)."],
      tools: ["Multimeter", "Screwdriver set"],
      estimatedFixTime: "30–45 minutes",
      whenToStop: "Replace the NTC sensor or heater element if testing confirms the fault. Heater replacement is a moderate DIY task — call a technician if unsure.",
      preventiveTips: ["Descale regularly to protect the heater element.", "Use appropriate wash temperatures to reduce element cycling."]
    },
    E3: {
      symptom: "Cycle pauses and an over-sudsing warning displays; drum rotates slowly to dissipate foam.",
      causes: ["Too much detergent used", "Non-HE detergent used in a high-efficiency machine", "Detergent residue buildup in the drawer or drum"],
      steps: ["Do not add more detergent.", "Select a rinse-and-spin cycle to clear the suds.", "Clean the detergent drawer thoroughly.", "Run a hot maintenance cycle with no detergent."],
      tools: ["None"],
      estimatedFixTime: "10 minutes",
      whenToStop: "No technician needed — this is a user-correction issue.",
      preventiveTips: ["Use HE-rated detergent only.", "Use the recommended dose (half is often sufficient).", "Clean the drum and drawer monthly."]
    },
    F5: {
      symptom: "Washer stops mid-cycle; control board reports a communication fault with a secondary module.",
      causes: ["Loose wiring harness connector between the main board and motor/sensor board", "Power-state corruption from a surge or abrupt power cut", "Control board failure"],
      steps: ["Unplug for 5 minutes then restart — clears transient faults in most cases.", "If recurring, unplug, open the top/back panel, and reseat all harness connectors.", "Check for any visible burn marks on the control board."],
      tools: ["Screwdriver set"],
      estimatedFixTime: "5 minutes (power cycle); 30 minutes (harness check)",
      whenToStop: "Call a technician if the error appears on power-on with no cycle running — the control board may require replacement.",
      preventiveTips: ["Use a surge-protected power strip.", "Avoid cutting power mid-cycle."]
    },
    F9: {
      symptom: "Drain cycle exceeds expected duration; machine judges drain performance inadequate.",
      causes: ["Partially blocked pump filter reducing flow", "Drain hose routed too high, increasing back-pressure", "Pump impeller starting to wear"],
      steps: ["Clean the pump filter (see OE steps above).", "Ensure the drain hose peak is no higher than 100 cm from the floor.", "Run a drain-only cycle and listen for the pump — a healthy pump sounds steady, a worn one may pulse or whine."],
      tools: ["Shallow tray", "Small brush"],
      estimatedFixTime: "10–20 minutes",
      whenToStop: "If drain performance is slow even after clearing the filter, the pump is wearing and should be replaced before it fails completely.",
      preventiveTips: ["Clean the filter monthly.", "Do not route the drain hose higher than specified in the installation manual."]
    },
    H2: {
      symptom: "Wash water does not reach target temperature in the allotted time; heater response is delayed.",
      causes: ["Heavy limescale coating on the heater element reducing efficiency", "NTC sensor reading slightly out of calibration", "Low incoming water temperature in winter"],
      steps: ["Run a hot maintenance cycle with a descaling agent or citric acid.", "If the error persists after descaling, test the heater element continuity.", "In very cold climates, check whether the inlet water temperature is affecting fill."],
      tools: ["Multimeter", "Descaling agent"],
      estimatedFixTime: "90 minutes (descale cycle)",
      whenToStop: "Replace the heater element if it shows no continuity.",
      preventiveTips: ["Descale every 3–6 months in hard-water areas.", "Run a periodic hot cycle (60°C or higher) to limit limescale buildup."]
    },
    C1: {
      symptom: "Cycle was interrupted by an internal safety check; machine locked out.",
      causes: ["Motor temperature protection tripped", "Control board detected an unexpected sensor combination", "Power interruption during a sensitive part of the cycle"],
      steps: ["Unplug the machine for 10 minutes to allow full reset.", "Restart with a small test load.", "Check that inlet, drain, and door are all normal before retrying."],
      tools: ["None"],
      estimatedFixTime: "10 minutes",
      whenToStop: "Call a technician if the lockout recurs across multiple cycle attempts — a sensor or control board fault is preventing normal operation.",
      preventiveTips: ["Do not interrupt cycles by cutting power at the wall mid-programme.", "Use a surge protector."]
    }
  },
  dryer: {
    D80: {
      symptom: "Dryer runs but clothes remain damp; airflow sensor detects restriction at approximately 80% blockage.",
      causes: ["Lint trap full and not cleaned between cycles", "Vent duct partially blocked by lint accumulation", "Vent duct kinked, crushed, or too long", "Bird nest or external debris blocking the exterior vent cap"],
      steps: ["Clean the lint trap completely — even a thin film of dryer-sheet residue reduces airflow significantly.", "Disconnect the duct at the back of the dryer and vacuum it out from both ends.", "Check the exterior vent cap and clear any obstruction.", "Ensure the duct run is as short and straight as possible — each 90° bend is equivalent to adding several feet of length."],
      tools: ["Vacuum with narrow attachment", "Dryer vent brush kit"],
      estimatedFixTime: "20–40 minutes",
      whenToStop: "Call a professional duct-cleaning service if the duct is very long, built into the wall, or shows damage.",
      preventiveTips: ["Clean the lint trap before every load.", "Clean the vent duct at least once a year.", "Use rigid or semi-rigid metal duct, never plastic flex duct."]
    },
    D90: {
      symptom: "Dryer shuts off early or runs very hot; airflow sensor detects near-complete blockage.",
      causes: ["Severe lint buildup in the duct — same root cause as D80 but more advanced", "Exterior vent cap flap stuck closed"],
      steps: ["Treat as D80 but with urgency — a D90 is a fire risk if unaddressed.", "Disconnect and fully clean the duct before running the dryer again.", "Verify the exterior flap opens freely during operation."],
      tools: ["Vacuum with narrow attachment", "Dryer vent brush kit"],
      estimatedFixTime: "20–40 minutes",
      whenToStop: "Do not continue using the dryer while the D90 is active. If you find scorching on the duct or lint trap housing, have it professionally inspected.",
      preventiveTips: ["Same as D80. A D90 after a D80 was ignored is a warning sign."]
    },
    E1: {
      symptom: "Dryer stops heating or shuts off; thermistor value is outside the expected range.",
      causes: ["Thermistor (temperature sensor) has failed open or short", "Thermistor wiring connector loose", "Thermal fuse blown due to a prior overheating event"],
      steps: ["Unplug the dryer.", "Locate the thermistor — usually on the exhaust duct inside the back panel.", "Test resistance with a multimeter: a typical thermistor reads around 10–50 kΩ at room temperature.", "Inspect the thermal fuse (one-shot fuse on the exhaust housing) — it reads 0 Ω if good, open if blown.", "Replace whichever component tests faulty."],
      tools: ["Multimeter", "Screwdriver set"],
      estimatedFixTime: "30–45 minutes",
      whenToStop: "If the thermal fuse is blown, also find and fix the root cause (restricted airflow, failed cycling thermostat) before replacing it — it will blow again otherwise.",
      preventiveTips: ["Keep the exhaust duct clear.", "Replace the thermal fuse and thermistor together if either has failed — they are inexpensive."]
    },
    E2: {
      symptom: "Temperature reading stays at maximum, minimum, or is erratic during the cycle.",
      causes: ["Thermistor short circuit", "Wiring harness to thermistor damaged"],
      steps: ["Same diagnostic steps as E1 but focus on short circuit — look for a very low resistance value (close to 0) rather than open.", "Inspect wiring for any pinched or burnt insulation."],
      tools: ["Multimeter", "Screwdriver set"],
      estimatedFixTime: "30–45 minutes",
      whenToStop: "Replace the thermistor; if wiring is damaged, a technician should repair the harness.",
      preventiveTips: ["Route replacement thermistor wiring away from heat sources."]
    },
    F1: {
      symptom: "Dryer stops and will not restart; control board has flagged a relay fault.",
      causes: ["Power surge damaged a control relay", "Loose connector on the relay board", "Control board failure"],
      steps: ["Unplug for 5 minutes and retry.", "If recurring, reseat harness connectors on the control board.", "Inspect the board for burn marks."],
      tools: ["Screwdriver set"],
      estimatedFixTime: "5 minutes (reset); 30+ minutes (board inspection)",
      whenToStop: "Replace the control board if the fault persists and harness connections are secure.",
      preventiveTips: ["Use a surge protector on the dryer outlet."]
    },
    F3: {
      symptom: "Dryer runs but produces no heat, or the heating element shuts off before clothes are dry.",
      causes: ["Heating element failed (most common on electric dryers)", "High-limit thermostat tripped", "Thermal fuse blown", "Restricted airflow caused an overheat that tripped a safety device"],
      steps: ["Check the vent duct first — a F3 caused by restricted airflow will recur if the duct is not cleared.", "Test the heating element for continuity — a broken element reads open.", "Test the high-limit thermostat and thermal fuse.", "Replace whichever component is open."],
      tools: ["Multimeter", "Screwdriver set"],
      estimatedFixTime: "30–60 minutes",
      whenToStop: "Gas dryer with no heat: call a technician — gas valve and igniter diagnosis is not a safe DIY task for most people.",
      preventiveTips: ["Keep the vent duct clear to prevent overheat conditions that blow fuses."]
    },
    PF: {
      symptom: "Dryer stopped mid-cycle; control board detected a power interruption.",
      causes: ["Utility power cut", "Tripped circuit breaker (electric dryers need a double-pole breaker)", "Loose connection at the outlet or terminal block"],
      steps: ["Check the circuit breaker — reset if tripped.", "For a 240V electric dryer, the breaker has two handles; if only one tripped, reset both.", "Resume the interrupted cycle.", "If breakers trip repeatedly, have an electrician inspect the outlet and wiring."],
      tools: ["None"],
      estimatedFixTime: "2 minutes",
      whenToStop: "Call an electrician if the breaker trips again during the same cycle.",
      preventiveTips: ["Have the dryer outlet and wiring inspected every few years.", "Do not run the dryer on an extension cord."]
    },
    tE: {
      symptom: "Temperature reading is absent or locked at an extreme value from the start of the cycle.",
      causes: ["Thermistor completely failed before the cycle runs", "Wiring to the thermistor open"],
      steps: ["Same as E1 — test thermistor at room temperature before any cycle."],
      tools: ["Multimeter", "Screwdriver set"],
      estimatedFixTime: "30–45 minutes",
      whenToStop: "Replace the thermistor; do not run the dryer without a working temperature sensor.",
      preventiveTips: ["Inspect thermistor leads annually for brittleness caused by heat exposure."]
    },
    nP: {
      symptom: "Dryer does not power on or displays a no-power warning immediately.",
      causes: ["Plug not fully seated in outlet", "Tripped circuit breaker", "Faulty outlet"],
      steps: ["Check the plug is fully inserted.", "Reset the circuit breaker.", "Test the outlet with another appliance or a multimeter."],
      tools: ["Multimeter"],
      estimatedFixTime: "5 minutes",
      whenToStop: "Call an electrician if the outlet is dead or the breaker trips again immediately.",
      preventiveTips: ["Use a properly rated 240V outlet for electric dryers."]
    },
    L2: {
      symptom: "Dryer runs on low heat or not at all; one leg of the 240V supply is missing.",
      causes: ["One pole of the double-pole circuit breaker tripped without the other", "Loose wire at the terminal block or breaker"],
      steps: ["Reset both poles of the double-pole breaker.", "If heat still fails, have an electrician check the terminal block wiring."],
      tools: ["None (breaker reset); multimeter (if testing voltage)"],
      estimatedFixTime: "5 minutes (reset)",
      whenToStop: "Call an electrician for all 240V wiring work beyond a breaker reset.",
      preventiveTips: ["Have dryer wiring inspected if you experience repeated L2 codes without a clear power event."]
    },
    C9: {
      symptom: "Dryer will not start; door switch state is inconsistent with door position.",
      causes: ["Door not fully closed", "Broken door latch hook", "Failed door switch"],
      steps: ["Close the door firmly.", "Inspect the latch hook and door switch plunger for damage.", "Test the door switch continuity with a multimeter."],
      tools: ["Multimeter", "Screwdriver set"],
      estimatedFixTime: "5 minutes (close check); 20 minutes (switch replacement)",
      whenToStop: "Replace the door switch if it shows no continuity when pressed.",
      preventiveTips: ["Do not slam the dryer door — it damages the latch over time."]
    },
    H1: {
      symptom: "Dryer shuts off; overheat protection has activated.",
      causes: ["Restricted exhaust airflow causing heat buildup", "Cycling thermostat failed in the closed position", "High-limit thermostat holding open"],
      steps: ["Clear the vent duct completely (see D80 steps).", "Test the cycling thermostat — it should open and close as temperature changes.", "If the dryer overheats even with a clear duct, the cycling thermostat has failed and needs replacement."],
      tools: ["Multimeter", "Screwdriver set"],
      estimatedFixTime: "30–60 minutes",
      whenToStop: "If any component shows signs of heat damage or scorching, call a technician before running the dryer again.",
      preventiveTips: ["Clean the vent duct annually.", "Replace the cycling thermostat if the dryer regularly runs very hot."]
    }
  },
  dishwasher: {
    E15: {
      symptom: "Dishwasher will not start or stops mid-cycle; base tray leak-protection float is raised.",
      causes: ["Water has entered the base tray from a leaking internal hose, pump seal, or door seal", "Spray arm hose connection leaking inside the machine", "Tub-to-pump seal deteriorated"],
      steps: ["Tilt the dishwasher forward 45° on old towels to drain the base tray — this resets the float and allows the machine to try to pump out.", "Run a short drain cycle.", "After draining, inspect under and inside for the leak source before running a full wash.", "Common locations: door seal, circulation pump seal, and the hose from the pump to the spray arm."],
      tools: ["Towels", "Flashlight", "Screwdriver set"],
      estimatedFixTime: "15–30 minutes (drain and inspect)",
      whenToStop: "If the tray fills again on the next cycle, the leak source must be found and repaired before further use.",
      preventiveTips: ["Inspect the door seal annually for cracks.", "Check under the dishwasher periodically for drip marks."]
    },
    E22: {
      symptom: "Wash cycle performance is poor or the machine stops; filter or drain is obstructed.",
      causes: ["Main filter assembly clogged with food debris", "Drain pump housing has a hard object (seed, glass fragment) inside", "Drain hose kinked"],
      steps: ["Remove the lower basket and spray arm.", "Twist out the filter assembly and rinse under running water; scrub with a soft brush.", "Inspect the sump area below the filter for foreign objects.", "Reinstall the filter firmly and run a short cycle."],
      tools: ["Soft brush", "Needle-nose pliers (for debris in sump)"],
      estimatedFixTime: "10–15 minutes",
      whenToStop: "Call a technician if the pump impeller is visibly damaged or the bearing sounds rough after clearing.",
      preventiveTips: ["Clean the filter once a month.", "Pre-scrape plates before loading — the filter is not a food processor."]
    },
    E24: {
      symptom: "Dishwasher does not drain or drains very slowly; drain restriction detected.",
      causes: ["Filter clogged (check first)", "Drain hose kinked or pressed against the cabinet wall", "Household drain or garbage disposal inlet blocked", "Drain pump impeller jammed"],
      steps: ["Clean the filter (see E22 steps).", "Pull the machine out slightly and straighten the drain hose.", "Check the high-loop or air gap if fitted.", "If connected to a garbage disposal, confirm the knockout plug was removed at installation.", "Run a drain cycle to test."],
      tools: ["Towels", "Flashlight"],
      estimatedFixTime: "10–20 minutes",
      whenToStop: "If all mechanical checks pass and the machine still won't drain, the pump motor needs testing.",
      preventiveTips: ["Mount the drain hose in a high-loop to prevent backflow.", "Clean the drain hose every 6–12 months."]
    },
    E25: {
      symptom: "Drain cycle does not complete; pump obstruction detected.",
      causes: ["Hard object (cherry pit, broken glass, toothpick) jammed in the drain pump impeller", "Pump impeller broken"],
      steps: ["Remove the filter assembly and spray arm.", "Reach down into the sump and feel for the pump impeller — try to turn it by hand.", "Use needle-nose pliers to remove any obstruction.", "If the impeller spins freely after clearing, run a drain cycle to confirm."],
      tools: ["Needle-nose pliers", "Flashlight", "Rubber gloves"],
      estimatedFixTime: "15–20 minutes",
      whenToStop: "If the impeller is broken or the pump motor hums without spinning, the pump assembly needs replacement.",
      preventiveTips: ["Do not wash items with small loose parts (toothpicks, olive pits) in the dishwasher.", "Clean the filter monthly to prevent debris reaching the pump."]
    },
    IE: {
      symptom: "Dishwasher does not fill with water within the timeout period.",
      causes: ["Water supply valve (under the sink) closed or partially closed", "Inlet hose kinked", "Inlet mesh filter on the machine clogged with sediment"],
      steps: ["Verify the shut-off valve is fully open.", "Inspect the inlet hose for kinks.", "Shut off water, disconnect the inlet hose at the machine, and pull the small mesh filter out with pliers — rinse and reinstall.", "Restore water and run a rinse cycle."],
      tools: ["Pliers", "Small brush", "Bucket"],
      estimatedFixTime: "10–15 minutes",
      whenToStop: "Replace the inlet solenoid valve if the supply and filter are confirmed good but the machine still won't fill.",
      preventiveTips: ["Replace the inlet hose every 5 years.", "Fit a metal-reinforced hose to reduce kink risk."]
    },
    LE: {
      symptom: "Water is detected under the machine or inside the base; leak sensor has triggered.",
      causes: ["Door seal worn or cracked", "Spray arm hitting a tall item and directing water upward onto the door", "Circulation pump seal leaking", "Inlet valve dripping when closed"],
      steps: ["Check the door seal for visible cracks or displaced sections.", "Check that no items in the upper basket are above the top of the door opening.", "Run a cycle and use a flashlight to observe underneath during operation.", "Identify the leak source before running again."],
      tools: ["Flashlight", "Towels"],
      estimatedFixTime: "15–30 minutes (diagnosis)",
      whenToStop: "Stop using the dishwasher until the leak source is confirmed and repaired.",
      preventiveTips: ["Inspect the door seal annually.", "Do not overload the top rack with items taller than the top of the tub."]
    },
    F2: {
      symptom: "Dishwasher halts fill cycle; water level sensor has detected an overflow condition.",
      causes: ["Inlet valve failing to close fully — machine slowly overfills", "Water level sensor (pressure switch) fault", "Blocked drain causing water to back up"],
      steps: ["Cancel the cycle and check whether the machine is full of water.", "If overfull, check the drain first — a blocked drain can cause apparent overflow.", "If the drain is clear, the inlet valve may be failing to close — test by unplugging: if water continues to trickle in, the valve has failed."],
      tools: ["Towels", "Flashlight"],
      estimatedFixTime: "15–30 minutes (diagnosis)",
      whenToStop: "Replace the inlet valve immediately if it drips with the power off.",
      preventiveTips: ["Have the inlet valve inspected if the machine runs for a long time before filling completes."]
    },
    F6: {
      symptom: "Wash results are poor; water distribution to the spray arms is inadequate.",
      causes: ["Spray arm holes blocked by limescale or food deposits", "Spray arm bearing worn — arm does not spin freely", "Water inlet pressure below the minimum required (typically 0.5 bar)", "Inlet filter clogged"],
      steps: ["Remove upper and lower spray arms (typically unscrew anticlockwise or lift off).", "Hold each arm under the tap and use a toothpick or skewer to clear each jet hole.", "Check that each arm spins freely when reinstalled.", "Clean the inlet hose filter."],
      tools: ["Toothpick or thin wire", "Small brush"],
      estimatedFixTime: "15–20 minutes",
      whenToStop: "Replace spray arms if jets cannot be cleared or the bearing is visibly worn.",
      preventiveTips: ["Use a dishwasher cleaner monthly in hard-water areas.", "Check spray arm rotation monthly."]
    },
    H3: {
      symptom: "Water does not reach wash temperature; heater response is below threshold.",
      causes: ["Heating element failed or heavily scaled", "NTC sensor inaccurate", "Incoming water temperature very low in winter"],
      steps: ["Run a descaling cycle with citric acid or a dishwasher descaler.", "If the problem persists, test the heater element with a multimeter — it should show a resistance of around 20–30 Ω.", "Check the NTC sensor resistance."],
      tools: ["Multimeter", "Descaling agent"],
      estimatedFixTime: "60 minutes (descale); 30 minutes (component test)",
      whenToStop: "Replace the heater element or NTC sensor if testing shows a fault.",
      preventiveTips: ["Descale in hard-water areas every 3 months.", "Connect the dishwasher to the hot water supply where possible."]
    },
    C1: {
      symptom: "Cycle was stopped by internal safety logic; machine is locked out.",
      causes: ["Combined fault condition — typically a secondary error that the machine couldn't recover from automatically", "Power interruption mid-cycle"],
      steps: ["Cancel the cycle, unplug for 5 minutes, and restart.", "If a separate error code appeared before C1, address that code first."],
      tools: ["None"],
      estimatedFixTime: "5 minutes",
      whenToStop: "Call a technician if the lockout recurs without another code being shown.",
      preventiveTips: ["Use a surge protector.", "Do not interrupt cycles by cutting power at the wall."]
    },
    E1: {
      symptom: "Cycle does not start; door lock is not confirming the secured state.",
      causes: ["Door not fully latched", "Door latch hook broken", "Door lock module microswitch failed"],
      steps: ["Close the door firmly until you hear the latch click.", "Inspect the latch hook on the door for damage.", "Test the door lock module — press in the lock plunger by hand and listen for a click."],
      tools: ["Flashlight", "Screwdriver set"],
      estimatedFixTime: "5 minutes (close check); 20 minutes (lock module replacement)",
      whenToStop: "Replace the door lock module if the hook is intact but the machine still shows the error.",
      preventiveTips: ["Do not force dishwasher doors shut — latch hooks are relatively fragile."]
    },
    E4: {
      symptom: "Cycle pauses; spray arm performance has fallen below the minimum threshold.",
      causes: ["Spray arm holes blocked by limescale or food", "Object in the rack obstructing spray arm rotation", "Low inlet water pressure"],
      steps: ["Remove and clean the spray arms (see F6 steps).", "Check that no tall items in the rack block arm rotation.", "Spin both arms by hand before starting the next cycle."],
      tools: ["Toothpick", "Small brush"],
      estimatedFixTime: "10–15 minutes",
      whenToStop: "Replace spray arms if cleaning does not restore normal rotation.",
      preventiveTips: ["Check spray arm clearance when loading the machine."]
    }
  },
  refrigerator: {
    "ER IF": {
      symptom: "Ice maker fan is running below the expected speed or not at all; ice production may be affected.",
      causes: ["Ice maker fan motor failing", "Fan blade obstructed by ice buildup around the fan", "Fan wiring connection loose"],
      steps: ["Open the freezer and listen for the ice maker fan — a functioning fan is audible.", "Check for ice accumulation around the fan area that may be blocking the blades.", "If ice is present, defrost manually by unplugging for 24–48 hours with doors open.", "If the fan runs after defrost, the defrost system has a fault — see ER DH.", "If the fan still doesn't run, test the motor."],
      tools: ["Flashlight", "Multimeter"],
      estimatedFixTime: "30 minutes (diagnosis); 24–48 hours if defrost needed",
      whenToStop: "Replace the ice maker fan motor if it reads open on the multimeter.",
      preventiveTips: ["Avoid storing items directly in front of freezer air vents.", "Service the defrost system if ice buildup recurs."]
    },
    "ER FF": {
      symptom: "Freezer section fan not running at expected speed; freezer temperature may be affected.",
      causes: ["Freezer fan motor failing", "Ice blocking fan blades from a defrost system failure", "Wiring harness connector loose"],
      steps: ["Press and hold the freezer door switch manually while listening for the fan.", "If no fan sound, check for ice obstruction.", "Manual defrost if ice is blocking the fan.", "Test fan motor continuity."],
      tools: ["Flashlight", "Multimeter"],
      estimatedFixTime: "30 minutes (diagnosis); 24–48 hours if defrost needed",
      whenToStop: "Replace the fan motor if it reads open.",
      preventiveTips: ["Keep freezer vents unobstructed.", "Run defrost cycles on schedule."]
    },
    "ER RF": {
      symptom: "Refrigerator section fan not meeting speed expectation; fridge temperature rising.",
      causes: ["Evaporator fan motor (which circulates cold air into the fridge section) failing", "Ice blocking the fan in the freezer compartment"],
      steps: ["The evaporator fan is typically behind a panel in the freezer.", "Remove panel, inspect fan and blades for ice.", "Test motor continuity with a multimeter."],
      tools: ["Screwdriver set", "Multimeter", "Flashlight"],
      estimatedFixTime: "30–45 minutes",
      whenToStop: "Replace the evaporator fan motor if it does not spin freely or reads open.",
      preventiveTips: ["Do not block freezer vents with food items."]
    },
    "ER DH": {
      symptom: "Defrost cycle did not complete in the allotted time; frost is accumulating on evaporator coils.",
      causes: ["Defrost heater element failed (open circuit)", "Defrost thermostat failed (preventing heater activation)", "Defrost control timer or sensor fault"],
      steps: ["Manual defrost: unplug for 24–48 hours with doors propped open and towels on the floor.", "If cooling resumes after defrost, the defrost system has failed — the temporary fix is not a repair.", "Test the defrost heater (typically 20–50 Ω) and defrost thermostat (should close at low temperature)."],
      tools: ["Multimeter", "Screwdriver set"],
      estimatedFixTime: "24–48 hours (defrost); 45 minutes (component replacement)",
      whenToStop: "Have the defrost control board checked by a technician if heater and thermostat test good.",
      preventiveTips: ["Do not prop the freezer door open unnecessarily — it causes frost buildup.", "Service the defrost system if manual defrost is needed more than once."]
    },
    "ER DS": {
      symptom: "Defrost sensor is returning an out-of-range reading; defrost cycle behaviour may be erratic.",
      causes: ["Defrost sensor failed or stuck at a fixed value", "Sensor wiring harness loose or corroded"],
      steps: ["Locate the defrost sensor on the evaporator coil assembly.", "Test resistance — check manufacturer specification for expected value at room temperature.", "Inspect wiring for corrosion."],
      tools: ["Multimeter", "Screwdriver set"],
      estimatedFixTime: "30–45 minutes",
      whenToStop: "Replace the sensor if resistance is out of spec; repair wiring if corroded.",
      preventiveTips: ["Inspect evaporator compartment for moisture ingress annually."]
    },
    E1: {
      symptom: "Ambient temperature sensor is reading a value outside the valid range; temperature control accuracy may be reduced.",
      causes: ["Ambient (room temperature) sensor failed", "Sensor wire pinched or broken"],
      steps: ["Locate the ambient sensor (usually near the top of the fresh food compartment or in the control area).", "Test resistance and compare to spec.", "Inspect harness for damage."],
      tools: ["Multimeter"],
      estimatedFixTime: "20–30 minutes",
      whenToStop: "Replace the sensor if the resistance value is wrong.",
      preventiveTips: ["Ensure the refrigerator has adequate clearance from walls for ambient sensing to work correctly."]
    },
    E2: {
      symptom: "Freezer compartment temperature sensor is out of range; freezer may run too cold or not cold enough.",
      causes: ["Freezer temperature sensor failed", "Sensor harness loose"],
      steps: ["Locate the freezer sensor (on or near the evaporator coil).", "Test resistance.", "Reseat harness connector."],
      tools: ["Multimeter", "Screwdriver set"],
      estimatedFixTime: "20–30 minutes",
      whenToStop: "Replace the sensor if out of spec.",
      preventiveTips: ["Avoid storing items that drip liquid near the sensor."]
    },
    E5: {
      symptom: "Ice maker sensor is reporting an out-of-range value; ice production may have stopped.",
      causes: ["Ice maker thermistor failed", "Wiring to ice maker assembly disconnected"],
      steps: ["Open the freezer and access the ice maker assembly.", "Locate the sensor (small plug-in component).", "Test resistance and compare to spec.", "Reseat any loose connector."],
      tools: ["Multimeter", "Screwdriver set"],
      estimatedFixTime: "20–30 minutes",
      whenToStop: "Replace the ice maker thermistor — it is typically a low-cost part.",
      preventiveTips: ["Check that the ice maker wire harness is not being pinched by ice buildup."]
    },
    H1: {
      symptom: "Temperature in the refrigerator or freezer has risen above the safe threshold; alarm triggered.",
      causes: ["Power outage (residual warmth after restoration)", "Door left open or door seal failing", "Cooling system fault — compressor, refrigerant, or fans"],
      steps: ["If recently powered on after an outage, allow 24 hours to stabilise before acting.", "Check the door seal on all compartments (paper test — see main guide).", "Verify condenser coils are not coated in dust.", "Verify condenser and evaporator fans run during their expected cycles."],
      tools: ["Thermometer", "Flashlight"],
      estimatedFixTime: "24 hours (stabilisation); 30 minutes (seal/coil check)",
      whenToStop: "Call a technician if neither the doors nor the coils explain the high temperature — the sealed refrigerant system may have failed.",
      preventiveTips: ["Clean condenser coils every 6–12 months.", "Check door seals twice a year."]
    },
    C3: {
      symptom: "Compressor protection has activated; compressor is not running to protect itself from damage.",
      causes: ["Compressor overheating due to dirty condenser coils", "Compressor start relay failing", "Compressor at end of life"],
      steps: ["Clean the condenser coils thoroughly.", "Allow the compressor to cool for 30 minutes, then restore power.", "Listen for the compressor start — a clicking sound that repeats every few minutes without the compressor running points to a failed start relay.", "Test the start relay (shake it — a loose rattle indicates failure)."],
      tools: ["Vacuum with brush attachment", "Flashlight"],
      estimatedFixTime: "30–45 minutes (diagnosis)",
      whenToStop: "Call a technician for compressor replacement — it involves the sealed refrigerant system.",
      preventiveTips: ["Clean condenser coils every 6–12 months.", "Ensure adequate ventilation around the refrigerator."]
    },
    F1: {
      symptom: "Control board has lost communication with a secondary component; some functions may be inoperative.",
      causes: ["Wiring harness connector between main board and display/sensor board loose", "Power surge corrupted control state", "Control board fault"],
      steps: ["Unplug for 5 minutes and restart.", "If recurring, inspect harness connectors on both boards.", "Check for burn marks or damaged components on the boards."],
      tools: ["Screwdriver set"],
      estimatedFixTime: "5 minutes (reset); 30 minutes (harness check)",
      whenToStop: "Call a technician for control board replacement.",
      preventiveTips: ["Use a surge protector."]
    },
    dF: {
      symptom: "Defrost drain is slow or blocked; water may pool in the freezer or appear under the crisper drawers.",
      causes: ["Defrost drain tube clogged with ice or debris", "Drain heater not clearing the drain tube", "Drain pan cracked"],
      steps: ["Locate the defrost drain opening at the bottom of the freezer compartment behind the evaporator cover.", "Flush with warm water using a turkey baster to melt any ice.", "Check the drain tube runs clear to the drip pan under the refrigerator."],
      tools: ["Turkey baster", "Warm water", "Towels"],
      estimatedFixTime: "20–30 minutes",
      whenToStop: "If ice rebuilds quickly in the drain, the drain heater has failed and needs replacement.",
      preventiveTips: ["Flush the drain annually as part of routine maintenance."]
    }
  },
  ac: {
    P1: {
      symptom: "AC unit stops cooling or shuts off; condensate drain overflow protection has activated.",
      causes: ["Condensate drain pan full because the drain line is clogged with algae or debris", "Drain line improperly pitched — condensate cannot flow by gravity", "Drain pump failed (if fitted)"],
      steps: ["Locate the drain pan (typically below the air handler evaporator coil) and check if it is full of water.", "Flush the drain line with a 50/50 bleach-water solution poured into the access port.", "Use a wet-dry vacuum to clear the exterior end of the drain line.", "Confirm water flows freely before restarting."],
      tools: ["Wet-dry vacuum", "Bleach solution", "Funnel"],
      estimatedFixTime: "20–30 minutes",
      whenToStop: "Call a technician if the drain pump is running but the pan still overflows — the pump may need replacement.",
      preventiveTips: ["Flush the condensate drain line with bleach solution every 3 months during cooling season.", "Install a float switch to prevent overflow if one is not already fitted."]
    },
    P2: {
      symptom: "AC compressor shuts off; high refrigerant pressure protection has activated.",
      causes: ["Condenser coils dirty — cannot reject heat efficiently", "Condenser fan not running", "Refrigerant overcharged", "Ambient temperature extremely high"],
      steps: ["Turn the unit off and allow it to cool.", "Clean the condenser coils (outdoor unit) — rinse with a garden hose from inside out at low pressure.", "Check that the condenser fan spins freely.", "Restart after 15 minutes."],
      tools: ["Garden hose", "Fin comb (optional)"],
      estimatedFixTime: "20–30 minutes",
      whenToStop: "Call a certified HVAC technician if the code returns after cleaning — refrigerant charge requires licensed equipment.",
      preventiveTips: ["Clean condenser coils each spring.", "Ensure 12 inches of clearance around the outdoor unit."]
    },
    E1: {
      symptom: "AC unit runs erratically or displays incorrect temperature readings; indoor ambient sensor is out of range.",
      causes: ["Indoor air temperature sensor failed", "Sensor located near a heat source giving a false reading", "Wiring to sensor loose"],
      steps: ["Check sensor placement — it should be in free-flowing return air, not near direct sunlight or heat.", "Test sensor resistance with a multimeter.", "Reseat wiring connector."],
      tools: ["Multimeter"],
      estimatedFixTime: "15–20 minutes",
      whenToStop: "Replace the sensor if resistance is out of spec.",
      preventiveTips: ["Keep filters clean — restricted airflow affects sensor accuracy."]
    },
    E5: {
      symptom: "Compressor shuts off; current has exceeded the protection threshold.",
      causes: ["Compressor starting under high load in hot weather", "Capacitor failing — not providing start boost to compressor", "Refrigerant overcharge increasing compressor load", "Compressor beginning to fail"],
      steps: ["Turn the unit off for 30 minutes to allow the compressor to cool.", "Test the run/start capacitor — a failing capacitor bulges at the top.", "Restart and monitor current draw if you have a clamp meter."],
      tools: ["Screwdriver set", "Clamp meter (optional)"],
      estimatedFixTime: "30–45 minutes",
      whenToStop: "Call an HVAC technician for refrigerant charge issues or compressor diagnosis.",
      preventiveTips: ["Replace capacitors proactively if the unit is over 8 years old.", "Service the refrigerant charge every 2–3 years."]
    },
    F0: {
      symptom: "System has entered a refrigerant protection mode; cooling may be reduced.",
      causes: ["Refrigerant low from a slow leak", "Pressure sensor inaccurate"],
      steps: ["Look for ice formation on the indoor coil — a common sign of low charge.", "Check for oily residue at refrigerant line connections, which indicates a leak.", "Do not top up refrigerant without finding and fixing the leak."],
      tools: ["Flashlight"],
      estimatedFixTime: "15 minutes (visual check)",
      whenToStop: "All refrigerant work must be performed by a licensed HVAC technician.",
      preventiveTips: ["Have the refrigerant charge checked annually as part of a service visit."]
    },
    F1: {
      symptom: "AC reports an indoor coil (evaporator) sensor fault; unit may run in a safe mode.",
      causes: ["Indoor coil temperature sensor failed", "Sensor wire damaged by moisture"],
      steps: ["Inspect the sensor on the evaporator coil for physical damage or corrosion.", "Test resistance."],
      tools: ["Multimeter"],
      estimatedFixTime: "20 minutes",
      whenToStop: "Replace the sensor; a failed sensor causes the unit to run in default mode, which wastes energy.",
      preventiveTips: ["Drain condensate properly to prevent moisture damage to sensors."]
    },
    F2: {
      symptom: "Outdoor coil (condenser) sensor fault; unit may reduce capacity.",
      causes: ["Outdoor sensor exposed to weather damage", "Wiring corroded"],
      steps: ["Inspect sensor and wiring at the outdoor unit.", "Test resistance."],
      tools: ["Multimeter"],
      estimatedFixTime: "20 minutes",
      whenToStop: "Replace the sensor; confirm wiring integrity.",
      preventiveTips: ["Protect sensor wiring where it exits the outdoor unit casing."]
    },
    H3: {
      symptom: "Compressor has shut down on overload; thermal protection activated.",
      causes: ["Dirty condenser coils causing heat buildup", "Low refrigerant reducing compressor cooling", "Locked rotor — compressor mechanically seized"],
      steps: ["Clean condenser coils.", "Allow 30 minutes for cooling.", "Restart and listen — a healthy compressor starts cleanly; a struggling one makes a grinding or humming-without-starting sound."],
      tools: ["Garden hose"],
      estimatedFixTime: "30 minutes",
      whenToStop: "Call a technician if the compressor hums but does not start after coil cleaning — the compressor may be seized.",
      preventiveTips: ["Annual condenser coil cleaning prevents most H3 events."]
    },
    C5: {
      symptom: "Inverter module has flagged a fault; compressor speed control is affected.",
      causes: ["Voltage spike damaged the inverter board", "Loose connection to the inverter", "Inverter board failure"],
      steps: ["Turn the unit off at the breaker for 5 minutes and restart.", "If recurring, inspect inverter board wiring connections."],
      tools: ["Screwdriver set"],
      estimatedFixTime: "5 minutes (reset)",
      whenToStop: "Inverter board replacement requires a technician.",
      preventiveTips: ["Use a properly rated surge protector or line conditioner for inverter AC units."]
    },
    dF: {
      symptom: "Defrost cycle is running or completed abnormally; may display during normal defrost.",
      causes: ["Defrost in progress — this can be a status code, not always a fault", "Defrost not completing in the allotted time", "Defrost heater or sensor failed"],
      steps: ["Wait 10–15 minutes — if the unit resumes normal operation, defrost completed normally.", "If it persists or repeats frequently, check the defrost heater and sensor."],
      tools: ["Multimeter"],
      estimatedFixTime: "10 minutes (observation); 30 minutes (diagnosis)",
      whenToStop: "Call a technician if defrost cycles are abnormally long or frequent.",
      preventiveTips: ["Keep filters clean — poor airflow strains the defrost cycle."]
    },
    L3: {
      symptom: "Fan motor is not reaching expected speed; airflow is reduced.",
      causes: ["Fan motor failing", "Fan blade obstructed by debris", "Capacitor for fan motor weak"],
      steps: ["Inspect and clear any debris from around the fan blade.", "Test start/run capacitor.", "Test fan motor windings with a multimeter."],
      tools: ["Multimeter"],
      estimatedFixTime: "20–30 minutes",
      whenToStop: "Replace the capacitor first (low cost) — if that doesn't help, replace the fan motor.",
      preventiveTips: ["Keep the area around the outdoor unit clear of leaves and debris."]
    },
    U8: {
      symptom: "Communication between indoor and outdoor units has repeatedly failed; unit locked out.",
      causes: ["Communication cable loose or damaged at either end", "Voltage on communication line out of spec", "Control board at indoor or outdoor unit failed"],
      steps: ["Power off the unit at the breaker.", "Inspect the communication wire connections at both the indoor air handler and outdoor unit.", "Look for damaged insulation, corrosion, or loose terminals.", "Restore power and allow the unit to reinitialise."],
      tools: ["Screwdriver set", "Multimeter"],
      estimatedFixTime: "20–30 minutes",
      whenToStop: "Call a technician if wiring is intact but the fault persists — one of the control boards has likely failed.",
      preventiveTips: ["Use shielded cable for communication wiring in installations near high-EMI equipment."]
    }
  },
  oven: {
    F1: {
      symptom: "Oven display shows F1 at power-on or mid-cook; control board has detected a key input fault.",
      causes: ["A touchpad key is stuck or shorted", "Membrane touchpad has deteriorated", "Control board detecting phantom key presses"],
      steps: ["Power cycle (flip the breaker for 5 minutes).", "If F1 returns at power-on, a key is stuck — press each key and feel for one that doesn't spring back clearly.", "If the touchpad is a ribbon-connected membrane, inspect the ribbon connector for moisture ingression.", "Replace the touchpad if a stuck key is confirmed."],
      tools: ["Screwdriver set"],
      estimatedFixTime: "5 minutes (reset); 30–45 minutes (touchpad replacement)",
      whenToStop: "Replace the control board if the touchpad has been replaced and F1 persists.",
      preventiveTips: ["Clean the touchpad with a dry cloth — moisture intrusion is the primary cause of membrane failure.", "Do not use abrasive cleaners on the control panel."]
    },
    F2: {
      symptom: "Oven shuts off and sounds an alarm; temperature in the cavity has exceeded the safe limit.",
      causes: ["Temperature sensor (RTD probe) reading incorrectly high", "Oven runaway — control board stuck a relay in the on position", "Self-clean cycle left unmonitored at an extreme setting"],
      steps: ["Allow the oven to cool completely.", "Power cycle.", "Test the temperature sensor resistance — typically 1080–1100 Ω at room temperature for most residential probes.", "If the sensor reads correctly, the control board may have a stuck relay."],
      tools: ["Multimeter"],
      estimatedFixTime: "30–45 minutes",
      whenToStop: "Do not use the oven again until the cause is identified — a true F2 (uncontrolled heating) is a fire risk. Call a technician if the control board is suspected.",
      preventiveTips: ["Never leave a self-clean cycle unmonitored.", "Test the temperature sensor annually if the oven reads hot."]
    },
    F3: {
      symptom: "Oven will not heat or displays F3; temperature sensor circuit is open.",
      causes: ["RTD temperature probe wire broken internally", "Probe connector disconnected at the control board", "Probe physically damaged from a spillover"],
      steps: ["Locate the temperature probe (a thin metal sensor at the back interior of the oven cavity).", "Test resistance at the probe's connector — open circuit (infinite resistance) confirms a broken probe.", "Inspect the wire run from the probe to the control board for damage.", "Replace the probe — it is typically a straightforward DIY part."],
      tools: ["Multimeter", "Screwdriver set"],
      estimatedFixTime: "20–30 minutes",
      whenToStop: "If the probe tests good, the harness or control board has the fault.",
      preventiveTips: ["Do not place foil directly over the oven floor — it can trap heat and damage the probe wire.", "Replace the probe if it shows any physical damage after a spillover."]
    },
    F4: {
      symptom: "Oven shows F4; temperature sensor circuit is shorted.",
      causes: ["RTD probe wire insulation has melted and is touching the chassis", "Moisture in the connector causing a short"],
      steps: ["Test the probe resistance — near zero (short) confirms the fault.", "Inspect the wire for any contact with the oven cavity walls or heating element.", "Replace the temperature probe."],
      tools: ["Multimeter", "Screwdriver set"],
      estimatedFixTime: "20–30 minutes",
      whenToStop: "Same as F3 — if the probe tests good, the harness or board has the fault.",
      preventiveTips: ["Route the probe wire away from the broil element when reinstalling."]
    },
    F5: {
      symptom: "Oven stops and shows F5; a communication fault between control boards has been detected.",
      causes: ["Main control board to display/relay board communication interrupted", "Power surge corrupted communication state", "Ribbon cable or connector loose"],
      steps: ["Power cycle (breaker off for 5 minutes).", "If recurring, open the control panel and reseat the ribbon cable between boards.", "Inspect for burn marks."],
      tools: ["Screwdriver set"],
      estimatedFixTime: "5 minutes (reset); 30 minutes (cable check)",
      whenToStop: "Call a technician for control board replacement if the fault persists.",
      preventiveTips: ["Use a surge protector on the oven circuit."]
    },
    F7: {
      symptom: "Oven shows F7; door lock mechanism feedback does not match the expected state.",
      causes: ["Lock motor failed mid-travel", "Door latch switch worn", "Self-clean cycle was interrupted mid-lock"],
      steps: ["Power cycle — this clears the lock motor state in many cases.", "If the door is physically locked, do not force it. Allow the oven to cool fully (1–2 hours), then power cycle.", "If unlocked but F7 shows, manually operate the latch to check for mechanical binding."],
      tools: ["Flashlight"],
      estimatedFixTime: "5 minutes (reset); 45 minutes (latch replacement)",
      whenToStop: "Call a technician if the door is locked after full cooling and a power cycle does not release it.",
      preventiveTips: ["Do not interrupt a self-clean cycle once the door has locked.", "Have the latch assembly inspected if self-clean is used frequently."]
    },
    E1: {
      symptom: "Oven consistently cooks hotter or cooler than the set temperature; calibration has drifted.",
      causes: ["Temperature probe reading slightly off its calibrated value", "Probe has aged and drifted from its original specification"],
      steps: ["Use an independent oven thermometer to measure actual cavity temperature at 350°F.", "If actual temperature deviates by more than 25°F, adjust the calibration offset in the oven's settings menu.", "If deviation exceeds 50°F, the probe likely needs replacement."],
      tools: ["Independent oven thermometer", "Multimeter (optional)"],
      estimatedFixTime: "10 minutes (calibration adjustment)",
      whenToStop: "Replace the temperature probe if calibration offset cannot compensate for the drift.",
      preventiveTips: ["Check calibration annually with an oven thermometer.", "Avoid extremely high self-clean temperatures unless necessary."]
    },
    E2: {
      symptom: "Cooling fan (which cools the control panel during and after cooking) is not responding.",
      causes: ["Cooling fan motor failed", "Fan blade obstructed", "Fan wiring disconnected"],
      steps: ["Listen for the cooling fan during a bake cycle — it should run during cooking and for a period after.", "Access the fan (usually behind the back panel or above the oven cavity) and inspect for obstruction.", "Test fan motor continuity."],
      tools: ["Screwdriver set", "Multimeter"],
      estimatedFixTime: "30–45 minutes",
      whenToStop: "Replace the cooling fan motor — running the oven without it will shorten control board life.",
      preventiveTips: ["Do not block the top rear vent of the oven."]
    },
    E6: {
      symptom: "Door lock did not complete within the expected time; self-clean locked out.",
      causes: ["Latch motor slow or worn", "Physical obstruction preventing the latch from travelling", "Latch switch adjusted out of position"],
      steps: ["Check for any debris near the latch slot on the door frame.", "Power cycle and retry self-clean initiation.", "If the latch motor moves slowly and stops, the motor or its worm gear is wearing."],
      tools: ["Flashlight"],
      estimatedFixTime: "10 minutes (check); 45 minutes (replacement)",
      whenToStop: "Replace the latch motor assembly if it cannot complete the travel.",
      preventiveTips: ["Test the door lock mechanism outside of self-clean once a year."]
    },
    C1: {
      symptom: "Oven cycle was cancelled by a safety condition; may be locked.",
      causes: ["Over-temperature event triggered C1 as a secondary lockout", "Power interruption during self-clean"],
      steps: ["Allow full cooling.", "Power cycle.", "If F2 appeared before C1, address F2 first."],
      tools: ["None"],
      estimatedFixTime: "5 minutes",
      whenToStop: "Call a technician if C1 follows an over-temperature event and the oven will not restart.",
      preventiveTips: ["Do not cut power during self-clean."]
    },
    H0: {
      symptom: "Heating relay self-test failed; oven may not heat.",
      causes: ["Relay on the control board stuck open or closed", "Heater element disconnected"],
      steps: ["Power cycle.", "If the oven heats but H0 persists, the relay's self-test logic has a fault.", "If the oven does not heat, test the bake and broil elements for continuity."],
      tools: ["Multimeter"],
      estimatedFixTime: "15–30 minutes",
      whenToStop: "A relay failure on the control board requires board replacement.",
      preventiveTips: ["Use a surge protector."]
    },
    P0: {
      symptom: "Control board detected a power integrity issue; may restart or show a warning.",
      causes: ["Voltage sag or spike on the supply line", "Loose connection at the terminal block", "Utility power quality issue"],
      steps: ["Power cycle.", "Tighten connections at the terminal block if accessible.", "Note whether the issue correlates with other high-draw appliances starting (dishwasher, A/C) — a sign of inadequate wiring."],
      tools: ["Screwdriver set"],
      estimatedFixTime: "5 minutes",
      whenToStop: "Call an electrician if P0 is frequent and correlates with other appliances starting.",
      preventiveTips: ["Have the kitchen circuit inspected if the home wiring is older.", "Use a surge protector rated for kitchen ranges."]
    }
  }
};

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function createEntry(brand, appliance, code, summary) {
  const pageSlug = `${brand.slug}-${appliance}-${slugify(code)}`;

  const content = (codeContent[appliance] && codeContent[appliance][code]) || {};

  const causes = content.causes || [
    `Intermittent ${appliance} sensor reading outside expected range.`,
    `Temporary power-state mismatch after a surge or abrupt cycle interruption.`,
    `Mechanical restriction in a core ${appliance} subsystem (airflow, drain, or movement).`,
    `Wiring harness connection seated loosely due to vibration over time.`
  ];

  const steps = content.steps || [
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
    code,
    title: `${brand.name} ${toTitle(appliance)} ${code} Error Code: Causes and Fixes`,
    summary,
    symptom: content.symptom || `${toTitle(appliance)} stops cycle and displays ${code}.`,
    severity: ["low", "medium", "high"][Math.floor((pageSlug.length + code.length) % 3)],
    causes,
    steps,
    tools: content.tools || ["Flashlight", "Microfiber cloth", "Small brush", "Screwdriver set"],
    preventiveTips: content.preventiveTips || [
      "Run monthly maintenance cycles and clean filters on schedule.",
      "Avoid overloading and keep installation clearances within manufacturer guidance.",
      "Use surge protection where local power quality is inconsistent."
    ],
    estimatedFixTime: content.estimatedFixTime || "10–35 minutes",
    whenToStop: content.whenToStop || "Stop and call a licensed technician if the code reappears after two full restart attempts or if you detect heat, smoke, or water leakage.",
    brandNote: (brandApplianceNotes[brand.slug] && brandApplianceNotes[brand.slug][appliance]) || null,
    updatedAt: "2026-02-20"
  };
}

const entries = [];

for (const brand of brands) {
  for (const appliance of brand.appliances) {
    for (const [code, summary] of blueprint[appliance]) {
      entries.push(createEntry(brand, appliance, code, summary));
    }
  }
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(entries, null, 2));

console.log(`Generated ${entries.length} error-code pages at data/error-codes.json`);
