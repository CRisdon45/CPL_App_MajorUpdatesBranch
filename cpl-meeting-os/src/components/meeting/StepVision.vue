<template>
  <div>
    <div class="row">
      <div>
        <div style="font-weight:700;">Vision</div>
        <div class="small muted">What should this yard feel like?</div>
      </div>
      <div class="small muted">Keep it big picture.</div>
    </div>

    <div class="grid2" style="margin-top:12px;">
      <div>
        <div class="small muted">Client name</div>
        <input class="input" v-model="client" placeholder="Client name..." />
      </div>
      <div>
        <div class="small muted">Mode</div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn" :class="{primary: mode==='new'}" @click="setMode('new')">New</button>
          <button class="btn" :class="{primary: mode==='remodel'}" @click="setMode('remodel')">Remodel</button>
          <button class="btn" :class="{primary: mode==='landscape'}" @click="setMode('landscape')">Landscape</button>
        </div>
      </div>
    </div>

    <div class="rule" style="margin: 12px 0;"></div>

    <div>
      <div class="small muted">Vision tags (tap to add/remove)</div>
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
        <button v-for="t in all" :key="t" class="btn" :class="{primary: tags.includes(t)}" @click="toggle(t)">{{ t }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSessionStore } from "@/store/sessionStore";

const s = useSessionStore();
const client = computed({
  get: () => s.session.clientName ?? "",
  set: (v) => s.setClientName(v)
});
const mode = computed(() => s.session.mode);
function setMode(m: any){ s.setMode(m); }

const all = ["Entertain", "Relax", "Kids", "Low Maintenance", "Resort", "Modern", "Natural Stone"];
const tags = computed(() => s.session.visionTags);

function toggle(t: string){
  const set = new Set(tags.value);
  if (set.has(t)) set.delete(t); else set.add(t);
  s.session.visionTags = Array.from(set);
}
</script>
