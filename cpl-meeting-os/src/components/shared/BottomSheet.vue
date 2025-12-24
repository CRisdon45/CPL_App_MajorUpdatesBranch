<template>
  <div v-if="open" style="position: fixed; inset: 0; z-index: 1000;">
    <div @click="$emit('close')" style="position:absolute; inset:0; background: rgba(0,0,0,.45);"></div>
    <div class="paper" style="position:absolute; left:0; right:0; bottom:0; max-height: 85vh; overflow:auto;">
      <div class="card">
        <div class="row">
          <div style="font-weight:700;">{{ title }}</div>
          <button class="btn" @click="$emit('close')">CLOSE</button>
        </div>
        <div class="rule" style="margin: 12px 0;"></div>
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ open: boolean; title: string }>();
defineEmits<{ (e: "close"): void }>();
</script>
