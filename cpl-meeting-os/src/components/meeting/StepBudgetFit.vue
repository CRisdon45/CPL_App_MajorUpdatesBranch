<template>
  <div>
    <div style="font-weight:700;">Budget Fit</div>
    <div class="small muted">Enter a target and get clean suggestions. (Starter version)</div>

    <div class="grid2" style="margin-top:12px;">
      <div>
        <div class="small muted">Target type</div>
        <select class="input" v-model="targetType">
          <option value="monthly">Monthly</option>
          <option value="total">Total</option>
        </select>
      </div>
      <div>
        <div class="small muted">Target value</div>
        <input class="input" type="number" v-model.number="targetValue" />
      </div>
    </div>

    <div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
      <button class="btn primary" @click="run()">SUGGEST MOVES</button>
      <button class="btn" @click="applyFirst()" :disabled="moves.length===0">APPLY #1</button>
    </div>

    <div v-if="status" style="margin-top:12px;">
      <div class="chip"><span class="muted">Status</span> <strong>{{ status }}</strong></div>
      <div class="chip" style="margin-left:8px;"><span class="muted">Delta</span> <strong>{{ money(Math.round(delta)) }}</strong></div>
    </div>

    <div v-if="moves.length" style="margin-top:12px;">
      <div class="small muted">Top moves</div>
      <div class="paper card" style="margin-top:8px;">
        <div v-for="m in moves" :key="m.label" class="row" style="padding:8px 0;">
          <div>
            <div style="font-weight:700;">{{ m.label }}</div>
            <div class="small muted">Saves ~{{ money(m.savings) }}</div>
          </div>
          <button class="btn" @click="apply(m.apply)">APPLY</button>
        </div>
      </div>
    </div>

    <div class="small muted" style="margin-top:10px;">
      Next upgrade: pool/deck levers + tier swaps + explain-why.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useConfigStore } from "@/store/configStore";
import { useSessionStore } from "@/store/sessionStore";
import type { EngineResponse } from "@/engine/facade";

const cfg = useConfigStore();
const s = useSessionStore();

const targetType = ref<"monthly"|"total">("monthly");
const targetValue = ref<number>(450);

const status = ref<string>("");
const delta = ref<number>(0);
const moves = ref<Array<{ label: string; apply: any; savings: number }>>([]);

const worker = new Worker(new URL("@/worker/engine.worker.ts", import.meta.url), { type: "module" });
worker.onmessage = (ev: MessageEvent<EngineResponse>) => {
  const msg = ev.data;
  if (msg.type === "budgetSuggestResult") {
    status.value = msg.status;
    delta.value = msg.delta;
    moves.value = msg.moves;
  }
};

function run(){
  if (!cfg.pricebook) return;
  worker.postMessage({ type: "budgetSuggest", pricebook: cfg.pricebook, session: s.session, target: { type: targetType.value, value: targetValue.value } });
}
function apply(applyObj: any){
  const { itemId, patch } = applyObj ?? {};
  if (!itemId || !patch) return;
  if (typeof patch.qty === "number") s.setItemQty(itemId, patch.qty);
  s.compute(cfg.pricebook);
}
function applyFirst(){
  if (!moves.value.length) return;
  apply(moves.value[0].apply);
}
function money(n: number){
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
</script>
