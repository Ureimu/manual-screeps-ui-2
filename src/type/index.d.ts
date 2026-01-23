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
        creepName: string;
        idList: {
            [name: number]: boolean;
        };
        creepLevel?: number;
        /**
         * creep的部件设定名称
         */
        creepBodyConfig: string;
        /**
         * creep的部件字符串
         */
        creepBody: string;
        priority: number;
        spawnCondition: readyConditionKey;
        creepCondition: CreepCondition;
        state: runningState;
        subCond?: string;
        subCondArgs?: string[];
        spawnName?: string;
        spawning?: boolean;
        roomName: string;
        spawnCount: number;
        /**
         * 从属的project名称。
         *
         * @type {string}
         * @memberof SpawnCreepDetail
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
declare module "AI/AIUreium/ui/type" {
    import { creepBodyConfigDetail } from "frame/creep/body/type";
    import { CreepGroupMemory, CreepGroupMode } from "frame/creep/group/type";
    import { SpawnCreepDetail } from "frame/spawn/spawnPool/type";
    import { ErrorSegmentMemory } from "utils/ErrorMapper/type";
    import { SingleData, SingleTypedTreeDataRecord } from "utils/TimeSeriesData/type";
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
            };
        };
    } & SingleTypedTreeDataRecord<SingleData<T>>;
    export interface StoreData {
        store: Record<string, number>;
        storeCapacity: number;
    }
}
