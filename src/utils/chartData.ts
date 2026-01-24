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
    if (aggregateAxis === "time" && timeData && timeData.length === data.length) {
        // 使用时间轴作为x轴
        processedData = data.map(
            ([, y], index) => [timeData[index]!, y] as [number, number | null],
        );
    } else if (aggregateAxis === "tick" && tickData && tickData.length === data.length) {
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

// 保持向后兼容的别名
export const calculateAverageData = calculateAggregateData;
