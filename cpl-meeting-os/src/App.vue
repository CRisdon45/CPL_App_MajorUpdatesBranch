<template>
  <div class="shell">
    <header class="header">
      <div class="header-inner">
        <div>
          <div class="brand">CALIFORNIA POOLS &amp; LANDSCAPE</div>
          <div class="small">Meeting OS (starter)</div>
        </div>

        <div class="total">
          <div class="small">TOTAL ESTIMATE</div>
          <strong>{{ money(totalLow) }} – {{ money(totalHigh) }}</strong>
          <div class="small">Monthly: <span class="kpi">{{ money(monthlyLow) }} – {{ money(monthlyHigh) }}</span></div>
        </div>
      </div>
    </header>

    <router-view />

    <div class="footerbar">
      <div>
        <div class="small">EST. MONTHLY ({{ financing.termYears }}y)</div>
        <strong>{{ money(monthlyLow) }} – {{ money(monthlyHigh) }}/mo</strong>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn" @click="go('/workflow')">WORKFLOW</button>
        <button class="btn" @click="go('/estimate')">ESTIMATE</button>
        <button class="btn" @click="go('/admin')">ADMIN</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useSessionStore } from "@/store/sessionStore";

const r = useRouter();
const s = useSessionStore();

const totalLow = computed(() => s.totalLow);
const totalHigh = computed(() => s.totalHigh);
const monthlyLow = computed(() => s.monthlyLow);
const monthlyHigh = computed(() => s.monthlyHigh);
const financing = computed(() => s.session.financing);

function go(path: string){ r.push(path); }
function money(n: number){
  const v = Number.isFinite(n) ? n : 0;
  return v.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
</script>
