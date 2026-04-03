/** 指powerCreep更新寿命任务。 */
export declare const PC_RENEW = -1;
/** 指powerCreep更新寿命任务。 */
export type PC_RENEW = -1;
/** 指powerCreep启用房间的power任务。 */
export declare const PC_ENABLE_POWER = -2;
/** 指powerCreep启用房间的power任务。 */
export type PC_ENABLE_POWER = -2;
/** 指powerCreep孵化任务。 */
export declare const PC_SPAWN = -3;
/** 指powerCreep孵化任务。 */
export type PC_SPAWN = -3;
/** 指powerCreep取出ops任务。 */
export declare const PC_WITHDRAW_OPS = -4;
/** 指powerCreep取出ops任务。 */
export type PC_WITHDRAW_OPS = -4;
/** 指powerCreep放入ops任务。 */
export declare const PC_TRANSFER_OPS = -5;
/** 指powerCreep放入ops任务。 */
export type PC_TRANSFER_OPS = -5;
export type PCTaskEnum = PC_RENEW | PC_ENABLE_POWER | PC_SPAWN | PC_WITHDRAW_OPS | PC_TRANSFER_OPS;
export type PowerTaskTypeEnum = PowerConstant | PCTaskEnum;
export declare const PowerTaskTypeIndexToNameMap: {
    [powerIndex in PowerTaskTypeEnum]: string;
};
export declare const POWER_TASK_ENUM_LIST: PowerTaskTypeEnum[];
export declare const PowerEnumMapToTargetStructureTypeList: {
    readonly [-1]: ["powerSpawn", "powerBank"];
    readonly [-3]: ["powerSpawn"];
    readonly [-4]: ["storage"];
    readonly [-5]: ["storage"];
    readonly 2: ["spawn"];
    readonly 3: ["tower"];
    readonly 4: ["storage"];
    readonly 5: ["lab"];
    readonly 6: ["storage", "terminal"];
    readonly 7: ["observer"];
    readonly 8: ["terminal"];
    readonly 16: ["powerSpawn"];
    readonly 17: ["rampart", "constructedWall"];
    readonly 19: ["factory"];
    readonly 9: ["spawn"];
    readonly 10: ["tower"];
    readonly 15: ["terminal"];
};
export declare const PowerEnumMapToTargetStaticObjectTypeList: {
    readonly [-2]: ["controller"];
    readonly 18: ["controller"];
    readonly 13: ["source"];
    readonly 14: ["mineral"];
    readonly 11: ["source"];
};
export interface PowerCreepTask {
    taskName: string;
    targetId: string;
    targetPosStr: string;
    powerTaskEnum: PowerTaskTypeEnum;
    targetName: string;
    pcName?: string;
    priority: number;
    effectEndTick: number;
    disposableTask?: boolean;
}
export type AddPowerCreepTaskArgs = {
    taskName: string;
    powerTaskEnum: PowerTaskTypeEnum;
    priority: number;
    /**
     * 将该任务分配给的powerCreep的名称。可选。
     */
    pcName?: string;
    /**
     * 是否是一次性任务。
     */
    disposableTask?: boolean;
} & (AddPowerCreepNoTargetTaskArgs | AddPowerCreepStaticTargetTaskArgs | AddPowerCreepMyStructureTargetTaskArgs | AddPowerCreepPosTargetTaskArgs | AddPowerCreepEnemyStructureTargetTaskArgs);
export type PowerTaskNoTargetTypeEnum = PWR_GENERATE_OPS;
type AddPowerCreepNoTargetTaskArgs = {
    powerTaskEnum: PowerTaskNoTargetTypeEnum;
};
export type PowerTaskStaticTargetTypeEnum = PC_ENABLE_POWER | PWR_OPERATE_CONTROLLER | PWR_REGEN_SOURCE | PWR_REGEN_MINERAL | PWR_DISRUPT_SOURCE;
type AddPowerCreepStaticTargetTaskArgs = {
    powerTaskEnum: PowerTaskStaticTargetTypeEnum;
    targetName: string;
};
export type PowerTaskMyStructureTargetTypeEnum = PC_RENEW | PC_SPAWN | PC_WITHDRAW_OPS | PC_TRANSFER_OPS | PWR_OPERATE_SPAWN | PWR_OPERATE_TOWER | PWR_OPERATE_STORAGE | PWR_OPERATE_LAB | PWR_OPERATE_EXTENSION | PWR_OPERATE_OBSERVER | PWR_OPERATE_TERMINAL | PWR_OPERATE_POWER | PWR_FORTIFY | PWR_OPERATE_FACTORY;
type AddPowerCreepMyStructureTargetTaskArgs = {
    powerTaskEnum: PowerTaskMyStructureTargetTypeEnum;
    structureId: string;
};
export declare const PowerTaskMyStructureTargetTypeList: [-1, -3, -4, -5, 2, 3, 4, 5, 6, 7, 8, 16, 17, 19];
export type PowerTaskPosTargetTypeEnum = PWR_SHIELD;
type AddPowerCreepPosTargetTaskArgs = {
    powerTaskEnum: PowerTaskPosTargetTypeEnum;
    targetPosStr: string;
};
export type PowerTaskEnemyStructureTargetTypeEnum = PWR_DISRUPT_SPAWN | PWR_DISRUPT_TOWER | PWR_DISRUPT_TERMINAL;
type AddPowerCreepEnemyStructureTargetTaskArgs = {
    powerTaskEnum: PowerTaskEnemyStructureTargetTypeEnum;
    targetPosStr: string;
};
export {};
