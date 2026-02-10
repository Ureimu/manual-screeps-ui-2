<template>
    <div class="resources-display">
        <!-- terminalBoundToStorageLimit 配置 -->
        <div class="config-section">
            <div class="section-header">
                <h4 class="section-title">终端容量绑定设置</h4>
                <el-tag
                    v-if="
                        isDifferentFromDefault &&
                        isDifferentFromDefault(sectionKey + '.terminalBoundToStorageLimit')
                    "
                    type="warning"
                    size="mini"
                    class="diff-tag"
                >
                    自定义
                </el-tag>
            </div>
            <div class="section-content">
                <el-tag :type="terminalBoundToStorageLimit ? 'success' : 'info'" size="small">
                    {{ terminalBoundToStorageLimit ? "已绑定" : "未绑定" }}
                </el-tag>
                <p class="config-description">
                    {{
                        terminalBoundToStorageLimit
                            ? "终端容量将基于Storage容量按比例计算"
                            : "终端容量独立设置"
                    }}
                </p>
            </div>
        </div>

        <!-- Storage 资源限制 -->
        <div class="config-section">
            <div class="section-header">
                <h4 class="section-title">Storage 资源限制</h4>
                <el-tag
                    v-if="
                        isDifferentFromDefault &&
                        isDifferentFromDefault(sectionKey + '.limit.storage')
                    "
                    type="warning"
                    size="mini"
                    class="diff-tag"
                >
                    自定义
                </el-tag>
            </div>
            <div class="resources-grid">
                <div
                    v-for="(resourceLimit, resourceName) in storageLimits"
                    :key="'storage-' + resourceName"
                    class="resource-card"
                    :class="{ 'has-diff': hasResourceDiff('storage', resourceName) }"
                >
                    <div class="resource-header">
                        <span class="resource-name">{{ resourceName }}</span>
                        <el-tag
                            v-if="isMineralCompound(resourceName)"
                            type="success"
                            size="mini"
                            class="compound-tag"
                        >
                            化合物
                        </el-tag>
                    </div>

                    <div class="resource-limits">
                        <div class="limit-row">
                            <span class="limit-label">最小:</span>
                            <span class="limit-value">{{ resourceLimit.min || 0 }}</span>
                        </div>
                        <div class="limit-row">
                            <span class="limit-label">最大:</span>
                            <span class="limit-value">{{ resourceLimit.max || "无限制" }}</span>
                        </div>

                        <!-- 化合物特有属性 -->
                        <div v-if="isMineralCompound(resourceName)" class="compound-properties">
                            <div class="limit-row">
                                <span class="limit-label">合成目标:</span>
                                <span class="limit-value">{{
                                    resourceLimit.reactionGoal || 0
                                }}</span>
                            </div>
                            <div class="limit-row">
                                <span class="limit-label">合成优先级:</span>
                                <span class="limit-value">{{
                                    resourceLimit.reactionPriority || 0
                                }}</span>
                            </div>
                            <div class="limit-row">
                                <span class="limit-label">批次数量:</span>
                                <span class="limit-value">{{
                                    resourceLimit.reactionBatchAmount || 0
                                }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Terminal 资源限制 -->
        <div class="config-section" v-if="!terminalBoundToStorageLimit">
            <div class="section-header">
                <h4 class="section-title">Terminal 资源限制</h4>
                <el-tag
                    v-if="
                        isDifferentFromDefault &&
                        isDifferentFromDefault(sectionKey + '.limit.terminal')
                    "
                    type="warning"
                    size="mini"
                    class="diff-tag"
                >
                    自定义
                </el-tag>
            </div>
            <div class="resources-grid">
                <div
                    v-for="(resourceLimit, resourceName) in terminalLimits"
                    :key="'terminal-' + resourceName"
                    class="resource-card"
                    :class="{ 'has-diff': hasResourceDiff('terminal', resourceName) }"
                >
                    <div class="resource-header">
                        <span class="resource-name">{{ resourceName }}</span>
                    </div>

                    <div class="resource-limits">
                        <div class="limit-row">
                            <span class="limit-label">最小:</span>
                            <span class="limit-value">{{ resourceLimit.min || 0 }}</span>
                        </div>
                        <div class="limit-row">
                            <span class="limit-label">最大:</span>
                            <span class="limit-value">{{ resourceLimit.max || "无限制" }}</span>
                        </div>
                        <div class="limit-row">
                            <span class="limit-label">最高买入价:</span>
                            <span class="limit-value">{{ resourceLimit.maxBuyPrice || 0 }}</span>
                        </div>
                        <div class="limit-row">
                            <span class="limit-label">最低卖出价:</span>
                            <span class="limit-value">{{ resourceLimit.minSellPrice || 0 }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Terminal 绑定提示 -->
        <div class="config-section" v-else>
            <div class="section-header">
                <h4 class="section-title">Terminal 资源限制</h4>
            </div>
            <div class="bound-notice">
                <el-alert type="info" :closable="false" show-icon>
                    <template #title>
                        <span>Terminal 容量已绑定到 Storage</span>
                    </template>
                    <p>Terminal 的容量限制将基于 Storage 的设定自动计算，无需单独配置。</p>
                </el-alert>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
    data: Record<string, unknown>;
    sectionKey?: string;
    isDifferentFromDefault?: ((path: string) => boolean) | undefined;
}

const props = defineProps<Props>();

// 类型定义
interface ResourceLimit {
    min?: number;
    max?: number;
    maxBuyPrice?: number;
    minSellPrice?: number;
    reactionGoal?: number;
    reactionPriority?: number;
    reactionBatchAmount?: number;
}

interface RoomResourcesConfig {
    terminalBoundToStorageLimit: boolean;
    limit: {
        storage: Record<string, ResourceLimit>;
        terminal: Record<string, ResourceLimit>;
    };
}

// 计算属性
const configData = computed(() => {
    return props.data as unknown as RoomResourcesConfig;
});

const terminalBoundToStorageLimit = computed(() => {
    return configData.value?.terminalBoundToStorageLimit ?? false;
});

const storageLimits = computed(() => {
    return configData.value?.limit?.storage ?? {};
});

const terminalLimits = computed(() => {
    return configData.value?.limit?.terminal ?? {};
});

// 化合物资源列表
const mineralCompounds = [
    "OH",
    "ZK",
    "UL",
    "G",
    "UH",
    "UO",
    "KH",
    "KO",
    "LH",
    "LO",
    "ZH",
    "ZO",
    "GH",
    "GO",
    "UH2O",
    "UHO2",
    "KH2O",
    "KHO2",
    "LH2O",
    "LHO2",
    "ZH2O",
    "ZHO2",
    "GH2O",
    "GHO2",
    "XUH2O",
    "XUHO2",
    "XKH2O",
    "XKHO2",
    "XLH2O",
    "XLHO2",
    "XZH2O",
    "XZHO2",
    "XGH2O",
    "XGHO2",
];

// 方法
const isMineralCompound = (resourceName: string): boolean => {
    return mineralCompounds.includes(resourceName);
};

const hasResourceDiff = (type: "storage" | "terminal", resourceName: string): boolean => {
    if (!props.isDifferentFromDefault || !props.sectionKey) return false;

    const path = `${props.sectionKey}.limit.${type}.${resourceName}`;
    return props.isDifferentFromDefault(path);
};
</script>

<style scoped>
.resources-display {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.config-section {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
    border: 1px solid #e4e7ed;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e4e7ed;
}

.section-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin: 0;
}

.diff-tag {
    font-size: 10px;
    padding: 0 6px;
    height: 20px;
}

.section-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.config-description {
    font-size: 12px;
    color: #909399;
    margin: 4px 0 0 0;
}

.resources-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
    margin-top: 8px;
}

.resource-card {
    background: #ffffff;
    border-radius: 6px;
    padding: 12px;
    border: 1px solid #e4e7ed;
    transition: all 0.3s ease;
}

.resource-card:hover {
    border-color: #409eff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.resource-card.has-diff {
    border-color: #e6a23c;
    background: #fdf6ec;
}

.resource-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
}

.resource-name {
    font-weight: 600;
    color: #303133;
    font-size: 13px;
}

.compound-tag {
    font-size: 10px;
    padding: 0 6px;
    height: 18px;
}

.resource-limits {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.limit-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.limit-label {
    font-size: 12px;
    color: #909399;
    min-width: 70px;
}

.limit-value {
    font-size: 12px;
    font-weight: 500;
    color: #303133;
    text-align: right;
    min-width: 60px;
}

.compound-properties {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px dashed #e4e7ed;
}

.bound-notice {
    margin-top: 8px;
}

.bound-notice :deep(.el-alert) {
    padding: 8px 16px;
}

.bound-notice :deep(.el-alert__title) {
    font-size: 13px;
    font-weight: 600;
}

.bound-notice :deep(.el-alert__content) p {
    font-size: 12px;
    color: #606266;
    margin: 4px 0 0 0;
}
</style>
