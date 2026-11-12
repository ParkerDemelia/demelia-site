// Which Notion expenses belong to the van. No Notion import here, so client components can use it too.

type Tagged = { category: string; expense: string; amount: number; earned: number }

// Notion multi-select comes through as "a, b" — match "van" anywhere in it.
export function isVanExpense(e: Pick<Tagged, "category">) {
  return e.category
    .toLowerCase()
    .split(",")
    .some((c) => c.trim() === "van")
}

// Living in it rather than building it: gas, food, the monthly Starlink bill.
export function isRunningCost(e: Pick<Tagged, "expense">) {
  return /\bgas\b|grocer|food|month/i.test(e.expense)
}

export const net = (e: Pick<Tagged, "amount" | "earned">) => (e.amount || 0) - (e.earned || 0)
