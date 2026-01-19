<script setup lang="ts">
import { computed } from "vue";
import type { LevelData } from "@/type/origin";
// import { formatPercent } from '@/utils/formatters'

interface Props {
    msg: string;
    levelData: LevelData | null;
    isFull?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isFull: false,
});

// 计算属性
const progressPercent = computed(() => {
    if (!props.levelData) return 0;
    if (props.levelData.progressTotal === 0) return 0;
    return (props.levelData.progress / props.levelData.progressTotal) * 100;
});

const barColor = computed(() => {
    if (props.isFull) return "#f56c6c"; // 红色 - 满容量
    return "#409eff"; // 蓝色 - 正常
});

const displayLevel = computed(() => {
    return props.levelData?.level ?? 0;
});

const progressValue = computed(() => {
    if (!props.levelData) return "0 / 0";
    return `${props.levelData.progress} / ${props.levelData.progressTotal}`;
});
</script>

<template>
    <div class="progress-indicator">
        <div class="progress-header">
            <span class="progress-title">{{ msg }}</span>
            <span class="progress-level">Lv. {{ displayLevel }}</span>
        </div>
        <div v-if="levelData" class="progress-container">
            <div class="progress-bar-wrapper">
                <div class="progress-bar-background">
                    <div
                        class="progress-bar-fill"
                        :style="{
                            width: `${progressPercent}%`,
                            backgroundColor: barColor,
                        }"
                    ></div>
                </div>
            </div>
            <div class="progress-info">
                <span class="progress-value">{{ progressValue }}</span>
                <span class="progress-percent">{{ progressPercent.toFixed(1) }}%</span>
            </div>
        </div>
        <div v-else class="progress-empty">
            <span>No data</span>
        </div>
    </div>
</template>

<style scoped>
.progress-indicator {
    background: #ffffff;
    border-radius: 4px;
    padding: 1rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.progress-indicator:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

.progress-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #333;
}

.progress-level {
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
}

.progress-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.progress-bar-wrapper {
    width: 100%;
}

.progress-bar-background {
    width: 100%;
    height: 24px;
    background-color: #f0f0f0;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e0e0e0;
}

.progress-bar-fill {
    height: 100%;
    transition: width 0.6s ease;
    border-radius: 12px;
}

.progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    color: #666;
}

.progress-value {
    font-family: "Monaco", "Courier", monospace;
}

.progress-percent {
    font-weight: 600;
    color: #333;
}

.progress-empty {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80px;
    color: #999;
    font-size: 0.9rem;
}
</style>
