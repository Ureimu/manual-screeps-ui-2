<template>
    <div class="panel-with-sidebar">
        <PanelSidebar
            title="全局面板"
            :categories="sidebarCategories"
            :activeCategory="activeCategory"
            @select="scrollToCategory"
        />
        <div ref="mainContentRef" class="panel-main-content">
            <div v-if="screepsData" class="panel-main">
                <!-- 用户信息 -->
                <div ref="userInfoRef" class="section-anchor">
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
                            <!-- 保留右侧列 -->
                            <el-row :gutter="24" class="inner-row-container full-height">
                                <el-col :xs="24" :sm="24" :md="24" :lg="24">
                                    <div class="info-section" />
                                </el-col>
                            </el-row>
                        </el-col>
                    </el-row>
                </div>

                <!-- 账户图表 -->
                <div ref="accountChartsRef" class="section-anchor">
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
                </div>

                <!-- 进度图表 -->
                <div ref="progressChartsRef" class="section-anchor">
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
            </div>

            <!-- 无数据提示 -->
            <el-empty v-else description="暂无全局数据，等待游戏数据..." />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAppStore } from "@/stores/app";

// 导入子组件
import ProgressIndicator from "@/components/ProgressIndicator.vue";
import TextContainer from "@/components/TextContainer.vue";
import FlexibleLineChart from "@/components/echarts/FlexibleLineChart.vue";
import PanelSidebar from "@/components/sidebar/PanelSidebar.vue";
import type { SidebarCategory } from "@/components/sidebar/PanelSidebar.vue";

// Pinia store
const appStore = useAppStore();

// 本地状态
const screepsData = computed(() => appStore.screepsData);

// 侧栏分类
const activeCategory = ref("userInfo");

const sidebarCategories = computed<SidebarCategory[]>(() => [
    { key: "userInfo", label: "用户信息" },
    { key: "accountCharts", label: "账户图表" },
    { key: "progressCharts", label: "进度图表" },
]);

// DOM 元素引用
const mainContentRef = ref<HTMLElement | null>(null);
const userInfoRef = ref<HTMLElement | null>(null);
const accountChartsRef = ref<HTMLElement | null>(null);
const progressChartsRef = ref<HTMLElement | null>(null);

const categoryRefMap: Record<string, ReturnType<typeof ref<HTMLElement | null>>> = {
    userInfo: userInfoRef,
    accountCharts: accountChartsRef,
    progressCharts: progressChartsRef,
};

function scrollToCategory(key: string): void {
    activeCategory.value = key;
    const targetRef = categoryRefMap[key];
    if (targetRef?.value) {
        targetRef.value.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

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
