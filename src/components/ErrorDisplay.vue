<template>
    <div class="error-display-container">
        <header class="error-header">
            <h3>{{ title }}</h3>
            <div class="error-stats">
                <span class="error-count">
                    <el-icon :size="16" color="#f56c6c">
                        <Warning />
                    </el-icon>
                    错误数量: {{ errorData.messageList.length }}
                </span>
                <span class="uncaught-count" v-if="errorData.uncaughtErrorNum > 0">
                    <el-icon :size="16" color="#e6a23c">
                        <WarningFilled />
                    </el-icon>
                    未捕获错误: {{ errorData.uncaughtErrorNum }}
                </span>
                <span class="buffer-status" :class="{ 'buffer-full': errorData.isFull }">
                    <el-icon :size="16" :color="errorData.isFull ? '#f56c6c' : '#67c23a'">
                        <DataBoard />
                    </el-icon>
                    缓冲区: {{ errorData.isFull ? "已满" : "正常" }}
                </span>
            </div>
        </header>

        <main class="error-main">
            <div v-if="errorData.messageList.length > 0" class="error-list">
                <div
                    v-for="error in sortedErrors"
                    :key="getErrorKey(error)"
                    class="error-item"
                    :class="{ expanded: expandedErrors.has(getErrorKey(error)) }"
                    @click="toggleError(getErrorKey(error))"
                >
                    <div class="error-summary">
                        <div class="error-icon">
                            <el-icon :size="14" color="#f56c6c">
                                <CircleCloseFilled />
                            </el-icon>
                        </div>
                        <div class="error-content">
                            <div class="error-message">{{ error.short }}</div>
                            <div class="error-meta">
                                <span class="error-ticks">
                                    <el-icon :size="12">
                                        <Clock />
                                    </el-icon>
                                    发生Tick: {{ formatTicks(error.ticks, currentTick) }}
                                </span>
                                <span class="error-count">
                                    <el-icon :size="12">
                                        <Histogram />
                                    </el-icon>
                                    出现次数: {{ error.ticks?.length || 0 }}
                                </span>
                            </div>
                        </div>
                        <div class="error-toggle">
                            <el-icon :size="12">
                                <ArrowDown v-if="!expandedErrors.has(getErrorKey(error))" />
                                <ArrowUp v-else />
                            </el-icon>
                        </div>
                    </div>

                    <div
                        v-if="expandedErrors.has(getErrorKey(error))"
                        class="error-details"
                        @click.stop
                    >
                        <div class="details-header">详细错误信息:</div>
                        <div class="full-messages">
                            <div
                                v-for="(message, msgIndex) in error.full"
                                :key="msgIndex"
                                class="full-message"
                                @click.stop="copyErrorMessage(message, msgIndex)"
                                :title="'点击复制: ' + getSingleErrorMessage(message, msgIndex)"
                            >
                                {{ message }}
                                <el-icon class="copy-icon" :size="12">
                                    <CopyDocument />
                                </el-icon>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="no-errors">
                <el-empty description="暂无错误信息" :image-size="80">
                    <template #image>
                        <el-icon :size="80" color="#67c23a">
                            <SuccessFilled />
                        </el-icon>
                    </template>
                </el-empty>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import type { ErrorSegmentMemory } from "@/type/origin";
import {
    Warning,
    WarningFilled,
    DataBoard,
    CircleCloseFilled,
    Clock,
    Histogram,
    ArrowDown,
    ArrowUp,
    SuccessFilled,
    CopyDocument,
} from "@element-plus/icons-vue";

interface Props {
    title?: string;
    errorData: ErrorSegmentMemory;
    currentTick?: number;
}

const props = withDefaults(defineProps<Props>(), {
    title: "错误信息",
    currentTick: undefined,
});

// 展开的错误索引集合（使用错误摘要作为键，避免排序后索引变化）
const expandedErrors = ref<Set<string>>(new Set());

// 按最后发生时间排序的错误列表（从新到旧）
const sortedErrors = computed(() => {
    if (!props.errorData?.messageList) return [];

    return [...props.errorData.messageList].sort((a, b) => {
        // 获取每个错误的最后发生时间（最大tick值）
        const ticksA = a.ticks || [];
        const ticksB = b.ticks || [];
        const lastTickA = ticksA.length > 0 ? Math.max(...ticksA) : 0;
        const lastTickB = ticksB.length > 0 ? Math.max(...ticksB) : 0;

        // 从大到小排序（最新的在前）
        return lastTickB - lastTickA;
    });
});

// 生成错误的唯一键（使用错误摘要）
const getErrorKey = (error: { short: string; ticks?: number[] }): string => {
    const ticks = error.ticks || [];
    return `${error.short}_${ticks.join("_")}`;
};

// 切换错误详情展开状态
const toggleError = (key: string) => {
    if (expandedErrors.value.has(key)) {
        expandedErrors.value.delete(key);
    } else {
        expandedErrors.value.add(key);
    }
};

// 格式化Tick显示（显示相对于当前tick的差值）
const formatTicks = (ticks?: number[], currentTick?: number): string => {
    if (!ticks || ticks.length === 0) return "无";

    // 如果没有当前tick，显示绝对tick数
    if (currentTick === undefined) {
        if (ticks.length === 1) return ticks[0]?.toString() ?? "";

        // 如果所有Tick都相同（理论上不会发生）
        const uniqueTicks = [...new Set(ticks)];
        if (uniqueTicks.length === 1) return uniqueTicks[0]?.toString() ?? "";

        // 显示最小和最大Tick
        const minTick = Math.min(...ticks);
        const maxTick = Math.max(...ticks);
        return `${minTick} - ${maxTick}`;
    }

    // 计算相对于当前tick的差值
    const formatRelativeTick = (tick: number): string => {
        const diff = currentTick - tick;
        if (diff === 0) return "当前tick";
        return `${diff} tick${Math.abs(diff) > 1 ? "s" : ""}前`;
    };

    if (ticks.length === 1) {
        return formatRelativeTick(ticks[0] ?? 0);
    }

    // 如果所有Tick都相同
    const uniqueTicks = [...new Set(ticks)];
    if (uniqueTicks.length === 1) {
        return formatRelativeTick(uniqueTicks[0] ?? 0);
    }

    // 显示最小和最大Tick的差值
    const minTick = Math.min(...ticks);
    const maxTick = Math.max(...ticks);
    return `${formatRelativeTick(minTick)} - ${formatRelativeTick(maxTick)}`;
};

// 从字符串右侧查找一对括号并提取内容
const extractContentFromParentheses = (text: string): string => {
    let depth = 0;
    let startIndex = -1;
    let endIndex = -1;

    // 从右侧开始查找
    for (let i = text.length - 1; i >= 0; i--) {
        const char = text[i];

        if (char === ")") {
            if (depth === 0) {
                endIndex = i;
            }
            depth++;
        } else if (char === "(") {
            depth--;
            if (depth === 0 && endIndex !== -1) {
                startIndex = i;
                break;
            }
        }
    }

    // 如果找到匹配的括号对，提取内容
    if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
        return text.substring(startIndex + 1, endIndex).trim();
    }

    // 如果没有找到括号对，返回原字符串
    return text;
};

const getSingleErrorMessage = (message: string, msgIndex: number) => {
    let textToCopy = message;

    // 如果不是第一行详细错误信息，尝试从右侧查找括号内容
    if (msgIndex > 0) {
        const extractedContent = extractContentFromParentheses(message);
        textToCopy = extractedContent;
    }
    return textToCopy;
};

// 复制错误信息到剪贴板
const copyErrorMessage = async (message: string, msgIndex: number) => {
    const textToCopy = getSingleErrorMessage(message, msgIndex);

    try {
        await navigator.clipboard.writeText(textToCopy);
        ElMessage.success({
            message: "错误信息已复制到剪贴板",
            duration: 2000,
        });
    } catch (err) {
        console.error("复制失败:", err);
        // 降级方案：使用document.execCommand
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand("copy");
            ElMessage.success({
                message: "错误信息已复制到剪贴板",
                duration: 2000,
            });
        } catch (execErr) {
            console.error("execCommand复制失败:", execErr);
            ElMessage.error({
                message: "复制失败，请手动复制",
                duration: 3000,
            });
        } finally {
            document.body.removeChild(textArea);
        }
    }
};
</script>

<style scoped>
.error-display-container {
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid #e1e8ed;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.error-header {
    padding: 1rem 1.5rem;
    background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
    border-bottom: 1px solid #fcd3d3;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.error-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #f56c6c;
}

.error-stats {
    display: flex;
    gap: 1.5rem;
    align-items: center;
}

.error-count,
.uncaught-count,
.buffer-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    padding: 4px 10px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.8);
}

.error-count {
    color: #f56c6c;
    border: 1px solid #fcd3d3;
}

.uncaught-count {
    color: #e6a23c;
    border: 1px solid #faecd8;
}

.buffer-status {
    color: #67c23a;
    border: 1px solid #e1f3d8;
}

.buffer-status.buffer-full {
    color: #f56c6c;
    border: 1px solid #fcd3d3;
}

.error-main {
    padding: 0;
}

.error-list {
    max-height: 500px;
    overflow-y: auto;
}

.error-item {
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: all 0.3s ease;
}

.error-item:last-child {
    border-bottom: none;
}

.error-item:hover {
    background-color: #fafafa;
}

.error-item.expanded {
    background-color: #f9f9f9;
}

.error-summary {
    padding: 1rem 1.5rem;
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.error-icon {
    flex-shrink: 0;
    margin-top: 2px;
}

.error-content {
    flex: 1;
    min-width: 0;
}

.error-message {
    font-size: 0.95rem;
    font-weight: 500;
    color: #303133;
    margin-bottom: 6px;
    line-height: 1.4;
    word-break: break-word;
}

.error-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
    color: #909399;
}

.error-ticks,
.error-count {
    display: flex;
    align-items: center;
    gap: 4px;
}

.error-toggle {
    flex-shrink: 0;
    color: #909399;
    transition: transform 0.3s ease;
}

.error-item.expanded .error-toggle {
    transform: rotate(180deg);
}

.error-details {
    padding: 0 1.5rem 1rem 3.5rem;
    animation: slideDown 0.3s ease;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.details-header {
    font-size: 0.85rem;
    font-weight: 600;
    color: #606266;
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 1px dashed #e4e7ed;
}

.full-messages {
    background: #f8f9fa;
    border-radius: 6px;
    padding: 12px;
    border: 1px solid #e9ecef;
}

.full-message {
    font-size: 0.85rem;
    color: #495057;
    line-height: 1.6;
    font-family: "Consolas", "Monaco", "Courier New", monospace;
    padding: 4px 0;
    border-bottom: 1px solid #e9ecef;
    cursor: pointer;
    position: relative;
    padding-right: 24px;
    transition: all 0.2s ease;
}

.full-message:hover {
    background-color: #f8f9fa;
    padding-left: 8px;
    border-radius: 4px;
}

.copy-icon {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0;
    transition: opacity 0.2s ease;
    color: #909399;
}

.full-message:hover .copy-icon {
    opacity: 1;
}

.full-message:last-child {
    border-bottom: none;
}

.no-errors {
    padding: 3rem 1.5rem;
    text-align: center;
}

/* 滚动条样式 */
.error-list::-webkit-scrollbar {
    width: 6px;
}

.error-list::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.error-list::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.error-list::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .error-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }

    .error-stats {
        flex-wrap: wrap;
        gap: 0.75rem;
    }

    .error-summary {
        padding: 0.75rem 1rem;
    }

    .error-details {
        padding: 0 1rem 0.75rem 2.5rem;
    }
}
</style>
