<template>
    <div class="navigation-container">
        <!-- 主导航菜单 -->
        <el-menu
            :default-active="activeIndex"
            mode="horizontal"
            @select="handleSelect"
            class="navigation-bar"
        >
            <el-menu-item index="/dashboard">
                <el-icon><House /></el-icon>
                <span>房间信息</span>
            </el-menu-item>
            <el-menu-item index="/global">
                <el-icon><View /></el-icon>
                <span>全局信息</span>
            </el-menu-item>
        </el-menu>

        <!-- 信息显示区域 -->
        <div class="info-panel">
            <!-- 全局信息面板 -->
            <div v-if="isGlobalPage" class="info-content">
                <div class="info-controls">
                    <!-- 左侧：控制按钮 -->
                    <div class="left-controls">
                        <div class="control-buttons">
                            <el-button @click="toggleAxisType" type="primary" size="small">
                                切换轴: {{ axisType === "time" ? "时间" : "Tick" }}
                            </el-button>
                        </div>
                    </div>

                    <!-- 右侧：shard 信息 -->
                    <div class="right-info">
                        <div class="shard-info">
                            <el-icon><Location /></el-icon>
                            <span class="shard-text">{{ shardName }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 房间信息面板 -->
            <div v-if="isRoomPage" class="info-content">
                <div class="info-controls">
                    <!-- 左侧：控制按钮和房间选择器 -->
                    <div class="left-controls">
                        <div class="control-buttons">
                            <el-button @click="toggleAxisType" type="primary" size="small">
                                切换轴: {{ axisType === "time" ? "时间" : "Tick" }}
                            </el-button>

                            <el-select
                                v-if="availableRooms.length > 0"
                                v-model="selectedRoom"
                                placeholder="选择房间"
                                size="small"
                                style="width: 150px"
                                @change="handleRoomChange"
                            >
                                <el-option
                                    v-for="room in availableRooms"
                                    :key="room"
                                    :label="room"
                                    :value="room"
                                />
                            </el-select>
                        </div>
                    </div>

                    <!-- 右侧：shard 信息 -->
                    <div class="right-info">
                        <div class="shard-info">
                            <el-icon><Location /></el-icon>
                            <span class="shard-text">{{ shardName }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAppStore } from "@/stores/app";
import { House, View, Location } from "@element-plus/icons-vue";

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();

// 路由状态
const activeIndex = ref(route.path);

// 房间选择 - 使用store中的状态
const selectedRoom = computed({
    get: () => appStore.selectedRoom,
    set: (value) => appStore.setSelectedRoom(value),
});

// 监听路由变化更新激活状态
watch(
    () => route.path,
    (newPath) => {
        activeIndex.value = newPath;
        // 重置房间选择
        if (newPath !== "/dashboard") {
            selectedRoom.value = null;
        }
    },
);

// 计算属性
const isGlobalPage = computed(() => route.path === "/global");
const isRoomPage = computed(() => route.path === "/dashboard");

const screepsData = computed(() => appStore.screepsData);
const axisType = computed(() => appStore.options.axisType);

// shard名称
const shardName = computed(() => {
    if (!screepsData.value?.shardData) return "";
    return screepsData.value.shardData.shardName;
});

// 可用房间列表
const availableRooms = computed(() => {
    if (!screepsData.value) return [];
    return Object.keys(screepsData.value.roomData || {});
});

// 方法
const handleSelect = (index: string) => {
    router.push(index);
};

const toggleAxisType = (): void => {
    appStore.setAxisType(axisType.value === "time" ? "tick" : "time");
};

const handleRoomChange = (room: string) => {
    selectedRoom.value = room;
    // 房间切换已通过store同步
};

// 初始化房间选择
watch(
    availableRooms,
    (rooms) => {
        if (rooms.length > 0 && !selectedRoom.value && isRoomPage.value) {
            selectedRoom.value = rooms[0] || null;
        }
    },
    { immediate: true },
);

// 监听房间选择变化，确保页面切换时正确显示
watch(
    () => route.path,
    (newPath) => {
        if (newPath === "/dashboard" && availableRooms.value.length > 0 && !selectedRoom.value) {
            selectedRoom.value = availableRooms.value[0] || null;
        }
    },
);
</script>

<style scoped>
.navigation-container {
    width: 100%;
    background-color: #ffffff;
    border-bottom: 1px solid #e1e8ed;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.navigation-bar {
    width: 100%;
    background-color: transparent;
    border-bottom: none;
}

.navigation-bar .el-menu-item {
    font-size: 14px;
    font-weight: 500;
    color: #606266;
    transition: all 0.3s ease;
}

.navigation-bar .el-menu-item:hover {
    background-color: #f5f7fa;
    color: #409eff;
}

.navigation-bar .el-menu-item.is-active {
    color: #409eff;
    border-bottom: 2px solid #409eff;
    background-color: #f0f7ff;
}

.navigation-bar .el-menu-item .el-icon {
    margin-right: 6px;
    font-size: 16px;
}

.info-panel {
    padding: 1rem 1.5rem;
    border-top: 1px solid #f0f0f0;
    background-color: #fafafa;
}

.info-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.info-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.left-controls {
    display: flex;
    align-items: center;
    flex: 1;
}

.right-info {
    display: flex;
    align-items: center;
}

.shard-info {
    display: flex;
    align-items: center;
    gap: 6px;
}

.shard-text {
    font-size: 14px;
    font-weight: 500;
    color: #606266;
}

.info-items {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.info-tag {
    font-size: 12px;
    height: 24px;
    line-height: 22px;
    border-radius: 4px;
    background-color: #f4f4f5;
    border-color: #e9e9eb;
    color: #909399;
}

.control-buttons {
    display: flex;
    gap: 0.75rem;
    align-items: center;
}

/* 响应式设计 */
@media (max-width: 992px) {
    .info-controls {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .left-controls {
        width: 100%;
    }

    .right-info {
        width: 100%;
        justify-content: flex-start;
    }

    .control-buttons {
        width: 100%;
        justify-content: flex-start;
    }
}

@media (max-width: 768px) {
    .navigation-bar .el-menu-item {
        font-size: 13px;
        padding: 0 12px;
    }

    .navigation-bar .el-menu-item .el-icon {
        margin-right: 4px;
        font-size: 14px;
    }

    .info-panel {
        padding: 0.75rem 1rem;
    }

    .shard-text {
        font-size: 13px;
    }

    .info-tag {
        font-size: 11px;
        height: 22px;
        line-height: 20px;
    }
}

@media (max-width: 480px) {
    .navigation-bar .el-menu-item span {
        display: none;
    }

    .navigation-bar .el-menu-item .el-icon {
        margin-right: 0;
        font-size: 16px;
    }

    .shard-text {
        font-size: 12px;
    }

    .control-buttons {
        flex-wrap: wrap;
    }
}
</style>
