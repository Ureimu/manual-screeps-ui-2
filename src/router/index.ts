import { createRouter, createWebHistory } from "vue-router";
import RoomInfoPanel from "@/views/RoomInfoPanel.vue";
import GlobalInfoPanel from "@/views/GlobalInfoPanel.vue";
import ProjectDetail from "@/views/ProjectDetail.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "home",
            redirect: "/dashboard",
        },
        {
            path: "/dashboard",
            name: "dashboard",
            component: RoomInfoPanel,
            meta: {
                title: "房间信息面板",
            },
        },
        {
            path: "/global",
            name: "global",
            component: GlobalInfoPanel,
            meta: {
                title: "全局信息面板",
            },
        },
        {
            path: "/project/:projectType/:projectId",
            name: "ProjectDetail",
            component: ProjectDetail,
            meta: {
                title: "项目详情",
            },
        },
    ],
});

// 路由守卫：设置页面标题
router.beforeEach((to, from, next) => {
    if (to.meta.title) {
        document.title = `${to.meta.title} - Screeps UI`;
    } else {
        document.title = "Screeps UI";
    }
    next();
});

export default router;
