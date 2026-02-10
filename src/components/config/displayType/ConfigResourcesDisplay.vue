<template>
    <div class="resources-grid">
        <div
            v-for="(limit, resource) in (data as any).limit"
            :key="resource.toString()"
            class="resource-item"
        >
            <div class="resource-header">
                <span class="resource-name">{{ resource }}</span>
                <el-tag
                    v-if="
                        isDifferentFromDefault &&
                        isDifferentFromDefault(sectionKey + '.limit.' + resource)
                    "
                    type="warning"
                    size="mini"
                    class="diff-tag"
                >
                    自定义
                </el-tag>
            </div>
            <div class="resource-limits">
                <div class="limit-item">
                    <span class="limit-label">最小:</span>
                    <span class="limit-value">{{ limit.min || 0 }}</span>
                </div>
                <div class="limit-item">
                    <span class="limit-label">最大:</span>
                    <span class="limit-value">{{ limit.max || "无限制" }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    data: Record<string, unknown>;
    sectionKey?: string;
    isDifferentFromDefault?: ((path: string) => boolean) | undefined;
}

defineProps<Props>();
</script>

<style scoped>
.resources-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
}

.resource-item {
    background: #f8f9fa;
    border-radius: 6px;
    padding: 12px;
    border: 1px solid #e4e7ed;
    transition: all 0.3s ease;
}

.resource-item:hover {
    border-color: #409eff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.resource-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e4e7ed;
}

.resource-name {
    font-weight: 600;
    color: #303133;
    font-size: 13px;
}

.diff-tag {
    font-size: 10px;
    padding: 0 6px;
    height: 20px;
}

.resource-limits {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.limit-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.limit-label {
    font-size: 12px;
    color: #909399;
}

.limit-value {
    font-size: 12px;
    font-weight: 500;
    color: #303133;
}
</style>
