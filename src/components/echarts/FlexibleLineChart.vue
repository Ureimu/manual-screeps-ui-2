<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts/core'
import {
    GridComponent,
    TooltipComponent,
    DataZoomComponent,
    TitleComponent,
    LegendComponent,
} from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { SVGRenderer } from 'echarts/renderers'
import { useAppStore } from '@/stores/app'
import { numberFormatter, formatTime } from '@/utils/formatters'

echarts.use([
    GridComponent,
    LineChart,
    SVGRenderer,
    TooltipComponent,
    DataZoomComponent,
    TitleComponent,
    LegendComponent,
])

interface Props {
    id: string
    name: string
    timeData?: number[]
    gameTimeData?: number[]
    yData?: number[]
    visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    visible: true,
    timeData: () => [],
    gameTimeData: () => [],
    yData: () => [],
})

const appStore = useAppStore()
const chartInstance = ref<echarts.ECharts | null>(null)
const chartContainer = ref<HTMLElement | null>(null)

// 计算属性
const axisType = computed(() => appStore.options.axisType)

const xAxisData = computed(() => {
    if (axisType.value === 'time' && props.timeData) {
        return props.timeData.map((time) => formatTime(time))
    }
    return props.gameTimeData || []
})

// 初始化图表
function initChart(): void {
    if (!chartContainer.value || !props.visible) return

    if (!chartInstance.value) {
        chartInstance.value = echarts.init(chartContainer.value, null, {
            renderer: 'svg',
        })
    }

    const option = {
        title: {
            text: props.name,
            left: 'center',
            textStyle: {
                fontSize: 14,
                fontWeight: 600,
                color: '#333',
            },
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(50, 50, 50, 0.95)',
            borderColor: '#409eff',
            borderWidth: 1,
            padding: 12,
            textStyle: {
                color: '#ffffff',
                fontSize: 12,
            },
            confine: true,
            transitionDuration: 0.2,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter: (params: any[]) => {
                if (!params || params.length === 0) return ''

                let html = `<div style="font-family: Arial, sans-serif;">`

                // 标题行
                if (axisType.value === 'time' && props.timeData && props.timeData.length > 0) {
                    const dataIndex = params[0].dataIndex
                    const timeStr = formatTime(props.timeData[dataIndex] || 0)
                    html += `<div style="font-weight: 700; margin-bottom: 8px; color: #66b1ff; font-size: 13px;">📅 ${timeStr}</div>`
                } else {
                    html += `<div style="font-weight: 700; margin-bottom: 8px; color: #66b1ff; font-size: 13px;">🎮 Tick: ${params[0].axisValue}</div>`
                }

                // 数据行
                for (const param of params) {
                    const value = param.value
                    const formattedValue = numberFormatter(value)
                    // const percentChange = params.length > 0 ? '→' : ''
                    html += `<div style="margin: 4px 0; display: flex; align-items: center; gap: 6px;">
                        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${param.color || '#409eff'};"></span>
                        <span style="color: #e0e0e0;">${param.seriesName}:</span>
                        <span style="color: #fff; font-weight: 600; font-family: 'Courier New';">${formattedValue}</span>
                    </div>`
                }

                html += '</div>'
                return html
            },
        },
        legend: {
            top: 'bottom',
            data: [props.name],
        },
        grid: {
            left: '60px',
            right: '60px',
            top: '60px',
            bottom: '60px',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            data: xAxisData.value,
            axisLabel: {
                fontSize: 12,
                color: '#606266',
                interval: Math.floor(xAxisData.value.length / 10) || 0,
            },
            axisLine: {
                lineStyle: {
                    color: '#e1e8ed',
                },
            },
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: numberFormatter,
                fontSize: 12,
                color: '#606266',
            },
            axisLine: {
                lineStyle: {
                    color: '#e1e8ed',
                },
            },
            splitLine: {
                lineStyle: {
                    color: '#f5f7fa',
                },
            },
        },
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100,
            },
            {
                type: 'slider',
                start: 0,
                end: 100,
                bottom: 10,
            },
        ],
        series: [
            {
                name: props.name,
                type: 'line',
                data: props.yData || [],
                smooth: true,
                symbolSize: 3,
                lineStyle: {
                    width: 2,
                    color: '#409eff',
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                        { offset: 1, color: 'rgba(64, 158, 255, 0)' },
                    ]),
                },
                itemStyle: {
                    color: '#409eff',
                    borderColor: '#ffffff',
                    borderWidth: 2,
                },
            },
        ],
    }

    chartInstance.value.setOption(option)
}

// 监听坐标轴类型变化
watch(axisType, () => {
    initChart()
})

// 监听数据变化
watch(
    () => [props.yData, props.timeData, props.gameTimeData],
    () => {
        if (props.visible) {
            initChart()
        }
    },
    { deep: true },
)

// 生命周期钩子
onMounted(() => {
    if (props.visible) {
        initChart()
    }

    // 处理窗口resize
    const handleResize = () => {
        chartInstance.value?.resize()
    }
    window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
    if (chartInstance.value) {
        chartInstance.value.dispose()
        chartInstance.value = null
    }
    window.removeEventListener('resize', () => {})
})
</script>

<template>
    <div v-show="visible" :id="id" ref="chartContainer" class="chart-container"></div>
</template>

<style scoped>
.chart-container {
    width: 100%;
    height: 360px;
    background: #ffffff;
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>
