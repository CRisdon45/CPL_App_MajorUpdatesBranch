import { createRouter, createWebHistory } from "vue-router";
import WorkflowPage from "@/pages/WorkflowPage.vue";
import EstimatePage from "@/pages/EstimatePage.vue";
import AdminPage from "@/pages/AdminPage.vue";
import ProposalPrint from "@/pages/ProposalPrint.vue";
import TimelinePrint from "@/pages/TimelinePrint.vue";

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: "/workflow" },
    { path: "/workflow", component: WorkflowPage },
    { path: "/estimate", component: EstimatePage },
    { path: "/admin", component: AdminPage },
    { path: "/print/proposal", component: ProposalPrint },
    { path: "/print/timeline", component: TimelinePrint }
  ]
});
