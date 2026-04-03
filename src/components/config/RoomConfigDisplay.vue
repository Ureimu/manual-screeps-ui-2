<template>
    <div class="enhanced-room-config">
        <!-- 配置头部：搜索和筛选 -->
        <div class="config-header">
            <div class="header-left">
                <h3 class="config-title">
                    <el-icon><Setting /></el-icon>
                    房间配置
                </h3>
                <el-tag :type="configSourceTagType" size="small" class="source-tag">
                    {{ configSourceText }}
                </el-tag>
            </div>
            <div class="header-right">
                <el-input
                    v-model="searchText"
                    placeholder="搜索配置项..."
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

        <!-- 配置内容：使用折叠面板 -->
        <el-collapse v-model="activeNames" size="small" class="config-collapse config-grid">
            <!-- 动态生成配置项 -->
            <el-collapse-item
                v-for="section in filteredSections"
                :key="section.key"
                :name="section.key"
                class="config-section"
            >
                <template #title>
                    <div class="section-header">
                        <span class="section-title">{{ section.key }}</span>
                        <el-tag
                            v-if="section.statusTag"
                            :type="section.statusTag.type"
                            size="small"
                            class="status-tag"
                        >
                            {{ section.statusTag.text }}
                        </el-tag>
                    </div>
                </template>
                <div v-if="section.data" class="section-content">
                    <!-- 对象展示 -->
                    <ConfigObjectDisplay
                        v-if="section.displayType === 'object'"
                        :data="section.data"
                        :section-key="section.key"
                    />
                </div>
            </el-collapse-item>
        </el-collapse>

        <!-- 无配置提示 -->
        <div v-if="!roomConfig" class="no-config">
            <el-empty description="暂无配置信息" :image-size="80" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Setting, Search, Filter } from "@element-plus/icons-vue";
import type { ScreepsConfig, RoomConfig } from "@/type/player/AI/AIUreium/config/type";
import ConfigObjectDisplay from "./displayType/ConfigObjectDisplay.vue";

interface Props {
    roomName: string | null;
    configData: ScreepsConfig | null;
}

const props = defineProps<Props>();

// 响应式状态
const searchText = ref("");
const showOnlyDiff = ref(false);
const activeNames = ref<string[]>([]); // 默认展开的项

// 配置项定义
const configSections = [
    {
        key: "getPower",
        displayType: "object" as const,
        statusField: "run",
    },
    {
        key: "harvestMineral",
        displayType: "object" as const,
        statusField: "run",
    },
    {
        key: "claimNewRoom",
        displayType: "object" as const,
        statusField: "run",
    },
    {
        key: "outwardsSource",
        displayType: "object" as const,
        statusField: "run",
    },
    {
        key: "market",
        displayType: "object" as const,
    },
    {
        key: "upgradeController",
        displayType: "object" as const,
        statusField: "run",
    },
    {
        key: "controllerLink",
        displayType: "object" as const,
    },
    {
        key: "processPower",
        displayType: "object" as const,
        statusField: "run",
    },
    {
        key: "repairWall",
        displayType: "object" as const,
        statusField: "run",
    },
    {
        key: "scoutRoom",
        displayType: "object" as const,
    },
    {
        key: "attackStronghold",
        displayType: "object" as const,
        statusField: "run",
    },
    {
        key: "observer",
        displayType: "object" as const,
    },
    {
        key: "tower",
        displayType: "object" as const,
    },
    {
        key: "rebootRoom",
        displayType: "object" as const,
    },
];

// 默认配置项（用于configSections中没有的key）
const defaultSectionConfig = {
    displayType: "object" as const,
};

// 计算属性
const roomConfig = computed(() => {
    if (!props.configData?.rooms || !props.roomName) return null;
    return props.configData.rooms[props.roomName] || props.configData.rooms.default;
});

const defaultConfig = computed(() => {
    return props.configData?.rooms?.default || null;
});

const configSourceTagType = computed(() => {
    if (!props.configData?.rooms || !props.roomName) return "info";
    return props.configData.rooms[props.roomName] ? "success" : "warning";
});

const configSourceText = computed(() => {
    if (!props.configData?.rooms || !props.roomName) return "无配置";
    return props.configData.rooms[props.roomName] ? "自定义配置" : "默认配置";
});

// 获取配置项状态标签
const getStatusTag = (sectionKey: string, data: unknown) => {
    const section = configSections.find((s) => s.key === sectionKey);
    if (!section || !data || typeof data !== "object" || data === null) return null;

    const dataObj = data as Record<string, unknown>;

    // 其他配置项的状态字段
    if (!section.statusField) return null;

    const statusValue = dataObj[section.statusField];

    if (typeof statusValue === "boolean") {
        return {
            type: statusValue ? "success" : "info",
            text: statusValue ? "启用" : "禁用",
        };
    } else if (typeof statusValue === "string") {
        return {
            type: statusValue === "loop" ? "success" : "warning",
            text:
                statusValue === "loop" ? "循环执行" : statusValue === "stop" ? "停止" : "条件执行",
        };
    }

    return null;
};

// 处理配置数据 - 使用roomConfig.value中的所有数据
const processedSections = computed(() => {
    if (!roomConfig.value) return [];

    const sections: Array<{
        key: string;
        displayType: "object" | "resources";
        statusField?: string;
        data: Record<string, unknown>;
        statusTag: { type: string; text: string } | null;
    }> = [];

    // 遍历roomConfig中的所有key
    for (const key in roomConfig.value) {
        // 排除roomResources，它现在有单独的组件显示
        if (key === "roomResources") continue;

        const data = roomConfig.value[key as keyof RoomConfig] as Record<string, unknown>;
        if (data === undefined) continue;

        // 查找configSections中的配置，如果没有则使用默认配置
        const sectionConfig = configSections.find((s) => s.key === key) || {
            key,
            ...defaultSectionConfig,
        };

        sections.push({
            key,
            displayType: sectionConfig.displayType,
            statusField: sectionConfig.statusField,
            data,
            statusTag: getStatusTag(key, data),
        });
    }

    return sections;
});

// 过滤配置项
const filteredSections = computed(() => {
    return processedSections.value.filter((section) => {
        if (!section.data) return false;

        // 检查搜索过滤
        if (searchText.value) {
            const searchStr = JSON.stringify(section.data).toLowerCase();
            return searchStr.includes(searchText.value.toLowerCase());
        }

        // 检查差异过滤
        if (showOnlyDiff.value && defaultConfig.value) {
            return isDifferentFromDefault(section.key);
        }

        return true;
    });
});

// 方法：检查配置项是否与默认配置不同
const isDifferentFromDefault = (path: string) => {
    if (!roomConfig.value || !defaultConfig.value) return false;

    const paths = path.split(".");
    let currentRoom = roomConfig.value as unknown as Record<string, unknown>;
    let currentDefault = defaultConfig.value as unknown as Record<string, unknown>;

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

// 方法：切换仅显示差异
const toggleShowOnlyDiff = () => {
    showOnlyDiff.value = !showOnlyDiff.value;
};

// 监听搜索文本变化，自动展开匹配的项
watch(searchText, (newVal) => {
    if (newVal) {
        const sectionsToExpand = filteredSections.value.map((section) => section.key);
        activeNames.value = sectionsToExpand;
    } else {
        activeNames.value = [];
    }
});
</script>

<style scoped>
.enhanced-room-config {
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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

.config-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 16px;
}

.config-collapse {
    border: none;
    background: transparent;
}

.config-grid .config-section {
    margin-bottom: 0;
}

.config-collapse :deep(.el-collapse-item) {
    margin-bottom: 0;
}

.config-collapse :deep(.el-collapse-item__header) {
    padding: 8px 12px;
    font-size: 20px;
    font-weight: 500;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    margin-bottom: 3px;
    transition: all 0.3s;
    height: auto;
    min-height: 30px;
}

.config-collapse :deep(.el-collapse-item__header):hover {
    border-color: #409eff;
    background-color: #f5f7fa;
}

.config-collapse :deep(.el-collapse-item__wrap) {
    background: transparent;
    border: none;
}

.config-collapse :deep(.el-collapse-item__content) {
    padding: 12px;
    border: 1px solid #ebeef5;
    border-top: none;
    border-radius: 0 0 4px 4px;
    max-height: 300px;
    overflow-y: auto;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
}

.section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    flex: 1;
}

.status-tag {
    margin-left: auto;
}

.section-content {
    padding: 12px 0;
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

    .config-grid {
        grid-template-columns: 1fr;
    }
}

/* 中等屏幕：2列 */
@media (min-width: 768px) {
    .config-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* 大屏幕：3列 */
@media (min-width: 1200px) {
    .config-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
</style>
