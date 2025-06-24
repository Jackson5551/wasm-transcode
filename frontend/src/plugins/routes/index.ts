import type { RouteRecordRaw } from "vue-router";
import Dashboard from "../../pages/Dashboard.vue";
import Queue from "../../pages/Queue.vue";
import Workers from "../../pages/Workers.vue";
import Uploads from "../../pages/Uploads.vue";
import MyMedia from "../../pages/MyMedia.vue";

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        name: "app",
        redirect: "/dashboard",
    },
    {
        path: "/dashboard",
        name: "app.dashboard",
        component: Dashboard,
    },
    {
        path: "/queue",
        name: "app.queue",
        component: Queue,
    },
    {
        path: "/workers",
        name: "app.workers",
        component: Workers,
    },
    {
        path: "/uploads",
        name: "app.uploads",
        component: Uploads,
    },
    {
        path: "/my-media",
        name: "app.my-media",
        component: MyMedia,
    },
];

export default routes;