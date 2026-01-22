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
}

const props = withDefaults(defineProps<Props>(), {
    visible: true,
    timeData: () => [],
    gameTimeData: () => [],
    yData: () => [],
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

// 新增：根据 dataZoom 百分比计算选区（右端点y - 左端点y），以及选区平均值
function computeSelectionFromPercent(
    startPercent: number,
    endPercent: number,
    fullData: [number, number][],
): void {
    if (!fullData || fullData.length === 0) {
        selectionDelta.value = null;
        selectionAvg.value = null;
        selectionAvgUnit.value = null;
        return;
    }

    const len = fullData.length;
    // clamp and convert percent to indices
    const sIdx = Math.max(0, Math.min(len - 1, Math.round((startPercent / 100) * (len - 1))));
    const eIdx = Math.max(0, Math.min(len - 1, Math.round((endPercent / 100) * (len - 1))));
    const left = Math.min(sIdx, eIdx);
    const right = Math.max(sIdx, eIdx);

    if (right < 0 || left >= len) {
        selectionDelta.value = null;
        selectionAvg.value = null;
        selectionAvgUnit.value = null;
        return;
    }

    const leftData = fullData[left];
    const rightData = fullData[right];
    if (!leftData || !rightData) {
        selectionDelta.value = null;
        selectionAvg.value = null;
        selectionAvgUnit.value = null;
        return;
    }

    const yLeft = Number(leftData[1]) || 0;
    const yRight = Number(rightData[1]) || 0;
    const delta = yRight - yLeft;

    const xLeft = Number(leftData[0]);
    const xRight = Number(rightData[0]);
    const span = xRight - xLeft;

    let avgRate: number | null = null;
    let unit: string | null = null;

    if (span === 0) {
        // 无跨度，无法定义速率
        avgRate = null;
        unit = null;
    } else {
        if (axisType.value === "time") {
            // 时间轴：x 单位为毫秒，转换为秒再计算 (/s)
            const spanSeconds = span / 1000;
            if (spanSeconds > 0) {
                avgRate = delta / spanSeconds;
                unit = "/s";
            }
        } else {
            // tick 轴：按 tick 计算 (/tick)
            const spanTicks = span;
            if (spanTicks > 0) {
                avgRate = delta / spanTicks;
                unit = "/tick";
            }
        }
    }

    selectionDelta.value = Number.isFinite(delta) ? Number(delta) : null;
    selectionAvg.value =
        avgRate !== null && Number.isFinite(avgRate) ? Number(Number(avgRate).toFixed(2)) : null;
    selectionAvgUnit.value = unit;
}

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

    let fullData: [number, number][];

    if (axisType.value === "time") {
        fullData = processedYData.map((value, index) => {
            return [props.timeData[index] as number, value] as [number, number];
        });
    } else {
        fullData = processedYData.map((value, index) => {
            return [props.gameTimeData[index] as number, value] as [number, number];
        });
    }

    const varyingRateOriginData: Array<[[number, number], [number, number]]> = [];
    fullData.forEach((value, index, array) => {
        if (index > 0) {
            const prev = array[index - 1];
            if (prev) {
                varyingRateOriginData.push([value, prev]);
            }
        }
    });
    const varyingRateData = varyingRateOriginData.map(
        (value) => [value[0][0], value[0][1] - value[1][1]] as [number, number],
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
            },
            {
                type: "inside",
                realtime: true,
                start: 25,
                end: 85,
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
    chartInstance.on("datazoom", (params: unknown) => {
        const p = params as Record<string, unknown>;
        // params 结构在不同版本可能不同，兼容 batch 与 非 batch 形式
        let start = 0;
        let end = 100;
        if (p.batch && Array.isArray(p.batch) && p.batch.length > 0) {
            const batch = p.batch[0] as Record<string, unknown>;
            start = (batch.start as number) ?? (batch.startValue as number) ?? start;
            end = (batch.end as number) ?? (batch.endValue as number) ?? end;
        } else {
            start = (p.start as number) ?? start;
            end = (p.end as number) ?? end;
        }
        computeSelectionFromPercent(start, end, fullData);
    });

    // 首次用当前 dataZoom 范围做一次计算（默认 option 中 start=0 end=100）
    // 如果图表已有 dataZoom 状态，也可以从 myChart.getOption() 读取，但使用初始值保证显示
    computeSelectionFromPercent(0, 100, fullData);
}

// 监听坐标轴类型变化
watch(axisType, () => {
    initChart();
});

// 监听数据变化
watch(
    () => [props.yData, props.timeData, props.gameTimeData],
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
