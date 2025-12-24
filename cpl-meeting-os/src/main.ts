import { createApp } from "vue";
import { createPinia } from "pinia";
import { router } from "@/router";
import "@/styles/app.css";

import App from "./App.vue";
import { useSessionStore } from "@/store/sessionStore";
import { useConfigStore } from "@/store/configStore";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.mount("#app");

// bind worker once
const session = useSessionStore();
session.bindWorker();
// --- session persistence (autosave + restore) ---
    const SESSION_KEY = "cpl_meeting_os_session_v1";
    const persist = (() => {
      let t: number | null = null;
      return (sessionObj: any) => {
        if (t) window.clearTimeout(t);
        t = window.setTimeout(() => {
          try { localStorage.setItem(SESSION_KEY, JSON.stringify(sessionObj)); } catch {}
        }, 200);
      };
    })();

    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) session.hydrate(JSON.parse(raw));
    } catch {}

    // persist on any session change
    session.$subscribe((_mutation, state) => {
      persist(state.session);
    });

// load config on startup
const config = useConfigStore();
config.loadDefault().then(() => {
  session.compute(config.pricebook);
});
