import { RecursivePartial } from "utils/typeUtils";
import { RoomResourceLimit } from "./roomResources/type";
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
    powerCreeps: {
        /**
         * power creep的设定。
         */
        creepConfigs: {
            [name: string]: SinglePowerCreepConfig;
        };
        /**
         * 是否使用powerCreep。
         */
        run: boolean;
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
        run: "stop" | "start" | "ifHasFreeCapacity";
        /**
         * 该值乘以roomConfig.resources[mineralType].max即为，
         * "ifHasFreeCapacity"计算条件时，该mineralType的最大capacity。
         */
        capacityRate: number;
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
    remoteResource: {
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
         * 允许采集矿物的房间列表。只能采集中央九房的矿物。
         */
        mineralRooms: string[];
        /**
         * 允许的最大source数量。
         */
        sourceAmount: number;
        /**
         * 允许的最大mineral数量。
         */
        mineralAmount: number;
        /**
         * 是否进行mineral采集。
         */
        mineralRun: "stop" | "start" | "ifHasFreeCapacity";
        /**
         * 该值乘以roomConfig.resources[mineralType].max即为，
         * "ifHasFreeCapacity"计算条件时，该mineralType的最大capacity。
         */
        mineralCapacityRate: number;
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
         * attack则该房间会在需要时产生attacker攻击外矿房间的invader。
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
         * 启动更多矿物挖掘所需的，storage的最低能量值。
         *
         * 如果低于该值，则不会启动更多矿物挖掘。已经启动的矿物挖掘不会停止。
         */
        minimumStorageEnergyToRebootMineral: number;
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
         * 交易处理速率。
         */
        dealRate: number;
        /**
         * 休眠时的交易处理速率倍率。
         *
         * 当没有任务需要处理时，会进入休眠状态。
         *
         * 此时的交易处理速率为dealRate乘以该值。
         */
        inactiveDealRateMultiplier: number;
        /**
         * 开始deal订单的最低storage能量值。
         */
        minTerminalEnergyToStartDealing: number;
        /**
         * 物资数量的发送限制比率。
         *
         * 当storage和terminal的总物资数量大于storage和terminal的总物资数量最大值乘以该比率时，就会自动尝试发送该物资到自己的其他terminal。
         */
        sendLimitRate: number;
        /**
         * 物资数量的卖出限制比率。
         *
         * 当storage和terminal的总物资数量大于storage和terminal的总物资数量最大值乘以该比率时，就会自动尝试卖出该物资。
         */
        sellLimitRate: number;
        /**
         * 物资数量的买入限制比率。
         *
         * 当storage和terminal的总物资数量小于storage和terminal的总物资数量最小值乘以该比率时，就会自动尝试买入该物资。
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
        /**
         * 是否无视房间等级限制进行墙的修理。
         */
        ignoreRcl: boolean;
        /**
         * 要维持多少个刷墙creep。
         */
        creepAmount: number;
        /**
         * 距离上次选定目标时，已刷的hits大于该设定值时，会切换到下一个刷墙目标。
         */
        switchTargetHits: number;
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
         * 是否进行攻击。
         */
        attack: boolean;
        /**
         * 是否进行治疗。
         */
        heal: boolean;
        /**
         * 是否进行修理。
         */
        repair: boolean;
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
     * 房间主动防御设置。
     */
    activeDefense: {
        /**
         * 是否启用主动防御。
         */
        run: boolean;
        /**
         * 是否攻击npc入侵者。
         */
        attackNpcInvader: boolean;
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
export interface SinglePowerCreepConfig {
    /**
     * 是否孵化。为false则会使creep suicide。
     */
    run: boolean;
    powers: {
        [powerIndex: number]: {
            /**
             * 是否启用power。
             */
            run: boolean;
            /**
             * rooms设置优先级更高。
             *
             * 当含有对应房间名时，会使用该房间内的该power对应的所有可见的对应类型object作为参数，
             * 并覆盖掉objects内对应房间的参数。
             */
            rooms: string[];
            /**
             * objects设置优先级低于rooms。
             *
             * 对于objects，分为下面几种情况。
             * * 对于static object任务，直接写flag名称。
             * * 对于my room object任务，直接写位置字符串。
             * * 对于位置任务，直接写位置字符串。
             */
            objects: string[];
        };
    };
}
