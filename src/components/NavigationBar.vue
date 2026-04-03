<template>
    <div class="navigation-container">
        <!-- 主导航菜单 -->
        <el-menu
            :default-active="activeIndex"
            mode="horizontal"
            @select="handleSelect"
            class="navigation-bar"
        >
            <el-menu-item index="/dashboard">
                <el-icon><House /></el-icon>
                <span>房间信息</span>
            </el-menu-item>
            <el-menu-item index="/global">
                <el-icon><View /></el-icon>
                <span>全局信息</span>
            </el-menu-item>
            <el-menu-item index="/shard">
                <el-icon><DataAnalysis /></el-icon>
                <span>分片信息</span>
            </el-menu-item>
        </el-menu>

        <!-- 信息显示区域 -->
        <div class="info-panel">
            <!-- 全局信息面板 -->
            <div v-if="isGlobalPage" class="info-content">
                <div class="info-controls">
                    <!-- 左侧：控制按钮 -->
                    <div class="left-controls">
                        <div class="control-buttons">
                            <el-button @click="toggleAxisType" type="primary" size="small">
                                切换轴: {{ axisType === "time" ? "时间" : "Tick" }}
                            </el-button>
                            <el-button @click="downloadData" type="success" size="small">
                                下载数据
                            </el-button>
                            <el-upload
                                class="upload-demo"
                                :show-file-list="false"
                                :before-upload="beforeUpload"
                                :on-success="handleUploadSuccess"
                                :on-error="handleUploadError"
                                accept=".ts,.js,.json"
                                action="#"
                                :http-request="handleUploadRequest"
                            >
                                <el-button type="warning" size="small"> 上传数据 </el-button>
                            </el-upload>
                            <!-- 时间区间预设下拉框 -->
                            <div class="time-range-selector">
                                <el-select
                                    v-model="selectedPreset"
                                    placeholder="选择时间区间"
                                    size="small"
                                    style="width: 150px"
                                    clearable
                                >
                                    <el-option-group
                                        v-for="group in presetGroups"
                                        :key="group.type"
                                        :label="group.label"
                                    >
                                        <el-option
                                            v-for="preset in group.presets"
                                            :key="preset.label"
                                            :label="preset.label"
                                            :value="preset"
                                            :title="preset.description"
                                            :class="`preset-option preset-${preset.type}`"
                                        />
                                    </el-option-group>
                                </el-select>
                            </div>
                        </div>
                    </div>

                    <!-- 右侧：数据时间和shard信息 -->
                    <div class="right-info">
                        <div class="tick-info" v-if="dataTick">
                            <span class="tick-text">{{ dataTick }}</span>
                        </div>
                        <div class="time-info" v-if="dataTime">
                            <span class="time-text">{{ dataTime }}</span>
                        </div>
                        <div class="shard-info">
                            <el-icon><Location /></el-icon>
                            <span class="shard-text">{{ shardName }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 房间信息面板 -->
            <div v-if="isRoomPage" class="info-content">
                <div class="info-controls">
                    <!-- 左侧：控制按钮和房间选择器 -->
                    <div class="left-controls">
                        <div class="control-buttons">
                            <el-button @click="toggleAxisType" type="primary" size="small">
                                切换轴: {{ axisType === "time" ? "时间" : "Tick" }}
                            </el-button>
                            <el-button @click="downloadData" type="success" size="small">
                                下载数据
                            </el-button>
                            <el-upload
                                class="upload-demo"
                                :show-file-list="false"
                                :before-upload="beforeUpload"
                                :on-success="handleUploadSuccess"
                                :on-error="handleUploadError"
                                accept=".ts,.js,.json"
                                action="#"
                                :http-request="handleUploadRequest"
                            >
                                <el-button type="warning" size="small"> 上传数据 </el-button>
                            </el-upload>
                            <!-- 时间区间预设下拉框 -->
                            <div class="time-range-selector">
                                <el-select
                                    v-model="selectedPreset"
                                    placeholder="选择时间区间"
                                    size="small"
                                    style="width: 150px"
                                    clearable
                                >
                                    <el-option-group
                                        v-for="group in presetGroups"
                                        :key="group.type"
                                        :label="group.label"
                                    >
                                        <el-option
                                            v-for="preset in group.presets"
                                            :key="preset.label"
                                            :label="preset.label"
                                            :value="preset"
                                            :title="preset.description"
                                            :class="`preset-option preset-${preset.type}`"
                                        />
                                    </el-option-group>
                                </el-select>
                            </div>

                            <el-select
                                v-if="availableRooms.length > 0"
                                v-model="selectedRoom"
                                placeholder="选择房间"
                                size="small"
                                style="width: 150px"
                                @change="handleRoomChange"
                            >
                                <el-option
                                    v-for="room in availableRooms"
                                    :key="room"
                                    :label="room"
                                    :value="room"
                                />
                            </el-select>
                        </div>
                    </div>

                    <!-- 右侧：数据时间和shard信息 -->
                    <div class="right-info">
                        <div class="tick-info" v-if="dataTick">
                            <span class="tick-text">{{ dataTick }}</span>
                        </div>
                        <div class="time-info" v-if="dataTime">
                            <span class="time-text">{{ dataTime }}</span>
                        </div>
                        <div class="shard-info">
                            <el-icon><Location /></el-icon>
                            <span class="shard-text">{{ shardName }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 分片信息面板 -->
            <div v-if="isShardPage" class="info-content">
                <div class="info-controls">
                    <!-- 左侧：控制按钮 -->
                    <div class="left-controls">
                        <div class="control-buttons">
                            <el-button @click="toggleAxisType" type="primary" size="small">
                                切换轴: {{ axisType === "time" ? "时间" : "Tick" }}
                            </el-button>
                            <el-button @click="downloadData" type="success" size="small">
                                下载数据
                            </el-button>
                            <el-upload
                                class="upload-demo"
                                :show-file-list="false"
                                :before-upload="beforeUpload"
                                :on-success="handleUploadSuccess"
                                :on-error="handleUploadError"
                                accept=".ts,.js,.json"
                                action="#"
                                :http-request="handleUploadRequest"
                            >
                                <el-button type="warning" size="small"> 上传数据 </el-button>
                            </el-upload>
                            <!-- 时间区间预设下拉框 -->
                            <div class="time-range-selector">
                                <el-select
                                    v-model="selectedPreset"
                                    placeholder="选择时间区间"
                                    size="small"
                                    style="width: 150px"
                                    clearable
                                >
                                    <el-option-group
                                        v-for="group in presetGroups"
                                        :key="group.type"
                                        :label="group.label"
                                    >
                                        <el-option
                                            v-for="preset in group.presets"
                                            :key="preset.label"
                                            :label="preset.label"
                                            :value="preset"
                                            :title="preset.description"
                                            :class="`preset-option preset-${preset.type}`"
                                        />
                                    </el-option-group>
                                </el-select>
                            </div>
                        </div>
                    </div>

                    <!-- 右侧：数据时间和shard信息 -->
                    <div class="right-info">
                        <div class="tick-info" v-if="dataTick">
                            <span class="tick-text">{{ dataTick }}</span>
                        </div>
                        <div class="time-info" v-if="dataTime">
                            <span class="time-text">{{ dataTime }}</span>
                        </div>
                        <div class="shard-info">
                            <el-icon><Location /></el-icon>
                            <span class="shard-text">{{ shardName }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAppStore } from "@/stores/app";
import { House, View, Location, DataAnalysis } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { getAllPresets, type TimeRangePreset } from "@/utils/chartPresets";
import { convertScreepsData } from "@/utils/convertScreepsData";
import type { OriginScreepsData } from "@/type/player/AI/AIUreium/ui/type";

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();

// 路由状态
const activeIndex = ref(route.path);

// 房间选择 - 使用store中的状态
const selectedRoom = computed({
    get: () => appStore.selectedRoom,
    set: (value) => appStore.setSelectedRoom(value),
});

// 监听路由变化更新激活状态
watch(
    () => route.path,
    (newPath) => {
        activeIndex.value = newPath;
        // 重置房间选择
        if (newPath !== "/dashboard") {
            selectedRoom.value = null;
        }
    },
);

// 计算属性
const isGlobalPage = computed(() => route.path === "/global");
const isRoomPage = computed(() => route.path === "/dashboard");
const isShardPage = computed(() => route.path === "/shard");

const screepsData = computed(() => appStore.screepsData);
const axisType = computed(() => appStore.options.axisType);
const selectedPreset = computed({
    get: () => appStore.options.timeRangePreset,
    set: (value) => {
        if (value) {
            appStore.setTimeRangePreset(value);
            applyPresetToAllCharts(value);
        } else {
            appStore.clearTimeRangePreset();
        }
    },
});

// 所有时间区间预设（包含时间和tick）
const allPresets = computed(() => getAllPresets());

// 分组显示的预设
const presetGroups = computed(() => {
    const timePresets = allPresets.value.filter((preset) => preset.type === "time");
    const tickPresets = allPresets.value.filter((preset) => preset.type === "tick");

    return [
        {
            type: "time",
            label: "时间区间",
            presets: timePresets,
        },
        {
            type: "tick",
            label: "Tick区间",
            presets: tickPresets,
        },
    ];
});

// 图表引用
const chartRefs = ref<Map<string, { applyTimeRangePreset: (preset: TimeRangePreset) => boolean }>>(
    new Map(),
);

// shard名称
const shardName = computed(() => {
    if (!screepsData.value?.shardData) return "";
    return screepsData.value.shardData.shardName;
});

// 数据tick
const dataTick = computed(() => {
    if (!screepsData.value?.timeData) return "";
    return `Tick: ${screepsData.value.timeData.tick}`;
});

// 数据时间
const dataTime = computed(() => {
    if (!screepsData.value?.timeData) return "";
    const date = new Date(screepsData.value.timeData.time);
    return date.toLocaleString();
});

// 可用房间列表
const availableRooms = computed(() => {
    if (!screepsData.value) return [];
    return Object.keys(screepsData.value.roomData || {});
});

// 方法
const handleSelect = (index: string) => {
    router.push(index);
};

const toggleAxisType = (): void => {
    appStore.setAxisType(axisType.value === "time" ? "tick" : "time");
};

const handleRoomChange = (room: string) => {
    selectedRoom.value = room;
    // 房间切换已通过store同步
};

// 注册图表引用
const registerChart = (
    chartId: string,
    chartMethods: { applyTimeRangePreset: (preset: TimeRangePreset) => boolean },
): void => {
    chartRefs.value.set(chartId, chartMethods);
};

// 注销图表引用
const unregisterChart = (chartId: string): void => {
    chartRefs.value.delete(chartId);
};

// 应用预设到所有图表
const applyPresetToAllCharts = (preset: TimeRangePreset): void => {
    for (const [, chartMethods] of chartRefs.value) {
        if (chartMethods && typeof chartMethods.applyTimeRangePreset === "function") {
            chartMethods.applyTimeRangePreset(preset);
        }
    }
};

// 提供注册方法给子组件
defineExpose({
    registerChart,
    unregisterChart,
});

// 初始化房间选择
watch(
    availableRooms,
    (rooms) => {
        if (rooms.length > 0 && !selectedRoom.value && isRoomPage.value) {
            selectedRoom.value = rooms[0] || null;
        }
    },
    { immediate: true },
);

// 监听房间选择变化，确保页面切换时正确显示
watch(
    () => route.path,
    (newPath) => {
        if (newPath === "/dashboard" && availableRooms.value.length > 0 && !selectedRoom.value) {
            selectedRoom.value = availableRooms.value[0] || null;
        }
    },
);

// 监听轴类型变化，更新预设列表
watch(axisType, () => {
    // 轴类型变化时预设列表会自动更新
});

// 下载数据方法
const downloadData = (): void => {
    if (!screepsData.value) {
        console.warn("没有数据可下载");
        return;
    }

    try {
        // 创建要下载的内容
        const content = `import type { OriginScreepsData } from "@/type/player/AI/AIUreium/ui/type";
export const testData: OriginScreepsData = ${JSON.stringify(screepsData.value)} as unknown as OriginScreepsData;`;

        // 创建Blob对象
        const blob = new Blob([content], { type: "text/typescript" });

        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `screeps-data-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.ts`;

        // 触发下载
        document.body.appendChild(a);
        a.click();

        // 清理
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log("数据下载成功");
        ElMessage.success("数据下载成功！");
    } catch (error) {
        console.error("下载数据时出错:", error);
        ElMessage.error("下载数据失败");
    }
};

// 上传数据方法（保留但标记为未使用，以备后用）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const openUploadDialog = (): void => {
    // 创建文件输入元素
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".ts,.js,.json";

    // 监听文件选择
    input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
            const content = await file.text();
            await loadUploadedData(content);
        } catch (error) {
            console.error("上传数据时出错:", error);
            ElMessage.error("上传数据失败，请检查文件格式");
        }
    };

    // 触发文件选择
    input.click();
};

// Element Plus Upload 组件相关方法
const beforeUpload = (file: File): boolean => {
    const allowedTypes = [".ts", ".js", ".json"];
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
        ElMessage.warning("请上传 .ts、.js 或 .json 格式的文件");
        return false;
    }

    if (file.size > 10 * 1024 * 1024) {
        // 10MB限制
        ElMessage.warning("文件大小不能超过10MB");
        return false;
    }

    return true;
};

const handleUploadRequest = async (options: {
    file: File;
    onSuccess: (response: unknown) => void;
    onError: (error: Error) => void;
}): Promise<void> => {
    const { file, onSuccess, onError } = options;

    try {
        const content = await readFileAsText(file);
        await loadUploadedData(content);
        onSuccess("上传成功");
    } catch (error) {
        console.error("上传失败:", error);
        onError(error instanceof Error ? error : new Error(String(error)));
    }
};

const handleUploadSuccess = (response: unknown, file: File): void => {
    console.log("文件上传成功:", file.name);
};

const handleUploadError = (error: Error): void => {
    console.error("文件上传失败:", error);
    ElMessage.error(`上传失败：${error.message || "未知错误"}`);
};

// 读取文件为文本
const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            resolve(event.target?.result as string);
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsText(file);
    });
};

// 加载上传的数据
const loadUploadedData = async (content: string): Promise<void> => {
    try {
        // 尝试解析上传的文件内容
        let data: OriginScreepsData;

        // 检查是否是 TypeScript 模块格式
        if (content.includes("export const testData")) {
            // 提取 testData 的值
            const match = content.match(/export const testData: OriginScreepsData = (.*?);/s);
            if (match && match[1]) {
                // 移除末尾的 "as unknown as OriginScreepsData"
                const dataStr = match[1].replace(/\s+as unknown as OriginScreepsData\s*$/, "");
                data = JSON.parse(dataStr);
            } else {
                throw new Error("无法从 TypeScript 文件中提取 testData");
            }
        } else {
            // 尝试直接解析为 JSON
            data = JSON.parse(content);
        }

        // 验证数据格式
        if (!data.type || data.type !== "OriginScreepsData") {
            throw new Error("无效的数据格式：缺少 OriginScreepsData 类型标识");
        }

        // 更新 store 中的数据
        appStore.setScreepsData(convertScreepsData(data));
        console.log("数据上传成功并已加载", data);

        // 显示成功消息
        ElMessage.success("数据上传成功！");

        // 如果当前在房间页面，自动选择第一个房间
        if (isRoomPage.value && data.roomData && Object.keys(data.roomData).length > 0) {
            const firstRoom = Object.keys(data.roomData)[0];
            selectedRoom.value = firstRoom || null;
        }
    } catch (error) {
        console.error("解析上传数据时出错:", error);
        ElMessage.error(`解析数据失败：${error instanceof Error ? error.message : "未知错误"}`);
    }
};
</script>

<style scoped>
.navigation-container {
    width: 100%;
    background-color: #ffffff;
    border-bottom: 1px solid #e1e8ed;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.navigation-bar {
    width: 100%;
    background-color: transparent;
    border-bottom: none;
}

.navigation-bar .el-menu-item {
    font-size: 14px;
    font-weight: 500;
    color: #606266;
    transition: all 0.3s ease;
}

.navigation-bar .el-menu-item:hover {
    background-color: #f5f7fa;
    color: #409eff;
}

.navigation-bar .el-menu-item.is-active {
    color: #409eff;
    border-bottom: 2px solid #409eff;
    background-color: #f0f7ff;
}

.navigation-bar .el-menu-item .el-icon {
    margin-right: 6px;
    font-size: 16px;
}

.info-panel {
    padding: 1rem 1.5rem;
    border-top: 1px solid #f0f0f0;
    background-color: #fafafa;
}

.info-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.info-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.left-controls {
    display: flex;
    align-items: center;
    flex: 1;
}

.right-info {
    display: flex;
    align-items: center;
}

.tick-info {
    margin-right: 16px;
    padding-right: 16px;
    border-right: 1px solid #e1e8ed;
}

.tick-text {
    font-size: 14px;
    font-weight: 500;
    color: #606266;
}

.time-info {
    margin-right: 16px;
    padding-right: 16px;
    border-right: 1px solid #e1e8ed;
}

.time-text {
    font-size: 14px;
    font-weight: 500;
    color: #606266;
}

.shard-info {
    display: flex;
    align-items: center;
    gap: 6px;
}

.shard-text {
    font-size: 14px;
    font-weight: 500;
    color: #606266;
}

.info-items {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.info-tag {
    font-size: 12px;
    height: 24px;
    line-height: 22px;
    border-radius: 4px;
    background-color: #f4f4f5;
    border-color: #e9e9eb;
    color: #909399;
}

.control-buttons {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
}

.time-range-selector {
    display: flex;
    align-items: center;
}

.preset-option.preset-time {
    padding-left: 20px;
    color: #409eff;
}

.preset-option.preset-tick {
    padding-left: 20px;
    color: #67c23a;
}

.el-select-dropdown .el-option-group__title {
    font-weight: bold;
    color: #606266;
    background-color: #f5f7fa;
    padding: 8px 12px;
}

.el-select-dropdown .el-option-group__wrap:not(:last-of-type) .el-select-dropdown__item {
    border-bottom: 1px solid #f0f0f0;
}

/* 响应式设计 */
@media (max-width: 992px) {
    .info-controls {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .left-controls {
        width: 100%;
    }

    .right-info {
        width: 100%;
        justify-content: flex-start;
    }

    .control-buttons {
        width: 100%;
        justify-content: flex-start;
    }
}

@media (max-width: 768px) {
    .navigation-bar .el-menu-item {
        font-size: 13px;
        padding: 0 12px;
    }

    .navigation-bar .el-menu-item .el-icon {
        margin-right: 4px;
        font-size: 14px;
    }

    .info-panel {
        padding: 0.75rem 1rem;
    }

    .shard-text {
        font-size: 13px;
    }

    .info-tag {
        font-size: 11px;
        height: 22px;
        line-height: 20px;
    }

    .time-range-selector {
        width: 100%;
    }

    .time-range-selector .el-select {
        width: 100%;
    }
}

@media (max-width: 480px) {
    .navigation-bar .el-menu-item span {
        display: none;
    }

    .navigation-bar .el-menu-item .el-icon {
        margin-right: 0;
        font-size: 16px;
    }

    .shard-text {
        font-size: 12px;
    }

    .control-buttons {
        flex-wrap: wrap;
    }

    .time-range-selector .el-select {
        width: 100%;
    }
}
</style>
