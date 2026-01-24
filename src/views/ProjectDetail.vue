<template>
    <div class="project-detail-container">
        <div v-if="projectData" class="detail-main">
            <!-- 返回按钮和标题 -->
            <div class="detail-header">
                <el-button type="primary" link @click="goBack" class="back-button">
                    <el-icon><ArrowLeft /></el-icon>
                    返回项目列表
                </el-button>
                <div class="header-title">
                    <h1 class="project-title">{{ projectId }}</h1>
                    <el-tag type="info" size="large" class="project-type-tag">
                        {{ getProjectTypeTitle(projectType) }}
                    </el-tag>
                </div>
            </div>

            <!-- 主要内容区域 -->
            <div class="detail-content">
                <!-- Mermaid 图表展示 -->
                <div v-if="projectData.diagram" class="mermaid-section">
                    <el-card class="section-card">
                        <template #header>
                            <div class="section-header">
                                <h3>流程图</h3>
                                <div class="mermaid-actions">
                                    <el-button-group>
                                        <el-button
                                            type="primary"
                                            size="small"
                                            @click="zoomOut"
                                            :disabled="zoomLevel <= minZoomValue"
                                            title="缩小图表"
                                        >
                                            <el-icon><Minus /></el-icon>
                                            缩小
                                        </el-button>
                                        <el-button
                                            type="info"
                                            size="small"
                                            @click="resetZoom"
                                            title="重置缩放和位置"
                                        >
                                            {{ (zoomLevel * 100).toFixed(0) }}%
                                        </el-button>
                                        <el-button
                                            type="primary"
                                            size="small"
                                            @click="zoomIn"
                                            :disabled="zoomLevel >= maxZoomValue"
                                            title="放大图表"
                                        >
                                            <el-icon><Plus /></el-icon>
                                            放大
                                        </el-button>
                                    </el-button-group>
                                    <el-button
                                        type="primary"
                                        size="small"
                                        @click="refreshMermaid"
                                        :loading="refreshingMermaid"
                                        title="重新渲染图表"
                                    >
                                        <el-icon><Refresh /></el-icon>
                                        刷新图表
                                    </el-button>
                                    <span class="drag-hint">(按住图表拖拽可移动)</span>
                                </div>
                            </div>
                        </template>
                        <div
                            class="mermaid-container"
                            ref="mermaidWrapper"
                            @wheel="handleWheel"
                            @dblclick="handleDoubleClick"
                        >
                            <div class="mermaid-grid" v-if="showGrid && zoomLevel > 1"></div>
                            <div
                                class="mermaid-chart"
                                ref="mermaidContainer"
                                :style="{
                                    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(${zoomLevel})`,
                                    transformOrigin: 'top left',
                                    width: 'fit-content',
                                    minWidth: '100%',
                                    cursor: isDragging ? 'grabbing' : 'grab',
                                }"
                                @mousedown="startDrag"
                                @mousemove="handleDrag"
                                @mouseup="stopDrag"
                                @mouseleave="stopDrag"
                                @touchstart="startDrag"
                                @touchmove="handleDrag"
                                @touchend="stopDrag"
                                @dblclick="handleChartDoubleClick"
                            ></div>
                            <div class="zoom-hint" v-if="showZoomHint">
                                <span>使用滚轮缩放 • 双击重置 • 拖拽移动</span>
                            </div>
                        </div>
                    </el-card>
                </div>

                <!-- Memory 树状图展示 -->
                <div v-if="hasMemoryData" class="memory-section">
                    <el-card class="section-card">
                        <template #header>
                            <div class="section-header">
                                <h3>内存数据</h3>
                                <div class="memory-actions">
                                    <el-button type="primary" size="small" @click="expandAll">
                                        展开全部
                                    </el-button>
                                    <el-button type="info" size="small" @click="collapseAll">
                                        折叠全部
                                    </el-button>
                                    <el-button type="success" size="small" @click="copyMemoryJson">
                                        复制JSON
                                    </el-button>
                                </div>
                            </div>
                        </template>
                        <div class="memory-container">
                            <el-tree
                                ref="memoryTree"
                                :data="formattedMemoryData"
                                :props="treeProps"
                                node-key="id"
                                :default-expand-all="defaultExpanded"
                                :expand-on-click-node="false"
                                class="memory-tree"
                            >
                                <template #default="{ node, data }">
                                    <span class="tree-node">
                                        <span class="tree-label">{{ node.label }}</span>
                                        <span v-if="data.value !== undefined" class="tree-value">
                                            : {{ formatValue(data.value) }}
                                        </span>
                                    </span>
                                </template>
                            </el-tree>
                        </div>
                    </el-card>
                </div>

                <!-- 原始数据展示 -->
                <div class="raw-data-section">
                    <el-card class="section-card">
                        <template #header>
                            <div class="section-header">
                                <h3>原始数据</h3>
                                <el-button type="success" size="small" @click="copyRawData">
                                    复制原始数据
                                </el-button>
                            </div>
                        </template>
                        <div class="raw-data-container">
                            <el-tabs v-model="activeTab" type="border-card">
                                <el-tab-pane label="JSON格式" name="json">
                                    <div class="json-viewer">
                                        <pre>{{ formattedJson }}</pre>
                                    </div>
                                </el-tab-pane>
                                <el-tab-pane label="原始文本" name="raw">
                                    <div class="raw-text-viewer">
                                        <pre>{{ rawText }}</pre>
                                    </div>
                                </el-tab-pane>
                            </el-tabs>
                        </div>
                    </el-card>
                </div>
            </div>
        </div>

        <!-- 加载状态 -->
        <div v-else-if="false" class="loading-state">
            <el-skeleton :rows="10" animated />
        </div>

        <!-- 无数据提示 -->
        <div v-else class="empty-state">
            <el-empty description="未找到项目数据" />
            <div class="empty-actions">
                <el-button type="primary" @click="goBack"> 返回项目列表 </el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Refresh, Minus, Plus } from "@element-plus/icons-vue";
import mermaid from "mermaid";
import { decode } from "js-base64";
import { ElMessage } from "element-plus";
import { useAppStore } from "@/stores/app";

// 路由和状态管理
const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

// 路由参数
const projectType = ref<string>("");
const projectId = ref<string>("");

// 响应式状态
const mermaidContainer = ref<HTMLElement | null>(null);
const mermaidWrapper = ref<HTMLElement | null>(null);
interface TreeStore {
    nodesMap: Record<string, { expanded: boolean }>;
}

const memoryTree = ref<{ store: TreeStore } | null>(null);
const refreshingMermaid = ref(false);
const defaultExpanded = ref(true);
const activeTab = ref("json");
const zoomLevel = ref(1);
const dragOffset = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const showGrid = ref(false);
const showZoomHint = ref(true);
const lastInteractionTime = ref(Date.now());

// 计算属性
const screepsData = computed(() => appStore.screepsData);
const projectData = computed(() => {
    if (!screepsData.value?.globalData?.projects) return null;
    return screepsData.value.globalData.projects[projectType.value]?.[projectId.value] || null;
});

const hasMemoryData = computed(() => {
    return projectData.value?.memory && Object.keys(projectData.value.memory).length > 0;
});

const formattedMemoryData = computed(() => {
    if (!projectData.value?.memory) return [];
    return formatMemoryData(projectData.value.memory);
});

const formattedJson = computed(() => {
    return JSON.stringify(projectData.value, null, 2);
});

const rawText = computed(() => {
    if (!projectData.value) return "";
    return `Diagram: ${projectData.value.diagram || "无"}\n\nMemory: ${JSON.stringify(projectData.value.memory || {}, null, 2)}`;
});

// 树状图配置
const treeProps = {
    children: "children",
    label: "label",
};

// 方法
function getProjectTypeTitle(type: string): string {
    const typeMap: Record<string, string> = {
        construction: "建筑项目",
        defense: "防御项目",
        resource: "资源项目",
        creep: "Creep项目",
        room: "房间项目",
        spawn: "孵化项目",
        maintainRoomProject: "房间维护项目",
        // 可以添加更多映射
    };
    return typeMap[type] || type;
}

interface TreeNode {
    id: string;
    label: string;
    value?: unknown;
    children?: TreeNode[];
}

function formatMemoryData(memory: Record<string, unknown>): TreeNode[] {
    const formatNode = (key: string, value: unknown, parentPath: string = ""): TreeNode => {
        const id = parentPath ? `${parentPath}.${key}` : key;

        if (value === null || value === undefined) {
            return {
                id,
                label: key,
                value: String(value),
            };
        }

        if (typeof value === "object" && !Array.isArray(value)) {
            const children = Object.entries(value as Record<string, unknown>).map(
                ([childKey, childValue]) => formatNode(childKey, childValue, id),
            );

            return {
                id,
                label: key,
                children: children.length > 0 ? children : undefined,
            };
        }

        return {
            id,
            label: key,
            value,
        };
    };

    return Object.entries(memory).map(([key, value]) => formatNode(key, value));
}

function formatValue(value: unknown): string {
    if (value === null) return "null";
    if (value === undefined) return "undefined";

    if (typeof value === "object") {
        return Array.isArray(value) ? `[${value.length} items]` : "{...}";
    }

    if (typeof value === "boolean") {
        return value ? "true" : "false";
    }

    if (typeof value === "number") {
        return Number.isInteger(value) ? value.toString() : value.toFixed(2);
    }

    if (typeof value === "string") {
        return value.length > 50 ? value.substring(0, 47) + "..." : value;
    }

    return String(value);
}

async function renderMermaid(): Promise<void> {
    if (!mermaidContainer.value || !projectData.value?.diagram) return;

    refreshingMermaid.value = true;
    try {
        // 清理之前的渲染
        mermaidContainer.value.innerHTML = "";

        // 解码base64编码的mermaid代码
        let diagram = projectData.value.diagram;
        try {
            diagram = decode(diagram);
        } catch {
            // 如果解码失败，说明不是base64编码，使用原始字符串
            console.log("Diagram is not base64 encoded, using as plain text");
        }

        // 初始化mermaid配置
        mermaid.initialize({
            startOnLoad: false,
            theme: "default",
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: "basis",
            },
            securityLevel: "loose",
        });

        // 渲染图表
        const { svg } = await mermaid.render(
            `mermaid-${projectType.value}-${projectId.value}`,
            diagram,
        );
        mermaidContainer.value.innerHTML = svg;
    } catch (error) {
        console.error("Failed to render mermaid diagram:", error);
        if (mermaidContainer.value) {
            const errorDetail = error instanceof Error ? error.message : String(error);
            mermaidContainer.value.innerHTML = `
                <div class="mermaid-error">
                    <div class="error-title">图表渲染失败</div>
                    <div class="error-detail">${errorDetail}</div>
                </div>
            `;
        }
    } finally {
        refreshingMermaid.value = false;
    }
}

function refreshMermaid(): void {
    renderMermaid();
}

const maxZoomValue = 5;
const minZoomValue = 0.3;
const zoomStepValue = 0.3;

function zoomIn(): void {
    if (zoomLevel.value < maxZoomValue) {
        const oldZoom = zoomLevel.value;
        zoomLevel.value = Math.min(maxZoomValue, zoomLevel.value + zoomStepValue);

        // 调整拖拽偏移量以保持视觉中心
        if (mermaidWrapper.value) {
            const wrapperRect = mermaidWrapper.value.getBoundingClientRect();
            const centerX = wrapperRect.width / 2;
            const centerY = wrapperRect.height / 2;

            // 计算新的偏移量以保持中心点
            dragOffset.value.x =
                centerX - (centerX - dragOffset.value.x) * (zoomLevel.value / oldZoom);
            dragOffset.value.y =
                centerY - (centerY - dragOffset.value.y) * (zoomLevel.value / oldZoom);
        }

        // 当缩放级别大于1时显示网格
        showGrid.value = zoomLevel.value > 1;

        // 确保偏移量在合理范围内
        enforceDragBounds();
    }
}

function zoomOut(): void {
    if (zoomLevel.value > minZoomValue) {
        const oldZoom = zoomLevel.value;
        zoomLevel.value = Math.max(minZoomValue, zoomLevel.value - zoomStepValue);

        // 调整拖拽偏移量以保持视觉中心
        if (mermaidWrapper.value) {
            const wrapperRect = mermaidWrapper.value.getBoundingClientRect();
            const centerX = wrapperRect.width / 2;
            const centerY = wrapperRect.height / 2;

            // 计算新的偏移量以保持中心点
            dragOffset.value.x =
                centerX - (centerX - dragOffset.value.x) * (zoomLevel.value / oldZoom);
            dragOffset.value.y =
                centerY - (centerY - dragOffset.value.y) * (zoomLevel.value / oldZoom);
        }

        // 当缩放级别小于等于1时隐藏网格
        showGrid.value = zoomLevel.value > 1;

        // 确保偏移量在合理范围内
        enforceDragBounds();
    }
}

function resetZoom(): void {
    zoomLevel.value = 1;
    dragOffset.value = { x: 0, y: 0 };
    showGrid.value = false;
    updateInteractionTime();
}

function startDrag(event: MouseEvent | TouchEvent): void {
    if (event.type === "mousedown" && (event as MouseEvent).button !== 0) {
        return; // 只响应左键点击
    }

    isDragging.value = true;
    if ("touches" in event && event.touches[0]) {
        dragStart.value = {
            x: event.touches[0].clientX - dragOffset.value.x,
            y: event.touches[0].clientY - dragOffset.value.y,
        };
    } else {
        dragStart.value = {
            x: (event as MouseEvent).clientX - dragOffset.value.x,
            y: (event as MouseEvent).clientY - dragOffset.value.y,
        };
    }

    updateInteractionTime();
    hideZoomHint();
    event.preventDefault();
}

function handleDrag(event: MouseEvent | TouchEvent): void {
    if (!isDragging.value) return;

    let clientX: number, clientY: number;

    if ("touches" in event && event.touches[0]) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = (event as MouseEvent).clientX;
        clientY = (event as MouseEvent).clientY;
    }

    // 计算新的偏移量
    const newX = clientX - dragStart.value.x;
    const newY = clientY - dragStart.value.y;

    // 限制拖拽范围，防止图表被拖出容器
    if (mermaidWrapper.value && mermaidContainer.value) {
        const wrapperRect = mermaidWrapper.value.getBoundingClientRect();
        const chartRect = mermaidContainer.value.getBoundingClientRect();
        const scaledWidth = chartRect.width * zoomLevel.value;
        const scaledHeight = chartRect.height * zoomLevel.value;

        // 计算最大允许的偏移量
        const maxX = Math.max(0, scaledWidth - wrapperRect.width);
        const maxY = Math.max(0, scaledHeight - wrapperRect.height);

        // 限制偏移量在合理范围内
        dragOffset.value = {
            x: Math.max(-maxX, Math.min(0, newX)),
            y: Math.max(-maxY, Math.min(0, newY)),
        };
    } else {
        dragOffset.value = {
            x: newX,
            y: newY,
        };
    }

    event.preventDefault();
}

function stopDrag(): void {
    isDragging.value = false;
    // 拖拽结束后确保偏移量在合理范围内
    enforceDragBounds();
    updateInteractionTime();
}

// 确保拖拽偏移量在合理范围内
function enforceDragBounds(): void {
    if (!mermaidWrapper.value || !mermaidContainer.value) return;

    const wrapperRect = mermaidWrapper.value.getBoundingClientRect();
    const chartRect = mermaidContainer.value.getBoundingClientRect();
    const scaledWidth = chartRect.width * zoomLevel.value;
    const scaledHeight = chartRect.height * zoomLevel.value;

    // 计算最大允许的偏移量
    const maxX = Math.max(0, scaledWidth - wrapperRect.width);
    const maxY = Math.max(0, scaledHeight - wrapperRect.height);

    // 限制偏移量在合理范围内
    dragOffset.value = {
        x: Math.max(-maxX, Math.min(0, dragOffset.value.x)),
        y: Math.max(-maxY, Math.min(0, dragOffset.value.y)),
    };
}

// 更新交互时间
function updateInteractionTime(): void {
    lastInteractionTime.value = Date.now();
}

// 隐藏缩放提示
function hideZoomHint(): void {
    showZoomHint.value = false;
}

// 处理滚轮缩放
function handleWheel(event: WheelEvent): void {
    event.preventDefault();

    const delta = event.deltaY;

    if (delta < 0) {
        // 向上滚动，放大
        zoomInAtPoint(event.clientX, event.clientY);
    } else {
        // 向下滚动，缩小
        zoomOutAtPoint(event.clientX, event.clientY);
    }

    updateInteractionTime();
    hideZoomHint();
}

// 在指定点缩放
function zoomInAtPoint(clientX: number, clientY: number): void {
    if (zoomLevel.value >= maxZoomValue) return;

    const oldZoom = zoomLevel.value;
    zoomLevel.value = Math.min(maxZoomValue, zoomLevel.value + zoomStepValue);

    // 计算相对于容器的坐标
    if (mermaidWrapper.value) {
        const wrapperRect = mermaidWrapper.value.getBoundingClientRect();
        const pointX = clientX - wrapperRect.left;
        const pointY = clientY - wrapperRect.top;

        // 调整偏移量以保持鼠标位置不变
        dragOffset.value.x = pointX - (pointX - dragOffset.value.x) * (zoomLevel.value / oldZoom);
        dragOffset.value.y = pointY - (pointY - dragOffset.value.y) * (zoomLevel.value / oldZoom);
    }

    showGrid.value = zoomLevel.value > 1;
    enforceDragBounds();
}

function zoomOutAtPoint(clientX: number, clientY: number): void {
    if (zoomLevel.value <= minZoomValue) return;

    const oldZoom = zoomLevel.value;
    zoomLevel.value = Math.max(minZoomValue, zoomLevel.value - zoomStepValue);

    // 计算相对于容器的坐标
    if (mermaidWrapper.value) {
        const wrapperRect = mermaidWrapper.value.getBoundingClientRect();
        const pointX = clientX - wrapperRect.left;
        const pointY = clientY - wrapperRect.top;

        // 调整偏移量以保持鼠标位置不变
        dragOffset.value.x = pointX - (pointX - dragOffset.value.x) * (zoomLevel.value / oldZoom);
        dragOffset.value.y = pointY - (pointY - dragOffset.value.y) * (zoomLevel.value / oldZoom);
    }

    showGrid.value = zoomLevel.value > 1;
    enforceDragBounds();
}

// 处理容器双击
function handleDoubleClick(event: MouseEvent): void {
    if (event.target === mermaidWrapper.value) {
        resetZoom();
        updateInteractionTime();
        hideZoomHint();
    }
}

// 处理图表双击
function handleChartDoubleClick(event: MouseEvent): void {
    event.stopPropagation();
    zoomInAtPoint(event.clientX, event.clientY);
    updateInteractionTime();
    hideZoomHint();
}

function expandAll(): void {
    if (memoryTree.value?.store) {
        const nodes = memoryTree.value.store.nodesMap;
        Object.keys(nodes).forEach((key) => {
            if (nodes[key]) {
                nodes[key].expanded = true;
            }
        });
    }
}

function collapseAll(): void {
    if (memoryTree.value?.store) {
        const nodes = memoryTree.value.store.nodesMap;
        Object.keys(nodes).forEach((key) => {
            if (nodes[key]) {
                nodes[key].expanded = false;
            }
        });
    }
}

async function copyMemoryJson(): Promise<void> {
    try {
        const jsonStr = JSON.stringify(projectData.value?.memory || {}, null, 2);
        await navigator.clipboard.writeText(jsonStr);
        ElMessage.success("内存数据已复制到剪贴板");
    } catch (error) {
        console.error("Failed to copy memory JSON:", error);
        ElMessage.error("复制失败");
    }
}

async function copyRawData(): Promise<void> {
    try {
        await navigator.clipboard.writeText(rawText.value);
        ElMessage.success("原始数据已复制到剪贴板");
    } catch (error) {
        console.error("Failed to copy raw data:", error);
        ElMessage.error("复制失败");
    }
}

function goBack(): void {
    router.back();
}

// 生命周期
onMounted(() => {
    // 从路由参数获取项目信息
    projectType.value = route.params.projectType as string;
    projectId.value = route.params.projectId as string;

    // 初始化mermaid
    mermaid.initialize({
        startOnLoad: false,
        theme: "default",
    });

    // 延迟渲染mermaid，确保DOM已准备好
    nextTick(() => {
        if (projectData.value?.diagram) {
            renderMermaid();
        }
    });

    // 添加键盘快捷键
    window.addEventListener("keydown", handleKeyDown);

    // 自动隐藏提示
    setTimeout(() => {
        if (Date.now() - lastInteractionTime.value > 5000) {
            showZoomHint.value = false;
        }
    }, 5000);
});

// 处理键盘快捷键
function handleKeyDown(event: KeyboardEvent): void {
    // 防止在输入框中触发
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
    }

    switch (event.key) {
        case "+":
        case "=":
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                zoomIn();
                updateInteractionTime();
                hideZoomHint();
            }
            break;
        case "-":
        case "_":
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                zoomOut();
                updateInteractionTime();
                hideZoomHint();
            }
            break;
        case "0":
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                resetZoom();
                updateInteractionTime();
                hideZoomHint();
            }
            break;
        case "r":
        case "R":
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                refreshMermaid();
                updateInteractionTime();
                hideZoomHint();
            }
            break;
    }
}

onUnmounted(() => {
    // 清理mermaid实例
    if (mermaidContainer.value) {
        mermaidContainer.value.innerHTML = "";
    }

    // 移除键盘事件监听器
    window.removeEventListener("keydown", handleKeyDown);
});

// 监听项目数据变化
watch(
    () => projectData.value,
    (newData) => {
        if (newData?.diagram) {
            nextTick(() => {
                renderMermaid();
            });
        }
    },
    { deep: true },
);
</script>

<style scoped>
.project-detail-container {
    padding: 1.5rem;
    background-color: #f5f7fa;
    height: calc(100vh - var(--navigation-bar-height, 120px));
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
}

.detail-main {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
}

.detail-header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;
}

.back-button {
    align-self: flex-start;
    padding-left: 0;
}

.header-title {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.project-title {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
    color: #303133;
}

.project-type-tag {
    font-size: 16px;
    padding: 8px 16px;
}

.detail-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.section-card {
    border: 1px solid #e1e8ed;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 4px;
}

.section-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
}

.mermaid-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
}

.mermaid-actions .drag-hint {
    font-size: 12px;
    color: #909399;
    margin-left: 8px;
}

.memory-actions {
    display: flex;
    gap: 8px;
}

.mermaid-section {
    width: 100%;
}

.mermaid-container {
    background: white;
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    padding: 16px;
    overflow: hidden;
    max-height: 600px;
    min-height: 300px;
    position: relative;
    cursor: default;
    position: relative;
}

.mermaid-grid {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
        linear-gradient(rgba(0, 0, 0, 0.15) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 0, 0, 0.15) 1px, transparent 1px);
    background-size: 20px 20px;
    pointer-events: none;
    z-index: 1;
    opacity: 0.5;
}

.zoom-hint {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 10;
    animation: fadeIn 0.3s ease;
    pointer-events: none;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.mermaid-chart {
    min-height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: transform 0.1s ease-out;
    margin: 0 auto;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    touch-action: none; /* 防止触摸默认行为 */
    z-index: 2;
    position: relative;
}

.mermaid-chart svg {
    max-width: none;
    height: auto;
    pointer-events: none; /* 防止SVG元素干扰拖拽 */
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.mermaid-error {
    color: #f56c6c;
    padding: 20px;
    text-align: center;
    background: #fef0f0;
    border-radius: 4px;
    font-size: 14px;
    width: 100%;
}

.mermaid-error .error-title {
    font-weight: bold;
    margin-bottom: 8px;
    font-size: 16px;
}

.mermaid-error .error-detail {
    margin-bottom: 8px;
    font-family: monospace;
    word-break: break-all;
    max-width: 100%;
    overflow: auto;
    pointer-events: auto; /* 错误信息区域允许交互 */
}

.memory-section {
    width: 100%;
}

.memory-container {
    background: white;
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    padding: 16px;
    max-height: 600px;
    overflow: auto;
}

.memory-tree {
    background: transparent;
}

.tree-node {
    display: flex;
    align-items: center;
    padding: 4px 0;
}

.tree-label {
    font-weight: 500;
    color: #303133;
    margin-right: 8px;
}

.tree-value {
    color: #909399;
    font-family: "Courier New", monospace;
    font-size: 14px;
    word-break: break-all;
}

.raw-data-section {
    width: 100%;
}

.raw-data-container {
    background: white;
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    overflow: hidden;
}

.json-viewer,
.raw-text-viewer {
    padding: 16px;
    max-height: 400px;
    overflow: auto;
    background: #f8f9fa;
    font-family: "Courier New", monospace;
    font-size: 14px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-all;
}

.json-viewer pre,
.raw-text-viewer pre {
    margin: 0;
    color: #24292e;
}

.loading-state {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.empty-state {
    max-width: 1200px;
    margin: 0 auto;
    padding: 4rem 2rem;
    text-align: center;
}

.empty-actions {
    margin-top: 2rem;
}

/* 滚动条样式 */
.mermaid-container::-webkit-scrollbar,
.memory-container::-webkit-scrollbar,
.json-viewer::-webkit-scrollbar,
.raw-text-viewer::-webkit-scrollbar {
    width: 6px;
}

.mermaid-container::-webkit-scrollbar-track,
.memory-container::-webkit-scrollbar-track,
.json-viewer::-webkit-scrollbar-track,
.raw-text-viewer::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.mermaid-container::-webkit-scrollbar-thumb,
.memory-container::-webkit-scrollbar-thumb,
.json-viewer::-webkit-scrollbar-thumb,
.raw-text-viewer::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.mermaid-container::-webkit-scrollbar-thumb:hover,
.memory-container::-webkit-scrollbar-thumb:hover,
.json-viewer::-webkit-scrollbar-thumb:hover,
.raw-text-viewer::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .project-detail-container {
        padding: 1rem;
        height: calc(100vh - var(--navigation-bar-height-mobile, 100px));
    }

    .project-title {
        font-size: 24px;
    }

    .section-header {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
    }

    .memory-actions {
        width: 100%;
        justify-content: flex-start;
    }

    .mermaid-actions {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }

    .mermaid-actions .el-button-group {
        width: 100%;
        display: flex;
    }

    .mermaid-actions .el-button-group .el-button {
        flex: 1;
    }
}
</style>
