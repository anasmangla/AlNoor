export type WeightPricing = {
  perLb: number;
  perKg: number;
  baseUnit: "lb" | "kg";
};

const LB_PER_KG = 2.2046226218;

function detectWeightUnit(unit?: string | null): "lb" | "kg" | null {
  if (!unit) return null;
  const normalized = unit.toLowerCase().trim();
  if (!normalized) return null;
  if (normalized.includes("lb") || normalized.includes("pound")) {
    return "lb";
  }
  if (normalized.includes("kg") || normalized.includes("kilo")) {
    return "kg";
  }
  return null;
}

export function getWeightPricing(product: {
  price: number;
  unit?: string | null;
  is_weight_based?: boolean | null;
}): WeightPricing | null {
  if (!product?.is_weight_based) return null;
  const unitType = detectWeightUnit(product.unit);
  if (!unitType) return null;
  const price = Number(product.price);
  if (!Number.isFinite(price)) return null;
  if (unitType === "lb") {
    return { perLb: price, perKg: price * LB_PER_KG, baseUnit: "lb" };
  }
  if (unitType === "kg") {
    return { perLb: price / LB_PER_KG, perKg: price, baseUnit: "kg" };
  }
  return null;
}

export function formatWeightPricing(
  product: {
    price: number;
    unit?: string | null;
    is_weight_based?: boolean | null;
  },
  digits = 2
): { perLb: string; perKg: string } | null {
  const info = getWeightPricing(product);
  if (!info) return null;
  return {
    perLb: info.perLb.toFixed(digits),
    perKg: info.perKg.toFixed(digits),
  };
}
