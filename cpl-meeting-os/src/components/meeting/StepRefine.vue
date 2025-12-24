<template>
  <div>
    <div style="font-weight:700;">Refine</div>
    <div class="small muted">Detailed item sheets live on the Estimate screen for now.</div>

    <div style="margin-top:10px;">
      <button class="btn primary" @click="goEstimate()">GO TO ESTIMATE</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
const r = useRouter();
function goEstimate(){ r.push("/estimate"); }
</script>
