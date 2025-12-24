<template>
  <div class="page">
    <div class="header">
      <div class="brand">{{ cfg.pricebook?.app?.companyName || "CPL" }}</div>
      <div class="muted">Timeline (Estimated)</div>
    </div>

    <div class="section">
      <h2>Project Timeline</h2>
      <div class="muted">Planning estimate. Adjusts as scope, jurisdiction, and scheduling are confirmed.</div>

      <div v-if="s.timeline" class="timeline" style="margin-top:12px;">
        <div v-for="p in s.timeline.phases" :key="p.id" class="timeline-row">
          <div class="timeline-label">{{ p.name }}</div>
          <div class="timeline-barwrap">
            <div class="timeline-bar" :style="{ left: (p.startDay / s.timeline.totalDays * 100) + '%', width: ((p.endDay - p.startDay) / s.timeline.totalDays * 100) + '%' }"></div>
          </div>
          <div class="timeline-days">{{ p.totalDays }}d</div>
        </div>
        <div class="muted" style="margin-top:10px;">Total: ~{{ s.timeline.totalDays }} days</div>
      </div>

      <div v-else class="muted" style="margin-top:10px;">No timeline available yet.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from "@/store/sessionStore";
import { useConfigStore } from "@/store/configStore";
const s = useSessionStore();
const cfg = useConfigStore();
</script>

<style scoped>
.page { padding:24px; background:#111; color:#f0e9d6; min-height:100vh; }
.header { display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(179,149,89,0.65); padding-bottom:10px; }
.brand { font-weight:800; letter-spacing:0.08em; }
.section { margin-top:18px; padding:14px; border:1px solid rgba(179,149,89,0.35); }
.muted { color: rgba(240,233,214,0.75); }
.timeline { display:flex; flex-direction:column; gap:10px; }
.timeline-row { display:grid; grid-template-columns: 240px 1fr 44px; gap:10px; align-items:center; }
.timeline-label { font-size:13px; }
.timeline-barwrap { position:relative; height:10px; border:1px solid rgba(179,149,89,0.35); }
.timeline-bar { position:absolute; top:0; bottom:0; background: rgba(179,149,89,0.35); }
.timeline-days { text-align:right; font-size:12px; color: rgba(240,233,214,0.85); }
</style>