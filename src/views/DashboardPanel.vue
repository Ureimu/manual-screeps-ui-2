<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAppStore } from "@/stores/app";

// 导入子组件
import ProgressIndicator from "@/components/ProgressIndicator.vue";
import TextContainer from "@/components/TextContainer.vue";
import FlexibleLineChart from "@/components/echarts/FlexibleLineChart.vue";
import ComparableLineChart from "@/components/echarts/ComparableLineChart.vue";
import SunBurstResourceChart from "@/components/echarts/SunBurstResourceChart.vue";

// Pinia store
const appStore = useAppStore();

// 本地状态
const screepsData = computed(() => appStore.screepsData);
const axisType = computed(() => appStore.options.axisType);
// const isLoading = computed(() => appStore.loading)
const containerRef = ref<HTMLDivElement | null>(null);

// 房间选择
const selectedRoom = ref<string | null>(null);
const availableRooms = computed(() => {
    if (!screepsData.value) return [];
    return Object.keys(screepsData.value.roomData || {});
});

const currentRoomName = computed(() => {
    if (selectedRoom.value) {
        return selectedRoom.value;
    }
    if (availableRooms.value.length > 0) {
        return availableRooms.value[0];
    }
    return null as string | null;
});

// 当有数据时自动选择第一个房间
onMounted(() => {
    if (availableRooms.value.length > 0 && !selectedRoom.value) {
        selectedRoom.value = availableRooms.value[0] || null;
    }
});

// 时间格式化工具
function formatTime(time: number): string {
    const addZero = (n: number): string => (n < 10 ? `0${n}` : `${n}`);
    const date = new Date(time);
    return `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(date.getDate())},${addZero(date.getHours())}:${addZero(date.getMinutes())}:${addZero(date.getSeconds())}`;
}

// 计算用户信息数组
const userInfoMessages = computed(() => {
    if (!screepsData.value?.userData) return [];
    const { userData, timeData, shardData } = screepsData.value;
    return [
        `玩家名称: ${userData.name}`,
        `当前 Tick: ${timeData.tick}`,
        `游戏时间: ${formatTime(timeData.time)}`,
        `所属分片: ${shardData.shardName}`,
    ];
});

// 计算房间信息数组
const roomInfoMessages = computed(() => {
    if (!screepsData.value?.roomData || !currentRoomName.value) return [];
    const room = screepsData.value.roomData[currentRoomName.value];
    if (!room) return [];
    return [
        `房间名称: ${room.name}`,
        `爬虫数量: ${Object.keys(room.spawnPool).length || 0}`,
        `控制器等级: ${room.controller?.level || 0}`,
        `升级速度: ${room.controller?.progressSpeed || "N/A"} /tick`,
    ];
});

// 获取外矿能量数据
const outwardsSourceData = computed(() => {
    if (!screepsData.value?.timeSeriesData || !currentRoomName.value) return [];
    const roomData = screepsData.value.timeSeriesData.roomData?.[currentRoomName.value];
    if (!roomData?.outwardsSourceEnergy) return [];

    return Object.entries(roomData.outwardsSourceEnergy).map(([name, data]) => ({
        name,
        data: Array.isArray(data.data) ? data.data : [],
    }));
});

// 切换坐标轴类型
function toggleAxisType(): void {
    appStore.setAxisType(axisType.value === "time" ? "tick" : "time");
}
</script>

<template>
    <div ref="containerRef" class="dashboard-container">
        <!-- 页面标题和控制栏 -->
        <el-card class="header-card">
            <template #header>
                <div class="card-header">
                    <h1>📊 Screeps 数据展示面板</h1>
                    <div class="header-controls">
                        <el-button @click="toggleAxisType" type="primary" size="small">
                            切换轴: {{ axisType === "time" ? "时间" : "Tick" }}
                        </el-button>
                        <el-select
                            v-if="availableRooms.length > 0"
                            v-model="selectedRoom"
                            placeholder="选择房间"
                            size="small"
                            style="width: 150px"
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
            </template>
        </el-card>

        <div v-if="screepsData" class="panel-main">
            <div v-if="screepsData.userData">
                <el-card>
                    <h2>全局信息</h2>
                </el-card>

                <!-- 第一行：用户信息和房间信息 -->
                <el-row :gutter="24" class="row-container">
                    <el-col :xs="24" :sm="12" :md="8" :lg="6">
                        <TextContainer title="用户信息" :msg="userInfoMessages" />
                    </el-col>
                </el-row>

                <!-- 第二行：用户等级进度条 -->
                <el-row :gutter="24" class="row-container">
                    <el-col :xs="24" :sm="12" :md="8" :lg="6">
                        <ProgressIndicator
                            msg="GCL"
                            :levelData="screepsData.userData.gcl"
                            :isFull="false"
                        />
                    </el-col>
                    <el-col :xs="24" :sm="12" :md="8" :lg="6">
                        <ProgressIndicator
                            msg="GPL"
                            :levelData="screepsData.userData.gpl"
                            :isFull="false"
                        />
                    </el-col>
                </el-row>

                <!-- 第四行：用户数据折线图 -->
                <el-row :gutter="24" class="row-container">
                    <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <FlexibleLineChart
                            id="credits-chart"
                            name="Credits"
                            :timeData="screepsData.timeSeriesData?.timeStamp?.data"
                            :gameTimeData="screepsData.timeSeriesData?.gameTime?.data"
                            :yData="screepsData.timeSeriesData?.userData?.credits?.data"
                            :visible="true"
                        />
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <FlexibleLineChart
                            id="pixels-chart"
                            name="Pixels"
                            :timeData="screepsData.timeSeriesData?.timeStamp?.data"
                            :gameTimeData="screepsData.timeSeriesData?.gameTime?.data"
                            :yData="screepsData.timeSeriesData?.userData?.pixels?.data"
                            :visible="true"
                        />
                    </el-col>
                </el-row>

                <!-- 第五行：GCL 和 GPL 进度折线图 -->
                <el-row :gutter="24" class="row-container">
                    <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <FlexibleLineChart
                            id="gcl-progress-chart"
                            name="GCL 进度"
                            :timeData="screepsData.timeSeriesData?.timeStamp?.data"
                            :gameTimeData="screepsData.timeSeriesData?.gameTime?.data"
                            :yData="screepsData.timeSeriesData?.userData?.gclProgress?.data"
                            :visible="true"
                        />
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <FlexibleLineChart
                            id="gpl-progress-chart"
                            name="GPL 进度"
                            :timeData="screepsData.timeSeriesData?.timeStamp?.data"
                            :gameTimeData="screepsData.timeSeriesData?.gameTime?.data"
                            :yData="screepsData.timeSeriesData?.userData?.gplProgress?.data"
                            :visible="true"
                        />
                    </el-col>
                </el-row>
            </div>

            <el-card>
                <h2>{{ currentRoomName }}房间信息</h2>
            </el-card>

            <el-row :gutter="24" class="row-container">
                <el-col :xs="24" :sm="12" :md="8" :lg="6">
                    <TextContainer title="房间信息" :msg="roomInfoMessages" />
                </el-col>
            </el-row>

            <!-- 第三行：房间控制器等级 -->
            <el-row
                v-if="currentRoomName && screepsData.roomData[currentRoomName]"
                :gutter="24"
                class="row-container"
            >
                <el-col :xs="24" :sm="12" :md="8" :lg="6">
                    <ProgressIndicator
                        msg="RCL"
                        :levelData="screepsData.roomData[currentRoomName]?.controller || null"
                        :isFull="false"
                    />
                </el-col>
            </el-row>

            <!-- 第六行：房间控制器进度和能量存储 -->
            <el-row v-if="currentRoomName" :gutter="24" class="row-container">
                <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <FlexibleLineChart
                        id="controller-progress-chart"
                        name="控制器升级进度"
                        :timeData="screepsData.timeSeriesData?.timeStamp?.data"
                        :gameTimeData="screepsData.timeSeriesData?.gameTime?.data"
                        :yData="
                            screepsData.timeSeriesData?.roomData?.[currentRoomName]
                                ?.controllerProgress?.data
                        "
                        :visible="true"
                    />
                </el-col>
                <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <FlexibleLineChart
                        id="storage-energy-chart"
                        name="能量存储"
                        :timeData="screepsData.timeSeriesData?.timeStamp?.data"
                        :gameTimeData="screepsData.timeSeriesData?.gameTime?.data"
                        :yData="
                            screepsData.timeSeriesData?.roomData?.[currentRoomName]?.storageData
                                ?.energy?.data
                        "
                        :visible="true"
                    />
                </el-col>
            </el-row>

            <!-- 第七行：外矿能量对比图 -->
            <el-row
                v-if="currentRoomName && outwardsSourceData.length > 0"
                :gutter="24"
                class="row-container"
            >
                <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <ComparableLineChart
                        id="outwards-source-chart"
                        name="外矿能量对比"
                        :timeData="screepsData.timeSeriesData?.timeStamp?.data"
                        :gameTimeData="screepsData.timeSeriesData?.gameTime?.data"
                        :yDataList="outwardsSourceData"
                        :visible="true"
                    />
                </el-col>
            </el-row>

            <!-- 第八行：资源分布图 -->
            <el-row v-if="currentRoomName" :gutter="24" class="row-container">
                <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <SunBurstResourceChart
                        id="resource-chart"
                        name="资源分布"
                        :roomData="screepsData.roomData[currentRoomName]?.store"
                        :visible="true"
                    />
                </el-col>
            </el-row>
        </div>

        <!-- 无数据提示 -->
        <el-empty v-else description="暂无数据，等待游戏数据..." />
    </div>
</template>

<style scoped>
.dashboard-container {
    padding: 1.5rem;
    background-color: #f5f7fa;
    min-height: 100vh;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
}

.header-card {
    margin-bottom: 1.5rem;
    flex-shrink: 0;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.card-header h1 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
}

.header-controls {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.panel-main {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    flex: 1;
    overflow-y: auto;
}

.row-container {
    width: 100%;
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .card-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }

    .header-controls {
        width: 100%;
        justify-content: flex-start;
    }
}

@media (max-width: 768px) {
    .dashboard-container {
        padding: 1rem;
    }

    .card-header h1 {
        font-size: 1.25rem;
    }

    .panel-main {
        gap: 1rem;
    }

    .row-container {
        margin-bottom: 1rem !important;
    }
}

:deep(.el-card) {
    background: #ffffff;
    border: 1px solid #e1e8ed;
}

:deep(.el-card__header) {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e1e8ed;
}

:deep(.el-row) {
    width: 100%;
}
</style>
