import { createRouter, createWebHistory } from 'vue-router'
import DashboardPanel from '@/views/DashboardPanel.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'dashboard',
            component: DashboardPanel,
        },
    ],
})

export default router
