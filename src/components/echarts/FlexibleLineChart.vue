<template>
    <div v-show="visible" :id="id" ref="chartContainer" class="chart-container"></div>
    <!-- 新增：显示选区计算结果 -->
    <div style="text-align: center; margin-top: 6px; color: #333; font-size: 13px">
        <span v-if="selectionDelta !== null"
            >变化值(delta): <b>{{ selectionDelta }}</b></span
        >
        <!-- 修改：显示平均变化率并附加单位 -->
        <span v-if="selectionAvg !== null" style="margin-left: 12px">
            平均变化率(avg): <b>{{ selectionAvg }}{{ selectionAvgUnit }}</b>
        </span>
        <span v-if="selectionDelta === null && selectionAvg === null"
            >请选择或缩放区间以查看计算结果</span
        >
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount } from "vue";
import * as echarts from "echarts/core";
import type { EChartsCoreOption } from "echarts/core";
import { GridComponent } from "echarts/components";
import { LineChart } from "echarts/charts";
import { SVGRenderer } from "echarts/renderers";
import { TooltipComponent } from "echarts/components";
import { DataZoomComponent } from "echarts/components";
import { TitleComponent } from "echarts/components";
import { useAppStore } from "@/stores/app";
import { formatTime, numberFormatter } from "@/utils/formatters";
import { calculateAggregateData, computeSelectionFromPercent } from "@/utils/chartData";

echarts.use([
    GridComponent,
    LineChart,
    SVGRenderer,
    TooltipComponent,
    DataZoomComponent,
    TitleComponent,
]);

interface Props {
    name: string;
    id: string;
    timeData: number[];
    yData?: (number | null)[];
    visible: boolean;
    gameTimeData: number[];
    exp?: number;
    mode?: "none" | "average" | "sum";
    interval?: number;
    aggregateAxis?: "time" | "tick";
}

const props = withDefaults(defineProps<Props>(), {
    visible: true,
    timeData: () => [],
    gameTimeData: () => [],
    yData: () => [],
    mode: "none",
    interval: 1500,
    aggregateAxis: undefined,
});

const appStore = useAppStore();

const axisType = computed(() => appStore.options.axisType);

let chartInstance: echarts.ECharts | null = null;
const chartContainer = ref<HTMLElement | null>(null);

// 新增响应式字段：框选结果
const selectionDelta = ref<number | null>(null);
const selectionAvg = ref<number | null>(null);
// 新增：平均值单位（"/s" 或 "/tick"）
const selectionAvgUnit = ref<string | null>(null);

// 使用导入的computeSelectionFromPercent函数

function initChart(): void {
    if (!chartContainer.value || !props.visible) return;

    if (!chartInstance) {
        chartInstance = echarts.init(chartContainer.value, null, {
            renderer: "svg",
        });
    }
    if (!props.yData) return;
    // console.log(`${props.id} runRender`);

    // 应用 exp 参数
    const processedYData = props.yData.map((value) => {
        if (value === null) return null;
        if (props.exp !== undefined) {
            return value * Math.pow(10, props.exp);
        }
        return value;
    });

    let fullData: [number, number | null][];

    if (axisType.value === "time") {
        fullData = processedYData.map((value, index) => {
            return [props.timeData[index] as number, value] as [number, number | null];
        });
    } else {
        fullData = processedYData.map((value, index) => {
            return [props.gameTimeData[index] as number, value] as [number, number | null];
        });
    }

    // 如果启用了聚合模式，处理数据
    if (props.mode !== "none" && props.interval && props.interval > 0) {
        fullData = calculateAggregateData(
            fullData,
            props.interval,
            props.mode,
            props.aggregateAxis,
            props.timeData,
            props.gameTimeData,
        );
    }

    const varyingRateOriginData: Array<[[number, number | null], [number, number | null]]> = [];
    fullData.forEach((value, index, array) => {
        if (index > 0) {
            const prev = array[index - 1];
            if (prev && value[1] !== null && prev[1] !== null) {
                varyingRateOriginData.push([value, prev]);
            }
        }
    });
    const varyingRateData = varyingRateOriginData.map(
        (value) =>
            [value[0][0], (value[0][1] as number) - (value[1][1] as number)] as [number, number],
    );

    const neededData: Record<string, unknown> = {
        tickData: props.gameTimeData,
        timeData: props.timeData,
        yData: processedYData,
    };

    for (const key in neededData) {
        if (!neededData[key]) {
            // console.log(`${props.id} ${key} notExist.`);
            return;
        }
    }

    // console.log(`${props.id} start render line chart`);

    // console.log(axisType.value);

    const option: EChartsCoreOption & { xAxis?: Record<string, unknown> } = {
        tooltip: {
            show: true,
            trigger: "axis",
            position: function () {
                const obj: { top: number | string; left?: number; right?: number } = {
                    top: "-20%",
                    left: 50,
                };
                return obj;
            },
            extraCssText: "text-align: left",
            formatter: (
                params: Array<{
                    data: [timeStamp: number, value: number];
                    dataIndex: number;
                    seriesName: string;
                    color: string;
                    marker: string;
                }>,
            ) => {
                // console.log(params);
                let str = "";
                if (!params || !params[0]) return str;
                const { dataIndex } = params[0];
                str += `时间: ${formatTime(props.timeData[dataIndex] as number)}<br>tick: ${props.gameTimeData[dataIndex] as number}<br>`;
                for (let index = 0; index < params.length; index++) {
                    const param = params[index];
                    if (param) {
                        const { data, seriesName, marker } = param;
                        str += `${marker} ${seriesName}: <b>${data[1]}</b> <br>`;
                    }
                }
                return str;
            },
        },
        title: {
            text:
                props.mode !== "none" && props.interval && props.interval > 0
                    ? `${props.name} (${props.mode === "average" ? "平均值" : "求和"}区间: ${props.interval}${props.aggregateAxis ? `${props.aggregateAxis === "time" ? "时间" : "tick"}` : axisType.value})`
                    : props.name,
            top: "top",
            left: "center",
        },
        xAxis: {},
        yAxis: [
            {
                type: "value",
                name: "value",
                scale: true,
                axisLabel: {
                    formatter: numberFormatter,
                },
                splitLine: {
                    lineStyle: {
                        color: ["#16f"],
                        opacity: 0.2,
                    },
                },
            },
            {
                type: "value",
                scale: true,
                name: "delta",
                axisLabel: {
                    formatter: numberFormatter,
                },
                splitLine: {
                    lineStyle: {
                        type: "dashed",
                        color: ["#392"],
                        opacity: 0,
                    },
                },
            },
        ],
        dataZoom: [
            {
                show: true,
                realtime: true,
                start: 0,
                end: 100,
                // echarts6.0.1会修复的bug，目前不要改动，否则dataZoom会错位
                showDataShadow: false,
            },
            {
                type: "inside",
                realtime: true,
                start: 25,
                end: 85,
                // echarts6.0.1会修复的bug，目前不要改动，否则dataZoom会错位
                showDataShadow: false,
            },
        ],
        series: [
            {
                name: props.name,
                type: "line",
                smooth: true,
                symbol: "none",
                areaStyle: {},
                data: fullData,
            },
            {
                name: props.name + " delta",
                type: "line",
                yAxisIndex: 1,
                lineStyle: {
                    width: 0,
                },
                showSymbol: false,
                data: varyingRateData,
            },
        ],
    };

    if (axisType.value === "time") {
        option.xAxis = {
            type: "time",
            axisLine: {
                show: false,
            },
            axisTick: {
                show: false,
            },
            splitLine: {
                show: true,
            },
        };
    } else {
        option.xAxis = {
            type: "value",
            min: "dataMin",
            max: "dataMax",
            axisLine: {
                show: false,
            },
            axisTick: {
                show: false,
            },
            splitLine: {
                show: true,
            },
        };
    }

    chartInstance.setOption(option, { notMerge: true });

    // 绑定 datazoom 事件，避免重复绑定先移除
    chartInstance.off("datazoom");
    chartInstance.on("datazoom", (params) => {
        const p = params as { start: number; end: number; type: "datazoom" };
        const start = p.start;
        const end = p.end;
        const result = computeSelectionFromPercent(start, end, fullData, axisType.value);
        selectionDelta.value = result.delta;
        selectionAvg.value = result.avgRate;
        selectionAvgUnit.value = result.unit;
    });

    // 首次用当前 dataZoom 范围做一次计算（默认 option 中 start=0 end=100）
    // 如果图表已有 dataZoom 状态，也可以从 myChart.getOption() 读取，但使用初始值保证显示
    const result = computeSelectionFromPercent(0, 100, fullData, axisType.value);
    selectionDelta.value = result.delta;
    selectionAvg.value = result.avgRate;
    selectionAvgUnit.value = result.unit;
}

// 监听坐标轴类型变化
watch(axisType, () => {
    initChart();
});

// 监听数据变化
watch(
    () => [
        props.yData,
        props.timeData,
        props.gameTimeData,
        props.mode,
        props.interval,
        props.aggregateAxis,
    ],
    () => {
        if (props.visible) {
            initChart();
        }
    },
    { deep: true },
);

// 生命周期钩子
onMounted(() => {
    if (props.visible) {
        initChart();
    }

    // 处理窗口resize
    const handleResize = () => {
        chartInstance?.resize();
    };
    window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
    if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
    }
    window.removeEventListener("resize", () => {});
});
</script>

<style scoped>
.uli li {
    list-style-type: "disc";
}

.chart-container {
    width: 100%;
    height: 100%;
    min-height: 360px;
    background: #ffffff;
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>
