<template>
  <main class="main">
  <div class="paper card">
  <div class="row" style="align-items:center;">
    <div style="font-weight:700;">Quick Start</div>
    <div style="display:flex; gap:8px; align-items:center;">
      <select class="input" v-model="selectedPackageId" style="min-width:220px;">
        <option value="">Start Package…</option>
        <option v-for="p in packagesForMode" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>
      <button class="btn" @click="applySelectedPackage" :disabled="!selectedPackageId">APPLY</button>
    </div>
  </div>
  <div class="rule" style="margin:12px 0;"></div>
  </div>

  <div class="paper card">
      <div class="row">
        <div>
          <div style="font-weight:700;">Estimate</div>
          <div class="small muted">Toggle items, set qty, and optionally customize.</div>
        </div>
        <div class="small muted" v-if="cfg.error">Config error: {{ cfg.error }}</div>
      </div>

      <div class="rule" style="margin:12px 0;"></div>

      <div class="grid2" style="margin-bottom:12px;">
        <div>
          <div class="small muted">Project type</div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn" :class="{primary: mode==='new'}" @click="setMode('new')">NEW</button>
            <button class="btn" :class="{primary: mode==='remodel'}" @click="setMode('remodel')">REMODEL</button>
            <button class="btn" :class="{primary: mode==='landscape'}" @click="setMode('landscape')">LANDSCAPE</button>
          </div>
        </div>

        <div v-if="mode !== 'landscape'">
          <div class="small muted">Pool base package</div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn" :class="{primary: poolBaseSelected}" @click="setPoolBase(true)">ON</button>
            <button class="btn" :class="{primary: !poolBaseSelected}" @click="setPoolBase(false)">OFF</button>
          </div>
          <div class="small muted" v-if="poolBaseNote" style="margin-top:6px;">{{ poolBaseNote }}</div>
        </div>
      </div>

      <div v-if="mode !== 'landscape'" class="paper" style="border:1px solid #c9b36b; padding:10px;">
        <div class="row" style="align-items:flex-end;">
          <div style="font-weight:700;">Pool Dimensions</div>
          <div class="small muted">{{ metrics.surface.toFixed(0) }} sf • {{ metrics.perimeter.toFixed(0) }} lf • IA {{ metrics.ia.toFixed(0) }} • {{ metrics.gallons.toLocaleString() }} gal</div>
        </div>

        <div class="grid2" style="margin-top:10px;">
          <div>
            <div class="small muted">Length (ft)</div>
            <input class="input" type="number" :value="pool.length" @input="setPool('length', ($event.target as HTMLInputElement).valueAsNumber)" />
          </div>
          <div>
            <div class="small muted">Width (ft)</div>
            <input class="input" type="number" :value="pool.width" @input="setPool('width', ($event.target as HTMLInputElement).valueAsNumber)" />
          </div>
        </div>

        <div class="grid2" style="margin-top:10px;">
          <div>
            <div class="small muted">Shallow depth (ft)</div>
            <input class="input" type="number" :value="pool.depthShallow" @input="setPool('depthShallow', ($event.target as HTMLInputElement).valueAsNumber)" />
          </div>
          <div>
            <div class="small muted">Deep depth (ft)</div>
            <input class="input" type="number" :value="pool.depthDeep" @input="setPool('depthDeep', ($event.target as HTMLInputElement).valueAsNumber)" />
          </div>
        </div>
      </div>

      <div class="grid2">
        <div>
          <div class="small muted">Search</div>
          <input class="input" v-model="q" placeholder="Search items..." />
        </div>
        <div>
          <div class="small muted">Down payment</div>
          <input class="input" type="number" v-model.number="down" />
        </div>
      </div>
    </div>

    <div v-for="sec in sections" :key="sec.id" class="paper card">
      <div class="row">
        <div style="font-weight:700;">{{ sec.name }}</div>
        <div class="small muted">Section</div>
      </div>

      <div class="rule" style="margin: 12px 0;"></div>

      <div v-for="it in itemsBySection(sec.id)" :key="it.id" style="padding: 10px 0;">
        <div class="row">
          <div>
            <div style="font-weight:700;">{{ it.name }}</div>
            <div class="small muted">{{ it.unit.toUpperCase() }} • Base {{ money(it.basePrice ?? 0) }}</div>
            <div v-if="it.tags?.length" class="small muted">Tags: {{ it.tags.join(', ') }}</div>
          </div>

          <div style="display:flex; gap:8px; align-items:center; justify-content:flex-end; flex-wrap:wrap;">
            <button class="btn" :class="{primary: isSel(it.id, it.defaultSelected)}" @click="toggle(it.id, it.defaultSelected)">
              {{ isSel(it.id, it.defaultSelected) ? "ON" : "OFF" }}
            </button>
            <button class="btn" v-if="it.options?.length" @click="open(it.id)">CUSTOMIZE ▾</button>
          </div>
        </div>

        <div v-if="isSel(it.id, it.defaultSelected) && it.unit !== 'each'" style="margin-top:10px;">
          <div class="small muted">Qty</div>
          <input class="input" type="number" :value="qty(it.id, it.defaultQty)" @input="setQty(it.id, ($event.target as HTMLInputElement).valueAsNumber)" />
        </div>
      </div>
    </div>

    <BottomSheet :open="!!ui.openItemId" title="Customize" @close="close()">
      <div v-if="openItem">
        <div style="font-weight:700;">{{ openItem.name }}</div>
        <div class="small muted">Advanced options stay hidden unless you open this.</div>

        <div class="rule" style="margin:12px 0;"></div>

        <div v-for="opt in openItem.options ?? []" :key="opt.id" style="margin-bottom:12px;">
          <div class="small muted">{{ opt.label }}</div>

          <select v-if="opt.type==='select'" class="input" :value="optVal(openItem.id, opt.id)" @change="setOpt(openItem.id,opt.id,($event.target as HTMLSelectElement).value)">
            <option value="">Select…</option>
            <option v-for="c in opt.choices ?? []" :key="c.id" :value="c.id">{{ c.label }}</option>
          </select>

          <div v-else-if="opt.type==='toggle'" style="display:flex; gap:10px; align-items:center;">
            <button class="btn" :class="{primary: optVal(openItem.id, opt.id)===true}" @click="setOpt(openItem.id,opt.id,true)">ON</button>
            <button class="btn" :class="{primary: optVal(openItem.id, opt.id)!==true}" @click="setOpt(openItem.id,opt.id,false)">OFF</button>
            <span class="small muted" v-if="opt.priceDelta">+{{ money(opt.priceDelta) }}</span>
          </div>

          <div v-else-if="opt.type==='qty'">
            <input class="input" type="number" :value="Number(optVal(openItem.id,opt.id) ?? 0)" @input="setOpt(openItem.id,opt.id,($event.target as HTMLInputElement).valueAsNumber)" />
            <div class="small muted" v-if="opt.pricePerUnit">Price: {{ money(opt.pricePerUnit) }}/{{ opt.unit ?? 'unit' }}</div>
          </div>

          <div v-else class="small muted">Material picker coming next.</div>
        </div>

        <button class="btn primary" @click="recompute()">DONE</button>
      </div>

      <div v-else class="small muted">No item selected.</div>
    </BottomSheet>
  </main>
</template>

<script setup lang="ts">
function fmtMoney(v: number) {
  try { return new Intl.NumberFormat(undefined,{style:'currency',currency:'USD',maximumFractionDigits:0}).format(v); } catch { return '$'+Math.round(v); }
}

import { computed, ref } from "vue";
import { useConfigStore } from "@/store/configStore";
import { useSessionStore } from "@/store/sessionStore";
import { useUIStore } from "@/store/uiStore";
import BottomSheet from "@/components/shared/BottomSheet.vue";

const cfg = useConfigStore();
const s = useSessionStore();
const ui = useUIStore();

const q = ref("");

const IGNORED_REQ_KEY = "cpl_meeting_os_ignored_requirements_v1";
const ignoredReq = ref<Record<string, boolean>>({});
try { ignoredReq.value = JSON.parse(localStorage.getItem(IGNORED_REQ_KEY) || "{}"); } catch {}

const dedupedRequirements = computed(() => {
  const out: Array<any> = [];
  const seen = new Set<string>();
  for (const r of (s.requirements ?? [])) {
    if (!r || !r.itemId) continue;
    if (ignoredReq.value[r.itemId]) continue;
    const key = `${r.policy || ""}:${r.itemId}:${r.reason || ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
});

function itemName(itemId: string) {
  const it = (cfg.pricebook?.items ?? []).find((x:any) => x.id === itemId);
  return it?.name || itemId;
}

function acceptRequirement(itemId: string) {
  s.setItemSelected(itemId, true);
  s.compute(cfg.pricebook);
}

function ignoreRequirement(itemId: string) {
  ignoredReq.value[itemId] = true;
  try { localStorage.setItem(IGNORED_REQ_KEY, JSON.stringify(ignoredReq.value)); } catch {}
}

const mode = computed(() => s.session.mode);
function setMode(m: typeof s.session.mode){
  s.setMode(m);
  // Landscape hides pool controls, but we keep the values for later.
  s.compute(cfg.pricebook);
}

const poolBaseSelected = computed(() => s.session.poolBaseSelected !== false);
const poolBaseNote = computed(() => cfg.pricebook?.poolBaseConfig?.note ?? "");
function setPoolBase(selected: boolean){
  s.setPoolBaseSelected(selected);
  s.compute(cfg.pricebook);
}

const pool = computed(() => s.session.pool);
function setPool(key: keyof typeof s.session.pool, v: number){
  const n = Number.isFinite(v) ? v : 0;
  s.setPoolField(key as any, n as any);
  s.compute(cfg.pricebook);
}

const metrics = computed(() => {
  const l = Number(pool.value.length || 0);
  const w = Number(pool.value.width || 0);
  const ds = Number(pool.value.depthShallow || 0);
  const dd = Number(pool.value.depthDeep || 0);
  const avg = (ds + dd) / 2;
  const surface = l * w;
  const perimeter = (l + w) * 2;
  const ia = surface + (perimeter * avg);
  const gallons = Math.round(surface * avg * 7.5);
  return { surface, perimeter, ia, gallons };
});

const down = computed({
  get: () => s.session.financing.downPayment ?? 0,
  set: (v) => { s.session.financing.downPayment = Number(v || 0); s.compute(cfg.pricebook); }
});

const sections = computed(() => (cfg.pricebook?.sections ?? []).slice().sort((a,b) => a.order - b.order));
const items = computed(() => cfg.pricebook?.items ?? []);
const packages = computed(() => cfg.pricebook?.app?.packages ?? []);
const quickAddIds = computed(() => cfg.pricebook?.app?.quickAdds ?? []);
const quickAddItems = computed(() => (cfg.pricebook?.items ?? []).filter((it:any)=>quickAddIds.value.includes(it.id)));

const selectedPackageId = ref("");
const packagesForMode = computed(() => packages.value.filter((p:any)=>!p.mode || p.mode === s.session.mode));

const priorityModel = ref<Record<string, "must"|"nice">>({});
for (const it of (cfg.pricebook?.items ?? [])) {
  priorityModel.value[it.id] = ((s.session.priorities as any)?.[it.id] || "nice");
}


function itemsBySection(sectionId: string){
  const query = q.value.trim().toLowerCase();
  return items.value
    .filter(i => i.sectionId === sectionId)
    .filter(i => !query || i.name.toLowerCase().includes(query) || (i.tags ?? []).some(t => t.toLowerCase().includes(query)));
}

function isSel(id: string, def?: boolean){
  const st = s.session.items[id] ?? {};
  return st.selected ?? def ?? false;
}
function toggle(id: string, def?: boolean){
  s.setItemSelected(id, !isSel(id, def));
  s.compute(cfg.pricebook);
}
function qty(id: string, def?: number){
  const st = s.session.items[id] ?? {};
  return st.qty ?? def ?? 1;
}
function setQty(id: string, v: number){
  s.setItemQty(id, Number.isFinite(v) ? v : 0);
  s.compute(cfg.pricebook);
}

function open(id: string){ ui.openItem(id); }
function close(){ ui.closeItem(); }
const openItem = computed(() => items.value.find(i => i.id === ui.openItemId) ?? null);

function optVal(itemId: string, optId: string){
  const st = s.session.items[itemId] ?? {};
  return st.options?.[optId];
}
function setOpt(itemId: string, optId: string, value: any){
  s.setItemOption(itemId, optId, value);
}
function recompute(){
  s.compute(cfg.pricebook);
  close();
}

function money(n: number){
  const v = Number.isFinite(n) ? n : 0;
  return v.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
</script>
