<template>
  <div>
    <div style="font-weight:700;">Constraints</div>
    <div class="small muted">Jurisdiction, access, HOA notes — just the meaningful bullets.</div>

    <div class="grid2" style="margin-top:12px;">
      <div>
        <div class="small muted">Jurisdiction</div>
        <select class="input" v-model="jur">
          <option value="">Select…</option>
          <option v-for="j in jurisdictions" :key="j.id" :value="j.id">{{ j.label }}</option>
        </select>
        <div v-if="jurObj" style="margin-top:10px;">
          <div class="small muted">Key bullets</div>
          <ul style="margin: 8px 0 0 18px;">
            <li v-for="b in jurObj.bullets" :key="b" class="small">{{ b }}</li>
          </ul>
        </div>
      </div>

      <div>
        <div class="small muted">Notes</div>
        <textarea class="input" style="min-height:130px;" v-model="notes" placeholder="Gate access, grade, utilities, HOA, etc."></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSessionStore } from "@/store/sessionStore";
import { useConfigStore } from "@/store/configStore";

const s = useSessionStore();
const cfg = useConfigStore();

const jurisdictions = computed(() => cfg.pricebook?.jurisdictions ?? []);
const jur = computed({
  get: () => s.session.jurisdictionId ?? "",
  set: (v) => s.setJurisdiction(v || "")
});
const jurObj = computed(() => jurisdictions.value.find(j => j.id === jur.value));

const notes = computed({
  get: () => s.session.constraintsNotes.join("\n"),
  set: (v) => { s.session.constraintsNotes = v.split(/\r?\n/).filter(Boolean); }
});
</script>
