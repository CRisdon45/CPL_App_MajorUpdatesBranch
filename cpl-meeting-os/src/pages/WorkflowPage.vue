<template>
  <main class="main">
    <WorkflowShell />
    <div v-if="session.lastError" class="paper card">
      <div style="font-weight:700;">Engine error</div>
      <div class="small">{{ session.lastError }}</div>
    </div>
  </main>
</template>

<script setup lang="ts">
import WorkflowShell from "@/components/meeting/WorkflowShell.vue";
import { computed } from "vue";
import { useSessionStore } from "@/store/sessionStore";
import { useConfigStore } from "@/store/configStore";
const session = useSessionStore();
</script>
