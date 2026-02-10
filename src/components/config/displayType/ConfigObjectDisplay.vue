<template>
    <!-- 如果整个data对象不包含嵌套对象，使用el-descriptions展示 -->
    <el-descriptions
        v-if="isSimpleObject(data)"
        :column="2"
        border
        size="small"
        class="simple-object-display"
    >
        <el-descriptions-item v-for="(value, key) in data" :key="key" :label="key">
            <ConfigValueDisplay :value="value" />
        </el-descriptions-item>
    </el-descriptions>

    <!-- 否则使用原来的展示方式 -->
    <div v-else class="object-display">
        <div v-for="(value, key) in data" :key="key" class="object-item">
            <div class="item-header">
                <h4 class="item-title">{{ key }}</h4>
            </div>

            <!-- 根据值的类型选择不同的展示方式 -->
            <div class="item-content">
                <!-- 布尔值 -->
                <el-tag
                    v-if="typeof value === 'boolean'"
                    :type="value ? 'success' : 'info'"
                    size="small"
                >
                    {{ value ? "是" : "否" }}
                </el-tag>

                <!-- 数组 -->
                <div v-else-if="Array.isArray(value)" class="array-display">
                    <div v-if="value.length">
                        <el-tag v-for="item in value" :key="item" size="small" class="array-item">
                            {{ item }}
                        </el-tag>
                    </div>
                    <span v-else class="empty-text">无</span>
                </div>

                <!-- 对象（包括嵌套对象） -->
                <div
                    v-else-if="typeof value === 'object' && value !== null"
                    class="nested-object-display"
                >
                    <!-- 如果是简单对象，使用el-descriptions展示 -->
                    <el-descriptions v-if="isSimpleObject(value)" :column="2" border size="small">
                        <el-descriptions-item
                            v-for="(nestedValue, nestedKey) in value as Record<string, unknown>"
                            :key="nestedKey"
                            :label="nestedKey"
                        >
                            <ConfigValueDisplay :value="nestedValue" />
                        </el-descriptions-item>
                    </el-descriptions>

                    <!-- 如果是复杂嵌套对象，递归展示 -->
                    <div v-else class="recursive-display">
                        <ConfigObjectDisplay
                            :data="value as Record<string, unknown>"
                            :section-key="sectionKey + '.' + key"
                        />
                    </div>
                </div>

                <!-- 字符串或数字 -->
                <span v-else class="simple-value">{{ value }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ConfigValueDisplay from "./ConfigValueDisplay.vue";

interface Props {
    data: Record<string, unknown>;
    sectionKey?: string;
}

defineProps<Props>();

// 判断是否为简单对象（所有值都是基本类型或数组）
const isSimpleObject = (obj: unknown): boolean => {
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
        return false;
    }

    // 检查对象的所有值是否都是基本类型或数组
    for (const value of Object.values(obj)) {
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
            return false; // 包含嵌套对象
        }
    }

    return true;
};
</script>

<style scoped>
.simple-object-display {
    margin-bottom: 16px;
}

.object-display {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.object-item {
    background: #f8f9fa;
    border-radius: 6px;
    padding: 16px;
    border: 1px solid #e4e7ed;
}

.item-header {
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ebeef5;
}

.item-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin: 0;
}

.item-content {
    min-height: 20px;
}

.array-display {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.array-item {
    margin: 2px;
}

.nested-object-display {
    margin-top: 8px;
}

.recursive-display {
    margin-top: 8px;
}

.simple-value {
    font-size: 14px;
    color: #303133;
}

.empty-text {
    color: #909399;
    font-style: italic;
    font-size: 12px;
}
</style>
