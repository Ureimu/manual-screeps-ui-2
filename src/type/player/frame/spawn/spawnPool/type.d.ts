import { ReadyCondition } from "../spawning/readyCondition/type";
export interface SpawnCreepDetail {
    type: "spawnCreep";
    id: string;
    taskName: string;
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
