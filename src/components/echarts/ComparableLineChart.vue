<template>
    <div v-show="visible" :id="id" ref="chartContainer" class="chart-container"></div>
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
    yDataList: {
        name: string;
        data: (number | null)[];
    }[];
    visible: boolean;
    gameTimeData: number[];
}

const appStore = useAppStore();
const props = withDefaults(defineProps<Props>(), {
    visible: true,
    timeData: () => [],
    gameTimeData: () => [],
    yDataList: () => [],
});

let chartInstance: echarts.ECharts | null = null;
const chartContainer = ref<HTMLElement | null>(null);

// 计算属性
const axisType = computed(() => appStore.options.axisType);

function initChart(): void {
    if (!chartContainer.value || !props.visible) return;

    if (!chartInstance) {
        chartInstance = echarts.init(chartContainer.value, null, {
            renderer: "svg",
        });
    }
    if (!props.yDataList) return;

    const dataList = props.yDataList.map((entry) => entry.data);
    const nameList = props.yDataList.map((entry) => entry.name);

    let fullDataList: [number, number | null][][];

    if (axisType.value === "time") {
        fullDataList = dataList.map((value) => {
            return value.map((value2, index) => {
                return [props.timeData[index] as number, value2];
            });
        });
    } else {
        fullDataList = dataList.map((value) => {
            return value.map((value2, index) => {
                return [props.gameTimeData[index] as number, value2];
            });
        });
    }

    const neededData: Record<string, unknown> = {
        tickData: props.gameTimeData,
        timeData: props.timeData,
        yData: props.yDataList,
    };

    for (const key in neededData) {
        if (!neededData[key]) {
            // console.log(`${props.id} ${key} notExist.`);
            return;
        }
    }

    const series: Array<{
        name: string;
        type: "line";
        smooth: true;
        symbol: "none";
        data: [number, number | null][];
        lineStyle: {
            width: number;
        };
    }> = [];

    fullDataList.forEach((fullData, index) => {
        const name = nameList[index] ?? "Series";
        series.push({
            name,
            type: "line",
            smooth: true,
            symbol: "none",
            data: fullData,
            lineStyle: {
                width: 1.2,
            },
        });
    });

    // console.log(axisType.value);

    const option: EChartsCoreOption & Record<string, unknown> = {
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
                str += `时间: ${formatTime(props.timeData[dataIndex] ?? 0)}<br>tick: ${props.gameTimeData[dataIndex] ?? 0}<br>`;
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
            text: props.name,
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
        ],
        dataZoom: [
            {
                show: true,
                realtime: true,
                start: 0,
                end: 100,
            },
            {
                type: "inside",
                realtime: true,
                start: 25,
                end: 85,
            },
        ],
        series,
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
}

// 监听坐标轴类型变化
watch(axisType, () => {
    initChart();
});

// 监听数据变化
watch(
    () => [props.yDataList, props.timeData, props.gameTimeData],
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
    color: gray;
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
