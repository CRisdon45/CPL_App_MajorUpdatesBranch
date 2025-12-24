<template>
  <main class="main">
    <div class="paper card">
      <div style="font-weight:800; font-size:16px;">Project Timeline</div>
      <div class="small muted">Planning estimate. Adjusts as scope, jurisdiction, and scheduling are confirmed.</div>

      <div class="rule" style="margin:12px 0;"></div>

      <div v-if="s.timeline" class="timeline">
        <div v-for="p in s.timeline.phases" :key="p.id" class="timeline-row">
          <div class="timeline-label">{{ p.name }}</div>
          <div class="timeline-barwrap">
            <div class="timeline-bar" :style="{ left: (p.startDay / s.timeline.totalDays * 100) + '%', width: ((p.endDay - p.startDay) / s.timeline.totalDays * 100) + '%' }"></div>
          </div>
          <div class="timeline-days">{{ p.totalDays }}d</div>
        </div>
        <div class="small muted" style="margin-top:10px;">Total: ~{{ s.timeline.totalDays }} days</div>
      </div>

      <div v-else class="small muted" style="margin-top:10px;">No timeline available yet.</div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useSessionStore } from "@/store/sessionStore";
const s = useSessionStore();
</script>

<style scoped>
.main { padding:16px; }
.timeline { display:flex; flex-direction:column; gap:10px; }
.timeline-row { display:grid; grid-template-columns: 240px 1fr 44px; gap:10px; align-items:center; }
.timeline-label { font-size:13px; }
.timeline-barwrap { position:relative; height:10px; border:1px solid rgba(179,149,89,0.35); }
.timeline-bar { position:absolute; top:0; bottom:0; background: rgba(179,149,89,0.35); }
.timeline-days { text-align:right; font-size:12px; color: rgba(240,233,214,0.85); }
</style>