<template>
  <div>
    <div style="font-weight:700;">Wrap</div>
    <div class="small muted">Set the follow‑up, then open the client-friendly prints.</div>

    <div class="paper card" style="margin-top:12px;">
      <div style="font-weight:700;">Follow‑up Meeting</div>
      <div class="small muted">This prints onto the proposal.</div>

      <div class="grid2" style="margin-top:10px;">
        <div>
          <div class="small muted">Date</div>
          <input class="input" type="date" :value="s.session.followup.date" @input="e=>s.setFollowup('date', (e as any).target.value)" />
        </div>
        <div>
          <div class="small muted">Time</div>
          <input class="input" type="time" :value="s.session.followup.time" @input="e=>s.setFollowup('time', (e as any).target.value)" />
        </div>
      </div>

      <div style="margin-top:10px;">
        <div class="small muted">Office</div>
        <select class="input" :value="s.session.followup.officeId" @change="e=>s.setFollowup('officeId', (e as any).target.value)">
          <option value="">Select office…</option>
          <option v-for="o in offices" :key="o.id" :value="o.id">{{ o.name }}</option>
        </select>
      </div>
    </div>

    <div style="display:flex; gap:8px; margin-top:12px; flex-wrap:wrap;">
      <button class="btn" @click="go('/print/proposal')">OPEN PROPOSAL (PRINT)</button>
      <button class="btn" @click="go('/print/timeline')">OPEN TIMELINE (PRINT)</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useSessionStore } from "@/store/sessionStore";
import { useConfigStore } from "@/store/configStore";

const r = useRouter();
const s = useSessionStore();
const cfg = useConfigStore();

const offices = computed(() => cfg.pricebook?.app?.offices ?? []);

function go(path: string){ r.push(path); }
</script>
