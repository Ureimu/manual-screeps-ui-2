declare module "frame/creep/body/type" {
    export type ControllerLevels = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
    export type creepBodyConfigDetail = Partial<{
        [p in ControllerLevels]: creepBodyConfigSingleDetail;
    }>;
    export type creepBodyConfigSingleDetail = {
        body: string;
    };
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
declare module "utils/typeUtils/index" {
    /** ADD YOUR OWN SELECTION OF PRIMITIVES **/
    type Primitives =
        | boolean
        | number
        | bigint
        | string
        | symbol
        | void
        | null
        | undefined
        | Date
        | Buffer
        | Function
        | RegExp;
    export type RecursivePartial<T> = T extends Primitives
        ? T /** RESOLVE PRIMITIVE TO ITSELF */
        : T extends Array<infer U>
          ? Array<RecursivePartial<U>> /** RESOLVE ARRAY */
          : T extends Map<infer K, infer V>
            ? Map<RecursivePartial<K>, RecursivePartial<V>> /** RESOLVE MAP */
            : T extends WeakMap<infer K, infer V>
              ? WeakMap<RecursivePartial<K>, RecursivePartial<V>> /** RESOLVE WEAK-MAP */
              : T extends Set<infer V>
                ? Set<RecursivePartial<V>> /** RESOLVE SET */
                : T extends WeakSet<infer V>
                  ? WeakSet<RecursivePartial<V>> /** RESOLVE WEAK-SET */
                  : T extends object
                    ? {
                          [K in keyof T]?: RecursivePartial<T[K]> /** RESOLVES OBJECT */;
                      }
                    : T; /** FALLBACK TO ITSELF IF NOT HANDLED */
}
declare module "utils/constants/resources" {
    export const mineralResource: readonly ["H", "O", "U", "L", "K", "Z", "X"];
    export const compound0Resource: readonly ["OH", "ZK", "UL"];
    export const compound0p5Resource: readonly ["G"];
    export const compound1Resource: readonly [
        "UH",
        "UO",
        "KH",
        "KO",
        "LH",
        "LO",
        "ZH",
        "ZO",
        "GH",
        "GO",
    ];
    export const compound2Resource: readonly [
        "UH2O",
        "UHO2",
        "KH2O",
        "KHO2",
        "LH2O",
        "LHO2",
        "ZH2O",
        "ZHO2",
        "GH2O",
        "GHO2",
    ];
    export const compound3Resource: readonly [
        "XUH2O",
        "XUHO2",
        "XKH2O",
        "XKHO2",
        "XLH2O",
        "XLHO2",
        "XZH2O",
        "XZHO2",
        "XGH2O",
        "XGHO2",
    ];
    export const compoundResource: readonly [
        "OH",
        "ZK",
        "UL",
        "G",
        "UH",
        "UO",
        "KH",
        "KO",
        "LH",
        "LO",
        "ZH",
        "ZO",
        "GH",
        "GO",
        "UH2O",
        "UHO2",
        "KH2O",
        "KHO2",
        "LH2O",
        "LHO2",
        "ZH2O",
        "ZHO2",
        "GH2O",
        "GHO2",
        "XUH2O",
        "XUHO2",
        "XKH2O",
        "XKHO2",
        "XLH2O",
        "XLHO2",
        "XZH2O",
        "XZHO2",
        "XGH2O",
        "XGHO2",
    ];
    export const COMPOUND_LEVEL: {
        [compoundName: string]: number;
    };
    export const compressedResource: readonly [
        "utrium_bar",
        "lemergium_bar",
        "zynthium_bar",
        "keanium_bar",
        "ghodium_melt",
        "oxidant",
        "reductant",
        "purifier",
        "battery",
    ];
    export const baseCommodityResource: readonly ["silicon", "metal", "biomass", "mist"];
    export const neutralCommodityResource: readonly ["composite", "crystal", "liquid"];
    export const WSCommodityResource: readonly [
        "wire",
        "switch",
        "transistor",
        "microchip",
        "circuit",
        "device",
    ];
    export const WNCommodityResource: readonly [
        "alloy",
        "tube",
        "fixtures",
        "frame",
        "hydraulics",
        "machine",
    ];
    export const ENCommodityResource: readonly [
        "cell",
        "phlegm",
        "tissue",
        "muscle",
        "organoid",
        "organism",
    ];
    export const ESCommodityResource: readonly [
        "condensate",
        "concentrate",
        "extract",
        "spirit",
        "emanation",
        "essence",
    ];
}
declare module "AI/AIUreium/config/roomResources/type" {
    import { mineralResource } from "utils/constants/resources";
    export interface RoomResourceLimit {
        storage: StorageStructureResourceLimit;
        terminal: TerminalStructureResourceLimit;
    }
    export type StorageStructureResourceLimit = {
        [name in ResourceConstant]: Pick<SingleResourceLimit, "max" | "min"> &
            (name extends MineralCompoundConstant
                ? Pick<
                      SingleResourceLimit,
                      "reactionGoal" | "reactionPriority" | "reactionBatchAmount"
                  >
                : {});
    };
    export type TerminalStructureResourceLimit = {
        [name in ResourceConstant]: Pick<
            SingleResourceLimit,
            "max" | "min" | "maxBuyPrice" | "minSellPrice"
        >;
    };
    export type TerminalStructureResourceLimitWithoutCapacity = {
        [name in ResourceConstant]: Pick<SingleResourceLimit, "maxBuyPrice" | "minSellPrice">;
    };
    export interface SingleResourceLimit {
        /**
         * 资源最高数量。
         *
         * * 对于storage，用于控制是否向terminal放入资源。
         * * 对于terminal，用于控制是否卖出。
         */
        max: number;
        /**
         * 资源最低数量。
         *
         * * 对于storage，用于控制是否从terminal拿取资源，是否合成。
         * * 对于terminal，用于控制是否买入。
         */
        min: number;
        /**
         * 最高买入价格。用于避免买入价格过高，导致亏损。
         */
        maxBuyPrice: number;
        /**
         * 最低卖出价格。用于避免卖出价格过低，导致亏损。
         */
        minSellPrice: number;
        /**
         * 合成化合物数量目标。
         *
         * 只有当该化合物的反应物在storage的数量都大于Math.max(storage的min属性, 单批次合成数量)时，才会自动启动合成。
         *
         * 当该化合物数量超过reactionGoal时，会停止合成。
         */
        reactionGoal: number;
        /**
         * 合成化合物优先级。
         *
         * 当有多种化合物满足合成条件时，会选择优先级级更高的进行合成。
         *
         * 当多种化合物满足合成条件，合成优先级相同且都为最高优先级时，会选择低等级化合物优先合成。
         *
         * 如果想要优先合成某种化合物，可以将该化合物以及其原料的优先级都提高。
         */
        reactionPriority: number;
        /**
         * 单次合成任务的化合物合成数量。
         */
        reactionBatchAmount: number;
    }
    export type ResourceType<T extends readonly ResourceConstant[]> = T extends readonly (infer U)[]
        ? U
        : never;
    export type MineralResource = ResourceType<typeof mineralResource>;
    export const capacityRate: {
        terminalToStorage: number;
    };
}
declare module "utils/console/colorful/type" {
    export type Colors = "red" | "green" | "yellow" | "blue";
}
declare module "utils/log4screeps/type" {
    import { Colors } from "utils/console/colorful/type";
    export const LogLevelToColor: {
        [name in LogLevel]: Colors;
    };
    export type LogLevel = "debug" | "info" | "error" | "warning";
    export const logLevelList: {
        debug: number;
        info: number;
        warning: number;
        error: number;
    };
}
declare module "AI/AIUreium/config/type" {
    import { RecursivePartial } from "utils/typeUtils/index";
    import { RoomResourceLimit } from "AI/AIUreium/config/roomResources/type";
    import { LogLevel } from "utils/log4screeps/type";
    export type UserConfigs = {
        [destName: string]: {
            [shardName: string]: ScreepsConfig;
        };
    };
    export type ScreepsConfig = {
        rooms: {
            [roomName: string]: RoomConfig;
            /**
             * default配置，为该shard的房间预设。
             *
             * 配置应用顺序为，defaultRoomConfig -> rooms.default -> rooms[roomName]，依次覆盖。
             */
            default: RoomConfig;
        };
        main: MainConfig;
    };
    export type PartialScreepsConfig = {
        rooms: {
            [roomName: string]: RecursivePartial<RoomConfig>;
            /**
             * default配置，为该shard的房间预设。
             *
             * 配置应用顺序为，defaultRoomConfig -> rooms.default -> rooms[roomName]，依次覆盖。
             */
            default: RecursivePartial<RoomConfig>;
        };
        main?: RecursivePartial<MainConfig>;
    };
    export type PartialRoomConfig = RecursivePartial<RoomConfig>;
    export interface MainConfig {
        /**
         * 是否启用profiler。
         *
         */
        useProfiler: boolean;
        /**
         * 日志设定。
         *
         * TODO 保留在RoomConfig是因为在考虑实现按房间划分的log设置。
         */
        log: {
            /**
             * 是否运行日志，
             */
            run: boolean;
            /**
             * 日志设定，可设置各个标签对应logger的LogLevel。
             */
            config: {
                [label: string]: LogLevel;
            };
        };
        /**
         * 统计信息相关设置。
         */
        statsEngine: {
            /**
             * 是否运行统计信息收集引擎。
             */
            run: boolean;
            /**
             * 记录数据的时间间隔，单位为毫秒。
             */
            recordInterval: number;
            /**
             * 单个segment存储数据的最大容量。
             *
             * 该参数主要用于测试statsEngine。平时使用保持默认值即可。
             */
            maxSegmentSize: number;
        };
        /**
         * 进攻要塞设置。
         *
         */
        attackStronghold: {
            /**
             * 是否运行进攻要塞。
             */
            run: boolean;
            /**
             * 启用进攻要塞的区块。
             */
            sectors: {
                [name: string]: AttackStrongholdSectorConfig;
                default: AttackStrongholdSectorConfig;
            };
        };
        generatePixel: {
            /**
             * 是否当cpu bucket满时，生成pixel。
             *
             * 不建议在cpu负荷较高时使用，易导致代码停机。
             *
             * @type {boolean}
             */
            run: boolean;
            /**
             * 在生成pixel之前，要求本tick具有的最少剩余cpu值。
             *
             * @type {number}
             */
            minFreeCpu: number;
        };
    }
    export interface RoomConfig {
        /**
         * Power采集设定。
         */
        getPower: {
            /**
             * 是否进行Power采集。
             */
            run: boolean;
            /**
             * 允许采集power的房间列表。
             */
            rooms: string[];
            /**
             * 启用power采集的最低能量限制。
             */
            lowestEnergyInStorage: number;
            /**
             * 选定powerBank开挖的，powerBank最低power值
             *
             */
            minPowerInBank: number;
            /**
             * 是否允许使用boost。
             * 为true时，实际运行时会自动检查是否能够使用。
             * 若无法使用boost会自动使用非boost配置。
             *
             * 实际使用还需配置roomResource提供相应boost资源。
             */
            useBoost: boolean;
        };
        /**
         * 家里的mineral采集设定。
         */
        harvestMineral: {
            /**
             * 是否进行mineral采集。
             */
            run: boolean;
        };
        /**
         * 占新房间设定。
         */
        claimNewRoom: {
            /**
             * 设为true，则会有可能以该房间为起点占领其他房间。
             */
            run: boolean;
        };
        /**
         * 外矿采集设定。
         */
        outwardsSource: {
            /**
             * 是否进行外矿采集。
             */
            run: boolean;
            /**
             * 最大允许的外矿距离。
             *
             * should not be bigger than 25/0.3, or change body data (also 0.3) in src\AI\AIUreium\room\outwardsSource\tasks\createCreepGroup\createOCarryGroup.ts
             */
            maxDistance: number;
            /**
             * 允许采集外矿的房间列表。
             */
            rooms: string[];
            /**
             * 允许的最大source数量。
             */
            sourceAmount: number;
            /**
             * 开始外矿作业的能量比率。
             *
             * 当storage的能量小于storage的能量最小值乘以该比率时，会开始执行外矿作业。
             *
             * 该设置用于防止能量爆仓。
             */
            startEnergyRate: number;
            /**
             * 停止外矿作业的能量比率。
             *
             * 当storage的能量大于storage的能量最大值乘以该比率时，会停止执行外矿作业。
             *
             *  该设置用于防止能量爆仓。
             */
            stopEnergyRate: number;
            /**
             * 处理invaderCore的策略。
             *
             * stop则暂停该房间外矿creep的孵化。
             *
             * attack则会产生attacker攻击invaderCore（未实现）。
             */
            invaderCoreStrategy: "stop" | "attack";
            /**
             * 处理invader的策略。
             *
             * stop则暂停该房间外矿creep的孵化。
             *
             * attack则会产生attacker攻击invader（未实现）。
             */
            invaderStrategy: "stop" | "attack";
            /**
             * 处理invaderStronghold的策略。
             *
             * stop则暂停该房间外矿creep的孵化。
             *
             * 暂时没有其他策略。
             */
            invaderStrongholdStrategy: "stop";
            /**
             * 是否使用外矿road，包含修建和维护。
             */
            useRoad: boolean;
            /**
             * 是否使用reserver。
             */
            useReserver: boolean;
            /**
             * 在本房间第一次启动外矿时，需要等待的延迟时间。
             *
             * 用于防止未获取完全周围房间数据就开矿，而导致没有选取最佳矿源。
             */
            waitTicksBeforeStart: number;
            /**
             * 单个批次启动的最大外矿数目。
             *
             * 外矿会逐批次启动，以防止在孵化oCarrier之前就没有能量导致宕机。
             */
            batchSize: number;
            /**
             * 启动更多外矿所需的，storage的最低能量值。
             *
             * 如果低于该值，则不会启动更多外矿。已经启动的外矿不会停止。
             */
            minimumStorageEnergyToReboot: number;
            /**
             * 外矿运作所需的，storage的最低能量值。
             *
             * 如果低于该值，已经启动的外矿也会停止。
             *
             * 这是为了避免能量被掏空，完全宕机。
             */
            minimumStorageEnergyToStop: number;
        };
        /**
         * market设定。
         */
        market: {
            /**
             * 是否购买能量。
             */
            buyEnergy: boolean;
            /**
             * 是否卖出能量。
             */
            sellEnergy: boolean;
            /**
             * 交易处理速率。
             */
            dealRate: number;
            /**
             * 开始deal订单的最低storage能量值。
             */
            minStorageEnergyToStartDealing: number;
            /**
             * 物资数量的卖出限制比率。
             *
             * 当storage的物资数量大于storage的物资数量最大值乘以该比率时，就会自动尝试卖出该物资。
             */
            sellLimitRate: number;
            /**
             * 物资数量的买入限制比率。
             *
             * 当storage的物资数量小于storage的物资数量最小值乘以该比率时，就会自动尝试买入该物资。
             */
            buyLimitRate: number;
            /**
             * 能量消耗时，消耗的能量的估算单价。
             *
             * 在deal单子时，会以该价格估算能量成本，以选择更好的单子。
             */
            energyCostPrice: number;
            /**
             * 处理卖单时，一次deal能接受的最低收益。
             *
             * 收益低于该值的单子将不被接受，用于过滤极少收益的卖单以提高交易效率。
             */
            minBenefit: number;
        };
        /**
         * 升级控制器设置
         */
        upgradeController: {
            /**
             * loop为一直执行，
             * stop为停止执行，
             * onControllerLinkWorks为仅当controllerLink工作时才执行。
             */
            run: "loop" | "stop" | "onControllerLinkWorks";
            /**
             * 是否快速刷级。启用后会将upgrader的数量自动设为当前可接受的最大值。
             *
             * 要发挥好效果，还需要保证storage能量的稳定供应。
             *
             * 一般需要配合买能量或者向终端发能量来使用。
             */
            speedRun: boolean;
            /**
             * 是否允许使用boost。
             * 为true时，实际运行时会自动检查是否能够使用。
             * 若无法使用boost会自动使用非boost配置。
             *
             * 实际使用还需配置roomResource提供相应boost资源。
             */
            useBoost: boolean;
        };
        /**
         * controllerLink的设置
         */
        controllerLink: {
            /**
             * 开始工作的比率，实际开始工作的storage能量值等于开始工作的比率乘以storage的最大能量值。
             */
            start: number;
            /**
             * 停止工作的比率，实际停止工作的storage能量值等于停止工作的比率乘以storage的最小能量值。
             */
            stop: number;
        };
        /**
         * power处理设置
         */
        processPower: {
            /**
             * 是否执行power处理。
             */
            run: boolean;
            /**
             * 执行power处理的最低storage所含能量数量限制。
             */
            energyLimit: number;
            /**
             * 执行power处理的最低storage所含power数量限制。
             */
            powerLimit: number;
        };
        /**
         * 修理墙壁相关设置。
         */
        repairWall: {
            /**
             * 产生creep去刷墙的storage最低能量值。
             */
            minEnergyToStart: number;
            /**
             * 是否修墙。包括constructedWall和Rampart。
             */
            run: boolean;
            /**
             * 常规墙维持的最低生命值。低于该值会自动派creep修理该墙。
             *
             * 如果同时存在constructedWall和Rampart，会以其生命值之和来做判断。
             */
            minHits: number;
            /**
             * 常规墙维持的最高生命值。高于该值会停止派creep修理该墙。
             *
             * 如果同时存在constructedWall和Rampart，会以其生命值之和来做判断。
             */
            maxHits: number;
            /**
             * 是否自动为了防核而修墙。
             */
            defendNuke: boolean;
        };
        scoutRoom: {
            /**
             * 是否使用scouter creep去探查其他房间。房间8级之后会自动停止使用。
             *
             * 一般用于低级房间前期开外矿。
             */
            useScouter: boolean;
            /**
             * 侦查的房间范围。以本room为中心。
             */
            range: number;
        };
        /**
         * 进攻要塞设置。
         *
         */
        attackStronghold: {
            /**
             * 是否运行进攻要塞。
             */
            run: boolean;
            /**
             * 启用进攻要塞的要塞等级。
             */
            strongholdLevels: {
                [level in 1 | 2 | 3 | 4 | 5]: boolean;
            };
        };
        observer: {
            /**按照权值观察房间。应当为整数。权值越大，平均观察次数越多。*/
            roomTypePower: {
                /**
                 * 过道房间的权值。
                 */
                highwayRoom: number;
                /**
                 * 具有控制器的房间的权值。
                 */
                controllerRoom: number;
                /**
                 * 中心的九个房间的权值。根据observer观察的范围，可能包含部分附近区块的中心的九个房间。
                 */
                centerRoom: number;
                /**
                 * 该房间对应区块中，在该房间附近的房间的权值。
                 */
                nearbyControllerRoomInSector: number;
            };
            /**
             * 观察的tick间隔，应当为整数且大于2，
             */
            observeInterval: number;
        };
        /**
         * tower相关设置。
         */
        tower: {
            /**
             * 建筑受到塔修理的最低血量。
             */
            minHitsToRepair: number;
            /**
             * 缓存列表的更新间隔tick数。不建议设置过低，因为find操作的cpu消耗较高。
             */
            updateInterval: {
                /**
                 * 缓存列表：敌方creep的更新间隔tick数。
                 */
                hostileCreeps: number;
                /**
                 * 缓存列表：友方受伤creep的更新间隔tick数。
                 */
                myInjuredCreeps: number;
                /**
                 * 缓存列表：友方需修补建筑的更新间隔tick数。
                 */
                structuresToRepair: number;
            };
        };
        /**
         * 重启已占有房间的相关设定。
         */
        rebootRoom: {
            /**
             * 触发重启的能量值。
             */
            minEnergy: number;
            /**
             * 停止重启的能量值。
             */
            maxEnergy: number;
        };
        /**
         * 房间资源量上下限设置。
         */
        roomResources: RoomResourcesConfig;
    }
    export type RoomResourcesConfig = {
        /**
         * 设定为true，则terminal的容量设置(max,min)不会生效，
         * 会使用storage的数据设定乘以一定比例转换为terminal数据设定。
         *
         */
        terminalBoundToStorageLimit: boolean;
        /**
         *  房间资源量上下限设置。
         */
        limit: RoomResourceLimit;
    };
    export interface AttackStrongholdSectorConfig {
        /**
         * 该区块是否运行进攻要塞。
         */
        run: boolean;
        /**
         * 启用进攻要塞的要塞等级。
         */
        strongholdLevels: {
            [level in 1 | 2 | 3 | 4 | 5]: boolean;
        };
    }
}
declare module "AI/AIUreium/ui/type" {
    import { creepBodyConfigDetail } from "frame/creep/body/type";
    import { CreepGroupMemory, CreepGroupMode } from "frame/creep/group/type";
    import { SpawnCreepDetail } from "frame/spawn/spawnPool/type";
    import { ErrorSegmentMemory } from "utils/ErrorMapper/type";
    import { SingleData, SingleTypedTreeDataRecord } from "utils/TimeSeriesData/type";
    import { RoomStatusData } from "AI/AIUreium/control/outwardsSource/type";
    import { ScreepsConfig } from "AI/AIUreium/config/type";
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
