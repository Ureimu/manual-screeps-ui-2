<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts/core'
import {
    GridComponent,
    TooltipComponent,
    TitleComponent,
    LegendComponent,
} from 'echarts/components'
import { SunburstChart } from 'echarts/charts'
import { SVGRenderer } from 'echarts/renderers'
import type { StoreData } from '@/type/origin'
import { numberFormatter } from '@/utils/formatters'

echarts.use([
    GridComponent,
    SunburstChart,
    SVGRenderer,
    TooltipComponent,
    TitleComponent,
    LegendComponent,
])

interface StoreInfo {
    storage?: StoreData
    terminal?: StoreData
    factory?: StoreData
}

interface Props {
    id: string
    name: string
    roomData?: StoreInfo
    visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    visible: true,
})

const chartInstance = ref<echarts.ECharts | null>(null)
const chartContainer = ref<HTMLElement | null>(null)

// 构建资源数据树
function buildResourceTree() {
    const root = {
        name: props.name || 'Resources',
        children: [] as Record<string, unknown>[],
    }

    if (!props.roomData) return [root]

    const { storage, terminal, factory } = props.roomData

    // 处理每个存储位置
    const locations = [
        { name: 'Storage', data: storage },
        { name: 'Terminal', data: terminal },
        { name: 'Factory', data: factory },
    ]

    for (const location of locations) {
        if (location.data && location.data.store) {
            const children: Record<string, unknown>[] = []
            let total = 0

            for (const [resource, amount] of Object.entries(location.data.store)) {
                if (amount > 0) {
                    children.push({
                        name: `${resource}: ${numberFormatter(amount)}`,
                        value: amount,
                    })
                    total += amount
                }
            }

            if (children.length > 0) {
                root.children.push({
                    name: `${location.name} (${numberFormatter(total)}/${numberFormatter(location.data.storeCapacity)})`,
                    children,
                })
            }
        }
    }

    return [root]
}

// 初始化图表
function initChart(): void {
    if (!chartContainer.value || !props.visible) return

    if (!chartInstance.value) {
        chartInstance.value = echarts.init(chartContainer.value, null, {
            renderer: 'svg',
        })
    }

    const data = buildResourceTree()

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
            trigger: 'item',
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
            formatter: (params: any) => {
                if (!params) return ''

                let html = `<div style="font-family: Arial, sans-serif;">`

                if (params.value) {
                    html += `<div style="font-weight: 700; color: #66b1ff; margin-bottom: 4px; font-size: 13px;">📊 ${params.name}</div>`
                    html += `<div style="color: #e0e0e0;">Amount: <span style="color: #fff; font-weight: 600; font-family: 'Courier New';">${numberFormatter(params.value)}</span></div>`
                } else {
                    html += `<div style="font-weight: 700; color: #66b1ff; margin-bottom: 4px; font-size: 13px;">📁 ${params.name}</div>`
                }

                html += `</div>`
                return html
            },
        },
        series: [
            {
                type: 'sunburst',
                data,
                radius: [0, '90%'],
                label: {
                    rotate: 'radial',
                    fontSize: 11,
                    color: '#333',
                },
                levels: [
                    {},
                    {
                        r0: '0%',
                        r: '35%',
                        label: {
                            rotate: 0,
                            fontSize: 12,
                            fontWeight: 600,
                        },
                    },
                    {
                        r0: '35%',
                        r: '90%',
                        label: {
                            rotate: 0,
                            fontSize: 10,
                        },
                        itemStyle: {
                            borderRadius: 3,
                            borderWidth: 2,
                            borderColor: '#fff',
                        },
                    },
                ],
            },
        ],
    }

    chartInstance.value.setOption(option)
}

// 监听数据变化
watch(
    () => props.roomData,
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
    height: 520px;
    background: #ffffff;
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>
