import { creepBodyConfigDetail } from "frame/creep/body/type";
import { CreepGroupMemory, CreepGroupMode } from "frame/creep/group/type";
import { ErrorSegmentMemory } from "utils/ErrorMapper/type";
import { RoomStatusData } from "../control/outwardsSource/type";
import { ScreepsConfig } from "../config/type";
import { SingleData, SingleTypedTreeDataRecord, TimeSeriesEngineData } from "screeps-timeseries";
import { LabTaskHistory } from "../control/maintain/runLab/type";
import { SpawnTask } from "frame/spawn/spawning/type";
export { ErrorSegmentMemory };
/**
 * 该文件为ui库与本代码库共享的类型文件。
 *
 * 在添加新类型时，需要保证引入的文件不应包含：
 *
 * 1. 全局类型声明，如declare global。
 * 2. 其他的导入依赖，除非该依赖也满足当前的要求。
 *
 * 建议保证导入的文件只包含类型，以避免问题。
 *
 * 如果导入的文件包含全局类型声明，可以把全局类型声明放到其他文件。
 */
export interface OriginScreepsData {
    type: "OriginScreepsData";
    rawTimeSeriesData: string[];
    statsEngineStorage: {
        usedRatio: number;
        dataIncreaseSpeed: number;
        usedSegmentsNumber: number;
        maxSizePerSegment: number;
    };
    statsEngineConfig: {
        interval: number;
        maxSegmentSize: number;
        idList: number[];
        mutationSize: number;
        readDataBatchSize: number;
        ifGatherData: boolean;
    };
    statsEngineData: TimeSeriesEngineData;
    timeData: {
        tick: number;
        time: number;
    };
    userData: {
        gcl: LevelData;
        gpl: LevelData;
        name: string;
        error: string;
        memoryString: string;
    };
    shardData: {
        shardName: string;
    };
    roomData: {
        [roomName: string]: RoomData;
    };
    globalData: {
        creepGroups: {
            [creepGroupName: string]: CreepGroupMemory<CreepGroupMode>;
        };
        creepBodyConfig: {
            [name: string]: creepBodyConfigDetail;
        };
        projects: {
            [projectType: string]: {
                [projectId: string]: {
                    diagram: string;
                    memory: Record<string, unknown>;
                };
            };
        };
    };
    historyData: {
        lab: {
            [roomName: string]: LabTaskHistory[];
        };
    };
    config: ScreepsConfig;
}
export interface LevelData {
    level: number;
    progress: number;
    progressTotal: number;
}
export interface RoomData {
    store: {
        storage?: StoreData;
        terminal?: StoreData;
        factory?: StoreData;
    };
    controller: {
        progressSpeed: string;
        ticksToUpgrade: string;
    } & LevelData;
    creep: {
        num: number;
    };
    name: string;
    spawnPool: {
        [creepName: string]: SpawnTask;
    };
    status?: RoomStatusData;
}
export type TimeSeriesData = TimeSeriesStats<(number | null)[]> & {
    timeStamp: SingleData<number[]>;
    gameTime: SingleData<number[]>;
};
export type TimeSeriesStats<T extends string | number | (number | null)[]> = {
    userData: {
        credits: SingleData<T>;
        pixels: SingleData<T>;
        gclProgress: SingleData<T>;
        gplProgress: SingleData<T>;
        bucket: SingleData<T>;
        cpu: SingleData<T>;
    };
    roomData: {
        [name: string]: {
            controllerProgress: SingleData<T>;
            storageData: {
                energy: SingleData<T>;
                energyDeltaByProject: {
                    [projectName: string]: SingleData<T>;
                };
            };
            outwardsSourceEnergy: {
                [sourceName: string]: SingleData<T>;
            };
            spawnTime: {
                [projectName: string]: SingleData<T>;
            };
            spawnEnergy: {
                [projectName: string]: SingleData<T>;
            };
            cpu: SingleData<T>;
        };
    };
} & SingleTypedTreeDataRecord<SingleData<T>>;
export interface StoreData {
    store: Record<string, number>;
    storeCapacity: number;
}
