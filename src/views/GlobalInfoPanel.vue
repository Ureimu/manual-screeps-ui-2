<template>
    <div class="global-info-container">
        <!-- 页面标题和控制栏 -->
        <el-card class="header-card">
            <template #header>
                <div class="card-header">
                    <h1>🌍 全局信息面板</h1>
                    <div class="header-controls">
                        <el-button @click="toggleAxisType" type="primary" size="small">
                            切换轴: {{ axisType === "time" ? "时间" : "Tick" }}
                        </el-button>
                    </div>
                </div>
            </template>
        </el-card>

        <div v-if="screepsData" class="panel-main">
            <!-- 用户信息 -->
            <el-row :gutter="0" class="row-container">
                <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-row :gutter="24" class="inner-row-container">
                        <el-col :xs="24" :sm="24" :md="24" :lg="12">
                            <TextContainer title="用户信息" :msg="userInfoMessages" />
                        </el-col>
                    </el-row>

                    <!-- 用户等级进度条 -->

                    <el-row :gutter="24" class="inner-row-container">
                        <el-col :xs="24" :sm="24" :md="24" :lg="12">
                            <ProgressIndicator
                                msg="GCL"
                                :levelData="screepsData.userData.gcl"
                                :isFull="false"
                            />
                        </el-col>
                        <el-col :xs="24" :sm="24" :md="24" :lg="12">
                            <ProgressIndicator
                                msg="GPL"
                                :levelData="screepsData.userData.gpl"
                                :isFull="false"
                            />
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>

            <!-- 用户数据折线图 -->

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

            <!-- GCL 和 GPL 进度折线图 -->

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

        <!-- 无数据提示 -->
        <el-empty v-else description="暂无全局数据，等待游戏数据..." />
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppStore } from "@/stores/app";

// 导入子组件
import ProgressIndicator from "@/components/ProgressIndicator.vue";
import TextContainer from "@/components/TextContainer.vue";
import FlexibleLineChart from "@/components/echarts/FlexibleLineChart.vue";

// Pinia store
const appStore = useAppStore();

// 本地状态
const screepsData = computed(() => appStore.screepsData);
const axisType = computed(() => appStore.options.axisType);

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

// 切换坐标轴类型
function toggleAxisType(): void {
    appStore.setAxisType(axisType.value === "time" ? "tick" : "time");
}
</script>

<style scoped>
.global-info-container {
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
    margin-bottom: 10px;
}

.row-container:last-child {
    margin-bottom: 0;
}

.inner-row-container {
    width: 100%;
    margin-bottom: 34px;
}

.inner-row-container:last-child {
    margin-bottom: 0;
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
    .global-info-container {
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
