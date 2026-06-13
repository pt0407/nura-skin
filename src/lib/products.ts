import type { AnalysisResult, MetricKey } from "./analyze";

export type PriceTier = "$" | "$$" | "$$$";
export type Strength = "gentle" | "moderate" | "active";
export type Category =
  | "niacinamide"
  | "brightening"
  | "azelaic"
  | "hydrator"
  | "barrier"
  | "exfoliant"
  | "retinoid"
  | "vitc"
  | "soothing"
  | "acne"
  | "spf";

export interface Product {
  id: string; // stable key for dedup + future live-data lookups
  brand: string;
  name: string;
  type: string; // category shown on the card
  hero: string; // key ingredient / why it's matched
  step: "AM" | "PM" | "AM/PM";
  targets: MetricKey[];
  /** how potent the active is — matched to how severe the concern is */
  strength: Strength;
  /** product family, used to keep a routine coherent (no duplicates/conflicts) */
  category: Category;
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

// A curated catalog of real, widely-available products. Each carries the
// concerns it treats, a potency (strength) and a family (category) so the
// recommender can match products to the user's actual scan profile.
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
    strength: "gentle",
    category: "niacinamide",
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
    strength: "moderate",
    category: "brightening",
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
    strength: "moderate",
    category: "brightening",
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
    strength: "gentle",
    category: "hydrator",
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
    strength: "gentle",
    category: "hydrator",
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
    strength: "gentle",
    category: "hydrator",
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
    strength: "gentle",
    category: "barrier",
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
    strength: "gentle",
    category: "barrier",
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
    strength: "active",
    category: "exfoliant",
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
    strength: "moderate",
    category: "exfoliant",
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
    strength: "moderate",
    category: "acne",
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
    strength: "active",
    category: "exfoliant",
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
    strength: "active",
    category: "retinoid",
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
    strength: "moderate",
    category: "retinoid",
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
    strength: "gentle",
    category: "exfoliant",
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
    strength: "moderate",
    category: "vitc",
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
    strength: "gentle",
    category: "vitc",
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
    strength: "gentle",
    category: "soothing",
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
    targets: ["calmness", "clarity", "evenness"],
    strength: "moderate",
    category: "azelaic",
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
    strength: "gentle",
    category: "soothing",
    tint: "#5f9070",
    price: "$",
    search: "Purito Centella Unscented Serum",
  },

  // ── Sunscreen (always the final step) ──
  {
    id: "eltamd-uvclear",
    brand: "EltaMD",
    name: "UV Clear SPF 46",
    type: "Sunscreen",
    hero: "Niacinamide mineral SPF derms love for acne-prone skin.",
    step: "AM",
    targets: ["radiance", "evenness", "calmness"],
    strength: "gentle",
    category: "spf",
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
    strength: "gentle",
    category: "spf",
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
    strength: "gentle",
    category: "spf",
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

const STRENGTH_RANK: Record<Strength, number> = { gentle: 0, moderate: 1, active: 2 };
const PRICE_RANK: Record<PriceTier, number> = { $: 0, $$: 1, $$$: 2 };

// Strong actives shouldn't be stacked (e.g. an acid exfoliant + a retinoid).
const STRONG = new Set<Category>(["exfoliant", "retinoid"]);
// For deeper tones we bias hyperpigmentation toward gentler, PIH-safe correctors.
const PIGMENT_SAFE = new Set<Category>(["niacinamide", "brightening", "azelaic"]);

/**
 * Build a personalized routine from the user's full scan profile.
 *
 * Unlike a fixed lookup, this ranks the catalog against the user's actual
 * metric deficits, picks active strength to match how severe each concern is,
 * nudges for skin tone, keeps the routine coherent (distinct categories, no
 * stacked strong actives), and ends on the SPF that best fits the profile —
 * so two different faces get two different routines.
 */
export function recommend(result: AnalysisResult): Recommendation[] {
  const deficit = {} as Record<MetricKey, number>;
  for (const m of result.metrics) deficit[m.key] = 100 - m.score; // higher = weaker

  const deep = result.depth === "Tan" || result.depth === "Deep";
  const sevTier = (d: number) => (d < 30 ? 0 : d <= 55 ? 1 : 2);

  // Relevance = how much of THIS user's weakness a product addresses.
  const relevance = (p: Product) =>
    p.targets.reduce((s, t) => s + (deficit[t] ?? 0) / 100, 0);

  // Full fit score for a product chosen to address a specific concern.
  const fitScore = (p: Product, concern: MetricKey) => {
    const strengthFit = Math.max(0, 2 - Math.abs(sevTier(deficit[concern] ?? 0) - STRENGTH_RANK[p.strength]));
    let tone = 0;
    if (deep) {
      if (concern === "evenness" && PIGMENT_SAFE.has(p.category)) tone += 0.5;
      if (p.strength === "active" && STRONG.has(p.category)) tone -= 0.3; // PIH caution
    }
    return relevance(p) + strengthFit * 0.5 + tone;
  };

  const picks: Recommendation[] = [];
  const usedIds = new Set<string>();
  const usedCats = new Set<Category>();
  let usedStrong = false;

  const eligible = (p: Product) =>
    p.category !== "spf" &&
    !usedIds.has(p.id) &&
    !usedCats.has(p.category) &&
    !(STRONG.has(p.category) && usedStrong);

  const take = (p: Product, reason: string) => {
    usedIds.add(p.id);
    usedCats.add(p.category);
    if (STRONG.has(p.category)) usedStrong = true;
    picks.push({ ...p, reason });
  };

  // 1) One product per weak concern, most severe first.
  for (const concern of result.weakpoints) {
    if (picks.length >= 3) break;
    const cands = CATALOG.filter((p) => eligible(p) && p.targets.includes(concern));
    if (!cands.length) continue;
    cands.sort(
      (a, b) =>
        fitScore(b, concern) - fitScore(a, concern) ||
        b.targets.length - a.targets.length ||
        PRICE_RANK[a.price] - PRICE_RANK[b.price] ||
        a.id.localeCompare(b.id)
    );
    take(cands[0], REASON[concern]);
  }

  // 2) Fill any remaining treatment slots with the best supporting product.
  while (picks.length < 3) {
    const cands = CATALOG.filter(eligible);
    if (!cands.length) break;
    cands.sort(
      (a, b) =>
        relevance(b) - relevance(a) ||
        PRICE_RANK[a.price] - PRICE_RANK[b.price] ||
        a.id.localeCompare(b.id)
    );
    const best = cands[0];
    const topTarget = [...best.targets].sort((a, b) => (deficit[b] ?? 0) - (deficit[a] ?? 0))[0];
    take(best, REASON[topTarget]);
  }

  // 3) Finish with the SPF that best fits the profile — always the last step.
  const spf = [...CATALOG.filter((p) => p.category === "spf")].sort(
    (a, b) =>
      relevance(b) - relevance(a) ||
      PRICE_RANK[a.price] - PRICE_RANK[b.price] ||
      a.id.localeCompare(b.id)
  )[0];
  picks.push({ ...spf, reason: "to protect every result" });

  return picks;
}
