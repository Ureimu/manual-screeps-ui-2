<template>
    <div ref="containerRef" class="dashboard-container">
        <div v-if="screepsData" class="panel-main">
            <el-row :gutter="0" class="row-container first-row">
                <el-col :xs="24" :sm="24" :md="12" :lg="12" class="left-column">
                    <el-row :gutter="24" class="inner-row-container full-height">
                        <el-col :xs="24" :sm="24" :md="24" :lg="24">
                            <div class="info-section">
                                <TextContainer title="房间信息" :msg="roomInfoMessages" />
                            </div>
                        </el-col>
                    </el-row>

                    <!-- 房间控制器等级 -->
                    <el-row
                        v-if="currentRoomName && screepsData.roomData[currentRoomName]"
                        :gutter="24"
                        class="inner-row-container"
                    >
                        <el-col :xs="24" :sm="24" :md="24" :lg="24">
                            <div class="info-section">
                                <ProgressIndicator
                                    msg="RCL"
                                    :levelData="
                                        screepsData.roomData[currentRoomName]?.controller || null
                                    "
                                    :isFull="false"
                                />
                            </div>
                        </el-col>
                    </el-row>
                </el-col>
                <el-col :xs="24" :sm="24" :md="12" :lg="12" class="right-column">
                    <el-row :gutter="24" class="inner-row-container full-height">
                        <!-- 资源分布图 -->
                        <el-col v-if="currentRoomName" :xs="24" :sm="24" :md="24" :lg="24">
                            <div class="chart-section">
                                <SunBurstResourceChart
                                    id="resource-chart"
                                    name="资源分布"
                                    :roomData="screepsData.roomData[currentRoomName]?.store"
                                    :visible="true"
                                />
                            </div>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>

            <!-- 房间控制器进度和能量存储 -->
            <el-row v-if="currentRoomName" :gutter="24" class="row-container chart-row">
                <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <div class="chart-wrapper">
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
                    </div>
                </el-col>
                <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <div class="chart-wrapper">
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
                    </div>
                </el-col>
            </el-row>

            <!-- 外矿能量对比图 -->
            <el-row
                v-if="currentRoomName && outwardsSourceData.length > 0"
                :gutter="24"
                class="row-container chart-row"
            >
                <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <div class="chart-wrapper">
                        <ComparableLineChart
                            id="outwards-source-chart"
                            name="外矿能量对比"
                            :timeData="screepsData.timeSeriesData?.timeStamp?.data"
                            :gameTimeData="screepsData.timeSeriesData?.gameTime?.data"
                            :yDataList="outwardsSourceData"
                            :visible="true"
                        />
                    </div>
                </el-col>
            </el-row>
        </div>

        <!-- 无数据提示 -->
        <el-empty v-else description="暂无房间数据，等待游戏数据..." />
    </div>
</template>

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
const containerRef = ref<HTMLDivElement | null>(null);

// 房间选择 - 使用store中的状态
const selectedRoom = computed({
    get: () => appStore.selectedRoom,
    set: (value) => appStore.setSelectedRoom(value),
});

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
