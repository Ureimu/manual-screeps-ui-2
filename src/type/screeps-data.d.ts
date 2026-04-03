import type { OriginScreepsData, TimeSeriesData } from "@/type/player/AI/AIUreium/ui/type";

/**
 * ScreepsData 类型
 * 表示经过转换后的 Screeps 数据
 * 基于 OriginScreepsData，但使用解析后的 timeSeriesData 替代原始的 rawTimeSeriesData
 */
export type ScreepsData = OriginScreepsData & {
    timeSeriesData: TimeSeriesData;
};
