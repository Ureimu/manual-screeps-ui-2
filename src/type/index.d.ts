declare module "frame/creep/body/type" {
    export type ControllerLevels = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
    export type creepBodyConfigDetail = Partial<{
        [p in ControllerLevels]: {
            body: string;
        };
    }>;
}
declare module "frame/creep/group/type" {
    /**
     *
     *
     * @export
     * @interface creepGroupDetail
     */
    export interface creepGroupDetail {
        creepNameList: string[];
    }
    export type CreepGroupMemory<T extends CreepGroupMode = CreepGroupMode> = T extends "route"
        ? {
              mode: "route";
              creepNameList: string[];
              routeName?: string;
              ifShow: boolean;
              arguments: string[];
              projectName?: string;
          }
        : T extends "role"
          ? {
                mode: "role";
                creepNameList: string[];
                roleName?: string;
                ifShow: boolean;
                arguments: string[];
                projectName?: string;
                isInterShard?: boolean;
            }
          : never;
    export type CreepGroupMode = "route" | "role";
    export function creepGroupModeIsRoute(
        memory: CreepGroupMemory<CreepGroupMode>,
    ): memory is CreepGroupMemory<"route">;
}
declare module "frame/spawn/spawning/readyCondition/type" {
    import { SpawnCreepDetail } from "frame/spawn/spawnPool/type";
    export interface ReadyCondition {
        loop: (spawnCreepDetail: SpawnCreepDetail) => void;
        notLoop: (spawnCreepDetail: SpawnCreepDetail) => void;
        shift: (spawnCreepDetail: SpawnCreepDetail) => void;
        sub: (spawnCreepDetail: SpawnCreepDetail) => void;
    }
}
declare module "frame/spawn/spawnPool/type" {
    import { ReadyCondition } from "frame/spawn/spawning/readyCondition/type";
    export interface SpawnCreepDetail {
        /**
         * creep的名称。
         */
        creepName: string;
        /**
         * （未启用）shiftCreep组的id列表
         */
        idList: {
            [name: number]: boolean;
        };
        /**
         * （未启用）shiftCreep的等级。
         */
        creepLevel?: number;
        /**
         * creep的部件设定名称
         */
        creepBodyConfig: string;
        /**
         * creep的部件字符串
         */
        creepBody: string;
        /**
         * creep的孵化优先级。
         */
        priority: number;
        /**
         * creep的孵化条件。
         */
        spawnCondition: readyConditionKey;
        /**
         * creep的当前情况。分为alive:活着，queue:队列中和dead:死亡。
         */
        creepCondition: CreepCondition;
        /**
         * creep的当前孵化池情况。分为running:在孵化池等待孵化，ready:等待进入孵化池，notReady:未准备进入孵化池。
         */
        state: runningState;
        /**
         * shiftCreep的控制孵化的函数名称。
         */
        subCond?: string;
        /**
         * （未启用）shiftCreep的控制孵化的函数参数。
         */
        subCondArgs?: string[];
        /**
         * creep上次孵化时所在的spawn名称。
         */
        spawnName?: string;
        /**
         * creep是否已正在spawn中孵化。
         */
        spawning?: boolean;
        /**
         * creep孵化时所属房间名称。
         */
        roomName: string;
        /**
         * creep出生次数。
         */
        spawnCount: number;
        /**
         * creep从属的project名称。
         */
        projectName?: string;
    }
    export type runningState = "running" | "ready" | "notReady";
    export type readyConditionKey = keyof ReadyCondition;
    export type CreepCondition = "alive" | "dead" | "queue";
}
declare module "utils/ErrorMapper/type" {
    export interface ErrorSegmentMemory {
        messageList: {
            short: string;
            full: string[];
            ticks: number[];
        }[];
        isFull: boolean;
        uncaughtErrorNum: number;
    }
    export interface ErrorCache {
        [time: number]: SingleErrorCache;
    }
    export interface SingleErrorCache {
        messageList: {
            short: string;
            full: string[];
        }[];
        tick: number;
    }
}
declare module "utils/TimeSeriesData/type" {
    export type SingleTypedTreeDataNode<T> = T | SingleTypedTreeDataRecord<T>;
    export interface SingleTypedTreeDataRecord<T> extends Record<
        string,
        SingleTypedTreeDataNode<T>
    > {}
    export type SingleTypedTreeData<T> = Record<string, SingleTypedTreeDataNode<T>> & {
        timeStamp?: T;
        gameTime?: T;
    };
    export interface SingleData<T extends (number | null)[] | string | number> {
        data: T;
        type: string;
        depth: number;
        /**
         * 指示该数据在使用时需要乘以10的多少次方。
         */
        exp?: number;
        mutations?: T extends number[] | string
            ? [mutationIndex: number, size: number][]
            : undefined;
    }
}
declare module "AI/AIUreium/control/outwardsSource/type" {
    export interface RoomStatusOutwardsSource {
        lastRunTime: number;
        isRunning: boolean;
        sources: {
            [name: string]: {
                isInUse: boolean;
                isChosen: boolean;
                isRemoved: boolean;
                reason: string;
            };
        };
    }
    export interface RoomStatusData {
        outwardsSource?: RoomStatusOutwardsSource;
    }
}
declare module "AI/AIUreium/ui/type" {
    import { creepBodyConfigDetail } from "frame/creep/body/type";
    import { CreepGroupMemory, CreepGroupMode } from "frame/creep/group/type";
    import { SpawnCreepDetail } from "frame/spawn/spawnPool/type";
    import { ErrorSegmentMemory } from "utils/ErrorMapper/type";
    import { SingleData, SingleTypedTreeDataRecord } from "utils/TimeSeriesData/type";
    import { RoomStatusData } from "AI/AIUreium/control/outwardsSource/type";
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
        timeSeriesData: TimeSeriesStats<(number | null)[]> & {
            timeStamp: SingleData<number[]>;
            gameTime: SingleData<number[]>;
        };
        statsEngineStorage: {
            usedRatio: number;
            dataIncreaseSpeed: number;
            usedSegmentsNumber: number;
            maxSizePerSegment: number;
        };
        timeData: {
            tick: number;
            time: number;
        };
        userData: {
            gcl: LevelData;
            gpl: LevelData;
            name: string;
            error: ErrorSegmentMemory;
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
            [creepName: string]: SpawnCreepDetail;
        };
        status?: RoomStatusData;
    }
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
                };
                outwardsSourceEnergy: {
                    [sourceName: string]: SingleData<T>;
                };
                spawnTime: SingleData<T>;
                cpu: SingleData<T>;
            };
        };
    } & SingleTypedTreeDataRecord<SingleData<T>>;
    export interface StoreData {
        store: Record<string, number>;
        storeCapacity: number;
    }
}
