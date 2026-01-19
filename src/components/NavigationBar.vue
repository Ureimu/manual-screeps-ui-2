<template>
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
    </el-menu>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { House, View } from "@element-plus/icons-vue";

const router = useRouter();
const route = useRoute();

const activeIndex = ref(route.path);

// 监听路由变化更新激活状态
watch(
    () => route.path,
    (newPath) => {
        activeIndex.value = newPath;
    },
);

const handleSelect = (index: string) => {
    router.push(index);
};
</script>

<style scoped>
.navigation-bar {
    width: 100%;
    background-color: #ffffff;
    border-bottom: 1px solid #e1e8ed;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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

/* 响应式设计 */
@media (max-width: 768px) {
    .navigation-bar .el-menu-item {
        font-size: 13px;
        padding: 0 12px;
    }

    .navigation-bar .el-menu-item .el-icon {
        margin-right: 4px;
        font-size: 14px;
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
}
</style>
