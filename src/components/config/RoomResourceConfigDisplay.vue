<template>
    <div class="room-resource-config-display">
        <!-- 配置头部：搜索和筛选 -->
        <div class="config-header">
            <div class="header-left">
                <h3 class="config-title">
                    <el-icon><Setting /></el-icon>
                    房间资源配置
                </h3>
                <el-tag :type="configSourceTagType" size="small" class="source-tag">
                    {{ configSourceText }}
                </el-tag>
            </div>
            <div class="header-right">
                <el-input
                    v-model="searchText"
                    placeholder="搜索资源..."
                    size="small"
                    clearable
                    style="width: 200px"
                >
                    <template #prefix>
                        <el-icon><Search /></el-icon>
                    </template>
                </el-input>
                <el-button
                    size="small"
                    :type="showOnlyDiff ? 'primary' : 'default'"
                    @click="toggleShowOnlyDiff"
                >
                    <el-icon><Filter /></el-icon>
                    仅显示差异
                </el-button>
            </div>
        </div>

        <!-- 配置内容 -->
        <div v-if="roomResourcesConfig" class="config-content">
            <!-- terminalBoundToStorageLimit 配置 -->
            <div class="config-section">
                <div class="section-header">
                    <h4 class="section-title">终端容量绑定设置</h4>
                    <el-tag
                        v-if="isDifferentFromDefault('terminalBoundToStorageLimit')"
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
                        v-if="isDifferentFromDefault('limit.storage')"
                        type="warning"
                        size="mini"
                        class="diff-tag"
                    >
                        自定义
                    </el-tag>
                </div>

                <el-collapse class="category-collapse">
                    <el-collapse-item
                        v-for="category in filteredCategories"
                        :key="'storage-' + category.name"
                        :name="'storage-' + category.name"
                    >
                        <template #title>
                            <div class="category-header">
                                <span class="category-title">{{ category.name }}</span>
                                <span class="category-description">{{ category.description }}</span>
                                <el-tag
                                    v-if="hasCategoryDiff('storage', category.resources)"
                                    type="warning"
                                    size="mini"
                                    class="category-diff-tag"
                                >
                                    有差异
                                </el-tag>
                            </div>
                        </template>

                        <div class="resources-grid">
                            <div
                                v-for="{
                                    name: resourceName,
                                    limit: resourceLimit,
                                } in getFilteredCategoryResources('storage', category.resources)"
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
                                        <span class="limit-value">{{
                                            resourceLimit.min || 0
                                        }}</span>
                                    </div>
                                    <div class="limit-row">
                                        <span class="limit-label">最大:</span>
                                        <span class="limit-value">{{
                                            resourceLimit.max || "无限制"
                                        }}</span>
                                    </div>

                                    <!-- 化合物特有属性 -->
                                    <div
                                        v-if="isMineralCompound(resourceName)"
                                        class="compound-properties"
                                    >
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

                            <div
                                v-if="
                                    getFilteredCategoryResources('storage', category.resources)
                                        .length === 0
                                "
                                class="no-resources"
                            >
                                <span class="empty-text">暂无资源</span>
                            </div>
                        </div>
                    </el-collapse-item>
                </el-collapse>
            </div>

            <!-- Terminal 资源限制 -->
            <div class="config-section" v-if="!terminalBoundToStorageLimit">
                <div class="section-header">
                    <h4 class="section-title">Terminal 资源限制</h4>
                    <el-tag
                        v-if="isDifferentFromDefault('limit.terminal')"
                        type="warning"
                        size="mini"
                        class="diff-tag"
                    >
                        自定义
                    </el-tag>
                </div>

                <el-collapse class="category-collapse">
                    <el-collapse-item
                        v-for="category in filteredCategories"
                        :key="'terminal-' + category.name"
                        :name="'terminal-' + category.name"
                    >
                        <template #title>
                            <div class="category-header">
                                <span class="category-title">{{ category.name }}</span>
                                <span class="category-description">{{ category.description }}</span>
                                <el-tag
                                    v-if="hasCategoryDiff('terminal', category.resources)"
                                    type="warning"
                                    size="mini"
                                    class="category-diff-tag"
                                >
                                    有差异
                                </el-tag>
                            </div>
                        </template>

                        <div class="resources-grid">
                            <div
                                v-for="{
                                    name: resourceName,
                                    limit: resourceLimit,
                                } in getFilteredCategoryResources('terminal', category.resources)"
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
                                        <span class="limit-value">{{
                                            resourceLimit.min || 0
                                        }}</span>
                                    </div>
                                    <div class="limit-row">
                                        <span class="limit-label">最大:</span>
                                        <span class="limit-value">{{
                                            resourceLimit.max || "无限制"
                                        }}</span>
                                    </div>
                                    <div class="limit-row">
                                        <span class="limit-label">最高买入价:</span>
                                        <span class="limit-value">{{
                                            resourceLimit.maxBuyPrice || 0
                                        }}</span>
                                    </div>
                                    <div class="limit-row">
                                        <span class="limit-label">最低卖出价:</span>
                                        <span class="limit-value">{{
                                            resourceLimit.minSellPrice || 0
                                        }}</span>
                                    </div>
                                </div>
                            </div>

                            <div
                                v-if="
                                    getFilteredCategoryResources('terminal', category.resources)
                                        .length === 0
                                "
                                class="no-resources"
                            >
                                <span class="empty-text">暂无资源</span>
                            </div>
                        </div>
                    </el-collapse-item>
                </el-collapse>
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

        <!-- 无配置提示 -->
        <div v-else class="no-config">
            <el-empty description="暂无资源配置信息" :image-size="80" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Setting, Search, Filter } from "@element-plus/icons-vue";
import type { ScreepsConfig } from "@/type/player/AI/AIUreium/config/type";
import {
    baseResource,
    mineralResource,
    compound0Resource,
    compound0p5Resource,
    compound1Resource,
    compound2Resource,
    compound3Resource,
    compressedResource,
    baseCommodityResource,
    neutralCommodityResource,
    WSCommodityResource,
    WNCommodityResource,
    ENCommodityResource,
    ESCommodityResource,
    compoundResource,
} from "@/type/constant/resources";

interface Props {
    roomName: string | null;
    configData: ScreepsConfig | null;
}

const props = defineProps<Props>();

// 响应式状态
const searchText = ref("");
const showOnlyDiff = ref(false);

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
const roomConfig = computed(() => {
    if (!props.configData?.rooms || !props.roomName) return null;
    return props.configData.rooms[props.roomName] || props.configData.rooms.default;
});

const roomResourcesConfig = computed(() => {
    return roomConfig.value?.roomResources as RoomResourcesConfig | undefined;
});

const defaultConfig = computed(() => {
    return props.configData?.rooms?.default || null;
});

const defaultResourcesConfig = computed(() => {
    return defaultConfig.value?.roomResources as RoomResourcesConfig | undefined;
});

const configSourceTagType = computed(() => {
    if (!props.configData?.rooms || !props.roomName) return "info";
    return props.configData.rooms[props.roomName] ? "success" : "warning";
});

const configSourceText = computed(() => {
    if (!props.configData?.rooms || !props.roomName) return "无配置";
    return props.configData.rooms[props.roomName] ? "自定义配置" : "默认配置";
});

const terminalBoundToStorageLimit = computed(() => {
    return roomResourcesConfig.value?.terminalBoundToStorageLimit ?? false;
});

const storageLimits = computed(() => {
    return roomResourcesConfig.value?.limit?.storage ?? {};
});

const terminalLimits = computed(() => {
    return roomResourcesConfig.value?.limit?.terminal ?? {};
});

// 资源分类定义
const resourceCategories = [
    {
        name: "基础资源",
        resources: baseResource,
        description: "基础资源",
    },
    {
        name: "基础矿物",
        resources: mineralResource,
        description: "基础矿物资源",
    },
    {
        name: "0级化合物",
        resources: compound0Resource,
        description: "基础化合物",
    },
    {
        name: "0.5级化合物",
        resources: compound0p5Resource,
        description: "0.5级化合物，只有G",
    },
    {
        name: "1级化合物",
        resources: compound1Resource,
        description: "一级化合物",
    },
    {
        name: "2级化合物",
        resources: compound2Resource,
        description: "二级化合物",
    },
    {
        name: "3级化合物",
        resources: compound3Resource,
        description: "三级化合物",
    },
    {
        name: "压缩资源",
        resources: compressedResource,
        description: "压缩和加工资源",
    },
    {
        name: "基础商品",
        resources: baseCommodityResource,
        description: "基础商品资源",
    },
    {
        name: "中性商品",
        resources: neutralCommodityResource,
        description: "中性商品资源",
    },
    {
        name: "WS商品",
        resources: WSCommodityResource,
        description: "WS派系商品",
    },
    {
        name: "WN商品",
        resources: WNCommodityResource,
        description: "WN派系商品",
    },
    {
        name: "EN商品",
        resources: ENCommodityResource,
        description: "EN派系商品",
    },
    {
        name: "ES商品",
        resources: ESCommodityResource,
        description: "ES派系商品",
    },
];

// 过滤后的分类（在仅显示差异时隐藏空分类）
const filteredCategories = computed(() => {
    return resourceCategories.filter((category) => {
        // 检查Storage中是否有该分类的资源
        const storageResources = getFilteredCategoryResources("storage", category.resources);
        // 检查Terminal中是否有该分类的资源（如果未绑定到Storage）
        const terminalResources = terminalBoundToStorageLimit.value
            ? []
            : getFilteredCategoryResources("terminal", category.resources);

        // 如果两个都没有资源，则过滤掉该分类
        return storageResources.length > 0 || terminalResources.length > 0;
    });
});

// 方法
const isMineralCompound = (resourceName: string): boolean => {
    // 检查是否是化合物（0-3级）

    return compoundResource.includes(resourceName as (typeof compoundResource)[number]);
};

// 获取分类的资源限制
const getCategoryResources = (
    type: "storage" | "terminal",
    categoryResources: readonly string[],
) => {
    const limits = type === "storage" ? storageLimits.value : terminalLimits.value;
    const result: Array<{ name: string; limit: ResourceLimit }> = [];

    for (const resourceName of categoryResources) {
        const limit = limits[resourceName];
        if (limit) {
            result.push({ name: resourceName, limit });
        }
    }

    return result;
};

// 检查分类是否有差异
const hasCategoryDiff = (
    type: "storage" | "terminal",
    categoryResources: readonly string[],
): boolean => {
    for (const resourceName of categoryResources) {
        if (hasResourceDiff(type, resourceName)) {
            return true;
        }
    }
    return false;
};

// 获取过滤后的分类资源
const getFilteredCategoryResources = (
    type: "storage" | "terminal",
    categoryResources: readonly string[],
) => {
    const resources = getCategoryResources(type, categoryResources);

    return resources.filter(({ name }) => {
        // 搜索过滤
        if (searchText.value && !name.toLowerCase().includes(searchText.value.toLowerCase())) {
            return false;
        }

        // 差异过滤
        if (showOnlyDiff.value && !hasResourceDiff(type, name)) {
            return false;
        }

        return true;
    });
};

const isDifferentFromDefault = (path: string): boolean => {
    if (!roomResourcesConfig.value || !defaultResourcesConfig.value) return false;

    const paths = path.split(".");
    let currentRoom = roomResourcesConfig.value as unknown as Record<string, unknown>;
    let currentDefault = defaultResourcesConfig.value as unknown as Record<string, unknown>;

    for (const p of paths) {
        const attr = currentRoom[p as keyof typeof currentRoom];
        const defaultAttr = currentDefault[p as keyof typeof currentDefault];
        if (attr === undefined || defaultAttr === undefined) {
            return attr !== defaultAttr;
        }
        currentRoom = attr as unknown as Record<string, unknown>;
        currentDefault = defaultAttr as unknown as Record<string, unknown>;
    }

    return JSON.stringify(currentRoom) !== JSON.stringify(currentDefault);
};

const hasResourceDiff = (type: "storage" | "terminal", resourceName: string): boolean => {
    if (!roomResourcesConfig.value || !defaultResourcesConfig.value) return false;

    const roomLimit =
        type === "storage"
            ? roomResourcesConfig.value.limit.storage[resourceName]
            : roomResourcesConfig.value.limit.terminal[resourceName];

    const defaultLimit =
        type === "storage"
            ? defaultResourcesConfig.value.limit.storage[resourceName]
            : defaultResourcesConfig.value.limit.terminal[resourceName];

    if (!roomLimit || !defaultLimit) return roomLimit !== defaultLimit;

    return JSON.stringify(roomLimit) !== JSON.stringify(defaultLimit);
};

const toggleShowOnlyDiff = () => {
    showOnlyDiff.value = !showOnlyDiff.value;
};
</script>

<style scoped>
.room-resource-config-display {
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin-bottom: 16px;
}

.config-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.config-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    display: flex;
    align-items: center;
    gap: 8px;
}

.source-tag {
    font-weight: 500;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 12px;
}

.config-content {
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

.category-collapse {
    margin-top: 12px;
}

.category-collapse :deep(.el-collapse-item__header) {
    padding: 8px 12px;
    font-size: 13px;
    font-weight: 500;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    margin-bottom: 3px;
    transition: all 0.3s;
    height: auto;
    min-height: 30px;
}

.category-collapse :deep(.el-collapse-item__header):hover {
    border-color: #409eff;
    background-color: #f5f7fa;
}

.category-collapse :deep(.el-collapse-item__wrap) {
    background: transparent;
    border: none;
}

.category-collapse :deep(.el-collapse-item__content) {
    padding: 12px;
    border: 1px solid #ebeef5;
    border-top: none;
    border-radius: 0 0 4px 4px;
}

.category-header {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
}

.category-title {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    min-width: 100px;
}

.category-description {
    font-size: 12px;
    color: #909399;
    flex: 1;
}

.category-diff-tag {
    font-size: 10px;
    padding: 0 6px;
    height: 18px;
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

.no-resources {
    text-align: center;
    padding: 20px;
    color: #909399;
    font-style: italic;
    font-size: 12px;
}

.empty-text {
    color: #909399;
    font-style: italic;
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

.no-config {
    padding: 40px 0;
    text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .config-header {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }

    .header-right {
        width: 100%;
    }

    .header-right .el-input {
        flex: 1;
    }

    .resources-grid {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }
}

/* 中等屏幕：3列 */
@media (min-width: 768px) {
    .resources-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* 大屏幕：6列 */
@media (min-width: 1200px) {
    .resources-grid {
        grid-template-columns: repeat(6, 1fr);
    }
}

/* 特大屏幕：8列 */
@media (min-width: 1500px) {
    .resources-grid {
        grid-template-columns: repeat(8, 1fr);
    }
}
</style>
