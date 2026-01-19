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
import { SunburstChart } from "echarts/charts";
import type { RoomData, StoreData } from "@/type/origin";
import { useAppStore } from "@/stores/app";

echarts.use([
    GridComponent,
    LineChart,
    SVGRenderer,
    TooltipComponent,
    DataZoomComponent,
    TitleComponent,
    SunburstChart,
]);

interface Props {
    name: string;
    id: string;
    visible: boolean;
    roomData: Partial<RoomData["store"]> | undefined;
}
const props = withDefaults(defineProps<Props>(), {
    visible: true,
    roomData: () =>
        ({}) as {
            storage: StoreData;
            terminal: StoreData;
            factory: StoreData;
        },
});
const appStore = useAppStore();

const axisType = computed(() => appStore.options.axisType);

let chartInstance: echarts.ECharts | null = null;
const chartContainer = ref<HTMLElement | null>(null);

const RES_TREE = {
    POWER资源: { POWER资源: ["power", "ops"] },
    基础资源: {
        能量: ["energy", "battery"],
        原矿: ["U", "L", "K", "Z", "X", "O", "H", "G"],
        压缩: [
            "utrium_bar",
            "lemergium_bar",
            "keanium_bar",
            "zynthium_bar",
            "purifier",
            "oxidant",
            "reductant",
            "ghodium_melt",
        ],
    },
    商品资源: {
        蓝色: ["silicon", "wire", "switch", "transistor", "microchip", "circuit", "device"],
        黄色: ["metal", "alloy", "tube", "fixtures", "frame", "hydraulics", "machine"],
        紫色: ["mist", "condensate", "concentrate", "extract", "spirit", "emanation", "essence"],
        绿色: ["biomass", "cell", "phlegm", "tissue", "muscle", "organoid", "organism"],
    },
    LAB资源: {
        蓝色: ["UH", "UH2O", "XUH2O", "UO", "UHO2", "XUHO2"],
        黄色: ["ZH", "ZH2O", "XZH2O", "ZO", "ZHO2", "XZHO2"],
        紫色: ["KH", "KH2O", "XKH2O", "KO", "KHO2", "XKHO2"],
        绿色: ["LH", "LH2O", "XLH2O", "LO", "LHO2", "XLHO2"],
        白色: ["GH", "GH2O", "XGH2O", "GO", "GHO2", "XGHO2"],
    },
    empty: { empty: ["empty"] },
};

const RES_COLOR_MAP: Record<string, string> = {
    empty: "rgb(247,247,247)",
    energy: "rgb(255,242,0)",
    battery: "rgb(255,242,0)",
    Z: "rgb(247, 212, 146)",
    L: "rgb(108, 240, 169)",
    U: "rgb(76, 167, 229)",
    K: "rgb(218, 107, 245)",
    X: "rgb(255, 192, 203)",
    G: "rgb(255,255,255)",
    zynthium_bar: "rgb(247, 212, 146)",
    lembergium_bar: "rgb(108, 240, 169)",
    utrium_bar: "rgb(76, 167, 229)",
    keanium_bar: "rgb(218, 107, 245)",
    purifier: "rgb(255, 192, 203)",
    ghodium_melt: "rgb(255,255,255)",
    power: "rgb(224,90,90)",
    ops: "rgb(224,90,90)",
    composite: "#ccc",
    crystal: "#ccc",
    liquid: "#ccc",
    device: "rgb(76, 167,229)",
    circuit: "rgb(76, 167,229)",
    microchip: "rgb(76, 167,229)",
    transistor: "rgb(76, 167,229)",
    switch: "rgb(76, 167,229)",
    wire: "rgb(76, 167,229)",
    silicon: "rgb(76, 167,229)",
    machine: "rgb(247,212,146)",
    hydraulics: "rgb(247,212,146)",
    frame: "rgb(247,212,146)",
    fixtures: "rgb(247,212,146)",
    tube: "rgb(247,212,146)",
    alloy: "rgb(247,212,146)",
    metal: "rgb(247,212,146)",
    essence: "rgb(218,107,245)",
    emanation: "rgb(218,107,245)",
    spirit: "rgb(218,107,245)",
    extract: "rgb(218,107,245)",
    concentrate: "rgb(218,107,245)",
    condensate: "rgb(218,107,245)",
    mist: "rgb(218,107,245)",
    organism: "rgb(108,240,169)",
    organoid: "rgb(108,240,169)",
    muscle: "rgb(108,240,169)",
    tissue: "rgb(108,240,169)",
    phlegm: "rgb(108,240,169)",
    cell: "rgb(108,240,169)",
    biomass: "rgb(108,240,169)",
    OH: "#ccc",
    ZK: "#ccc",
    UL: "#ccc",
    UH: "rgb(76, 167,229)",
    UH2O: "rgb(76, 167,229)",
    XUH2O: "rgb(76, 167,229)",
    UO: "rgb(76, 167,229)",
    UHO2: "rgb(76, 167,229)",
    XUHO2: "rgb(76, 167,229)",
    ZH: "rgb(247,212,146)",
    ZH2O: "rgb(247,212,146)",
    XZH2O: "rgb(247,212,146)",
    ZO: "rgb(247,212,146)",
    ZHO2: "rgb(247,212,146)",
    XZHO2: "rgb(247,212,146)",
    KH: "rgb(218,107,245)",
    KH2O: "rgb(218,107,245)",
    XKH2O: "rgb(218,107,245)",
    KO: "rgb(218,107,245)",
    KHO2: "rgb(218,107,245)",
    XKHO2: "rgb(218,107,245)",
    LH: "rgb(108,240,169)",
    LH2O: "rgb(108,240,169)",
    XLH2O: "rgb(108,240,169)",
    LO: "rgb(108,240,169)",
    LHO2: "rgb(108,240,169)",
    XLHO2: "rgb(108,240,169)",
    GH: "rgb(255,255,255)",
    GH2O: "rgb(255,255,255)",
    XGH2O: "rgb(255,255,255)",
    GO: "rgb(255,255,255)",
    GHO2: "rgb(255,255,255)",
    XGHO2: "rgb(255,255,255)",
    H: "#ccc",
    O: "#ccc",
    oxidant: "#ccc",
    reductant: "#ccc",
};

function getStorageTerminalRes(
    room: Partial<RoomData["store"]> | undefined,
): Record<string, number> {
    const store: Record<string, number> = {};
    if (!room) return {};
    if (room.storage) addStore(store, room.storage.store, room.storage.storeCapacity);
    if (room.terminal) addStore(store, room.terminal.store, room.terminal.storeCapacity);
    if (room.factory) addStore(store, room.factory.store, room.factory.storeCapacity);
    return store;
}

function addStore(
    store: Record<string, number>,
    b: Record<string, number>,
    capacity: number,
): Record<string, number> {
    let sum = 0;
    for (const v in b) {
        if (b[v] && b[v] > 0) {
            store[v] = (store[v] || 0) + b[v];
            sum += b[v];
        }
    }
    store["empty"] = (store["empty"] || 0) + capacity - sum;
    return store;
}

interface TreeNode {
    name: string;
    value?: number;
    itemStyle?: { color: string };
    children?: TreeNode[];
}

function buildTree(node: Record<string, number[] | Record<string, number[]>>): TreeNode[] {
    const arr: TreeNode[] = [];
    if (!props.roomData) return [];
    const ori = getStorageTerminalRes(props.roomData);

    if (Array.isArray(node)) {
        for (const resType of node) {
            arr.push({
                name: resType,
                value: ori[resType],
                itemStyle: {
                    color: RES_COLOR_MAP[resType] ?? RES_COLOR_MAP["energy"] ?? "",
                },
            });
        }
    } else {
        for (const resType in node) {
            const nodeValue = node[resType];
            if (!nodeValue) continue;

            const children = buildTree(
                nodeValue as Record<string, number[] | Record<string, number[]>>,
            );
            if (children.length) {
                const firstChildColor = children[0]?.itemStyle?.color || "#999";
                arr.push({
                    name: resType,
                    itemStyle: {
                        color: RES_COLOR_MAP[resType] ? RES_COLOR_MAP[resType] : firstChildColor,
                    },
                    children: children,
                });
            }
        }
    }
    return arr;
}

function initChart(): void {
    if (!chartContainer.value || !props.visible) return;

    if (!chartInstance) {
        chartInstance = echarts.init(chartContainer.value, null, {
            renderer: "svg",
        });
    }
    if (!props.roomData) return;
    // console.log(`${props.id} start render sunburst chart`);

    const data = buildTree(
        RES_TREE as unknown as Record<string, number[] | Record<string, number[]>>,
    );

    const option: EChartsCoreOption & { series?: Record<string, unknown> } = {
        title: {
            text: props.name,
            top: "top",
            left: "center",
        },
        tooltip: { show: true },
        series: {
            itemStyle: {
                borderColor: "#1b1b1b",
                borderWidth: 1,
            },
            type: "sunburst",
            data: data,
            radius: [0, "95%"],
            sort: null,
            emphasis: {
                focus: "ancestor",
            },
        },
    };

    chartInstance.setOption(option, { notMerge: true });
}
watch(axisType, () => {
    initChart();
});

// 监听数据变化
watch(
    () => [props.roomData],
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
.chart-container {
    width: 100%;
    height: 100%;
    min-height: 360px;
    background: #ffffff;
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>
