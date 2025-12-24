import { defineStore } from "pinia";
import { toRaw } from "vue";
import type { Session } from "@/engine/types";
import type { EngineResponse } from "@/engine/facade";

const worker = new Worker(new URL("@/worker/engine.worker.ts", import.meta.url), { type: "module" });

export const useSessionStore = defineStore("session", {
  state: () => ({
    session: {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      mode: "new",
      financing: { termYears: 20, apr: 0.08, downPayment: 0 },
      pool: { length: 28, width: 12, depthShallow: 3, depthDeep: 5 },
      poolBaseSelected: true,
      budgetTarget: { monthly: 0, total: 0 },
      priorities: {} as Record<string, any>,
      followup: { date: "", time: "", officeId: "" },
      items: {},
      visionTags: [],
      constraintsNotes: [],
      decisionLog: []
    } as Session,

    totalLow: 0,
    totalHigh: 0,
    monthlyLow: 0,
    monthlyHigh: 0,

    // engine breakdown helpers
    requirements: [] as Array<{ itemId: string; policy: "required" | "recommended"; reason: string }>,
    lineItems: [] as Array<{ itemId: string; name: string; lineTotal: number }>,
    suggestions: [] as Array<any>,
    timeline: null as any,

    lastError: "",
    lastComputeMs: 0
  }),

  actions: {
    hydrate(raw: any) {
      // best-effort merge; ignore invalid shapes
      if (!raw || typeof raw !== "object") return;
      const s: any = this.session;
      if (typeof raw.clientName === "string") s.clientName = raw.clientName;
      if (raw.mode === "new" || raw.mode === "remodel" || raw.mode === "landscape") s.mode = raw.mode;
      if (typeof raw.jurisdictionId === "string") s.jurisdictionId = raw.jurisdictionId;
      if (raw.financing && typeof raw.financing === "object") {
        s.financing = { ...s.financing, ...raw.financing };
      }
      if (raw.pool && typeof raw.pool === "object") {
        s.pool = { ...s.pool, ...raw.pool };
      }
      if (typeof raw.poolBaseSelected === "boolean") s.poolBaseSelected = raw.poolBaseSelected;
      if (raw.items && typeof raw.items === "object") s.items = raw.items;
      if (raw.followup && typeof raw.followup === "object") s.followup = { ...s.followup, ...raw.followup };
      if (raw.budgetTarget && typeof raw.budgetTarget === "object") s.budgetTarget = { ...s.budgetTarget, ...raw.budgetTarget };
      if (raw.priorities && typeof raw.priorities === "object") s.priorities = { ...raw.priorities };
      if (Array.isArray(raw.visionTags)) s.visionTags = raw.visionTags;
      if (Array.isArray(raw.constraintsNotes)) s.constraintsNotes = raw.constraintsNotes;
      if (Array.isArray(raw.decisionLog)) s.decisionLog = raw.decisionLog;
    },

    bindWorker() {
      worker.onmessage = (ev: MessageEvent<EngineResponse>) => {
        const msg = ev.data;
        if (msg.type === "error") {
          this.lastError = msg.message;
          return;
        }
        if (msg.type === "computeResult") {
          this.totalLow = msg.result.totalLow;
          this.totalHigh = msg.result.totalHigh;
          this.monthlyLow = msg.result.monthlyLow;
          this.monthlyHigh = msg.result.monthlyHigh;
          this.requirements = (msg.result.breakdown?.requirements ?? []) as any;
          this.lineItems = ((msg.result.breakdown?.items ?? []) as any).map((x:any)=>({ itemId: x.itemId, name: x.name, lineTotal: x.lineTotal }));
          this.suggestions = (msg.result.breakdown?.suggestions ?? []) as any;
          this.timeline = (msg.result.breakdown?.timeline ?? null) as any;
          this.lastError = "";
        }
      };
    },

    applyPackage(pkg: any, pricebook: any) {
      if (!pkg) return;
      if (pkg.mode) this.session.mode = pkg.mode;
      for (const a of (pkg.apply ?? [])) {
        const id = a.itemId;
        if (!id) continue;
        if (!this.session.items[id]) this.session.items[id] = { selected: false, qty: 0, options: {} } as any;
        if (typeof a.selected === "boolean") this.session.items[id].selected = a.selected;
        if (typeof a.qty === "number") this.session.items[id].qty = a.qty;
        if (a.options && typeof a.options === "object") this.session.items[id].options = { ...(this.session.items[id].options || {}), ...a.options };
      }
      // Keep base pool toggle in sync if the package touches it
      if (typeof pkg.apply?.find?.((x:any)=>x.itemId === "base_pool")?.selected === "boolean") {
        this.session.poolBaseSelected = !!pkg.apply.find((x:any)=>x.itemId === "base_pool").selected;
      }
      this.compute(pricebook);
    },

    compute(pricebook: any) {
      if (!pricebook) return;
      const t0 = performance.now();

      // Pinia/Vue store objects are reactive Proxies; Web Workers can't structured-clone Proxies.
      // Convert to plain JSON-safe objects before postMessage.
      const pb = JSON.parse(JSON.stringify(toRaw(pricebook)));
      const sess = JSON.parse(JSON.stringify(toRaw(this.session)));

      worker.postMessage({ type: "compute", pricebook: pb, session: sess });
      this.lastComputeMs = Math.round(performance.now() - t0);
    },

    setMode(mode: Session["mode"]) {
      this.session.mode = mode;
    },

    setClientName(name: string) {
      this.session.clientName = name;
    },

    setJurisdiction(id: string) {
      this.session.jurisdictionId = id;
    },

    setPoolBaseSelected(selected: boolean) {
      this.session.poolBaseSelected = selected;
    },

    setPoolField<K extends keyof Session["pool"]>(key: K, value: Session["pool"][K]) {
      this.session.pool = { ...this.session.pool, [key]: value };
    },

    setItemSelected(id: string, selected: boolean) {
      const prev = this.session.items[id] ?? {};
      this.session.items[id] = { ...prev, selected };
    },

    setItemQty(id: string, qty: number) {
      const prev = this.session.items[id] ?? {};
      this.session.items[id] = { ...prev, qty };
    },

    setItemOption(itemId: string, optionId: string, value: any) {
      const prev = this.session.items[itemId] ?? {};
      const opts = { ...(prev.options ?? {}) };
      opts[optionId] = value;
      this.session.items[itemId] = { ...prev, options: opts };
    },

    setItemPriority(id: string, priority: any) {
      const prev = this.session.items[id] ?? {};
      this.session.items[id] = { ...prev, priority };
    },

    setFollowup<K extends keyof Session["followup"]>(key: K, value: Session["followup"][K]) {
      this.session.followup = { ...this.session.followup, [key]: value };
    },

    setBudgetTarget(type: "monthly" | "total", value: number) {
      this.session.budgetTarget = { ...this.session.budgetTarget, [type]: Number(value || 0) };
    }
  }
});
