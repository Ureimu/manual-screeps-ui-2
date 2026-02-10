<template>
    <template v-if="value !== null && value !== undefined">
        <!-- 布尔值显示 -->
        <el-tag v-if="typeof value === 'boolean'" :type="value ? 'success' : 'info'" size="small">
            {{ value ? "是" : "否" }}
        </el-tag>
        <!-- 数组显示 -->
        <div v-else-if="Array.isArray(value)">
            <div v-if="value.length">
                <el-tag v-for="item in value" :key="item" size="small" class="room-tag">
                    {{ item }}
                </el-tag>
            </div>
            <span v-else class="empty-text">无</span>
        </div>
        <!-- 对象显示 -->
        <div v-else-if="typeof value === 'object' && value !== null">
            <div
                v-for="(nestedValue, nestedKey) in Object.entries(value)"
                :key="nestedKey"
                class="nested-item"
            >
                <span class="nested-key">{{ nestedKey }}: </span>
                <span class="nested-value">{{ nestedValue }}</span>
            </div>
        </div>
        <!-- 字符串或数字显示 -->
        <span v-else>{{ value }}</span>
    </template>
    <span v-else class="empty-text">-</span>
</template>

<script setup lang="ts">
interface Props {
    value: unknown;
}

defineProps<Props>();
</script>

<style scoped>
.room-tag {
    margin: 2px 4px 2px 0;
}

.empty-text {
    color: #909399;
    font-style: italic;
    font-size: 12px;
}

.nested-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
    border-bottom: 1px dashed #ebeef5;
}

.nested-item:last-child {
    border-bottom: none;
}

.nested-key {
    font-size: 12px;
    color: #909399;
    font-weight: 500;
}

.nested-value {
    font-size: 12px;
    font-weight: 500;
    color: #303133;
}
</style>
