import { defineStore } from "pinia";
import type { Pricebook } from "@/engine/types";
import { ZPricebook } from "@/engine/schemas";

const LOCAL_KEY = "cpl_meeting_os_pricebook_v1";

function tryLoadLocal(): Pricebook | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const json = JSON.parse(raw);
    const parsed = ZPricebook.safeParse(json);
    if (!parsed.success) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export const useConfigStore = defineStore("config", {
  state: () => ({
    pricebook: null as Pricebook | null,
    loaded: false,
    error: ""
  }),
  actions: {
    saveLocal() {
      if (!this.pricebook) return;
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(this.pricebook));
      } catch {
        // ignore quota errors
      }
    },

    exportJSON(): string {
      return JSON.stringify(this.pricebook ?? {}, null, 2);
    },

    importJSON(text: string) {
      const json = JSON.parse(text);
      const parsed = ZPricebook.parse(json);
      this.pricebook = parsed;
      this.saveLocal();
    },

    clearLocal() {
      try { localStorage.removeItem(LOCAL_KEY); } catch {}
    },

    async loadDefault() {
      this.error = "";
      this.loaded = false;
      try {
        const local = tryLoadLocal();
        if (local) {
          this.pricebook = local;
          this.loaded = true;
          return;
        }

        const res = await fetch(`${import.meta.env.BASE_URL}data/pricebook.default.json`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load default pricebook: ${res.status}`);
        const json = await res.json();

        const parsed = ZPricebook.safeParse(json);
        if (!parsed.success) throw new Error("Default pricebook JSON failed schema validation.");

        this.pricebook = parsed.data;
        this.loaded = true;
      } catch (e: any) {
        this.error = e?.message ?? "Config load error";
      }
    }
  }
});
