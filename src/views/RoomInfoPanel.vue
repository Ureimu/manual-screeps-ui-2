<template>
    <div class="panel-with-sidebar">
        <PanelSidebar
            title="房间面板"
            :categories="sidebarCategories"
            :activeCategory="activeCategory"
            @select="scrollToCategory"
        />
        <div ref="mainContentRef" class="panel-main-content">
            <div v-if="screepsData" class="panel-main">
                <!-- 房间总览 / 资源分布 -->
                <div ref="overviewRef" class="section-anchor">
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
                                                screepsData.roomData[currentRoomName]?.controller ||
                                                null
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
                </div>

                <!-- 房间配置 -->
                <div ref="configRef" class="section-anchor">
                    <el-row v-if="currentRoomName" :gutter="24" class="row-container chart-row">
                        <el-col :xs="24" :sm="24" :md="24" :lg="24">
                            <div class="config-section">
                                <RoomConfigDisplay
                                    :roomName="currentRoomName || null"
                                    :configData="screepsData.config"
                                />
                            </div>
                        </el-col>
                    </el-row>

                    <el-row v-if="currentRoomName" :gutter="24" class="row-container chart-row">
                        <el-col :xs="24" :sm="24" :md="24" :lg="24">
                            <div class="config-section">
                                <RoomResourceConfigDisplay
                                    :roomName="currentRoomName || null"
                                    :configData="screepsData.config"
                                />
                            </div>
                        </el-col>
                    </el-row>
                </div>

                <!-- 进度/能量 -->
                <div ref="progressRef" class="section-anchor">
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
                                    :exp="
                                        screepsData.timeSeriesData?.roomData?.[currentRoomName]
                                            ?.controllerProgress?.exp
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
                                        screepsData.timeSeriesData?.roomData?.[currentRoomName]
                                            ?.storageData?.energy?.data
                                    "
                                    :exp="
                                        screepsData.timeSeriesData?.roomData?.[currentRoomName]
                                            ?.storageData?.energy?.exp
                                    "
                                    :visible="true"
                                />
                            </div>
                        </el-col>
                    </el-row>
                </div>

                <!-- 孵化信息 -->
                <div ref="spawnRef" class="section-anchor">
                    <el-row v-if="currentRoomName" :gutter="24" class="row-container chart-row">
                        <el-col :xs="24" :sm="24" :md="12" :lg="12">
                            <div class="chart-wrapper">
                                <FlexibleLineChart
                                    id="spawn-time-chart"
                                    name="孵化时间"
                                    :timeData="screepsData.timeSeriesData?.timeStamp?.data"
                                    :gameTimeData="screepsData.timeSeriesData?.gameTime?.data"
                                    :yData="totalSpawnTimeData"
                                    :mode="'sum'"
                                    :interval="1500"
                                    :aggregateAxis="'tick'"
                                    :visible="true"
                                />
                            </div>
                        </el-col>
                        <el-col :xs="24" :sm="24" :md="12" :lg="12">
                            <div class="chart-wrapper">
                                <FlexibleLineChart
                                    id="cpu-chart"
                                    name="CPU使用情况"
                                    :timeData="screepsData.timeSeriesData?.timeStamp?.data"
                                    :gameTimeData="screepsData.timeSeriesData?.gameTime?.data"
                                    :yData="
                                        screepsData.timeSeriesData?.roomData?.[currentRoomName]?.cpu
                                            ?.data
                                    "
                                    :exp="
                                        screepsData.timeSeriesData?.roomData?.[currentRoomName]?.cpu
                                            ?.exp
                                    "
                                    :visible="true"
                                />
                            </div>
                        </el-col>
                    </el-row>

                    <el-row v-if="currentRoomName" :gutter="24" class="row-container chart-row">
                        <el-col :xs="24" :sm="24" :md="12" :lg="12">
                            <div class="chart-wrapper">
                                <FlexibleLineChart
                                    id="spawn-energy-chart"
                                    name="孵化能量"
                                    :timeData="screepsData.timeSeriesData?.timeStamp?.data"
                                    :gameTimeData="screepsData.timeSeriesData?.gameTime?.data"
                                    :yData="totalSpawnEnergyData"
                                    :mode="'sum'"
                                    :interval="1500"
                                    :aggregateAxis="'tick'"
                                    :visible="true"
                                />
                            </div>
                        </el-col>
                    </el-row>
                </div>

                <!-- 项目列表 -->
                <div ref="projectsRef" class="section-anchor">
                    <el-row v-if="currentRoomName" :gutter="24" class="row-container chart-row">
                        <el-col :xs="24" :sm="24" :md="24" :lg="24">
                            <div class="chart-wrapper">
                                <ProjectsDisplay :projectsData="filteredProjectsData" />
                            </div>
                        </el-col>
                    </el-row>
                </div>

                <!-- 实验室任务历史 -->
                <div ref="labHistoryRef" class="section-anchor">
                    <el-row v-if="currentRoomName" :gutter="24" class="row-container chart-row">
                        <el-col :xs="24" :sm="24" :md="24" :lg="24">
                            <div class="chart-wrapper">
                                <LabTaskHistoryDisplay
                                    :historyData="labTaskHistoryData"
                                    :roomName="currentRoomName"
                                />
                            </div>
                        </el-col>
                    </el-row>
                </div>

                <!-- 外矿数据 -->
                <div ref="outwardsRef" class="section-anchor">
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
                                    :mode="'sum'"
                                    :interval="1500"
                                    :aggregateAxis="'tick'"
                                    :visible="true"
                                />
                            </div>
                        </el-col>
                    </el-row>
                </div>
                <div ref="energyDeltaRef" class="section-anchor">
                    <el-row
                        v-if="currentRoomName && energyDeltaProjects.length > 0"
                        :gutter="24"
                        class="row-container chart-row"
                    >
                        <el-col :xs="24" :sm="24" :md="24" :lg="24">
                            <div class="chart-wrapper">
                                <div class="project-selector">
                                    <span class="selector-label">选择项目：</span>
                                    <el-select
                                        v-model="selectedEnergyDeltaProject"
                                        placeholder="请选择项目"
                                        style="width: 240px"
                                    >
                                        <el-option
                                            v-for="project in energyDeltaProjects"
                                            :key="project"
                                            :label="project"
                                            :value="project"
                                        />
                                    </el-select>
                                </div>
                                <ComparableLineChart
                                    v-if="
                                        selectedEnergyDeltaProject &&
                                        energyDeltaByCreepData.length > 0
                                    "
                                    :key="'energy-delta-' + selectedEnergyDeltaProject"
                                    id="energy-delta-chart"
                                    :name="`项目能量净收益 - ${selectedEnergyDeltaProject}`"
                                    :timeData="screepsData.timeSeriesData?.timeStamp?.data"
                                    :gameTimeData="screepsData.timeSeriesData?.gameTime?.data"
                                    :yDataList="energyDeltaByCreepData"
                                    :mode="'sum'"
                                    :interval="1500"
                                    :aggregateAxis="'tick'"
                                    :visible="true"
                                />
                                <el-empty
                                    v-else-if="selectedEnergyDeltaProject"
                                    description="该项目暂无爬虫数据"
                                />
                            </div>
                        </el-col>
                    </el-row>
                </div>
            </div>

            <!-- 无数据提示 -->
            <el-empty v-else description="暂无房间数据，等待游戏数据..." />
        </div>
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
import ProjectsDisplay from "@/components/ProjectsDisplay.vue";
import RoomConfigDisplay from "@/components/config/RoomConfigDisplay.vue";
import RoomResourceConfigDisplay from "@/components/config/RoomResourceConfigDisplay.vue";
import LabTaskHistoryDisplay from "@/components/LabTaskHistoryDisplay.vue";
import PanelSidebar from "@/components/sidebar/PanelSidebar.vue";
import type { SidebarCategory } from "@/components/sidebar/PanelSidebar.vue";

// Pinia store
const appStore = useAppStore();

// 本地状态
const screepsData = computed(() => appStore.screepsData);

// 侧栏分类
const activeCategory = ref("overview");

const sidebarCategories = computed<SidebarCategory[]>(() => [
    { key: "overview", label: "房间总览 / 资源" },
    { key: "config", label: "房间配置" },
    { key: "progress", label: "进度 / 能量" },
    { key: "spawn", label: "孵化信息" },
    { key: "projects", label: "项目列表" },
    { key: "labHistory", label: "实验室历史" },
    { key: "outwards", label: "外矿数据" },
    { key: "energyDelta", label: "项目能量净收益" },
]);

// DOM 元素引用
const mainContentRef = ref<HTMLElement | null>(null);
const overviewRef = ref<HTMLElement | null>(null);
const configRef = ref<HTMLElement | null>(null);
const progressRef = ref<HTMLElement | null>(null);
const spawnRef = ref<HTMLElement | null>(null);
const projectsRef = ref<HTMLElement | null>(null);
const labHistoryRef = ref<HTMLElement | null>(null);
const outwardsRef = ref<HTMLElement | null>(null);
const energyDeltaRef = ref<HTMLElement | null>(null);

const categoryRefMap: Record<string, ReturnType<typeof ref<HTMLElement | null>>> = {
    overview: overviewRef,
    config: configRef,
    progress: progressRef,
    spawn: spawnRef,
    projects: projectsRef,
    labHistory: labHistoryRef,
    outwards: outwardsRef,
    energyDelta: energyDeltaRef,
};

function scrollToCategory(key: string): void {
    activeCategory.value = key;
    const targetRef = categoryRefMap[key];
    if (targetRef?.value) {
        targetRef.value.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

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
        exp: data.exp,
    }));
});

// 获取 energyDeltaByProjectByCreep 中的所有项目名称列表
const energyDeltaProjects = computed(() => {
    if (!screepsData.value?.timeSeriesData || !currentRoomName.value) return [];
    const roomData = screepsData.value.timeSeriesData.roomData?.[currentRoomName.value];
    if (!roomData?.storageData?.energyDeltaByProjectByCreep) return [];
    return Object.keys(roomData.storageData.energyDeltaByProjectByCreep);
});

// 当前选中的项目（默认选择第一个）
const selectedEnergyDeltaProject = computed({
    get: () => {
        if (energyDeltaProjects.value.length === 0) return null;
        // 使用内部 ref 保存用户手动选择的值
        return _selectedEnergyDeltaProject.value ?? energyDeltaProjects.value[0] ?? null;
    },
    set: (val) => {
        _selectedEnergyDeltaProject.value = val;
    },
});
const _selectedEnergyDeltaProject = ref<string | null>(null);

// 获取选中项目的每个爬虫的能量净收益数据
// 公式: energyDeltaByCreep = storage能量交换(per creep) - spawn能量消耗(per project / creep count)
const energyDeltaByCreepData = computed(() => {
    if (
        !screepsData.value?.timeSeriesData ||
        !currentRoomName.value ||
        !selectedEnergyDeltaProject.value
    )
        return [];
    const roomData = screepsData.value.timeSeriesData.roomData?.[currentRoomName.value];
    if (!roomData?.storageData?.energyDeltaByProjectByCreep) return [];

    const projectData =
        roomData.storageData.energyDeltaByProjectByCreep[selectedEnergyDeltaProject.value];
    if (!projectData) return [];

    const creepEntries = Object.entries(projectData);
    const creepCount = creepEntries.length;

    // 获取该项目的 spawnEnergy
    const spawnEnergyData = roomData.spawnEnergy?.[selectedEnergyDeltaProject.value];
    const spawnArr = Array.isArray(spawnEnergyData?.data) ? spawnEnergyData.data : [];

    return creepEntries.map(([creepName, storageDelta]) => {
        const storageArr = Array.isArray(storageDelta.data) ? storageDelta.data : [];

        const resultData = storageArr.map((storageVal, index) => {
            if (storageVal === null) return null;
            // 将 spawnEnergy 平均分摊到每个 creep
            const spawnVal = creepCount > 0 ? (spawnArr[index] ?? 0) / creepCount : 0;
            return storageVal - spawnVal;
        });

        return {
            name: creepName,
            data: resultData,
        };
    });
});

// 汇总 spawnTime: 对每个房间的所有 project 求和
const totalSpawnTimeData = computed(() => {
    if (!screepsData.value?.timeSeriesData || !currentRoomName.value) return [];
    const roomData = screepsData.value.timeSeriesData.roomData?.[currentRoomName.value];
    if (!roomData?.spawnTime) return [];

    const entries = Object.values(roomData.spawnTime);
    if (entries.length === 0) return [];

    const maxLen = Math.max(...entries.map((e) => (Array.isArray(e.data) ? e.data.length : 0)));
    const result: (number | null)[] = new Array(maxLen).fill(0);

    for (const entry of entries) {
        const data = Array.isArray(entry.data) ? entry.data : [];
        for (let i = 0; i < data.length; i++) {
            const val = data[i];
            if (val == null) continue;
            result[i] = (result[i] ?? 0) + val;
        }
    }

    return result;
});

// 汇总 spawnEnergy: 对每个房间的所有 project 求和
const totalSpawnEnergyData = computed(() => {
    if (!screepsData.value?.timeSeriesData || !currentRoomName.value) return [];
    const roomData = screepsData.value.timeSeriesData.roomData?.[currentRoomName.value];
    if (!roomData?.spawnEnergy) return [];

    const entries = Object.values(roomData.spawnEnergy);
    if (entries.length === 0) return [];

    const maxLen = Math.max(...entries.map((e) => (Array.isArray(e.data) ? e.data.length : 0)));
    const result: (number | null)[] = new Array(maxLen).fill(0);

    for (const entry of entries) {
        const data = Array.isArray(entry.data) ? entry.data : [];
        for (let i = 0; i < data.length; i++) {
            const val = data[i];
            if (val == null) continue;
            result[i] = (result[i] ?? 0) + val;
        }
    }

    return result;
});

// 筛选项目数据 - 只显示项目ID以当前房间名称开头的项目
const filteredProjectsData = computed(() => {
    if (!screepsData.value?.globalData?.projects || !currentRoomName.value) return {};

    const allProjects = screepsData.value.globalData.projects;
    const filteredProjects: Record<
        string,
        Record<string, { diagram: string; memory: Record<string, unknown> }>
    > = {};

    Object.entries(allProjects).forEach(([projectType, projectsByType]) => {
        const filteredProjectsByType: Record<
            string,
            { diagram: string; memory: Record<string, unknown> }
        > = {};

        Object.entries(projectsByType).forEach(([projectId, project]) => {
            // 检查项目ID是否以当前房间名称开头
            if (projectId.startsWith(currentRoomName.value!)) {
                filteredProjectsByType[projectId] = project;
            }
        });

        // 只有当该类型下有符合条件的项目时才添加到结果中
        if (Object.keys(filteredProjectsByType).length > 0) {
            filteredProjects[projectType] = filteredProjectsByType;
        }
    });

    return filteredProjects;
});

// 获取实验室任务历史数据
const labTaskHistoryData = computed(() => {
    if (!screepsData.value?.historyData?.lab || !currentRoomName.value) return [];
    return screepsData.value.historyData.lab[currentRoomName.value] || [];
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

.project-selector {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #fafbfc;
    border-bottom: 1px solid #e1e8ed;
}

.selector-label {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    white-space: nowrap;
}
</style>
