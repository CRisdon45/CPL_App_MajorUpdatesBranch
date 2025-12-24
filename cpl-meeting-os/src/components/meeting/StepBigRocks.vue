<template>
  <div>
    <div style="font-weight:700;">Big Rocks</div>
    <div class="small muted">Pick direction first; details later. (Packages will plug in here.)</div>

    <div class="grid2" style="margin-top:12px;">
      <div class="paper card">
        <div style="font-weight:700;">Quick Adds (demo)</div>
        <div class="small muted">Tap to toggle. (Later: bottom-sheet editors.)</div>
        <div class="rule" style="margin:12px 0;"></div>
        <div v-for="it in quick" :key="it.id" class="row" style="padding: 8px 0;">
          <div>
            <div style="font-weight:700;">{{ it.name }}</div>
            <div class="small muted">{{ it.unit.toUpperCase() }} • Base {{ money(it.basePrice || 0) }}</div>
          </div>
          <button class="btn" :class="{primary: isSel(it.id)}" @click="toggle(it.id)">{{ isSel(it.id) ? "ON" : "OFF" }}</button>
        </div>
      </div>

      <div class="paper card">
        <div style="font-weight:700;">Must / Nice / Locked (demo)</div>
        <div class="small muted">Later this feeds the budget optimizer.</div>
        <div class="rule" style="margin:12px 0;"></div>

        <div v-for="it in quick" :key="it.id" style="padding: 8px 0;">
          <div class="row">
            <div style="font-weight:700;">{{ it.name }}</div>
            <select class="input" style="max-width:220px;" :value="priority(it.id)" @change="setPriority(it.id, ($event.target as HTMLSelectElement).value)">
              <option value="optional">Optional</option>
              <option value="nice">Nice</option>
              <option value="must">Must</option>
              <option value="locked">Locked</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="small muted" style="margin-top:10px;">
      Next: replace this “demo” with your real Packages + Quick Adds JSON.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useConfigStore } from "@/store/configStore";
import { useSessionStore } from "@/store/sessionStore";

const cfg = useConfigStore();
const s = useSessionStore();
const items = computed(() => cfg.pricebook?.items ?? []);
const quick = computed(() => items.value.slice(0, 6));

function isSel(id: string){
  const item = items.value.find(i => i.id === id);
  const st = s.session.items[id] ?? {};
  return st.selected ?? item?.defaultSelected ?? false;
}
function toggle(id: string){
  s.setItemSelected(id, !isSel(id));
  s.compute(cfg.pricebook);
}
function priority(id: string){
  const item = items.value.find(i => i.id === id);
  const st = s.session.items[id] ?? {};
  return st.priority ?? item?.priorityDefault ?? "optional";
}
function setPriority(id: string, p: any){
  s.setItemPriority(id, p);
}
function money(n: number){
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
</script>
