# 📋 项目学习总结与数据展示页面生成 Prompt

### **项目概览**

这是一个基于 **Vue 3 + TypeScript + Vite** 的 Screeps 游戏数据可视化面板项目。项目采用 **Composition API** + **Pinia状态管理** + **ECharts图表库** + **Element Plus 组件库** 的技术栈，专门用于展示和分析 Screeps 玩家的游戏数据。

---

## 📊 **生成数据展示页面的详细 Prompt**

### **一、核心需求与框架**

```
你正在一个 Vue 3 + TypeScript 项目中工作，该项目专注于 Screeps 游戏数据可视化。
请按照以下标准生成一个新的数据展示页面组件。

项目技术栈：
- 前端框架：Vue 3（使用 Composition API 和 <script setup> 语法）
- UI 框架：Element Plus ^2.13.1
- 图表库：ECharts ^6.0.0
- 语言：TypeScript（严格模式）
- 构建工具：Vite
- 状态管理：Pinia ^3.0.4
- 路由：Vue Router ^4.6.4
- 工具库：lodash, mermaid
```

---

### **二、页面布局架构标准**

```
页面结构应遵循以下标准布局：

1. **顶层容器结构**：使用 Flexbox 布局实现响应式设计
   - header (顶部导航栏，固定高度)：使用 ElHeader 组件
   - main (主内容区)：flex: 1, 可滚动，使用 ElMain 组件
   - aside (左侧导航栏，可折叠)：使用 ElAside 组件，240px 宽度

2. **内容卡片网格**：使用 ElCard 和 ElRow/ElCol 组件实现响应式网格
   - 卡片间距：通过 gutter 属性设置间距
   - 卡片背景：使用 ElCard 的默认样式
   - 卡片样式：内置 Box Shadow 效果
   - 卡片宽度采用响应式设计，使用 ElRow 的 :gutter 和 ElCol 的 :xs/:sm/:md/:lg/:xl 属性

3. **内容分块**：使用 `<section>` 标签或 ElCard 组件分隔不同数据段落
   - 每个房间/数据段使用独立的 ElCard 或 section 容器
   - 使用 `<h2>` 或 `<h3>` 标签或 ElPageHeader 组件放置标题
   - 标题可配置锚点属性便于导航

4. **标签页**：使用 ElTabs 组件组织复杂功能
   - 支持选项卡切换以分类展示（如房间信息、外矿信息等）
   - ElTabs 内置激活状态管理
```

---

### **三、必须包含的核心组件类型**

#### **3.1 进度条显示组件（DashboardProgress 风格）**
```
组件名：[XXXProgressBar] 或 ProgressIndicator
用途：显示等级进度、容量进度等
特点：
- 使用 HTML5 <progress> 标签或自定义 SVG 圆形进度条
- 支持百分比属性计算进度百分比
- 支持自定义显示内容（如等级数字）
- 支持高亮警示色（满容量显示红色 #F56C6C，正常显示蓝色 #3498db）

示例数据结构：
{
  level: number,
  progress: number,
  progressTotal: number
}

Props 接口：
- msg: string (标题)
- levelData: LevelData | null
- isFull: boolean (是否满容量)
```

#### **3.2 文本信息卡片（TextContainer 风格）**
```
组件名：[XXXInfoBox] 或 TextContainer
用途：显示静态文本数据（房间名称、时间戳、数量等）
特点：
- 使用标准 HTML 元素组织
- header 显示标题
- main/section 中循环渲染信息行
- 单行格式：`{label}: {value}`
- 字体大小：16-20px，行高：1.5
- 支持动态生成信息数组

Props 接口：
- msg: string[] (信息行数组)
- title: string (卡片标题)
```

#### **3.3 时间序列折线图（FlexibleLineChart 风格）**
```
组件名：[XXXLineChart] 或 FlexibleLineChart
用途：显示游戏资源、生产力等时间序列数据
特点：
- 双轴设计：左轴为原始数据，右轴为变化率（delta）
- 支持时间轴/tick轴切换（通过 Pinia store 的 options.axisType）
- 内置 DataZoom 交互：显示滚动条和内部缩放
- 自动计算选区内的变化值(delta)和平均变化率(avg)
- 智能数字格式化：k, M, B, T, P, E, Z, Y 单位转换
- 平滑曲线渲染 (smooth: true)
- 支持面积图效果 (areaStyle: {})

Props 接口：
- id: string (唯一标识)
- name: string (图表标题)
- timeData: number[] (时间戳数组，毫秒)
- gameTimeData: number[] (游戏tick数组)
- yData: number[] (数值数据)
- visible: boolean (是否显示)

响应式显示：
- 选区delta值：rightValue - leftValue
- 选区平均变化率：delta / span (单位：/s 或 /tick)
- 下方显示计算结果："变化值(delta): X, 平均变化率(avg): X /s"
```

#### **3.4 对比折线图（ComparableLineChart 风格）**
```
组件名：[XXXComparisonChart] 或 ComparableLineChart
用途：对比多条数据线（如多个外矿的能量输出）
特点：
- 同时显示多条折线
- 支持图例切换（点击图例隐显对应的线）
- 每条线可独立着色
- 支持 Tooltip 对比显示
- 响应式高度和宽度

Props 接口：
- id: string
- name: string
- timeData: number[]
- gameTimeData: number[]
- yDataList: Array<{name: string; data: number[]}> (多条数据)
- visible: boolean
```

#### **3.5 资源分布图（SunBurstResourceChart 风格）**
```
组件名：[XXXResourceChart] 或 SunBurstResourceChart
用途：显示存储资源分布（饼图/旭日图）
特点：
- 使用 ECharts Sunburst 图表
- 展示 storage/terminal/factory 的多种资源占比
- 高度：520px，宽度：100% (响应式)
- 支持点击钻取层级

Props 接口：
- id: string
- name: string
- roomData: { storage?: StoreData; terminal?: StoreData; factory?: StoreData }
- visible: boolean

数据结构：
StoreData: {
  store: Record<string, number>,  // {energy: 100000, K: 5000, ...}
  storeCapacity: number
}
```

---

### **四、数据类型定义标准**

```typescript
// 必须遵循的类型系统

// 单个数据点
interface SingleData<T> {
  data: T;
  type: string;
  depth: number;
}

// 等级数据（进度条用）
interface LevelData {
  level: number;
  progress: number;
  progressTotal: number;
}

// 存储数据
interface StoreData {
  store: Record<string, number>;
  storeCapacity: number;
}

// 时间序列框架
interface FrameStats<T> {
  userData: {
    credits: SingleData<T>;
    pixels: SingleData<T>;
    gclProgress: SingleData<T>;
    gplProgress: SingleData<T>;
  };
  roomData: {
    [name: string]: {
      controllerProgress: SingleData<T>;
      storageData: {
        energy: SingleData<T>;
      };
      outwardsSourceEnergy: {
        [sourceName: string]: SingleData<T>;
      };
    };
  };
}

// 主数据接口（必须）
interface ScreepsData {
  timeSeriesData: FrameStats<number[]> & {
    timeStamp: SingleData<number[]>;
    gameTime: SingleData<number[]>;
  };
  timeData: {
    tick: number;
    time: number;  // 毫秒时间戳
  };
  userData: {
    gcl: LevelData;
    gpl: LevelData;
    name: string;
    error: ErrorSegmentMemory;
    memoryString: string;
  };
  shardData: {
    shardName: string;
  };
  roomData: {
    [roomName: string]: RoomData;
  };
  globalData: {
    creepGroups: { [name: string]: CreepGroupMemory };
    creepBodyConfig: { [name: string]: creepBodyConfigDetail };
  };
}

// 房间数据详情
interface RoomData {
  store: {
    storage?: StoreData;
    terminal?: StoreData;
    factory?: StoreData;
  };
  controller: LevelData & {
    progressSpeed: string;
    ticksToUpgrade: string;
  };
  creep: {
    num: number;
  };
  name: string;
  projectDiagram: {
    maintenance: string;        // Base64 encoded mermaid diagram
    outwardsSource: {
      [sourceName: string]: {
        name: string;
        diagram: string;         // Base64 encoded mermaid diagram
      };
    };
    getPower: string;           // Base64 encoded mermaid diagram
    newRoom: string;            // Base64 encoded mermaid diagram
  };
  spawnPool: {
    [creepName: string]: SpawnPoolData;
  };
}

interface SpawnPoolData {
  creepName: string;
  creepBody: string;
  priority: number;
  spawnCondition: string;
  state: string;
  roomName: string;
}
```

---

### **五、组件开发规范**

#### **5.1 Vue 3 Composition API 组件结构**
```typescript
<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import type { ScreepsData } from '@/type/origin'
import { useAppStore } from '@/stores/app'

// 定义 Props
interface Props {
  screepsData?: ScreepsData
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Data Panel'
})

// 定义事件
const emit = defineEmits<{
  update: [value: string]
}>()

// 使用 Pinia store
const appStore = useAppStore()

// 本地状态
const chartInstance = ref<any>(null)
const isLoading = ref(false)

// 计算属性
const axisType = computed(() => appStore.options.axisType)

// 监听器
watch(() => axisType.value, (newVal) => {
  // 重新渲染图表
  renderChart()
})

// 生命周期
onMounted(() => {
  // 初始化逻辑
  renderChart()
})

onBeforeUnmount(() => {
  // 清理逻辑
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }
})

// 方法
function renderChart(): void {
  // 实现
}
</script>
```

#### **5.2 模板结构规范**
```vue
<template>
  <section class="data-panel">
    <header class="panel-header">
      <h2>{{ title }}</h2>
    </header>
    <main class="panel-main">
      <div class="grid-container">
        <!-- 内容块 -->
      </div>
    </main>
  </section>
</template>
```

#### **5.3 样式规范 (Element Plus 组件库)**
```vue
<style scoped>
/* 使用 Element Plus 组件库提供的样式 */

/* ElCard 组件已包含通用的卡片样式 */
:deep(.el-card) {
  margin-bottom: 1.5rem;
}

/* ElRow/ElCol 组件提供响应式网格 */
:deep(.el-row) {
  margin-bottom: 1.5rem;
}

:deep(.el-col) {
  padding: 0;
}

/* 自定义扩展样式 */
.panel-header {
  margin-bottom: 1rem;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.grid-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.grid-item {
  flex: 1;
  min-width: 200px;
}

/* 响应式设计 - Element Plus 自带响应式 */
@media (max-width: 1024px) {
  .grid-item {
    min-width: 150px;
  }
}

@media (max-width: 768px) {
  .grid-container {
    flex-direction: column;
  }

  .grid-item {
    width: 100%;
  }
}
</style>
```

#### **5.4 与 Pinia 交互**
```typescript
// 获取轴类型切换状态
const axisType = computed(() => appStore.options.axisType)

// 监听状态变化
watch(() => axisType.value, (newVal: string) => {
  // 重新渲染图表
  renderChart()
})

// 修改 store 状态 - 使用 ElSelect 或 ElButtonGroup 触发
function toggleAxisType(): void {
  appStore.setAxisType(axisType.value === 'time' ? 'tick' : 'time')
}
```

#### **5.5 时间格式化工具**
```typescript
// 项目中已有的时间格式化方法
function formatTime(time: number): string {
  const addZero = (n: number): string => n < 10 ? `0${n}` : `${n}`
  const date = new Date(time)
  return `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(date.getDate())},${addZero(date.getHours())}:${addZero(date.getMinutes())}:${addZero(date.getSeconds())}`
}
```

---

### **六、ECharts 集成规范**

#### **6.1 必要导入**
```typescript
import * as echarts from 'echarts/core'
import { 
  GridComponent, 
  TooltipComponent, 
  DataZoomComponent, 
  TitleComponent,
  LegendComponent 
} from 'echarts/components'
import { LineChart, SunburstChart, BarChart } from 'echarts/charts'
import { SVGRenderer } from 'echarts/renderers'

echarts.use([
  GridComponent, 
  LineChart, 
  SVGRenderer, 
  TooltipComponent, 
  DataZoomComponent, 
  TitleComponent,
  LegendComponent
])
```

#### **6.2 图表初始化**
```typescript
import { ref, onMounted } from 'vue'

let chartInstance = ref<any>(null)

onMounted(() => {
  const chartDom = document.getElementById('chart-id')
  if (!chartDom) return

  // 初始化或复用图表实例
  if (!chartInstance.value) {
    chartInstance.value = echarts.init(chartDom, null, { renderer: 'svg' })
  }

  // 设置配置项
  chartInstance.value.setOption(option)
})
```

#### **6.3 Tooltip 自定义**
```typescript
tooltip: {
  trigger: 'axis',
  formatter: (params: any[]) => {
    let str = `时间: ${formatTime(...)}<br>tick: ${...}<br>`
    for (let i = 0; i < params.length; i++) {
      const { data, seriesName, marker } = params[i]
      str += `${marker} ${seriesName}: <b>${numberFormatter(data[1])}</b><br>`
    }
    return str
  }
}
```

#### **6.4 数字格式化**
```typescript
// 大数字智能单位显示
function numberFormatter(value: number): string {
  const absoluteValue = Math.abs(value)
  const magnitude = Math.log10(absoluteValue)
  const size = magnitude % 3
  const magnitudeDivideKilo = magnitude - size
  const levelMap: Record<number, string> = {
    0: '', 3: 'k', 6: 'M', 9: 'B', 12: 'T', 
    15: 'P', 18: 'E', 21: 'Z', 24: 'Y'
  }
  
  if (magnitude < 3) {
    return `${Math.round(absoluteValue)}`
  }
  
  const formatted = (absoluteValue / 10 ** magnitudeDivideKilo)
    .toFixed(size >= 2 ? 0 : 1)
  return `${value >= 0 ? '' : '-'}${formatted}${levelMap[magnitudeDivideKilo] || ''}`
}

// 在 yAxis 中使用
axisLabel: { formatter: numberFormatter }
```

---

### **七、具体页面示例需求模板**

```
当你生成一个新的数据展示页面时，遵循以下模板结构：

【页面名称】: [XXXDataPanel] / [XXXDashboard]

【页面用途】: 
- 展示 [数据类型] 的历史趋势和当前状态

【必需的数据源】: 
- screepsData.timeSeriesData.[dataPath] (时间序列数据)
- screepsData.timeData (当前游戏时间)
- screepsData.[otherData] (其他必要数据)

【必需的子组件】:
1. 进度条组件 × N (显示当前等级/进度)
2. 信息卡片组件 × 1-2 (显示关键指标)
3. 折线图组件 × N (显示时间序列趋势)
4. [其他可视化组件]

【布局方案】:
第1行: 进度条×3 + 信息卡片×1
第2行: 大折线图×2 + 对比图×1
第3行: [其他组件]

【交互需求】:
- 支持时间轴/tick轴切换
- 支持图表缩放和框选
- 自动计算选区数据统计
- Tooltip 显示详细数据

【响应式需求】:
- 卡片宽度使用 CSS Grid (使用 minmax 函数)
- 图表固定高度 (260px-520px)
- 卡片间距 gap: 1.5rem
- 全部使用白色背景卡片
```

---

### **八、性能与最佳实践**

```
1. **图表渲染优化**:
   - 使用条件渲染：v-if="visible && hasMounted"
   - 图表复用而不是重新创建
   - 避免频繁的 setOption 调用
   - 使用 throttle/debounce 处理频繁事件

2. **内存管理**:
   - 在 onBeforeUnmount 生命周期中清理事件监听器
   - 销毁图表实例：chartInstance.value?.dispose()
   - 及时解除 ref 的引用

3. **数据验证**:
   - 检查数据存在性后再渲染
   - 处理空数组/null/undefined 情况
   - 使用可选链操作符 (?.)

4. **Pinia 状态管理**:
   - 通过 computed 监听 store 状态变化
   - 避免直接修改 props
   - 使用 watch 响应式追踪状态变化

5. **命名规范**:
   - 组件名使用 PascalCase (XXXChart, YYYPanel)
   - 文件名使用 PascalCase.vue
   - 方法名使用 camelCase
   - 常量使用 UPPER_SNAKE_CASE
   - CSS class 使用 kebab-case

6. **TypeScript 最佳实践**:
   - 为所有函数参数和返回值标注类型
   - 避免使用 any，使用联合类型或泛型
   - 为复杂的 props 使用 interface 或 type
```

---

### **九、常见数据展示场景**

#### **场景1：用户总体数据面板**
- 显示: GCL/GPL 等级进度、Credits、Pixels
- 组件: ProgressIndicator (GCL, GPL) + FlexibleLineChart (Credits, Pixels) + TextContainer
- 布局: 3列进度条 + 文本信息 → 3列折线图

#### **场景2：单房间运维数据**
- 显示: RCL等级、爬虫数量、升级速度、能量存储
- 组件: ProgressIndicator (RCL) + SunBurstResourceChart (资源) + FlexibleLineChart (控制器进度) + TextContainer (静态信息)
- 布局: 1列进度条 + 信息 → 2列图表区域

#### **场景3：外矿能量对比**
- 显示: 多个外矿的采集能量对比、平均采集速率
- 组件: ComparableLineChart (多源对比) + 平均数据统计
- 布局: 1列大图表 + 统计信息

---

### **十、完整组件模板示例**

```vue
<!-- 文件: src/components/NewDataPanel.vue -->

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { ScreepsData } from '@/type/origin'
import { useAppStore } from '@/stores/app'

// 导入子组件
import ProgressIndicator from './ProgressIndicator.vue'
import FlexibleLineChart from './echarts/FlexibleLineChart.vue'
import TextContainer from './TextContainer.vue'

// Props 定义
interface Props {
  screepsData?: ScreepsData
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Data Panel'
})

// Pinia store
const appStore = useAppStore()

// 本地状态
const chartInstances = ref<any[]>([])
const isLoading = ref(false)

// 计算属性
const axisType = computed(() => appStore.options.axisType)

// 方法
function formatTime(time: number): string {
  const addZero = (n: number): string => n < 10 ? `0${n}` : `${n}`
  const d = new Date(time)
  return `${d.getFullYear()}-${addZero(d.getMonth() + 1)}-${addZero(d.getDate())},${addZero(d.getHours())}:${addZero(d.getMinutes())}:${addZero(d.getSeconds())}`
}

// 生命周期
onMounted(() => {
  // 初始化逻辑
})

onBeforeUnmount(() => {
  // 清理逻辑
  chartInstances.value.forEach(chart => chart?.dispose())
})
</script>

<template>
  <el-card class="data-panel">
    <template #header>
      <div class="panel-header">
        <h2>{{ title }}</h2>
      </div>
    </template>
    <div class="panel-main">
      <!-- 进度条行 - 使用 ElRow/ElCol 实现响应式网格 -->
      <el-row :gutter="[24, 24]">
        <el-col v-if="screepsData?.userData.gcl" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <ProgressIndicator 
            msg="GCL" 
            :levelData="screepsData.userData.gcl"
            :isFull="false"
          />
        </el-col>
        <!-- 更多卡片... -->
      </el-row>

      <!-- 图表行 - 使用 ElRow/ElCol -->
      <el-row :gutter="[24, 24]">
        <el-col v-if="screepsData?.timeSeriesData" :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <FlexibleLineChart
            id="chart-1"
            name="Credits"
            :timeData="screepsData.timeSeriesData.timeStamp?.data"
            :gameTimeData="screepsData.timeSeriesData.gameTime?.data"
            :yData="screepsData.timeSeriesData.userData?.credits.data"
            :visible="!!screepsData"
          />
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<style scoped>
/* 使用 Element Plus 组件库样式 */

/* ElCard 组件提供面板容器 */
:deep(.el-card) {
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.panel-header {
  padding: 1rem 1.5rem;
  background: #f9f9f9;
  border-bottom: 1px solid #e1e8ed;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
  font-weight: 600;
}

.panel-main {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
}

/* ElRow/ElCol 提供响应式网格 */
:deep(.el-row) {
  margin-bottom: 1.5rem;
}

:deep(.el-row:last-child) {
  margin-bottom: 0;
}

.grid-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.grid-container:last-child {
  margin-bottom: 0;
}

.grid-lg {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.grid-item {
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  flex: 1;
  min-width: 200px;
}

/* 响应式设计 - Element Plus 内置响应式支持 */
@media (max-width: 1024px) {
  .grid-container {
    gap: 1rem;
  }

  .grid-lg {
    gap: 1rem;
  }

  .panel-main {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .grid-container,
  .grid-lg {
    flex-direction: column;
  }

  .grid-item {
    min-width: 100%;
  }

  .panel-header {
    padding: 0.75rem 1rem;
  }

  .panel-header h2 {
    font-size: 1.1rem;
  }
}
</style>
```

---

### **XI. 总结与快速生成指令**

当你需要快速生成一个新数据展示页面时，请遵循：

1. **确定数据源**: 从 ScreepsData 接口中找到对应的数据字段
2. **选择组件**: 根据数据类型选择合适的可视化组件
3. **设计布局**: 使用 Element Plus 的 ElRow/ElCol 组件实现响应式网格，遵循间距和卡片规范
4. **编写逻辑**: 使用 Composition API 的 `<script setup>` 语法
5. **配置 ECharts**: 遵循集成规范，设置格式化器和交互事件
6. **样式标准化**: 使用 Element Plus 组件库的预定义样式和自定义 CSS，保持整体风格一致
7. **集成路由**: 在 Vue Router 中注册新页面的路由
8. **集成导航**: 在左侧导航菜单中添加新页面的导航链接

**最重要的是**: 所有新页面必须能够集成到 App.vue 的布局中，通过 RouterView 显示，并支持时间轴/tick轴切换！
