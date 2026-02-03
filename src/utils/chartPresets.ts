/**
 * 图表时间区间预设工具函数
 * 提供一键设置图表显示区间功能
 * 支持时间区间和tick区间
 */

import type { ECharts } from "echarts/core";

/**
 * 时间区间预设类型
 */
export interface TimeRangePreset {
    label: string;
    value: number;
    type: "time" | "tick";
    description: string;
}

/**
 * 所有预设（包含时间区间和tick区间）
 * 按类型分组显示
 */
export const ALL_PRESETS: TimeRangePreset[] = [
    // 时间区间预设（毫秒）
    { label: "近1天", value: 24 * 60 * 60 * 1000, type: "time", description: "最近24小时" },
    { label: "近7天", value: 7 * 24 * 60 * 60 * 1000, type: "time", description: "最近7天" },
    { label: "近15天", value: 15 * 24 * 60 * 60 * 1000, type: "time", description: "最近15天" },
    { label: "近30天", value: 30 * 24 * 60 * 60 * 1000, type: "time", description: "最近30天" },
    { label: "近90天", value: 90 * 24 * 60 * 60 * 1000, type: "time", description: "最近90天" },

    // Tick区间预设
    { label: "近1500tick", value: 1500, type: "tick", description: "最近1500个游戏tick" },
    { label: "近7500tick", value: 7500, type: "tick", description: "最近7500个游戏tick" },
    { label: "近15000tick", value: 15000, type: "tick", description: "最近15000个游戏tick" },
    { label: "近30000tick", value: 30000, type: "tick", description: "最近30000个游戏tick" },
    { label: "近90000tick", value: 90000, type: "tick", description: "最近90000个游戏tick" },
    { label: "近270000tick", value: 270000, type: "tick", description: "最近270000个游戏tick" },
    { label: "近810000tick", value: 810000, type: "tick", description: "最近810000个游戏tick" },
];

/**
 * 时间轴预设（毫秒）
 */
export const TIME_PRESETS: TimeRangePreset[] = ALL_PRESETS.filter(
    (preset) => preset.type === "time",
);

/**
 * Tick轴预设
 */
export const TICK_PRESETS: TimeRangePreset[] = ALL_PRESETS.filter(
    (preset) => preset.type === "tick",
);

/**
 * 获取所有预设（包含时间区间和tick区间）
 */
export function getAllPresets(): TimeRangePreset[] {
    return ALL_PRESETS;
}

/**
 * 根据轴类型获取预设（兼容旧代码）
 */
export function getPresetsByAxisType(axisType: "time" | "tick"): TimeRangePreset[] {
    if (axisType === "time") {
        return TIME_PRESETS;
    } else {
        return TICK_PRESETS;
    }
}

/**
 * 根据数据索引和预设值计算dataZoom的start和end百分比
 * 基于数据索引而非x值，确保切换轴类型时百分比一致
 * @param data 数据数组，格式为 [x, y | null][]
 * @param presetValue 预设值（毫秒或tick数）
 * @returns 包含start和end百分比的对象，如果无法计算则返回null
 */
export function calculateZoomRange(
    data: [number, number | null][],
    presetValue: number,
): { start: number; end: number } | null {
    if (!data || data.length === 0) {
        return null;
    }

    // 获取数据范围（基于x值）
    const xValues = data.map((item) => item[0]);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const totalRange = maxX - minX;

    if (totalRange <= 0) {
        return null;
    }

    // 计算要显示的范围（从最大值向前推presetValue）
    const targetEnd = maxX;
    const targetStart = Math.max(minX, targetEnd - presetValue);

    // 计算百分比（基于x值范围）
    const startPercent = ((targetStart - minX) / totalRange) * 100;
    const endPercent = ((targetEnd - minX) / totalRange) * 100;

    return {
        start: Math.max(0, Math.min(100, startPercent)),
        end: Math.max(0, Math.min(100, endPercent)),
    };
}

/**
 * 根据数据索引计算dataZoom的start和end百分比
 * 基于数据点数量而非x值，确保切换轴类型时显示相同的数据点
 * @param data 数据数组，格式为 [x, y | null][]
 * @param dataPointCount 要显示的数据点数量
 * @returns 包含start和end百分比的对象，如果无法计算则返回null
 */
export function calculateZoomRangeByDataPoints(
    data: [number, number | null][],
    dataPointCount: number,
): { start: number; end: number } | null {
    if (!data || data.length === 0 || dataPointCount <= 0) {
        return null;
    }

    const totalPoints = data.length;

    // 确保要显示的数据点数量不超过总数据点数量
    const displayPoints = Math.min(dataPointCount, totalPoints);

    // 计算百分比：显示最后displayPoints个数据点
    const startPercent = ((totalPoints - displayPoints) / totalPoints) * 100;
    const endPercent = 100;

    return {
        start: Math.max(0, Math.min(100, startPercent)),
        end: Math.max(0, Math.min(100, endPercent)),
    };
}

/**
 * 根据预设值计算要显示的数据点数量
 * 通过查找满足条件的数据点索引来计算
 * @param data 数据数组，格式为 [x, y | null][]
 * @param presetValue 预设值（毫秒或tick数）
 * @returns 要显示的数据点数量，如果无法计算则返回null
 */
export function calculateDataPointsByPreset(
    data: [number, number | null][],
    presetValue: number,
): number | null {
    if (!data || data.length === 0 || presetValue <= 0) {
        return null;
    }

    const xValues = data.map((item) => item[0]);
    const maxX = Math.max(...xValues);
    const targetStart = maxX - presetValue;

    // 查找第一个x值大于等于targetStart的数据点索引
    let startIndex = 0;
    for (let i = data.length - 1; i >= 0; i--) {
        const xValue = xValues[i];
        if (xValue !== undefined && xValue >= targetStart) {
            startIndex = i;
        } else {
            break;
        }
    }

    // 计算要显示的数据点数量
    const displayPoints = data.length - startIndex;
    return displayPoints > 0 ? displayPoints : null;
}

/**
 * 根据预设值计算基于数据点的显示范围
 * 结合calculateDataPointsByPreset和calculateZoomRangeByDataPoints
 * @param data 数据数组，格式为 [x, y | null][]
 * @param presetValue 预设值（毫秒或tick数）
 * @returns 包含start和end百分比的对象，如果无法计算则返回null
 */
export function calculateZoomRangeByPreset(
    data: [number, number | null][],
    presetValue: number,
): { start: number; end: number } | null {
    const dataPointCount = calculateDataPointsByPreset(data, presetValue);
    if (dataPointCount === null) {
        return null;
    }
    return calculateZoomRangeByDataPoints(data, dataPointCount);
}

/**
 * 应用预设到图表
 * @param chartInstance ECharts实例
 * @param calculationData 用于计算百分比的数据（基于预设类型）
 * @param preset 预设配置
 * @returns 是否成功应用
 */
export function applyPresetToChart(
    chartInstance: ECharts,
    calculationData: [number, number | null][],
    preset: TimeRangePreset,
): boolean {
    const zoomRange = calculateZoomRangeByPreset(calculationData, preset.value);

    if (!zoomRange) {
        return false;
    }

    // 设置dataZoom
    chartInstance.dispatchAction({
        type: "dataZoom",
        start: zoomRange.start,
        end: zoomRange.end,
        dataZoomIndex: 0, // 对应第一个dataZoom组件
    });

    return true;
}

/**
 * 获取预设的显示标签
 */
export function getPresetLabel(preset: TimeRangePreset): string {
    return preset.label;
}

/**
 * 获取预设的描述
 */
export function getPresetDescription(preset: TimeRangePreset): string {
    return preset.description;
}
