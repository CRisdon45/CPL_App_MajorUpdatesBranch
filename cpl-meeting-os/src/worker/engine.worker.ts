/// <reference lib="webworker" />
import { ZPricebook } from "@/engine/schemas";
import type { EngineRequest, EngineResponse } from "@/engine/facade";
import { computeEstimate } from "@/engine/calc/pricing";
import { suggestBudgetMoves } from "@/engine/optimizer/budgetFit";

function deriveRequirements(session: any, pricebook: any) {
  const reqs: Array<any> = [];
  const itemsById = new Map<string, any>();
  for (const it of (pricebook?.items ?? [])) itemsById.set(it.id, it);
  const selectedIds = new Set<string>();
  for (const [id, st] of Object.entries(session?.items ?? {})) {
    if ((st as any)?.selected) selectedIds.add(id);
  }
  if (session?.poolBaseSelected) selectedIds.add("base_pool");

  for (const id of Array.from(selectedIds)) {
    const it = itemsById.get(id);
    if (!it) continue;
    const requires = it.requires ?? [];
    for (const r of requires) {
      if (!r?.itemId) continue;
      if (selectedIds.has(r.itemId)) continue;
      reqs.push({ itemId: r.itemId, policy: r.policy || "recommended", reason: r.reason || `Triggered by ${it.name}` });
    }
  }
  return reqs;
}

function computeTimeline(session: any, pricebook: any) {
  const templates = pricebook?.timeline?.templates ?? [];
  const tpl = templates.find((t:any)=> (t.jurisdictions ?? []).includes("*")) || templates[0];
  if (!tpl) return null;
  const phases = (tpl.phases ?? []).map((p:any)=>({ ...p, totalDays: p.days }));
  const selectedIds = new Set<string>();
  for (const [id, st] of Object.entries(session?.items ?? {})) if ((st as any)?.selected) selectedIds.add(id);
  if (session?.poolBaseSelected) selectedIds.add("base_pool");

  for (const adj of (tpl.adjustments ?? [])) {
    const anyItems = adj?.when?.anyItems ?? [];
    if (!anyItems.some((x:string)=>selectedIds.has(x))) continue;
    const ph = phases.find((p:any)=>p.id === adj.phase);
    if (ph) ph.totalDays += (adj.deltaDays || 0);
  }
  let day=0;
  const out = phases.map((p:any)=>{
    const start=day;
    const len=Math.max(0, p.totalDays || p.days || 0);
    day += len;
    return { ...p, startDay: start, endDay: day };
  });
  return { templateId: tpl.id, totalDays: day, phases: out };
}

function computeFitSuggestions(session: any, breakdownItems: any[], totals: any) {
  const suggestions: any[] = [];
  const targetMonthly = session?.budgetTarget?.monthly || 0;
  const targetTotal = session?.budgetTarget?.total || 0;

  const totalBase = totals.totalLow || totals.totalHigh || 0;
  const monthlyBase = totals.monthlyLow || totals.monthlyHigh || 0;
  const ratio = totalBase > 0 ? (monthlyBase / totalBase) : 0;

  if (targetMonthly > 0) {
    const over = (totals.monthlyLow || 0) - targetMonthly;
    if (over > 1) {
      const deckState = session?.items?.decking;
      const deckQty = deckState?.qty ?? 0;
      const decking = breakdownItems.find(x=>x.itemId === "decking");
      if (decking && deckQty > 300) {
        const reduceBy = Math.min(200, deckQty - 300);
        const unitPrice = decking.unitPrice ?? (decking.lineTotal / Math.max(1, deckQty));
        const saveTotal = reduceBy * unitPrice;
        const saveMonthly = saveTotal * ratio;
        suggestions.push({ kind:"lever", title:`Reduce decking by ${reduceBy} sf`, impactMonthly: -saveMonthly, impactTotal: -saveTotal, apply:{ itemId:"decking", qty: deckQty - reduceBy }, why:"Fast lever without changing core scope." });
      }

      const priorities = session?.priorities ?? {};
      const removable = breakdownItems
        .filter(x=>x.itemId !== "base_pool")
        .filter(x=> (priorities[x.itemId] || "nice") !== "must")
        .sort((a,b)=> (b.lineTotal||0)-(a.lineTotal||0));

      for (const it of removable.slice(0,3)) {
        const saveTotal = it.lineTotal || 0;
        const saveMonthly = saveTotal * ratio;
        suggestions.push({ kind:"remove", title:`Consider removing ${it.name}`, impactMonthly:-saveMonthly, impactTotal:-saveTotal, apply:{ itemId: it.itemId, selected:false }, why:"Marked as non‑must to hit target." });
      }
    }
  }

  if (targetTotal > 0) {
    const over = (totals.totalLow || 0) - targetTotal;
    if (over > 50) suggestions.push({ kind:"target", title:`Over target by ~${Math.round(over).toLocaleString()}`, impactTotal:-over });
  }
  return suggestions;
}

self.onmessage = (ev: MessageEvent<EngineRequest>) => {
  try {
    const msg = ev.data;
    const parsed = ZPricebook.safeParse(msg.pricebook);
    if (!parsed.success) {
      const res: EngineResponse = { type: "error", message: "Invalid pricebook schema." };
      postMessage(res);
      return;
    }

    if (msg.type === "compute") {
      const result = computeEstimate(parsed.data, msg.session);
      // enrich breakdown with timeline + fit suggestions (best-effort)
      const timeline = computeTimeline(msg.session, parsed.data);
      const suggestions = computeFitSuggestions(msg.session, result.breakdown.items, {
        totalLow: result.totalLow,
        totalHigh: result.totalHigh,
        monthlyLow: result.monthlyLow,
        monthlyHigh: result.monthlyHigh
      });
      result.breakdown.timeline = timeline;
      result.breakdown.suggestions = suggestions;
      const res: EngineResponse = { type: "computeResult", result };
      postMessage(res);
      return;
    }

    if (msg.type === "budgetSuggest") {
      const r = suggestBudgetMoves(parsed.data, msg.session, msg.target);
      const res: EngineResponse = { type: "budgetSuggestResult", ...r };
      postMessage(res);
      return;
    }

    const res: EngineResponse = { type: "error", message: "Unknown request type." };
    postMessage(res);
  } catch (e: any) {
    const res: EngineResponse = { type: "error", message: e?.message ?? "Engine error" };
    postMessage(res);
  }
};
