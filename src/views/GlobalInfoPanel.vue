<template>
    <div class="global-info-container">
        <div v-if="screepsData" class="panel-main">
            <!-- 用户信息 -->
            <el-row :gutter="0" class="row-container first-row">
                <el-col :xs="24" :sm="24" :md="12" :lg="12" class="left-column">
                    <el-row :gutter="24" class="inner-row-container">
                        <el-col :xs="24" :sm="24" :md="24" :lg="24">
                            <div class="info-section">
                                <TextContainer title="用户信息" :msg="userInfoMessages" />
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
                    <!-- 保留右侧列，但移除资源分布图 -->
                    <el-row :gutter="24" class="inner-row-container full-height">
                        <el-col :xs="24" :sm="24" :md="24" :lg="24">
                            <div class="info-section">
                                <!-- 可以添加其他全局信息 -->
                            </div>
                        </el-col>
                    </el-row>
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

// 导入子组件
import ProgressIndicator from "@/components/ProgressIndicator.vue";
import TextContainer from "@/components/TextContainer.vue";
import FlexibleLineChart from "@/components/echarts/FlexibleLineChart.vue";

// Pinia store
const appStore = useAppStore();

// 本地状态
const screepsData = computed(() => appStore.screepsData);

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
