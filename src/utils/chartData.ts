/**
 * 计算滑动窗口聚合数据（平均值或求和）
 * 为每个数据点计算 (timePoint-interval, timePoint] 区间内的聚合值
 * @param data 原始数据数组，格式为 [x, y | null][]
 * @param interval 区间大小（tick或毫秒）
 * @param mode 聚合模式：'average' 计算平均值，'sum' 计算和，'none' 直接返回原始数据
 * @param aggregateAxis 聚合计算使用的轴类型：'time' 使用时间轴，'tick' 使用tick轴，undefined 使用原始数据的x轴
 * @param timeData 时间数据数组（当aggregateAxis为'time'时需要）
 * @param tickData tick数据数组（当aggregateAxis为'tick'时需要）
 * @returns 处理后的聚合数据数组，每个点对应原始数据点的滑动窗口聚合值
 */
export function calculateAggregateData(
    data: [number, number | null][],
    interval: number | undefined,
    mode: "average" | "sum" | "none" = "average",
    aggregateAxis?: "time" | "tick",
    timeData?: number[],
    tickData?: number[],
): [number, number | null][] {
    if (data.length === 0 || !interval || interval <= 0 || mode === "none") {
        return data;
    }

    // 如果指定了聚合轴，需要重新构建数据
    let processedData = data;
    if (aggregateAxis === "time" && timeData) {
        // 使用时间轴作为x轴
        processedData = data.map(
            ([, y], index) => [timeData[index]!, y] as [number, number | null],
        );
    } else if (aggregateAxis === "tick" && tickData) {
        // 使用tick轴作为x轴
        processedData = data.map(
            ([, y], index) => [tickData[index]!, y] as [number, number | null],
        );
    }

    const result: [number, number | null][] = [];

    // 使用双指针滑动窗口算法
    let left = 0;
    let right = 0;

    for (let i = 0; i < processedData.length; i++) {
        const [currentTime] = processedData[i]!;
        const windowStart = currentTime - interval;

        // 移动左指针，移除窗口外的数据
        while (left < i) {
            const [leftTime] = processedData[left]!;
            if (leftTime > windowStart) {
                break;
            }
            left++;
        }

        // 确保右指针至少包含当前点
        if (right <= i) {
            right = i + 1;
        }

        // 移动右指针，包含窗口内的所有数据
        while (right < processedData.length) {
            const [rightTime] = processedData[right]!;
            if (rightTime > currentTime) {
                break;
            }
            right++;
        }

        // 计算窗口内有效数据的聚合值
        let sum = 0;
        let count = 0;

        for (let j = left; j < right; j++) {
            const [, value] = processedData[j]!;
            if (value !== null) {
                sum += value;
                count++;
            }
        }

        // 根据模式计算聚合值
        if (count > 0) {
            if (mode === "average") {
                const average = sum / count;
                result.push([data[i]![0], average]);
            } else if (mode === "sum") {
                result.push([data[i]![0], sum]);
            }
        } else {
            result.push([data[i]![0], null]);
        }
    }

    return result;
}

/**
 * 根据百分比选区计算变化值和平均变化率
 * 当左右区间端点为null时，会寻找离端点最近的区间内的值作为端点值的替代
 * @param startPercent 起始百分比 (0-100)
 * @param endPercent 结束百分比 (0-100)
 * @param fullData 完整数据数组，格式为 [x, y | null][]
 * @param axisType 轴类型：'time' 时间轴，'tick' tick轴
 * @returns 包含变化值、平均变化率和单位的对象
 */
export function computeSelectionFromPercent(
    startPercent: number,
    endPercent: number,
    fullData: [number, number | null][],
    axisType: "time" | "tick",
): {
    delta: number | null;
    avgRate: number | null;
    unit: string | null;
} {
    if (!fullData || fullData.length === 0) {
        return { delta: null, avgRate: null, unit: null };
    }

    const len = fullData.length;
    // clamp and convert percent to indices
    const sIdx = Math.max(0, Math.min(len - 1, Math.round((startPercent / 100) * (len - 1))));
    const eIdx = Math.max(0, Math.min(len - 1, Math.round((endPercent / 100) * (len - 1))));
    const leftIndex = Math.min(sIdx, eIdx);
    const rightIndex = Math.max(sIdx, eIdx);

    if (rightIndex < 0 || leftIndex >= len) {
        return { delta: null, avgRate: null, unit: null };
    }

    const durationLeftData = fullData[leftIndex];
    const durationRightData = fullData[rightIndex];
    console.log(fullData);

    if (!durationLeftData || !durationRightData) {
        return { delta: null, avgRate: null, unit: null };
    }

    // 寻找左端点最近的非null值
    let yLeft: number | null = null;
    if (durationLeftData[1] !== null) {
        yLeft = durationLeftData[1];
    } else {
        // 向右搜索，但不超过右端点
        for (let i = leftIndex; i < rightIndex; i++) {
            const [, value] = fullData[i]!;
            if (value !== null) {
                yLeft = value;
                break;
            }
        }
    }

    // 寻找右端点最近的非null值
    let yRight: number | null = null;
    if (durationRightData[1] !== null) {
        yRight = durationRightData[1];
    } else {
        // 向左搜索，但不小于左端点
        for (let i = rightIndex; i > leftIndex; i--) {
            const [, value] = fullData[i]!;
            if (value !== null) {
                yRight = value;
                break;
            }
        }
    }

    // 如果左右端点都找不到非null值，返回null
    if (yLeft === null || yRight === null) {
        return { delta: null, avgRate: null, unit: null };
    }

    const delta = yRight - yLeft;

    const xLeft = Number(durationLeftData[0]);
    const xRight = Number(durationRightData[0]);
    const span = xRight - xLeft;

    let avgRate: number | null = null;
    let unit: string | null = null;

    if (span === 0) {
        // 无跨度，无法定义速率
        avgRate = null;
        unit = null;
    } else {
        if (axisType === "time") {
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

    return {
        delta: Number.isFinite(delta) ? Number(delta.toFixed(2)) : null,
        avgRate:
            avgRate !== null && Number.isFinite(avgRate)
                ? Number(Number(avgRate).toFixed(2))
                : null,
        unit: unit,
    };
}
