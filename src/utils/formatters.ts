/**
 * 时间格式化工具函数
 * @param time 时间戳（毫秒）
 * @returns 格式化后的时间字符串 "YYYY-MM-DD,HH:MM:SS"
 */
export function formatTime(time: number): string {
    const addZero = (n: number): string => (n < 10 ? `0${n}` : `${n}`);
    const date = new Date(time);
    return `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(date.getDate())},${addZero(date.getHours())}:${addZero(date.getMinutes())}:${addZero(date.getSeconds())}`;
}

/**
 * 游戏 tick 格式化为可读字符串
 * @param tick 游戏 tick 数
 * @returns 格式化后的 tick 字符串
 */
export function formatTick(tick: number): string {
    return `Tick: ${tick.toLocaleString()}`;
}

/**
 * 大数字智能单位转换
 * 将数字转换为 k, M, B, T, P, E, Z, Y 等单位
 * @param value 数值
 * @returns 格式化后的数字字符串
 */
export function numberFormatter(value: number): string {
    if (value === 0) return "0";

    const absoluteValue = Math.abs(value);
    const magnitude = Math.log10(absoluteValue);

    // 小于 1000，直接返回
    if (magnitude < 3) {
        return `${Math.round(absoluteValue)}`;
    }

    const size = magnitude % 3;
    const magnitudeDivideKilo = magnitude - size;
    const levelMap: Record<number, string> = {
        0: "",
        3: "k",
        6: "M",
        9: "B",
        12: "T",
        15: "P",
        18: "E",
        21: "Z",
        24: "Y",
    };

    const formatted = (absoluteValue / 10 ** magnitudeDivideKilo).toFixed(size >= 2 ? 0 : 1);

    return `${value >= 0 ? "" : "-"}${formatted}${levelMap[magnitudeDivideKilo] || ""}`;
}

/**
 * 百分比格式化
 * @param value 当前值
 * @param total 总值
 * @returns 百分比字符串
 */
export function formatPercent(value: number, total: number): string {
    if (total === 0) return "0%";
    const percent = ((value / total) * 100).toFixed(2);
    return `${percent}%`;
}

/**
 * 将数字格式化为逗号分隔的字符串
 * @param value 数值
 * @returns 带逗号的数字字符串
 */
export function formatWithCommas(value: number): string {
    return value.toLocaleString();
}

/**
 * 计算时间段内的平均变化率
 * @param startValue 起始值
 * @param endValue 结束值
 * @param timeSpan 时间跨度（秒）
 * @returns 平均变化率
 */
export function calculateAverageRate(
    startValue: number,
    endValue: number,
    timeSpan: number,
): number {
    if (timeSpan === 0) return 0;
    return (endValue - startValue) / timeSpan;
}

/**
 * 格式化速率（带单位）
 * @param rate 速率值
 * @param unit 单位
 * @returns 格式化后的速率字符串
 */
export function formatRate(rate: number, unit: string = "/s"): string {
    return `${numberFormatter(rate)}${unit}`;
}
