<template>
    <div class="lab-task-history-container">
        <el-card class="history-card">
            <template #header>
                <div class="card-header">
                    <span class="card-title">{{ title }}</span>
                    <el-tag v-if="roomName" type="info" size="small">{{ roomName }}</el-tag>
                </div>
            </template>

            <div v-if="!historyData || historyData.length === 0" class="empty-state">
                <el-empty :description="emptyDescription" :image-size="100" />
            </div>

            <div v-else class="history-content">
                <el-table
                    :data="sortedHistoryData"
                    style="width: 100%"
                    :default-sort="{ prop: 'endTick', order: 'ascending' }"
                    stripe
                    border
                    size="small"
                    class="history-table"
                >
                    <el-table-column prop="name" label="任务名称" width="180" sortable>
                        <template #default="{ row }">
                            <div class="task-name-cell">
                                <span class="task-name">{{ row.name }}</span>
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column
                        v-if="!roomName"
                        prop="roomName"
                        label="房间"
                        width="120"
                        sortable
                    >
                        <template #default="{ row }">
                            <el-tag type="info" size="small">{{ row.roomName }}</el-tag>
                        </template>
                    </el-table-column>

                    <el-table-column prop="type" label="任务类型" width="120" sortable>
                        <template #default="{ row }">
                            <el-tag :type="getTaskTypeTagType(row.type)" size="small">
                                {{ getTaskTypeText(row.type) }}
                            </el-tag>
                        </template>
                    </el-table-column>

                    <el-table-column
                        prop="taskStatus"
                        label="任务状态"
                        width="100"
                        sortable
                        :sort-method="sortByTaskStatus"
                    >
                        <template #default="{ row }">
                            <el-tag :type="getTaskStatusTagType(row)" size="small" effect="dark">
                                {{ getTaskStatusText(row) }}
                            </el-tag>
                        </template>
                    </el-table-column>

                    <el-table-column prop="priority" label="优先级" width="80" sortable>
                        <template #default="{ row }">
                            <span :class="getPriorityClass(row.priority)">
                                {{ row.priority }}
                            </span>
                        </template>
                    </el-table-column>

                    <el-table-column prop="startTick" label="开始Tick" width="100" sortable>
                        <template #default="{ row }">
                            {{ formatTick(row.startTick) }}
                        </template>
                    </el-table-column>

                    <el-table-column prop="endTick" label="结束Tick" width="100" sortable>
                        <template #default="{ row }">
                            <span v-if="row.endTick === -1" class="unfinished-tick">未完成</span>
                            <span v-else>{{ formatTick(row.endTick) }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column
                        label="持续时间"
                        width="100"
                        sortable
                        :sort-method="sortByDuration"
                    >
                        <template #default="{ row }">
                            <span v-if="row.endTick === -1" class="unfinished-duration"
                                >进行中</span
                            >
                            <span v-else>{{ calculateDuration(row.startTick, row.endTick) }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="任务详情" min-width="200">
                        <template #default="{ row }">
                            <div class="task-details">
                                <div v-if="row.type === 'boostCreep'" class="task-detail-item">
                                    <span class="detail-label">强化类型:</span>
                                    <el-tag type="warning" size="small">
                                        {{ row.boostType }}
                                    </el-tag>
                                    <span class="detail-label">身体部件:</span>
                                    <span>{{ row.bodyPartsCount }}</span>
                                </div>

                                <div v-if="row.type === 'runReaction'" class="task-detail-item">
                                    <span class="detail-label">反应:</span>
                                    <span>
                                        {{ row.materialType1 }} + {{ row.materialType2 }} →
                                        {{ row.productType }}
                                    </span>
                                    <span class="detail-label">数量:</span>
                                    <span>{{ row.gotAmount }}/{{ row.amount }}</span>
                                </div>

                                <div v-if="row.type === 'reverseReaction'" class="task-detail-item">
                                    <span class="detail-label">逆反应:</span>
                                    <span>
                                        {{ row.materialType }} → {{ row.productType1 }} +
                                        {{ row.productType2 }}
                                    </span>
                                    <span class="detail-label">数量:</span>
                                    <span>{{ row.gotAmount }}/{{ row.amount }}</span>
                                </div>

                                <div v-if="row.type === 'unboostCreep'" class="task-detail-item">
                                    <span class="detail-label">解除强化:</span>
                                    <span>爬虫ID: {{ row.creepId }}</span>
                                </div>

                                <div
                                    v-if="row.labList && row.labList.length > 0"
                                    class="task-detail-item"
                                >
                                    <span class="detail-label">实验室:</span>
                                    <span>{{ row.labList.length }} 个</span>
                                </div>
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" width="80" fixed="right">
                        <template #default="{ row }">
                            <el-button
                                type="primary"
                                size="small"
                                link
                                @click="showTaskDetails(row)"
                            >
                                详情
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 任务详情对话框 -->
                <el-dialog
                    v-model="detailDialogVisible"
                    :title="`任务详情 - ${selectedTask?.name || ''}`"
                    width="600px"
                    destroy-on-close
                >
                    <div v-if="selectedTask" class="task-detail-dialog">
                        <el-descriptions :column="2" border size="small">
                            <el-descriptions-item label="任务名称">
                                {{ selectedTask.name }}
                            </el-descriptions-item>
                            <el-descriptions-item label="任务类型">
                                <el-tag :type="getTaskTypeTagType(selectedTask.type)" size="small">
                                    {{ getTaskTypeText(selectedTask.type) }}
                                </el-tag>
                            </el-descriptions-item>
                            <el-descriptions-item label="优先级">
                                <span :class="getPriorityClass(selectedTask.priority)">
                                    {{ selectedTask.priority }}
                                </span>
                            </el-descriptions-item>
                            <el-descriptions-item label="开始Tick">
                                {{ formatTick(selectedTask.startTick) }}
                            </el-descriptions-item>
                            <el-descriptions-item label="结束Tick">
                                <span v-if="selectedTask.endTick === -1" class="unfinished-tick"
                                    >未完成</span
                                >
                                <span v-else>{{ formatTick(selectedTask.endTick) }}</span>
                            </el-descriptions-item>
                            <el-descriptions-item label="持续时间">
                                <span v-if="selectedTask.endTick === -1" class="unfinished-duration"
                                    >进行中</span
                                >
                                <span v-else>{{
                                    calculateDuration(selectedTask.startTick, selectedTask.endTick)
                                }}</span>
                            </el-descriptions-item>
                            <el-descriptions-item label="任务状态">
                                <el-tag
                                    v-if="selectedTask.isFailed"
                                    type="danger"
                                    size="small"
                                    effect="dark"
                                >
                                    失败
                                </el-tag>
                                <el-tag
                                    v-else-if="selectedTask.endTick === -1"
                                    type="warning"
                                    size="small"
                                    effect="dark"
                                >
                                    未完成
                                </el-tag>
                                <el-tag v-else type="success" size="small" effect="dark">
                                    成功
                                </el-tag>
                            </el-descriptions-item>
                            <el-descriptions-item label="房间名称">
                                {{ selectedTask.roomName }}
                            </el-descriptions-item>
                            <el-descriptions-item label="实验室数量">
                                {{ selectedTask.labList?.length || 0 }}
                            </el-descriptions-item>
                        </el-descriptions>

                        <!-- 任务类型特定详情 -->
                        <div
                            v-if="selectedTask.type === 'boostCreep'"
                            class="type-specific-details"
                        >
                            <h4>强化任务详情</h4>
                            <el-descriptions :column="2" border size="small">
                                <el-descriptions-item label="爬虫ID">
                                    {{ selectedTask.creepId }}
                                </el-descriptions-item>
                                <el-descriptions-item label="强化类型">
                                    <el-tag type="warning" size="small">
                                        {{ selectedTask.boostType }}
                                    </el-tag>
                                </el-descriptions-item>
                                <el-descriptions-item label="身体部件数量">
                                    {{ selectedTask.bodyPartsCount }}
                                </el-descriptions-item>
                                <el-descriptions-item label="是否携带结束">
                                    {{ selectedTask.isCarryEnd ? "是" : "否" }}
                                </el-descriptions-item>
                            </el-descriptions>
                        </div>

                        <div
                            v-if="selectedTask.type === 'unboostCreep'"
                            class="type-specific-details"
                        >
                            <h4>解除强化任务详情</h4>
                            <el-descriptions :column="2" border size="small">
                                <el-descriptions-item label="爬虫ID">
                                    {{ selectedTask.creepId }}
                                </el-descriptions-item>
                                <el-descriptions-item label="是否携带结束">
                                    {{ selectedTask.isCarryEnd ? "是" : "否" }}
                                </el-descriptions-item>
                            </el-descriptions>
                        </div>

                        <div
                            v-if="selectedTask.type === 'runReaction'"
                            class="type-specific-details"
                        >
                            <h4>反应任务详情</h4>
                            <el-descriptions :column="2" border size="small">
                                <el-descriptions-item label="反应式">
                                    {{ selectedTask.materialType1 }} +
                                    {{ selectedTask.materialType2 }} →
                                    {{ selectedTask.productType }}
                                </el-descriptions-item>
                                <el-descriptions-item label="目标数量">
                                    {{ selectedTask.amount }}
                                </el-descriptions-item>
                                <el-descriptions-item label="完成数量">
                                    {{ selectedTask.gotAmount }}
                                </el-descriptions-item>
                                <el-descriptions-item label="完成率">
                                    {{
                                        (
                                            (selectedTask.gotAmount / selectedTask.amount) *
                                            100
                                        ).toFixed(2)
                                    }}%
                                </el-descriptions-item>
                                <el-descriptions-item label="原料实验室">
                                    {{ selectedTask.materialLabs?.length || 0 }} 个
                                </el-descriptions-item>
                                <el-descriptions-item label="产物实验室">
                                    {{ selectedTask.productLabs?.length || 0 }} 个
                                </el-descriptions-item>
                                <el-descriptions-item label="是否正在任务完成后清理lab">
                                    {{ selectedTask.isClearingLabsOnEnd ? "是" : "否" }}
                                </el-descriptions-item>
                            </el-descriptions>
                        </div>

                        <div
                            v-if="selectedTask.type === 'reverseReaction'"
                            class="type-specific-details"
                        >
                            <h4>逆反应任务详情</h4>
                            <el-descriptions :column="2" border size="small">
                                <el-descriptions-item label="逆反应式">
                                    {{ selectedTask.materialType }} →
                                    {{ selectedTask.productType1 }} +
                                    {{ selectedTask.productType2 }}
                                </el-descriptions-item>
                                <el-descriptions-item label="目标数量">
                                    {{ selectedTask.amount }}
                                </el-descriptions-item>
                                <el-descriptions-item label="完成数量">
                                    {{ selectedTask.gotAmount }}
                                </el-descriptions-item>
                                <el-descriptions-item label="完成率">
                                    {{
                                        (
                                            (selectedTask.gotAmount / selectedTask.amount) *
                                            100
                                        ).toFixed(2)
                                    }}%
                                </el-descriptions-item>
                                <el-descriptions-item label="原料实验室">
                                    {{ selectedTask.materialLabs?.length || 0 }} 个
                                </el-descriptions-item>
                                <el-descriptions-item label="产物实验室">
                                    {{ selectedTask.productLabs?.length || 0 }} 个
                                </el-descriptions-item>
                                <el-descriptions-item label="是否正在任务完成后清理lab">
                                    {{ selectedTask.isClearingLabsOnEnd ? "是" : "否" }}
                                </el-descriptions-item>
                            </el-descriptions>
                        </div>

                        <!-- 实验室列表 -->
                        <div
                            v-if="selectedTask.labList && selectedTask.labList.length > 0"
                            class="lab-list"
                        >
                            <h4>实验室列表</h4>
                            <div class="lab-tags">
                                <el-tag
                                    v-for="(labId, index) in selectedTask.labList"
                                    :key="index"
                                    type="info"
                                    size="small"
                                    class="lab-tag"
                                >
                                    {{ labId }}
                                </el-tag>
                            </div>
                        </div>
                    </div>
                </el-dialog>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { LabTaskHistory } from "@/type/player/AI/AIUreium/control/maintain/runLab/type";

interface Props {
    historyData?: LabTaskHistory[];
    roomName?: string;
    title?: string;
}

const props = withDefaults(defineProps<Props>(), {
    historyData: () => [],
    roomName: "",
    title: "实验室任务历史",
});

// 对话框状态
const detailDialogVisible = ref(false);
const selectedTask = ref<LabTaskHistory | null>(null);

// 计算属性
const emptyDescription = computed(() => {
    return props.roomName
        ? `房间 ${props.roomName} 暂无实验室任务历史数据`
        : "暂无实验室任务历史数据";
});

// 按结束时间倒序排序的历史数据，未完成的任务（endTick === -1）显示在最前面
const sortedHistoryData = computed(() => {
    return [...props.historyData].sort((a, b) => {
        // 如果a是未完成的任务，b不是，则a排在前面
        if (a.endTick === -1 && b.endTick !== -1) return -1;
        // 如果b是未完成的任务，a不是，则b排在前面
        if (b.endTick === -1 && a.endTick !== -1) return 1;
        // 如果都是未完成的任务，按开始时间倒序排序（最新的开始时间在前）
        if (a.endTick === -1 && b.endTick === -1) {
            return b.startTick - a.startTick;
        }
        // 如果都是已完成的任务，按结束时间倒序排序（最新的结束时间在前）
        return b.endTick - a.endTick;
    });
});

// 格式化Tick显示
const formatTick = (tick: number): string => {
    if (tick === undefined || tick === null || isNaN(tick)) {
        return "N/A";
    }
    return tick.toLocaleString();
};

// 计算持续时间
const calculateDuration = (startTick: number, endTick: number): string => {
    if (endTick === -1) return "进行中";
    if (
        startTick === undefined ||
        startTick === null ||
        isNaN(startTick) ||
        endTick === undefined ||
        endTick === null ||
        isNaN(endTick)
    ) {
        return "N/A";
    }
    const duration = endTick - startTick;
    if (duration < 0) return "N/A";
    return `${duration} ticks`;
};

// 获取任务类型标签样式
const getTaskTypeTagType = (type: string): string => {
    switch (type) {
        case "boostCreep":
            return "warning";
        case "unboostCreep":
            return "info";
        case "runReaction":
            return "success";
        case "reverseReaction":
            return "primary";
        default:
            return "";
    }
};

// 获取任务类型文本
const getTaskTypeText = (type: string): string => {
    switch (type) {
        case "boostCreep":
            return "强化爬虫";
        case "unboostCreep":
            return "解除强化";
        case "runReaction":
            return "化学反应";
        case "reverseReaction":
            return "逆反应";
        default:
            return type;
    }
};

// 获取任务状态标签样式
const getTaskStatusTagType = (task: LabTaskHistory): string => {
    if (task.isFailed) return "danger";
    if (task.endTick === -1) return "warning";
    return "success";
};

// 获取任务状态文本
const getTaskStatusText = (task: LabTaskHistory): string => {
    if (task.isFailed) return "失败";
    if (task.endTick === -1) return "未完成";
    return "成功";
};

// 获取任务状态排序值（用于表格排序）
const getTaskStatusSortValue = (task: LabTaskHistory): number => {
    if (task.isFailed) return 3;
    if (task.endTick === -1) return 1;
    return 2;
};

// 表格任务状态排序方法
const sortByTaskStatus = (a: LabTaskHistory, b: LabTaskHistory): number => {
    return getTaskStatusSortValue(a) - getTaskStatusSortValue(b);
};

// 表格持续时间排序方法
const sortByDuration = (a: LabTaskHistory, b: LabTaskHistory): number => {
    return a.endTick - a.startTick - (b.endTick - b.startTick);
};

// 获取优先级样式类
const getPriorityClass = (priority: number): string => {
    if (priority >= 8) return "priority-high";
    if (priority >= 5) return "priority-medium";
    return "priority-low";
};

// 显示任务详情
const showTaskDetails = (task: LabTaskHistory): void => {
    selectedTask.value = task;
    detailDialogVisible.value = true;
};
</script>

<style scoped>
.lab-task-history-container {
    width: 100%;
    height: 100%;
}

.history-card {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-title {
    font-size: 16px;
    font-weight: 600;
}

.empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
}

.history-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.history-table {
    flex: 1;
    overflow: auto;
}

.task-name-cell {
    display: flex;
    align-items: center;
}

.task-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.task-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.task-detail-item {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.detail-label {
    font-weight: 600;
    color: #606266;
    font-size: 12px;
}

.priority-high {
    color: #f56c6c;
    font-weight: bold;
}

.priority-medium {
    color: #e6a23c;
    font-weight: bold;
}

.priority-low {
    color: #67c23a;
    font-weight: bold;
}

.type-specific-details {
    margin-top: 20px;
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 4px;
}

.type-specific-details h4 {
    margin: 0 0 12px 0;
    color: #303133;
    font-size: 14px;
}

.lab-list {
    margin-top: 20px;
}

.lab-list h4 {
    margin: 0 0 12px 0;
    color: #303133;
    font-size: 14px;
}

.lab-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.lab-tag {
    font-family: monospace;
    font-size: 12px;
}

.unfinished-tick {
    color: #e6a23c;
    font-weight: bold;
    font-style: italic;
}

.unfinished-duration {
    color: #e6a23c;
    font-weight: bold;
    font-style: italic;
}

:deep(.el-descriptions) {
    margin-top: 16px;
}

:deep(.el-descriptions__title) {
    font-size: 14px;
}

:deep(.el-descriptions__label) {
    font-weight: 600;
}
</style>
