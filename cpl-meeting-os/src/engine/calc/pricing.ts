import type { Pricebook, Session, ComputeResult, ItemTemplate, PoolMetrics } from "../types";

function computePoolMetrics(session: Session): PoolMetrics {
  const l = Number(session.pool.length || 0);
  const w = Number(session.pool.width || 0);
  const ds = Number(session.pool.depthShallow || 0);
  const dd = Number(session.pool.depthDeep || 0);

  const avgDepth = (ds + dd) / 2;
  const surface = l * w;
  const perimeter = (l + w) * 2;
  const ia = surface + (perimeter * avgDepth); // matches your single-file build
  const gallons = Math.round(surface * avgDepth * 7.5);

  return { perimeter, surface, ia, gallons, avgDepth };
}

function pmt(principal: number, apr: number, termYears: number) {
  const n = Math.max(1, Math.round(termYears * 12));
  const r = Math.max(0, apr) / 12;
  if (principal <= 0) return 0;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

function monthlyFromTotal(total: number, apr: number, termYears: number) {
  return Math.round(pmt(total, apr, termYears));
}

function getSelected(item: ItemTemplate, session: Session) {
  const st = session.items[item.id] ?? {};
  return st.selected ?? item.defaultSelected ?? item.selectedByDefault ?? false;
}

function getQty(item: ItemTemplate, session: Session) {
  const st = session.items[item.id] ?? {};
  const v = st.qty ?? item.defaultQty ?? 1;
  return Number.isFinite(v) ? v : 1;
}

export function computeEstimate(pricebook: Pricebook, session: Session): ComputeResult {
  const poolBaseCfg = pricebook.poolBaseConfig;
  const poolMetrics = computePoolMetrics(session);

  const poolBaseEnabled = poolBaseCfg?.enabled ?? true;
  const poolBaseSelected = session.poolBaseSelected !== false; // default true

  let poolBase = 0;
  if (poolBaseEnabled && poolBaseSelected && session.mode !== "landscape" && poolBaseCfg) {
    // Mirrors the rule type 'pool_base' in your current single-file build
    poolBase = poolBaseCfg.basePrice;

    if (poolMetrics.surface > poolBaseCfg.surfaceThreshold) {
      poolBase += (poolMetrics.surface - poolBaseCfg.surfaceThreshold) * poolBaseCfg.surfaceOverage;
    }
    if (poolMetrics.perimeter > poolBaseCfg.perimeterThreshold) {
      poolBase += (poolMetrics.perimeter - poolBaseCfg.perimeterThreshold) * poolBaseCfg.perimeterOverage;
    }
    if (poolMetrics.avgDepth > poolBaseCfg.depthThreshold) {
      poolBase += (poolMetrics.avgDepth - poolBaseCfg.depthThreshold) * poolMetrics.perimeter * poolBaseCfg.depthRate;
    }
  }

  let total = poolBase;
  const lineItems: ComputeResult["breakdown"]["items"] = [];
  const requirements: ComputeResult["breakdown"]["requirements"] = [];


// collect requirements/recommendations implied by selected items
const itemById = new Map<string, ItemTemplate>();
for (const it of pricebook.items) itemById.set(it.id, it);

const isSelected = (id: string) => {
  const it = itemById.get(id);
  if (!it) {
    const st = (session.items as any)[id] ?? {};
    return !!st.selected;
  }
  return getSelected(it, session);
};

const reqSeen = new Set<string>();
for (const it of pricebook.items) {
  if (!getSelected(it, session)) continue;
  const reqs = (it as any).requires as Array<{ itemId: string; policy?: "required" | "recommended"; reason?: string }> | undefined;
  if (!reqs || !reqs.length) continue;
  for (const r of reqs) {
    if (!r?.itemId) continue;
    if (isSelected(r.itemId)) continue;
    const policy = r.policy ?? "required";
    const reason = r.reason ?? `${it.name} implies ${r.itemId}`;
    const key = `${policy}|${r.itemId}|${reason}`;
    if (reqSeen.has(key)) continue;
    reqSeen.add(key);
    requirements.push({ itemId: r.itemId, policy, reason });
  }
}

  for (const item of pricebook.items) {
    if (!getSelected(item, session)) continue;

    const basePrice = item.basePrice ?? item.price ?? 0;
    let lineTotal = basePrice;
    const qty = getQty(item, session);

    // starter behavior:
    // - each: basePrice
    // - sf/lf/percent/allowance: qty * basePrice (treat basePrice as per-unit for now)
    if (item.unit !== "each") {
      const pricePer = basePrice;
      lineTotal = qty * pricePer;
    }

    // options add deltas
    const st = session.items[item.id] ?? {};
    const selectedOptions = st.options ?? {};
    if (item.options) {
      for (const opt of item.options) {
        const val = selectedOptions[opt.id];
        if (opt.type === "toggle") {
          if (val === true) lineTotal += opt.priceDelta ?? 0;
        } else if (opt.type === "select") {
          const choice = opt.choices?.find(c => c.id === val);
          if (choice?.priceDelta) lineTotal += choice.priceDelta;
        } else if (opt.type === "qty") {
          const q = Number(val ?? 0);
          if (Number.isFinite(q) && q > 0) lineTotal += q * (opt.pricePerUnit ?? 0);
        }
      }
    }

    // requirements list (UI will later prompt accept/apply)
    if (item.requires) {
      for (const req of item.requires) {
        requirements.push({ itemId: req.itemId, policy: req.policy, reason: req.reason });
      }
    }

    total += lineTotal;
    lineItems.push({ itemId: item.id, name: item.name, lineTotal, detail: { qty } });
  }

  const totalLow = total;
  const totalHigh = total;

  const down = session.financing.downPayment ?? 0;
  const principalLow = Math.max(0, totalLow - down);
  const principalHigh = Math.max(0, totalHigh - down);
  const monthlyLow = monthlyFromTotal(principalLow, session.financing.apr, session.financing.termYears);
  const monthlyHigh = monthlyFromTotal(principalHigh, session.financing.apr, session.financing.termYears);

  return {
    totalLow,
    totalHigh,
    monthlyLow,
    monthlyHigh,
    breakdown: { poolBase, items: lineItems, requirements }
  };
}
