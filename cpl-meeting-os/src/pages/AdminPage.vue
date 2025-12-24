<template>
  <main class="main">
    <div class="paper card">
      <div class="row">
        <div>
          <div style="font-weight:700;">Admin</div>
          <div class="small muted">Pricebook toggles + imports will live here.</div>
        </div>
        <div class="small muted">Schema v{{ cfg.pricebook?.schemaVersion ?? "-" }}</div>
      </div>

      <div class="rule" style="margin:12px 0;"></div>

      <div class="grid2">
        <div>
          <div style="font-weight:700;">Pool Base</div>
          <div class="small muted">Turns base price on/off (starter).</div>

          <div style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;">
            <button class="btn" :class="{primary: poolBaseEnabled}" @click="setPoolBase(true)">ON</button>
            <button class="btn" :class="{primary: !poolBaseEnabled}" @click="setPoolBase(false)">OFF</button>
          </div>

          <div class="small muted" style="margin-top:10px;">Base price</div>
          <input class="input" type="number" :value="poolBasePrice" @input="setField('basePrice', ($event.target as HTMLInputElement).valueAsNumber)" />

          <div class="grid2" style="margin-top:10px;">
            <div>
              <div class="small muted">Surface threshold (sf)</div>
              <input class="input" type="number" :value="poolBase.surfaceThreshold" @input="setField('surfaceThreshold', ($event.target as HTMLInputElement).valueAsNumber)" />
            </div>
            <div>
              <div class="small muted">Surface overage ($/sf)</div>
              <input class="input" type="number" :value="poolBase.surfaceOverage" @input="setField('surfaceOverage', ($event.target as HTMLInputElement).valueAsNumber)" />
            </div>
          </div>

          <div class="grid2" style="margin-top:10px;">
            <div>
              <div class="small muted">Perimeter threshold (lf)</div>
              <input class="input" type="number" :value="poolBase.perimeterThreshold" @input="setField('perimeterThreshold', ($event.target as HTMLInputElement).valueAsNumber)" />
            </div>
            <div>
              <div class="small muted">Perimeter overage ($/lf)</div>
              <input class="input" type="number" :value="poolBase.perimeterOverage" @input="setField('perimeterOverage', ($event.target as HTMLInputElement).valueAsNumber)" />
            </div>
          </div>

          <div class="grid2" style="margin-top:10px;">
            <div>
              <div class="small muted">Depth threshold (avg ft)</div>
              <input class="input" type="number" :value="poolBase.depthThreshold" @input="setField('depthThreshold', ($event.target as HTMLInputElement).valueAsNumber)" />
            </div>
            <div>
              <div class="small muted">Depth rate ($/lf/ft)</div>
              <input class="input" type="number" :value="poolBase.depthRate" @input="setField('depthRate', ($event.target as HTMLInputElement).valueAsNumber)" />
            </div>
          </div>

          <div class="small muted" style="margin-top:10px;">Note (optional)</div>
          <input class="input" :value="poolBase.note ?? ''" @input="setNote(($event.target as HTMLInputElement).value)" />
        </div>

        <div>
          <div style="font-weight:700;">Debug</div>
          <div class="small muted">Config load / compute info</div>
          <div class="rule" style="margin:12px 0;"></div>
          <div class="small">Loaded: <strong>{{ cfg.loaded }}</strong></div>
          <div class="small">Compute ms (dispatch): <strong>{{ session.lastComputeMs }}</strong></div>
          <div class="small" v-if="cfg.error">Config error: <strong>{{ cfg.error }}</strong></div>
          <div class="small" v-if="session.lastError">Engine error: <strong>{{ session.lastError }}</strong></div>
        </div>
      </div>
    </div>

    <div class="paper card">
      <div style="font-weight:700;">Import/Export</div>
      <div class="small muted">Plain readable JSON that round-trips cleanly.</div>

      <div class="rule" style="margin:12px 0;"></div>

      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn" @click="exportAll()">EXPORT FULL JSON</button>
        <button class="btn" @click="importAll()">IMPORT JSON</button>
        <button class="btn" @click="resetDefault()">RESET TO DEFAULT</button>
      </div>

      <textarea class="input" v-model="ioText" rows="10" style="margin-top:10px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;"></textarea>
      <div class="small muted" style="margin-top:8px;">Tip: exports are pretty-printed and safe to edit.</div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useConfigStore } from "@/store/configStore";
import { useSessionStore } from "@/store/sessionStore";

const cfg = useConfigStore();
const session = useSessionStore();

const ioText = ref("");

const poolBaseEnabled = computed(() => cfg.pricebook?.poolBaseConfig?.enabled ?? true);
const poolBasePrice = computed(() => cfg.pricebook?.poolBaseConfig?.basePrice ?? 0);

const poolBase = computed(() => cfg.pricebook?.poolBaseConfig ?? {
  enabled: true,
  basePrice: 0,
  surfaceThreshold: 0,
  surfaceOverage: 0,
  perimeterThreshold: 0,
  perimeterOverage: 0,
  depthThreshold: 0,
  depthRate: 0,
  note: ""
});

function setPoolBase(enabled: boolean){
  if (!cfg.pricebook) return;
  const current = cfg.pricebook.poolBaseConfig ?? {
    enabled: true,
    basePrice: 0,
    surfaceThreshold: 0,
    surfaceOverage: 0,
    perimeterThreshold: 0,
    perimeterOverage: 0,
    depthThreshold: 0,
    depthRate: 0,
    note: "",
    _backup: null
  };

  if (enabled) {
    if (current._backup) {
      cfg.pricebook.poolBaseConfig = { ...current._backup, enabled: true, _backup: null };
    } else {
      current.enabled = true;
      cfg.pricebook.poolBaseConfig = current;
    }
  } else {
    // Mirror your single-file behavior: store backup then zero out live fields
    current._backup = {
      enabled: true,
      basePrice: current.basePrice,
      surfaceThreshold: current.surfaceThreshold,
      surfaceOverage: current.surfaceOverage,
      perimeterThreshold: current.perimeterThreshold,
      perimeterOverage: current.perimeterOverage,
      depthThreshold: current.depthThreshold,
      depthRate: current.depthRate,
      note: current.note
    };
    cfg.pricebook.poolBaseConfig = {
      enabled: false,
      basePrice: 0,
      surfaceThreshold: 0,
      surfaceOverage: 0,
      perimeterThreshold: 0,
      perimeterOverage: 0,
      depthThreshold: 0,
      depthRate: 0,
      note: current.note,
      _backup: current._backup
    };
  }
  cfg.saveLocal();
  session.compute(cfg.pricebook);
}

function setField(key: keyof typeof poolBase.value, v: number){
  if (!cfg.pricebook) return;
  const cur = cfg.pricebook.poolBaseConfig ?? (poolBase.value as any);
  (cur as any)[key] = Number.isFinite(v) ? v : 0;
  cfg.pricebook.poolBaseConfig = cur as any;
  cfg.saveLocal();
  session.compute(cfg.pricebook);
}
function setNote(text: string){
  if (!cfg.pricebook) return;
  const cur = cfg.pricebook.poolBaseConfig ?? (poolBase.value as any);
  (cur as any).note = text;
  cfg.pricebook.poolBaseConfig = cur as any;
  cfg.saveLocal();
}

function exportAll(){
  ioText.value = cfg.exportJSON();
}
function importAll(){
  try {
    cfg.importJSON(ioText.value || "{}");
    session.compute(cfg.pricebook);
  } catch (e:any) {
    alert(e?.message ?? "Import failed");
  }
}
async function resetDefault(){
  cfg.clearLocal();
  await cfg.loadDefault();
  session.compute(cfg.pricebook);
  ioText.value = "";
}
</script>
