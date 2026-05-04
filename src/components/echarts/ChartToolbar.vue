<template>
    <div class="chart-toolbar">
        <div class="toolbar-group">
            <span class="toolbar-label">聚合模式</span>
            <el-button-group size="small">
                <el-button
                    :type="mode === 'none' ? 'primary' : 'default'"
                    @click="$emit('update:mode', 'none')"
                >
                    无
                </el-button>
                <el-button
                    :type="mode === 'average' ? 'primary' : 'default'"
                    @click="$emit('update:mode', 'average')"
                >
                    平均值
                </el-button>
                <el-button
                    :type="mode === 'sum' ? 'primary' : 'default'"
                    @click="$emit('update:mode', 'sum')"
                >
                    求和
                </el-button>
            </el-button-group>
        </div>

        <div v-if="mode !== 'none'" class="toolbar-group">
            <span class="toolbar-label">聚合区间</span>
            <el-select
                :model-value="interval"
                size="small"
                style="width: 100px"
                @update:model-value="$emit('update:interval', Number($event))"
            >
                <el-option
                    v-for="opt in intervalOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                />
            </el-select>
        </div>

        <div v-if="mode !== 'none'" class="toolbar-group">
            <span class="toolbar-label">聚合轴</span>
            <el-button-group size="small">
                <el-button
                    :type="aggregateAxis === 'time' ? 'primary' : 'default'"
                    @click="$emit('update:aggregateAxis', 'time')"
                >
                    时间
                </el-button>
                <el-button
                    :type="aggregateAxis === 'tick' ? 'primary' : 'default'"
                    @click="$emit('update:aggregateAxis', 'tick')"
                >
                    Tick
                </el-button>
            </el-button-group>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    mode: "none" | "average" | "sum";
    interval: number;
    aggregateAxis: "time" | "tick" | undefined;
}>();

defineEmits<{
    "update:mode": [value: "none" | "average" | "sum"];
    "update:interval": [value: number];
    "update:aggregateAxis": [value: "time" | "tick" | undefined];
}>();

const intervalOptions = [
    { label: "500", value: 500 },
    { label: "1000", value: 1000 },
    { label: "1500", value: 1500 },
    { label: "3000", value: 3000 },
    { label: "5000", value: 5000 },
    { label: "10000", value: 10000 },
    { label: "50000", value: 50000 },
];
</script>

<style scoped>
.chart-toolbar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 8px 12px;
    background: #fafafa;
    border-bottom: 1px solid #e8e8e8;
    flex-wrap: wrap;
}

.toolbar-group {
    display: flex;
    align-items: center;
    gap: 6px;
}

.toolbar-label {
    font-size: 12px;
    color: #666;
    white-space: nowrap;
}
</style>
