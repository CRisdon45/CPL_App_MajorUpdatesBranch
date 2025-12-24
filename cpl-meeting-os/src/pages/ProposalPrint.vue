<template>
  <main class="main">
    <div class="paper card">
      <div style="font-weight:700; font-size:16px;">Client Summary (print view - starter)</div>
      <div class="small muted">This will become: scope + options + warranties + next meeting.</div>
      <div class="rule" style="margin:12px 0;"></div>

      <div class="grid2">
        <div>
          <div class="small muted">Client</div>
          <div style="font-weight:700;">{{ s.session.clientName || "—" }}</div>
          <div class="small muted" style="margin-top:10px;">Mode</div>
          <div style="font-weight:700;">{{ s.session.mode }}</div>
        </div>
        <div>
          <div class="small muted">Estimate</div>
          <div style="font-weight:700;">{{ money(s.totalLow) }} – {{ money(s.totalHigh) }}</div>
          <div class="small muted">Monthly</div>
          <div style="font-weight:700;">{{ money(s.monthlyLow) }} – {{ money(s.monthlyHigh) }}/mo</div>
        </div>
      </div>

      <div class="rule" style="margin:12px 0;"></div>

      <div style="font-weight:700;">Vision tags</div>
      <div class="small">{{ s.session.visionTags.join(", ") || "—" }}</div>

      <div class="rule" style="margin:12px 0;"></div>

      <div style="font-weight:700;">Selected items (current calc)</div>
      <ul style="margin:8px 0 0 18px;">
        <li v-for="li in selected" :key="li.itemId" class="small">{{ li.name }} — {{ money(li.lineTotal) }}</li>
      </ul>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSessionStore } from "@/store/sessionStore";
import { useConfigStore } from "@/store/configStore";
import { computeEstimate } from "@/engine/calc/pricing";

const s = useSessionStore();
const cfg = useConfigStore();

const offices = computed(() => cfg.pricebook?.app?.offices ?? []);
const office = computed(() => offices.value.find((o:any)=>o.id === s.session.followup.officeId) || null);
const officeName = computed(() => office.value?.name || "—");
const officeAddress = computed(() => office.value?.address || "");

const selectedIds = computed(() => {
  const set = new Set<string>();
  for (const [id, st] of Object.entries(s.session.items ?? {})) if ((st as any)?.selected) set.add(id);
  if ((s.session as any).poolBaseSelected) set.add("base_pool");
  return set;
});

const warrantyDefs = computed(() => cfg.pricebook?.app?.warrantySnippets ?? []);
const warrantyList = computed(() => {
  return warrantyDefs.value.filter((w:any) => {
    const anyItems = w?.when?.anyItems ?? [];
    return anyItems.some((id:string)=> selectedIds.value.has(id));
  });
});

const selected = computed(() => {
  if (!cfg.pricebook) return [];
  const r = computeEstimate(cfg.pricebook, s.session);
  return r.breakdown.items.filter(x => x.lineTotal > 0);
});

function money(n: number){
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
</script>
