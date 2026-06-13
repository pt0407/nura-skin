import type { MetricKey } from "./analyze";

export type PriceTier = "$" | "$$" | "$$$";

export interface Product {
  id: string; // stable key for dedup + future live-data lookups
  brand: string;
  name: string;
  type: string; // category shown on the card
  hero: string; // key ingredient / why it's matched
  step: "AM" | "PM" | "AM/PM";
  targets: MetricKey[];
  tint: string; // accent color for the card swatch
  price: PriceTier;
  search: string; // brand + product, used to build the Amazon link
}

/**
 * Amazon Associates tag. Set VITE_AMAZON_TAG in your Vercel project env to your
 * real store id (e.g. "nuraskin-20"). The placeholder below still produces
 * working links — they just won't earn commission until you replace it.
 */
const AMAZON_TAG = import.meta.env.VITE_AMAZON_TAG || "nuraskin-20";

/**
 * Build a monetized Amazon link for a product. We link to a scoped Amazon
 * search (brand + product) rather than a hard-coded ASIN so the link never
 * 404s when a listing changes — the affiliate tag still tracks the sale.
 */
export function shopUrl(p: Pick<Product, "search">): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(p.search)}&tag=${AMAZON_TAG}`;
}

// A curated catalog of real, widely-available products, each tagged with the
// concerns it helps so recommendations are derived from the user's own scan.
// Order matters: recommend() picks the first unused match per concern, so the
// strongest all-rounder for each concern is listed first.
export const CATALOG: Product[] = [
  // ── Tone / evenness ──
  {
    id: "to-niacinamide",
    brand: "The Ordinary",
    name: "Niacinamide 10% + Zinc 1%",
    type: "Serum",
    hero: "Niacinamide + zinc visibly even tone and curb shine.",
    step: "AM",
    targets: ["evenness", "clarity"],
    tint: "#9d8650",
    price: "$",
    search: "The Ordinary Niacinamide 10% Zinc 1%",
  },
  {
    id: "gm-discoloration",
    brand: "Good Molecules",
    name: "Discoloration Correcting Serum",
    type: "Brightening serum",
    hero: "Tranexamic acid + niacinamide fade post-acne marks.",
    step: "AM",
    targets: ["evenness"],
    tint: "#a98b3e",
    price: "$",
    search: "Good Molecules Discoloration Correcting Serum",
  },
  {
    id: "lrp-melab3",
    brand: "La Roche-Posay",
    name: "Mela B3 Dark Spot Serum",
    type: "Dark spot serum",
    hero: "Melasyl + niacinamide target stubborn discoloration.",
    step: "AM",
    targets: ["evenness", "radiance"],
    tint: "#b07d4a",
    price: "$$",
    search: "La Roche-Posay Mela B3 serum",
  },

  // ── Hydration ──
  {
    id: "to-haB5",
    brand: "The Ordinary",
    name: "Hyaluronic Acid 2% + B5",
    type: "Hydrating serum",
    hero: "Multi-weight hyaluronic acid + B5 pull water into skin.",
    step: "AM/PM",
    targets: ["hydration", "radiance"],
    tint: "#5b7c9d",
    price: "$",
    search: "The Ordinary Hyaluronic Acid 2% B5",
  },
  {
    id: "neutrogena-hydroboost",
    brand: "Neutrogena",
    name: "Hydro Boost Gel-Cream",
    type: "Gel moisturizer",
    hero: "Lightweight hyaluronic gel for all-day water-binding.",
    step: "AM/PM",
    targets: ["hydration"],
    tint: "#6f93b3",
    price: "$",
    search: "Neutrogena Hydro Boost gel cream",
  },
  {
    id: "cosrx-snail",
    brand: "COSRX",
    name: "Advanced Snail 96 Mucin Essence",
    type: "Essence",
    hero: "Snail mucin layers lightweight repair and bounce.",
    step: "AM/PM",
    targets: ["hydration", "texture"],
    tint: "#7f9a86",
    price: "$",
    search: "COSRX Advanced Snail 96 Mucin Essence",
  },

  // ── Barrier / dryness + texture ──
  {
    id: "cerave-cream",
    brand: "CeraVe",
    name: "Moisturizing Cream",
    type: "Moisturizer",
    hero: "Ceramides + hyaluronic acid rebuild a dry barrier.",
    step: "PM",
    targets: ["hydration", "texture"],
    tint: "#a98c6b",
    price: "$",
    search: "CeraVe Moisturizing Cream",
  },
  {
    id: "vanicream-cream",
    brand: "Vanicream",
    name: "Moisturizing Cream",
    type: "Moisturizer",
    hero: "Bare-bones, fragrance-free support for reactive skin.",
    step: "AM/PM",
    targets: ["hydration", "calmness"],
    tint: "#b39d83",
    price: "$",
    search: "Vanicream Moisturizing Cream",
  },

  // ── Clarity / congestion ──
  {
    id: "pc-2bha",
    brand: "Paula's Choice",
    name: "Skin Perfecting 2% BHA Liquid",
    type: "Exfoliant",
    hero: "Salicylic acid clears pores and de-shines the T-zone.",
    step: "PM",
    targets: ["clarity", "texture"],
    tint: "#6b8f71",
    price: "$$",
    search: "Paula's Choice 2% BHA Liquid Exfoliant",
  },
  {
    id: "to-salicylic",
    brand: "The Ordinary",
    name: "Salicylic Acid 2% Solution",
    type: "Exfoliant",
    hero: "Targeted BHA for congestion and breakouts.",
    step: "PM",
    targets: ["clarity"],
    tint: "#5f8466",
    price: "$",
    search: "The Ordinary Salicylic Acid 2% Solution",
  },
  {
    id: "lrp-effaclarduo",
    brand: "La Roche-Posay",
    name: "Effaclar Duo",
    type: "Acne treatment",
    hero: "Niacinamide + LHA target active spots and marks.",
    step: "AM/PM",
    targets: ["clarity", "evenness"],
    tint: "#6e8f74",
    price: "$$",
    search: "La Roche-Posay Effaclar Duo",
  },

  // ── Texture / resurfacing ──
  {
    id: "to-glycolic",
    brand: "The Ordinary",
    name: "Glycolic Acid 7% Toning Solution",
    type: "Exfoliating toner",
    hero: "Weekly AHA tone-up for smoother, brighter skin.",
    step: "PM",
    targets: ["texture", "radiance"],
    tint: "#7a6e9c",
    price: "$",
    search: "The Ordinary Glycolic Acid 7% Toning Solution",
  },
  {
    id: "differin-gel",
    brand: "Differin",
    name: "Adapalene Gel 0.1%",
    type: "Retinoid",
    hero: "OTC retinoid for texture, clogged pores, and marks.",
    step: "PM",
    targets: ["texture", "clarity"],
    tint: "#8a6f9c",
    price: "$",
    search: "Differin Adapalene Gel 0.1%",
  },
  {
    id: "cerave-retinol",
    brand: "CeraVe",
    name: "Resurfacing Retinol Serum",
    type: "Retinol serum",
    hero: "Encapsulated retinol smooths texture overnight.",
    step: "PM",
    targets: ["texture", "evenness"],
    tint: "#7e6b8a",
    price: "$",
    search: "CeraVe Resurfacing Retinol Serum",
  },
  {
    id: "inkey-pha",
    brand: "The Inkey List",
    name: "PHA Toner",
    type: "Toner",
    hero: "Gluconolactone resurfaces gently — low irritation.",
    step: "PM",
    targets: ["texture", "evenness"],
    tint: "#857aa6",
    price: "$",
    search: "The Inkey List PHA Toner",
  },

  // ── Radiance / antioxidant ──
  {
    id: "maelove-glowmaker",
    brand: "Maelove",
    name: "The Glow Maker Vitamin C Serum",
    type: "Antioxidant serum",
    hero: "15% vitamin C + ferulic for a brighter, even glow.",
    step: "AM",
    targets: ["radiance", "evenness"],
    tint: "#c08a3e",
    price: "$$",
    search: "Maelove Glow Maker Vitamin C serum",
  },
  {
    id: "truskin-vitc",
    brand: "TruSkin",
    name: "Vitamin C Serum",
    type: "Antioxidant serum",
    hero: "Vitamin C + E + ferulic to revive dull, tired skin.",
    step: "AM",
    targets: ["radiance"],
    tint: "#c8943f",
    price: "$",
    search: "TruSkin Vitamin C Serum",
  },

  // ── Calmness / soothing ──
  {
    id: "lrp-cicaplast",
    brand: "La Roche-Posay",
    name: "Cicaplast Baume B5",
    type: "Soothing balm",
    hero: "Panthenol + madecassoside calm and repair.",
    step: "AM/PM",
    targets: ["calmness", "hydration"],
    tint: "#5f8f6a",
    price: "$$",
    search: "La Roche-Posay Cicaplast Baume B5",
  },
  {
    id: "to-azelaic",
    brand: "The Ordinary",
    name: "Azelaic Acid Suspension 10%",
    type: "Treatment",
    hero: "Azelaic acid calms redness and unclogs at once.",
    step: "PM",
    targets: ["calmness", "clarity"],
    tint: "#8a5a5a",
    price: "$",
    search: "The Ordinary Azelaic Acid Suspension 10%",
  },
  {
    id: "purito-centella",
    brand: "Purito",
    name: "Centella Unscented Serum",
    type: "Soothing serum",
    hero: "49% centella quiets redness — fully fragrance-free.",
    step: "AM/PM",
    targets: ["calmness", "hydration"],
    tint: "#5f9070",
    price: "$",
    search: "Purito Centella Unscented Serum",
  },

  // ── Sunscreen (always last step) ──
  {
    id: "eltamd-uvclear",
    brand: "EltaMD",
    name: "UV Clear SPF 46",
    type: "Sunscreen",
    hero: "Niacinamide mineral SPF derms love for acne-prone skin.",
    step: "AM",
    targets: ["radiance", "evenness", "calmness"],
    tint: "#3c5043",
    price: "$$$",
    search: "EltaMD UV Clear SPF 46",
  },
  {
    id: "boj-reliefsun",
    brand: "Beauty of Joseon",
    name: "Relief Sun SPF 50+",
    type: "Sunscreen",
    hero: "Featherlight daily SPF with rice + probiotics.",
    step: "AM",
    targets: ["radiance", "hydration"],
    tint: "#445a4b",
    price: "$",
    search: "Beauty of Joseon Relief Sun SPF 50",
  },
  {
    id: "lrp-anthelios",
    brand: "La Roche-Posay",
    name: "Anthelios Mineral SPF 50",
    type: "Sunscreen",
    hero: "100% mineral broad-spectrum shield for sensitive skin.",
    step: "AM",
    targets: ["radiance", "calmness"],
    tint: "#3f5446",
    price: "$$",
    search: "La Roche-Posay Anthelios Mineral SPF 50",
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
      (p) => p.targets.includes(concern) && !used.has(p.id) && p.type !== "Sunscreen"
    );
    if (match) {
      used.add(match.id);
      picks.push({ ...match, reason: REASON[concern] });
    }
  }

  // Round the routine out with a hydrator if nothing covers it yet.
  if (!picks.some((p) => p.targets.includes("hydration"))) {
    const hydrator = CATALOG.find(
      (p) => p.targets.includes("hydration") && p.type !== "Sunscreen" && !used.has(p.id)
    );
    if (hydrator) {
      picks.push({ ...hydrator, reason: "to keep skin balanced" });
      used.add(hydrator.id);
    }
  }

  // Cap treatments at 3 so SPF always keeps the final slot — protection is
  // non-negotiable and must never be sliced off.
  const treatments = picks.slice(0, 3);
  const spf = CATALOG.find((p) => p.type === "Sunscreen")!;
  return [...treatments, { ...spf, reason: "to protect every result" }];
}
