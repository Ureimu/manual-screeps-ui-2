<template>
    <div class="panel-sidebar">
        <div class="sidebar-header">
            <h4 class="sidebar-title">{{ title }}</h4>
        </div>
        <div class="sidebar-categories">
            <div
                v-for="(category, index) in categories"
                :key="index"
                :class="[
                    'category-item',
                    { 'is-active': activeCategory === category.key },
                ]"
                @click="$emit('select', category.key)"
            >
                <el-tooltip
                    v-if="category.icon"
                    :content="category.label"
                    placement="right"
                    :show-after="300"
                >
                    <el-icon v-if="category.icon" class="category-icon">
                        <component :is="category.icon" />
                    </el-icon>
                </el-tooltip>
                <span class="category-label">{{ category.label }}</span>
                <el-tag v-if="category.count !== undefined" size="small" class="category-count">
                    {{ category.count }}
                </el-tag>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";

export interface SidebarCategory {
    key: string;
    label: string;
    icon?: Component | string;
    count?: number;
}

interface Props {
    title?: string;
    categories: SidebarCategory[];
    activeCategory: string;
}

defineProps<Props>();

defineEmits<{
    select: [key: string];
}>();
</script>

<style scoped>
.panel-sidebar {
    width: 200px;
    min-width: 200px;
    background: #ffffff;
    border-right: 1px solid #e1e8ed;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    height: 100%;
}

.sidebar-header {
    padding: 1rem;
    border-bottom: 1px solid #e1e8ed;
}

.sidebar-title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: #303133;
}

.sidebar-categories {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem 0;
}

.category-item {
    display: flex;
    align-items: center;
    padding: 0.6rem 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border-left: 3px solid transparent;
    gap: 0.5rem;
}

.category-item:hover {
    background-color: #f5f7fa;
    color: #409eff;
}

.category-item.is-active {
    background-color: #ecf5ff;
    color: #409eff;
    border-left-color: #409eff;
    font-weight: 500;
}

.category-icon {
    font-size: 1.1rem;
    flex-shrink: 0;
}

.category-label {
    font-size: 0.9rem;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.category-count {
    flex-shrink: 0;
}

/* 滚动条样式 */
.sidebar-categories::-webkit-scrollbar {
    width: 4px;
}

.sidebar-categories::-webkit-scrollbar-track {
    background: transparent;
}

.sidebar-categories::-webkit-scrollbar-thumb {
    background: #d0d5dd;
    border-radius: 2px;
}

.sidebar-categories::-webkit-scrollbar-thumb:hover {
    background: #b0b5bd;
}
</style>
