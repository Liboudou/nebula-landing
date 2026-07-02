const PLANS = { starter: 9, pro: 29, enterprise: 99 }

export function price(plan, cycle) {
  const base = PLANS[plan]
  if (base === undefined) throw new Error(`Unknown plan: ${plan}`)
  if (cycle === "annual") return Math.round(base * 0.8 * 100) / 100
  return base
}

export function formatPrice(n) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2 }).replace(/\u202f/g, " ") + " €"
}
