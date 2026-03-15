/**
 * Screeps 数据转换工具函数
 * 用于将 OriginScreepsData 转换为 ScreepsData
 */

import type { OriginScreepsData, TimeSeriesStats } from "AI/AIUreium/ui/type";
import type { SingleTypedTreeData, SingleData } from "screeps-timeseries/dist/src/type";
import type { ScreepsData } from "@/type/screeps-data";
import { TimeSeriesSegmentManager, TimeSeriesDataEngine } from "screeps-timeseries";

/**
 * 将 OriginScreepsData 转换为 ScreepsData
 * 目前暂时直接返回相同的数据结构，后续可以根据需要进行转换
 *
 * @param originData - 原始的 OriginScreepsData 数据
 * @returns 转换后的 ScreepsData 数据
 */
export function convertScreepsData(originData: OriginScreepsData): ScreepsData {
    // 目前暂时直接返回相同的数据结构
    // 后续可以在这里添加数据转换逻辑，例如：
    // 1. 数据格式转换
    // 2. 数据字段重命名
    // 3. 数据计算和衍生字段添加
    // 4. 数据验证和清理

    console.log("转换 Screeps 数据:", originData);

    let tick = 0;
    const statsEngine = new TimeSeriesDataEngine(() => ({}) as TimeSeriesStats<number>, {
        interval: originData.statsEngineConfig.interval,
        maxSegmentSize: originData.statsEngineConfig.maxSegmentSize,
        idList: originData.statsEngineConfig.idList,
        mutationSize: originData.statsEngineConfig.mutationSize,
        readDataBatchSize: originData.statsEngineConfig.readDataBatchSize,
        ifGatherData: originData.statsEngineConfig.ifGatherData,
        timeGetter() {
            return tick++;
        },
        segmentManager: new TimeSeriesSegmentManager(
            originData.rawTimeSeriesData.map((i) => decodeURIComponent(i)),
        ),
        timeData() {
            return originData.statsEngineData;
        },
    });

    statsEngine.readData(true);

    let convertedData: null | false | SingleTypedTreeData<SingleData<(number | null)[]>> = null;
    while (!convertedData) {
        convertedData = statsEngine.readData(false);
    }

    originData.userData.memoryString = decodeURIComponent(originData.userData.memoryString);

    return {
        ...originData,
        timeSeriesData: convertedData as unknown as TimeSeriesStats<(number | null)[]> & {
            timeStamp: SingleData<number[]>;
            gameTime: SingleData<number[]>;
        },
    };
}
