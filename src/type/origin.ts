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

export interface LevelData {
    level: number;
    progress: number;
    progressTotal: number;
}
export interface ErrorSegmentMemory {
    messageList: { short: string; full: string[]; ticks: number[] }[];
    isFull: boolean;
    uncaughtErrorNum: number;
}

export interface SpawnCreepDetail {
    creepName: string;
    idList: { [name: number]: boolean };
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
    spawnCondition: string;
    creepCondition: string;
    state: string;
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
export type ControllerLevels = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";

export type creepBodyConfigDetail = Partial<{
    [p in ControllerLevels]: {
        body: string;
    };
}>;

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

export type SingleTypedTreeDataNode<T> = T | SingleTypedTreeDataRecord<T>;

// 下面定义了一个树类型，需要借用接口的特性，参见https://stackoverflow.com/questions/46216048
// 除非你有更好的方案，否则不要去掉下面的eslint-disable-next-line
// eslint-disable-next-line
interface SingleTypedTreeDataRecord<T> extends Record<string, SingleTypedTreeDataNode<T>> {}
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
