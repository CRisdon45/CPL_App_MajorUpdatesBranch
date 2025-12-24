import { defineStore } from "pinia";

export const useUIStore = defineStore("ui", {
  state: () => ({
    meetingMode: true,
    openItemId: null as string | null
  }),
  actions: {
    openItem(id: string){ this.openItemId = id; },
    closeItem(){ this.openItemId = null; }
  }
});
