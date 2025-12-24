import type { BudgetTarget, Pricebook, Session } from "../types";
import { computeEstimate } from "../calc/pricing";

export function suggestBudgetMoves(pricebook: Pricebook, session: Session, target: BudgetTarget) {
  const current = computeEstimate(pricebook, session);
  const currentValue = target.type === "total" ? current.totalHigh : current.monthlyHigh;

  const delta = currentValue - target.value;
  const closeBand = Math.max(250, target.value * 0.05);

  if (Math.abs(delta) <= closeBand) return { status: "close" as const, delta, moves: [] };
  if (delta < 0) return { status: "under" as const, delta, moves: [] };

  const moves: Array<{ label: string; apply: any; savings: number }> = [];

  for (const item of pricebook.items) {
    const st = session.items[item.id] ?? {};
    const priority = st.priority ?? item.priorityDefault ?? "optional";
    if (priority === "must" || priority === "locked") continue;

    const selected = st.selected ?? item.defaultSelected ?? false;
    if (!selected) continue;

    if (!item.adjustable) continue;

    const qty = Number(st.qty ?? item.defaultQty ?? 0);
    const step = item.adjustable.step;
    const next = qty - step;
    if (!Number.isFinite(qty) || next < item.adjustable.min) continue;

    const unitPrice = item.basePrice ?? 0;
    const savings = unitPrice * step;

    moves.push({
      label: `Reduce ${item.name} by ${step} ${item.unit}`,
      apply: { itemId: item.id, patch: { qty: next } },
      savings
    });
  }

  moves.sort((a, b) => b.savings - a.savings);
  return { status: "over" as const, delta, moves: moves.slice(0, 8) };
}
