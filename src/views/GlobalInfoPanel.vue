<template>
    <div class="global-info-container">
        <div v-if="screepsData" class="panel-main">
            <!-- 用户信息 -->
            <el-row :gutter="0" class="row-container first-row">
                <el-col :xs="24" :sm="24" :md="12" :lg="12" class="left-column">
                    <el-row :gutter="24" class="inner-row-container">
                        <el-col :xs="24" :sm="24" :md="24" :lg="12">
                            <div class="info-section">
                                <TextContainer title="用户信息" :msg="userInfoMessages" />
                            </div>
                        </el-col>
                        <el-col :xs="24" :sm="24" :md="24" :lg="12">
                            <div class="info-section">
                                <TextContainer title="数据库信息" :msg="storageUsedRatioMessages" />
                            </div>
                        </el-col>
                    </el-row>

                    <!-- 用户等级进度条 -->
                    <el-row :gutter="24" class="inner-row-container">
                        <el-col :xs="24" :sm="24" :md="12" :lg="12">
                            <ProgressIndicator
                                msg="GCL"
                                :levelData="screepsData.userData.gcl"
                                :isFull="false"
                            />
                        </el-col>
                        <el-col :xs="24" :sm="24" :md="12" :lg="12">
                            <ProgressIndicator
                                msg="GPL"
                                :levelData="screepsData.userData.gpl"
                                :isFull="false"
                            />
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

            <!-- 用户数据折线图 -->
            <el-row :gutter="24" class="row-container chart-row">
                <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <div class="chart-wrapper">
                        <FlexibleLineChart
                            id="credits-chart"
                            name="Credits"
                            :timeData="screepsData.timeSeriesData?.timeStamp?.data"
                            :gameTimeData="screepsData.timeSeriesData?.gameTime?.data"
                            :yData="screepsData.timeSeriesData?.userData?.credits?.data"
                            :exp="screepsData.timeSeriesData?.userData?.credits?.exp"
                            :visible="true"
                        />
                    </div>
                </el-col>
                <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <div class="chart-wrapper">
                        <FlexibleLineChart
                            id="pixels-chart"
                            name="Pixels"
                            :timeData="screepsData.timeSeriesData?.timeStamp?.data"
                            :gameTimeData="screepsData.timeSeriesData?.gameTime?.data"
                            :yData="screepsData.timeSeriesData?.userData?.pixels?.data"
                            :exp="screepsData.timeSeriesData?.userData?.pixels?.exp"
                            :visible="true"
                        />
                    </div>
                </el-col>
            </el-row>

            <!-- GCL 和 GPL 进度折线图 -->
            <el-row :gutter="24" class="row-container chart-row">
                <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <div class="chart-wrapper">
                        <FlexibleLineChart
                            id="gcl-progress-chart"
                            name="GCL 进度"
                            :timeData="screepsData.timeSeriesData?.timeStamp?.data"
                            :gameTimeData="screepsData.timeSeriesData?.gameTime?.data"
                            :yData="screepsData.timeSeriesData?.userData?.gclProgress?.data"
                            :exp="screepsData.timeSeriesData?.userData?.gclProgress?.exp"
                            :visible="true"
                        />
                    </div>
                </el-col>
                <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <div class="chart-wrapper">
                        <FlexibleLineChart
                            id="gpl-progress-chart"
                            name="GPL 进度"
                            :timeData="screepsData.timeSeriesData?.timeStamp?.data"
                            :gameTimeData="screepsData.timeSeriesData?.gameTime?.data"
                            :yData="screepsData.timeSeriesData?.userData?.gplProgress?.data"
                            :exp="screepsData.timeSeriesData?.userData?.gplProgress?.exp"
                            :visible="true"
                        />
                    </div>
                </el-col>
            </el-row>
        </div>

        <!-- 无数据提示 -->
        <el-empty v-else description="暂无全局数据，等待游戏数据..." />
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppStore } from "@/stores/app";
import type { RoomData } from "AI/AIUreium/ui/type";

// 导入子组件
import ProgressIndicator from "@/components/ProgressIndicator.vue";
import TextContainer from "@/components/TextContainer.vue";
import FlexibleLineChart from "@/components/echarts/FlexibleLineChart.vue";

import SunBurstResourceChart from "@/components/echarts/SunBurstResourceChart.vue";
import ErrorDisplay from "@/components/ErrorDisplay.vue";
import ProjectsDisplay from "@/components/ProjectsDisplay.vue";

// Pinia store
const appStore = useAppStore();

// 本地状态
const screepsData = computed(() => appStore.screepsData);
// 切换坐标轴类型现在由NavigationBar处理
// const axisType = computed(() => appStore.options.axisType);

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

// 切换坐标轴类型 - 现在由NavigationBar处理
// function toggleAxisType(): void {
//     appStore.setAxisType(axisType.value === "time" ? "tick" : "time");
// }
</script>

<style scoped>
@import "@/assets/styles/panels.css";

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
