import type { MetricKey } from "./analyze";

export interface Product {
  name: string;
  type: string;
  hero: string; // the key ingredient / why
  step: "AM" | "PM" | "AM/PM";
  targets: MetricKey[];
  tint: string; // accent color for the card
}

// A small curated catalog. Each product is tagged with the concerns it helps,
// so recommendations are derived from the user's own weak points.
export const CATALOG: Product[] = [
  {
    name: "Hyaluronic Drench Serum",
    type: "Hydrating serum",
    hero: "Multi-weight hyaluronic acid + panthenol to plump and hold water.",
    step: "AM/PM",
    targets: ["hydration", "radiance"],
    tint: "#5b7c9d",
  },
  {
    name: "Ceramide Barrier Cream",
    type: "Moisturizer",
    hero: "Ceramides + squalane rebuild a dry, compromised barrier.",
    step: "PM",
    targets: ["hydration", "texture"],
    tint: "#a98c6b",
  },
  {
    name: "10% Niacinamide Tone Fluid",
    type: "Treatment",
    hero: "Niacinamide visibly evens tone and fades dark spots.",
    step: "AM",
    targets: ["evenness", "clarity"],
    tint: "#9d8650",
  },
  {
    name: "Gentle BHA Pore Refiner",
    type: "Exfoliant",
    hero: "Salicylic acid clears congestion and de-shines the T-zone.",
    step: "PM",
    targets: ["clarity", "texture"],
    tint: "#6b8f71",
  },
  {
    name: "PHA Smoothing Toner",
    type: "Toner",
    hero: "Gluconolactone resurfaces gently — texture without irritation.",
    step: "PM",
    targets: ["texture", "evenness"],
    tint: "#7a6e9c",
  },
  {
    name: "Vitamin C Glow Ampoule",
    type: "Antioxidant serum",
    hero: "15% L-ascorbic acid brightens and revives dull skin.",
    step: "AM",
    targets: ["radiance", "evenness"],
    tint: "#c08a3e",
  },
  {
    name: "Centella Calm Serum",
    type: "Soothing serum",
    hero: "Centella + allantoin quiet redness and reactivity.",
    step: "AM/PM",
    targets: ["calmness", "hydration"],
    tint: "#5f8f6a",
  },
  {
    name: "Azelaic Redness Corrector",
    type: "Treatment",
    hero: "10% azelaic acid calms flushing and unclogs at once.",
    step: "PM",
    targets: ["calmness", "clarity"],
    tint: "#8a5a5a",
  },
  {
    name: "Mineral Glow SPF 50",
    type: "Sunscreen",
    hero: "Daily zinc shield — the one step that protects every result.",
    step: "AM",
    targets: ["radiance", "evenness", "calmness"],
    tint: "#3c5043",
  },
];

export interface Recommendation extends Product {
  reason: string;
}

const REASON: Record<MetricKey, string> = {
  hydration: "to rebuild hydration",
  evenness: "to even out tone",
  clarity: "to clear congestion",
  texture: "to smooth texture",
  radiance: "to bring back glow",
  calmness: "to calm redness",
};

/**
 * Pick a focused routine from the catalog based on the user's weak points.
 * Always finishes with SPF — protection is non-negotiable.
 */
export function recommend(weakpoints: MetricKey[]): Recommendation[] {
  const picks: Recommendation[] = [];
  const used = new Set<string>();

  for (const concern of weakpoints) {
    const match = CATALOG.find(
      (p) => p.targets.includes(concern) && !used.has(p.name) && p.type !== "Sunscreen"
    );
    if (match) {
      used.add(match.name);
      picks.push({ ...match, reason: REASON[concern] });
    }
  }

  // Round the routine out with a hydrator if nothing covers it yet.
  if (!picks.some((p) => p.targets.includes("hydration"))) {
    const hydrator = CATALOG.find((p) => p.name === "Hyaluronic Drench Serum")!;
    if (!used.has(hydrator.name)) {
      picks.push({ ...hydrator, reason: "to keep skin balanced" });
      used.add(hydrator.name);
    }
  }

  const spf = CATALOG.find((p) => p.type === "Sunscreen")!;
  picks.push({ ...spf, reason: "to protect every result" });

  return picks.slice(0, 4);
}
