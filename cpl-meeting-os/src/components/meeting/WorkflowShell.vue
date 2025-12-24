<template>
  <div class="paper card">
    <div class="row">
      <div>
        <div style="font-weight:700;">Meeting Workflow</div>
        <div class="small muted">Big rocks first → details later. Jump anywhere.</div>
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end;">
        <button class="btn" :class="{primary: step==='vision'}" @click="step='vision'">VISION</button>
        <button class="btn" :class="{primary: step==='constraints'}" @click="step='constraints'">CONSTRAINTS</button>
        <button class="btn" :class="{primary: step==='bigrocks'}" @click="step='bigrocks'">BIG ROCKS</button>
        <button class="btn" :class="{primary: step==='budget'}" @click="step='budget'">BUDGET FIT</button>
        <button class="btn" :class="{primary: step==='refine'}" @click="step='refine'">REFINE</button>
        <button class="btn" :class="{primary: step==='wrap'}" @click="step='wrap'">WRAP</button>
      </div>
    </div>

    <div class="rule" style="margin: 12px 0;"></div>

    <StepVision v-if="step==='vision'" />
    <StepConstraints v-else-if="step==='constraints'" />
    <StepBigRocks v-else-if="step==='bigrocks'" />
    <StepBudgetFit v-else-if="step==='budget'" />
    <StepRefine v-else-if="step==='refine'" />
    <StepWrap v-else />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import StepVision from "./StepVision.vue";
import StepConstraints from "./StepConstraints.vue";
import StepBigRocks from "./StepBigRocks.vue";
import StepBudgetFit from "./StepBudgetFit.vue";
import StepRefine from "./StepRefine.vue";
import StepWrap from "./StepWrap.vue";

const step = ref<"vision"|"constraints"|"bigrocks"|"budget"|"refine"|"wrap">("vision");
</script>
