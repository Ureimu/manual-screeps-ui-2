import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { OriginScreepsData } from "AI/AIUreium/ui/type";

export const useAppStore = defineStore("app", () => {
    // 应用数据状态
    const screepsData = ref<OriginScreepsData | null>(null);

    // 应用选项状态
    const options = ref({
        axisType: "time" as "time" | "tick", // 坐标轴类型：时间或游戏tick
        theme: "light" as "light" | "dark", // 主题
    });

    // UI 状态
    const sidebarCollapsed = ref(false);
    const loading = ref(false);
    const selectedRoom = ref<string | null>(null); // 当前选中的房间

    // 计算属性
    const hasData = computed(() => screepsData.value !== null);

    // 方法：更新 screeps 数据
    function setScreepsData(data: OriginScreepsData): void {
        screepsData.value = data;
    }

    // 方法：清空数据
    function clearScreepsData(): void {
        screepsData.value = null;
    }

    // 方法：切换坐标轴类型
    function setAxisType(type: "time" | "tick"): void {
        options.value.axisType = type;
    }

    // 方法：切换主题
    function setTheme(theme: "light" | "dark"): void {
        options.value.theme = theme;
    }

    // 方法：切换侧边栏
    function toggleSidebar(): void {
        sidebarCollapsed.value = !sidebarCollapsed.value;
    }

    // 方法：设置加载状态
    function setLoading(isLoading: boolean): void {
        loading.value = isLoading;
    }

    // 方法：设置选中的房间
    function setSelectedRoom(room: string | null): void {
        selectedRoom.value = room;
    }

    return {
        // 状态
        screepsData,
        options,
        sidebarCollapsed,
        loading,
        selectedRoom,
        // 计算属性
        hasData,
        // 方法
        setScreepsData,
        clearScreepsData,
        setAxisType,
        setTheme,
        toggleSidebar,
        setLoading,
        setSelectedRoom,
    };
});
