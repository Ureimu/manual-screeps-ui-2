<template>
    <div class="shard-info-container">
        <div v-if="screepsData" class="panel-main">
            <!-- 第一行：数据库信息和全局资源分布图 -->
            <el-row :gutter="0" class="row-container first-row">
                <el-col :xs="24" :sm="24" :md="12" :lg="12" class="left-column">
                    <el-row :gutter="24" class="inner-row-container full-height">
                        <el-col :xs="24" :sm="24" :md="24" :lg="24">
                            <div class="info-section">
                                <TextContainer title="数据库信息" :msg="storageUsedRatioMessages" />
                            </div>
                        </el-col>
                    </el-row>
                </el-col>
                <el-col :xs="24" :sm="24" :md="12" :lg="12" class="right-column">
                    <el-row :gutter="24" class="inner-row-container full-height">
                        <!-- 全局资源分布图 -->
                        <el-col :xs="24" :sm="24" :md="24" :lg="24">
                            <div class="chart-section">
                                <SunBurstResourceChart
                                    id="global-resource-chart"
                                    name="全局资源分布"
                                    :roomData="globalStoreData"
                                    :visible="true"
                                />
                            </div>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>

            <!-- 错误信息展示 -->
            <el-row :gutter="24" class="row-container">
                <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <ErrorDisplay
                        title="游戏错误信息"
                        :errorData="screepsData.userData.error"
                        :currentTick="screepsData.timeData.tick"
                    />
                </el-col>
            </el-row>

            <!-- 项目展示 -->
            <el-row :gutter="24" class="row-container">
                <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <ProjectsDisplay :projectsData="screepsData.globalData?.projects" />
                </el-col>
            </el-row>

            <!-- 全局实验室任务历史 -->
            <el-row :gutter="24" class="row-container">
                <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <div class="chart-wrapper">
                        <LabTaskHistoryDisplay
                            :historyData="globalLabTaskHistoryData"
                            title="全局实验室任务历史"
                        />
                    </div>
                </el-col>
            </el-row>

            <!-- CPU 和 Bucket 折线图 -->
            <el-row :gutter="24" class="row-container chart-row">
                <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <div class="chart-wrapper">
                        <FlexibleLineChart
                            id="cpu-chart"
                            name="CPU 使用情况"
                            :timeData="screepsData.timeSeriesData?.timeStamp?.data"
                            :gameTimeData="screepsData.timeSeriesData?.gameTime?.data"
                            :yData="screepsData.timeSeriesData?.userData?.cpu?.data"
                            :exp="screepsData.timeSeriesData?.userData?.cpu?.exp"
                            :mode="'average'"
                            :interval="1500"
                            :aggregateAxis="'tick'"
                            :visible="true"
                        />
                    </div>
                </el-col>
                <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <div class="chart-wrapper">
                        <FlexibleLineChart
                            id="bucket-chart"
                            name="Bucket"
                            :timeData="screepsData.timeSeriesData?.timeStamp?.data"
                            :gameTimeData="screepsData.timeSeriesData?.gameTime?.data"
                            :yData="screepsData.timeSeriesData?.userData?.bucket?.data"
                            :visible="true"
                        />
                    </div>
                </el-col>
            </el-row>

            <!-- 房间CPU用量对比图 -->
            <el-row :gutter="24" class="row-container chart-row">
                <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <div class="chart-wrapper">
                        <ComparableLineChart
                            id="room-cpu-comparison-chart"
                            name="房间CPU用量对比"
                            :timeData="screepsData.timeSeriesData?.timeStamp?.data"
                            :gameTimeData="screepsData.timeSeriesData?.gameTime?.data"
                            :yDataList="roomCpuData"
                            :mode="'average'"
                            :interval="1500"
                            :aggregateAxis="'tick'"
                            :visible="true"
                        />
                    </div>
                </el-col>
            </el-row>

            <!-- 房间spawnTime对比图 -->
            <el-row :gutter="24" class="row-container chart-row">
                <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <div class="chart-wrapper">
                        <ComparableLineChart
                            id="room-spawntime-comparison-chart"
                            name="房间spawnTime对比"
                            :timeData="screepsData.timeSeriesData?.timeStamp?.data"
                            :gameTimeData="screepsData.timeSeriesData?.gameTime?.data"
                            :yDataList="roomSpawnTimeData"
                            :mode="'sum'"
                            :interval="1500"
                            :aggregateAxis="'tick'"
                            :visible="true"
                        />
                    </div>
                </el-col>
            </el-row>

            <!-- 房间spawnEnergy对比图 -->
            <el-row :gutter="24" class="row-container chart-row">
                <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <div class="chart-wrapper">
                        <ComparableLineChart
                            id="room-spawnenergy-comparison-chart"
                            name="房间spawnEnergy对比"
                            :timeData="screepsData.timeSeriesData?.timeStamp?.data"
                            :gameTimeData="screepsData.timeSeriesData?.gameTime?.data"
                            :yDataList="roomSpawnEnergyData"
                            :mode="'sum'"
                            :interval="1500"
                            :aggregateAxis="'tick'"
                            :visible="true"
                        />
                    </div>
                </el-col>
            </el-row>
        </div>

        <!-- 无数据提示 -->
        <el-empty v-else description="暂无分片数据，等待游戏数据..." />
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppStore } from "@/stores/app";
import type { RoomData } from "@/type/player/AI/AIUreium/ui/type";

// 导入子组件
import TextContainer from "@/components/TextContainer.vue";
import FlexibleLineChart from "@/components/echarts/FlexibleLineChart.vue";
import ComparableLineChart from "@/components/echarts/ComparableLineChart.vue";
import SunBurstResourceChart from "@/components/echarts/SunBurstResourceChart.vue";
import ErrorDisplay from "@/components/ErrorDisplay.vue";
import ProjectsDisplay from "@/components/ProjectsDisplay.vue";
import LabTaskHistoryDisplay from "@/components/LabTaskHistoryDisplay.vue";

// Pinia store
const appStore = useAppStore();

// 本地状态
const screepsData = computed(() => appStore.screepsData);

// 计算所有房间的store数据总和
const globalStoreData = computed(() => {
    if (!screepsData.value?.roomData) return undefined;

    const roomData = screepsData.value.roomData;
    const globalStore = {
        storage: { store: {} as Record<string, number>, storeCapacity: 0 },
        terminal: { store: {} as Record<string, number>, storeCapacity: 0 },
        factory: { store: {} as Record<string, number>, storeCapacity: 0 },
    };

    // 遍历所有房间，累加store数据
    Object.values(roomData).forEach((room: RoomData) => {
        const store = room.store;

        // 累加storage数据
        if (store.storage) {
            globalStore.storage.storeCapacity += store.storage.storeCapacity;
            Object.entries(store.storage.store).forEach(([resource, amount]) => {
                globalStore.storage.store[resource] =
                    (globalStore.storage.store[resource] || 0) + amount;
            });
        }

        // 累加terminal数据
        if (store.terminal) {
            globalStore.terminal.storeCapacity += store.terminal.storeCapacity;
            Object.entries(store.terminal.store).forEach(([resource, amount]) => {
                globalStore.terminal.store[resource] =
                    (globalStore.terminal.store[resource] || 0) + amount;
            });
        }

        // 累加factory数据
        if (store.factory) {
            globalStore.factory.storeCapacity += store.factory.storeCapacity;
            Object.entries(store.factory.store).forEach(([resource, amount]) => {
                globalStore.factory.store[resource] =
                    (globalStore.factory.store[resource] || 0) + amount;
            });
        }
    });

    return {
        storage: globalStore.storage,
        terminal: globalStore.terminal,
        factory: globalStore.factory,
    };
});

// 计算存储使用率信息数组
const storageUsedRatioMessages = computed(() => {
    if (!screepsData.value?.statsEngineStorage) return [];
    const statEngineData = screepsData.value?.statsEngineStorage;
    const storageUsedRatio = statEngineData.usedRatio;
    const increaseSpeed = statEngineData.dataIncreaseSpeed;
    const usedSegmentNumber = statEngineData.usedSegmentsNumber;
    const maxSize = statEngineData.maxSizePerSegment;
    const percentage = (storageUsedRatio * 100).toFixed(2);
    return [
        `全局存储使用率: ${percentage}%`,
        `数据大小增长速度：${increaseSpeed.toFixed(2)}bytes/天`,
        `剩余容量可使用天数：${Math.floor(((1 - storageUsedRatio) * maxSize * usedSegmentNumber) / increaseSpeed)}天`,
    ];
});

// 获取所有房间的CPU数据
const roomCpuData = computed(() => {
    if (!screepsData.value?.timeSeriesData?.roomData) return [];

    const roomData = screepsData.value.timeSeriesData.roomData;
    const cpuDataList = [];

    // 遍历所有房间，获取CPU数据
    for (const [roomName, roomTimeSeriesData] of Object.entries(roomData)) {
        if (roomTimeSeriesData?.cpu?.data) {
            cpuDataList.push({
                name: roomName,
                data: roomTimeSeriesData.cpu.data,
                exp: roomTimeSeriesData.cpu.exp,
            });
        }
    }

    return cpuDataList;
});

// 获取所有房间的spawnTime数据
const roomSpawnTimeData = computed(() => {
    if (!screepsData.value?.timeSeriesData?.roomData) return [];

    const roomData = screepsData.value.timeSeriesData.roomData;
    const spawnTimeDataList = [];

    // 遍历所有房间，获取spawnTime数据
    for (const [roomName, roomTimeSeriesData] of Object.entries(roomData)) {
        if (roomTimeSeriesData?.spawnTime?.data) {
            spawnTimeDataList.push({
                name: roomName,
                data: roomTimeSeriesData.spawnTime.data,
                exp: roomTimeSeriesData.spawnTime.exp,
            });
        }
    }

    return spawnTimeDataList;
});

// 获取所有房间的spawnEnergy数据
const roomSpawnEnergyData = computed(() => {
    if (!screepsData.value?.timeSeriesData?.roomData) return [];

    const roomData = screepsData.value.timeSeriesData.roomData;
    const spawnEnergyDataList = [];

    // 遍历所有房间，获取spawnEnergy数据
    for (const [roomName, roomTimeSeriesData] of Object.entries(roomData)) {
        if (roomTimeSeriesData?.spawnEnergy?.data) {
            spawnEnergyDataList.push({
                name: roomName,
                data: roomTimeSeriesData.spawnEnergy.data,
                exp: roomTimeSeriesData.spawnEnergy.exp,
            });
        }
    }

    return spawnEnergyDataList;
});

// 获取全局实验室任务历史数据（所有房间）
const globalLabTaskHistoryData = computed(() => {
    if (!screepsData.value?.historyData?.lab) return [];

    const labHistoryData = screepsData.value.historyData.lab;
    const allHistoryData = [];

    // 遍历所有房间，收集实验室任务历史数据
    for (const [roomName, roomHistory] of Object.entries(labHistoryData)) {
        if (Array.isArray(roomHistory)) {
            // 为每个任务添加房间名称
            const roomHistoryWithRoomName = roomHistory.map((task) => ({
                ...task,
                roomName: roomName,
            }));
            allHistoryData.push(...roomHistoryWithRoomName);
        }
    }

    return allHistoryData;
});
</script>

<style scoped>
@import "@/assets/styles/panels.css";

/* 分片信息面板容器 */
.shard-info-container {
    padding: 1.5rem;
    background-color: #f5f7fa;
    height: calc(100vh - var(--navigation-bar-height, 120px));
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
}

/* 全局组件样式覆盖 */
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

:deep(.el-col) {
    display: flex;
    flex-direction: column;
}
</style>
