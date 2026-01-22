<template>
    <div class="projects-display">
        <el-card class="projects-card">
            <template #header>
                <div class="card-header">
                    <span class="card-title">项目列表</span>
                    <el-tag type="info" size="small"> {{ totalProjectsCount }} 个项目 </el-tag>
                </div>
            </template>

            <div v-if="!hasProjects" class="empty-state">
                <el-empty description="暂无项目数据" />
            </div>

            <div v-else class="projects-container">
                <!-- 项目类型筛选 -->
                <div class="filter-section">
                    <el-input
                        v-model="searchQuery"
                        placeholder="搜索项目名称..."
                        clearable
                        class="search-input"
                        @input="handleSearch"
                    >
                        <template #prefix>
                            <el-icon><Search /></el-icon>
                        </template>
                    </el-input>

                    <el-select
                        v-model="selectedType"
                        placeholder="选择项目类型"
                        clearable
                        class="type-select"
                        @change="handleTypeChange"
                    >
                        <el-option
                            v-for="type in projectTypes"
                            :key="type"
                            :label="getProjectTypeTitle(type)"
                            :value="type"
                        />
                    </el-select>
                </div>

                <!-- 项目列表 -->
                <div class="projects-list">
                    <el-table
                        :data="filteredProjects"
                        :default-sort="{ prop: 'type', order: 'ascending' }"
                        stripe
                        size="large"
                        class="projects-table"
                        @row-click="handleRowClick"
                    >
                        <el-table-column prop="type" label="项目类型" width="150" sortable>
                            <template #default="{ row }">
                                <el-tag :type="getTagType(row.type)" size="small">
                                    {{ getProjectTypeTitle(row.type) }}
                                </el-tag>
                            </template>
                        </el-table-column>

                        <el-table-column prop="id" label="项目ID" min-width="200" sortable>
                            <template #default="{ row }">
                                <span class="project-id">{{ row.id }}</span>
                            </template>
                        </el-table-column>

                        <el-table-column
                            prop="hasDiagram"
                            label="流程图"
                            width="100"
                            align="center"
                        >
                            <template #default="{ row }">
                                <el-tag
                                    :type="row.hasDiagram ? 'success' : 'info'"
                                    size="small"
                                    effect="plain"
                                >
                                    {{ row.hasDiagram ? "有" : "无" }}
                                </el-tag>
                            </template>
                        </el-table-column>

                        <el-table-column
                            prop="hasMemory"
                            label="内存数据"
                            width="100"
                            align="center"
                        >
                            <template #default="{ row }">
                                <el-tag
                                    :type="row.hasMemory ? 'success' : 'info'"
                                    size="small"
                                    effect="plain"
                                >
                                    {{ row.hasMemory ? "有" : "无" }}
                                </el-tag>
                            </template>
                        </el-table-column>

                        <el-table-column label="操作" width="120" align="center" fixed="right">
                            <template #default="{ row }">
                                <el-button
                                    type="primary"
                                    size="small"
                                    @click.stop="viewProjectDetail(row.type, row.id)"
                                >
                                    查看详情
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>

                <!-- 分页 -->
                <div v-if="filteredProjects.length > pageSize" class="pagination-section">
                    <el-pagination
                        v-model:current-page="currentPage"
                        v-model:page-size="pageSize"
                        :page-sizes="[10, 20, 50, 100]"
                        layout="total, sizes, prev, pager, next, jumper"
                        :total="filteredProjects.length"
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                    />
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { Search } from "@element-plus/icons-vue";
import type { OriginScreepsData } from "@/type/origin";

interface Props {
    projectsData?: OriginScreepsData["globalData"]["projects"];
}

interface ProjectItem {
    type: string;
    id: string;
    hasDiagram: boolean;
    hasMemory: boolean;
    rawData: {
        diagram?: string;
        memory?: Record<string, unknown>;
    };
}

const props = withDefaults(defineProps<Props>(), {
    projectsData: () => ({}),
});

const router = useRouter();

// 响应式状态
const searchQuery = ref("");
const selectedType = ref("");
const currentPage = ref(1);
const pageSize = ref(20);

// 计算属性
const hasProjects = computed(() => {
    return Object.keys(props.projectsData).length > 0;
});

const totalProjectsCount = computed(() => {
    let count = 0;
    Object.values(props.projectsData).forEach((projectsByType) => {
        count += Object.keys(projectsByType).length;
    });
    return count;
});

const projectTypes = computed(() => {
    return Object.keys(props.projectsData);
});

const allProjects = computed(() => {
    const projects: ProjectItem[] = [];

    Object.entries(props.projectsData).forEach(([projectType, projectsByType]) => {
        Object.entries(projectsByType).forEach(([projectId, project]) => {
            projects.push({
                type: projectType,
                id: projectId,
                hasDiagram: !!project.diagram,
                hasMemory: !!project.memory && Object.keys(project.memory).length > 0,
                rawData: project,
            });
        });
    });

    return projects;
});

const filteredProjects = computed(() => {
    let filtered = allProjects.value;

    // 按类型筛选
    if (selectedType.value) {
        filtered = filtered.filter((project) => project.type === selectedType.value);
    }

    // 按搜索词筛选
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(
            (project) =>
                project.id.toLowerCase().includes(query) ||
                project.type.toLowerCase().includes(query),
        );
    }

    // 分页
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filtered.slice(start, end);
});

// 方法
function getProjectTypeTitle(projectType: string): string {
    const typeMap: Record<string, string> = {
        maintainRoomProject: "房间维护项目",
        attackStrongholdProject: "攻打要塞项目",
        interShardNewRoom: "跨shard占领房间项目",
        getPowerProject: "采集power项目",
        newRoom: "占领房间项目",
        outwardsHarvestProject: "外矿项目",
        // 可以添加更多映射
    };
    return typeMap[projectType] || projectType;
}

function getTagType(projectType: string): string {
    const typeMap: Record<string, string> = {
        maintainRoomProject: "primary",
    };
    return typeMap[projectType] || "";
}

function handleSearch(): void {
    currentPage.value = 1;
}

function handleTypeChange(): void {
    currentPage.value = 1;
}

function handleSizeChange(size: number): void {
    pageSize.value = size;
    currentPage.value = 1;
}

function handleCurrentChange(page: number): void {
    currentPage.value = page;
}

function handleRowClick(row: ProjectItem): void {
    viewProjectDetail(row.type, row.id);
}

function viewProjectDetail(projectType: string, projectId: string): void {
    router.push({
        name: "ProjectDetail",
        params: {
            projectType,
            projectId,
        },
    });
}

// 监听projects数据变化，重置筛选和分页
watch(
    () => props.projectsData,
    () => {
        searchQuery.value = "";
        selectedType.value = "";
        currentPage.value = 1;
    },
    { deep: true },
);
</script>

<style scoped>
.projects-display {
    width: 100%;
    height: 100%;
}

.projects-card {
    height: 100%;
    border: 1px solid #e1e8ed;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 4px;
}

.card-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
}

.empty-state {
    padding: 40px 0;
}

.projects-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: calc(100% - 60px);
}

.filter-section {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
}

.search-input {
    flex: 1;
    min-width: 200px;
    max-width: 300px;
}

.type-select {
    width: 200px;
}

.projects-list {
    flex: 1;
    overflow: hidden;
}

.projects-table {
    width: 100%;
    height: 100%;
    min-height: 500px;
}

.projects-table :deep(.el-table__row) {
    transition: background-color 0.2s;
}

.projects-table :deep(.el-table__row:hover) {
    background-color: #f5f7fa;
}

.project-id {
    font-weight: 500;
}

.pagination-section {
    display: flex;
    justify-content: center;
    padding: 16px 0;
    border-top: 1px solid #e8e8e8;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .filter-section {
        flex-direction: column;
        align-items: stretch;
    }

    .search-input,
    .type-select {
        max-width: 100%;
        width: 100%;
    }

    .projects-table :deep(.el-table__cell) {
        padding: 8px 4px;
    }
}
</style>
