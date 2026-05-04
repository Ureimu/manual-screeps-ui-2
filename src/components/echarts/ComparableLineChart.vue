<template>
    <div v-show="visible" class="chart-wrapper">
        <ChartToolbar
            v-model:mode="currentMode"
            v-model:interval="currentInterval"
            v-model:aggregate-axis="currentAggregateAxis"
        />
        <div :id="id" ref="chartContainer" class="chart-container"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount, getCurrentInstance } from "vue";
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
import { calculateAggregateData } from "@/utils/chartData";
import {
    applyPresetToChart,
    calculateZoomRangeByPreset,
    type TimeRangePreset,
} from "@/utils/chartPresets";
import ChartToolbar from "@/components/echarts/ChartToolbar.vue";

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
        exp?: number;
    }[];
    visible: boolean;
    gameTimeData: number[];
    mode?: "none" | "average" | "sum";
    interval?: number;
    aggregateAxis?: "time" | "tick";
}

const appStore = useAppStore();
const props = withDefaults(defineProps<Props>(), {
    visible: true,
    timeData: () => [],
    gameTimeData: () => [],
    yDataList: () => [],
    mode: "none",
    interval: 1500,
    aggregateAxis: undefined,
});

// 本地响应式聚合选项，从 props 初始化
const currentMode = ref<"none" | "average" | "sum">(props.mode);
const currentInterval = ref<number>(props.interval);
const currentAggregateAxis = ref<"time" | "tick" | undefined>(props.aggregateAxis);

let chartInstance: echarts.ECharts | null = null;
const chartContainer = ref<HTMLElement | null>(null);

// 保存当前的dataZoom范围（基于百分比）
const currentZoomRange = ref<{ start: number; end: number } | null>(null);

// 暴露给父组件的方法
const exposeMethods = {
    /**
     * 应用时间区间预设
     */
    applyTimeRangePreset: (preset: TimeRangePreset): boolean => {
        if (!chartInstance) return false;

        // 构建完整数据
        const dataList = props.yDataList.map((entry) => {
            if (entry.exp !== undefined) {
                return entry.data.map((value) => {
                    if (value === null) return null;
                    return value * Math.pow(10, entry.exp!);
                });
            }
            return entry.data;
        });

        // 使用第一个系列的数据
        if (dataList.length === 0) return false;
        const firstSeriesData = dataList[0];
        if (!firstSeriesData) return false;

        // 根据预设类型选择数据源进行计算
        let calculationData: [number, number | null][];
        if (preset.type === "time") {
            calculationData = firstSeriesData.map((value, index) => {
                return [props.timeData[index] as number, value];
            });
        } else {
            calculationData = firstSeriesData.map((value, index) => {
                return [props.gameTimeData[index] as number, value];
            });
        }

        const result = applyPresetToChart(chartInstance, calculationData, preset);
        if (result && chartInstance) {
            // 更新保存的dataZoom范围
            const zoomRange = calculateZoomRangeByPreset(calculationData, preset.value);
            if (zoomRange) {
                currentZoomRange.value = zoomRange;
            }
        }
        return result;
    },

    /**
     * 获取图表实例
     */
    getChartInstance: () => chartInstance,
};

// 暴露方法给父组件
defineExpose(exposeMethods);

// 获取父组件实例以注册图表
const instance = getCurrentInstance();
const parent = instance?.parent;

// 计算属性
const axisType = computed(() => appStore.options.axisType);
const timeRangePreset = computed(() => appStore.options.timeRangePreset);

function initChart(): void {
    if (!chartContainer.value || !props.visible) return;

    if (!chartInstance) {
        chartInstance = echarts.init(chartContainer.value, null, {
            renderer: "svg",
        });
    }
    if (!props.yDataList) return;

    const dataList = props.yDataList.map((entry) => {
        if (entry.exp !== undefined) {
            return entry.data.map((value) => {
                if (value === null) return null;
                return value * Math.pow(10, entry.exp!);
            });
        }
        return entry.data;
    });
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

    // 如果启用了聚合模式，处理数据
    if (currentMode.value !== "none" && currentInterval.value && currentInterval.value > 0) {
        fullDataList = fullDataList.map((seriesData) => {
            return calculateAggregateData(
                seriesData,
                currentInterval.value,
                currentMode.value,
                currentAggregateAxis.value,
                props.timeData,
                props.gameTimeData,
            );
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
            text:
                currentMode.value !== "none" && currentInterval.value && currentInterval.value > 0
                    ? `${props.name} (${currentMode.value === "average" ? "平均值" : "求和"}区间: ${currentInterval.value}${currentAggregateAxis.value ? `${currentAggregateAxis.value === "time" ? "时间" : "tick"}` : axisType.value})`
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

    // 恢复保存的dataZoom范围
    if (currentZoomRange.value && chartInstance) {
        chartInstance.dispatchAction({
            type: "dataZoom",
            start: currentZoomRange.value.start,
            end: currentZoomRange.value.end,
            dataZoomIndex: 0,
        });
    }

    // 监听预设变化
    watch(
        timeRangePreset,
        (newPreset) => {
            if (newPreset && chartInstance) {
                // 构建完整数据
                const dataList = props.yDataList.map((entry) => {
                    if (entry.exp !== undefined) {
                        return entry.data.map((value) => {
                            if (value === null) return null;
                            return value * Math.pow(10, entry.exp!);
                        });
                    }
                    return entry.data;
                });

                // 使用第一个系列的数据
                if (dataList.length === 0) return;
                const firstSeriesData = dataList[0];
                if (!firstSeriesData) return;

                // 根据预设类型选择数据源进行计算
                let calculationData: [number, number | null][];
                if (newPreset.type === "time") {
                    calculationData = firstSeriesData.map((value, index) => {
                        return [props.timeData[index] as number, value];
                    });
                } else {
                    calculationData = firstSeriesData.map((value, index) => {
                        return [props.gameTimeData[index] as number, value];
                    });
                }

                const result = applyPresetToChart(chartInstance!, calculationData, newPreset);
                if (result && chartInstance) {
                    // 更新保存的dataZoom范围
                    const zoomRange = calculateZoomRangeByPreset(calculationData, newPreset.value);
                    if (zoomRange) {
                        currentZoomRange.value = zoomRange;
                    }
                }
            }
        },
        { immediate: true },
    );
}

// 监听坐标轴类型变化
watch(axisType, () => {
    // 保存当前的dataZoom范围（百分比）
    if (chartInstance) {
        const option = chartInstance.getOption();
        if (option.dataZoom && Array.isArray(option.dataZoom) && option.dataZoom.length > 0) {
            const dataZoom = option.dataZoom[0];
            if (
                dataZoom &&
                typeof dataZoom.start === "number" &&
                typeof dataZoom.end === "number"
            ) {
                currentZoomRange.value = {
                    start: dataZoom.start,
                    end: dataZoom.end,
                };
            }
        }
    }
    initChart();
});

// 监听数据变化
watch(
    () => [
        props.yDataList,
        props.timeData,
        props.gameTimeData,
        currentMode.value,
        currentInterval.value,
        currentAggregateAxis.value,
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

    // 注册图表到父组件（NavigationBar）
    if (parent && parent.exposed && typeof parent.exposed.registerChart === "function") {
        parent.exposed.registerChart(props.id, exposeMethods);
    }
});

onBeforeUnmount(() => {
    if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
    }

    // 注销图表从父组件（NavigationBar）
    if (parent && parent.exposed && typeof parent.exposed.unregisterChart === "function") {
        parent.exposed.unregisterChart(props.id);
    }

    window.removeEventListener("resize", () => {});
});
</script>

<style scoped>
.uli li {
    list-style-type: "disc";
    color: gray;
}

.chart-wrapper {
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.chart-container {
    width: 100%;
    height: 100%;
    min-height: 360px;
    background: #ffffff;
}
</style>
