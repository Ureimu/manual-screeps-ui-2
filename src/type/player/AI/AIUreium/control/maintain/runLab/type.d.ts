import { LabResourceConstant } from "utils/constants/lab";
export type SingleLabData = {
    running: boolean;
    taskName?: string;
    id: Id<StructureLab>;
    center?: boolean;
    isCarrying?: boolean;
};
export type LabTaskType = "boostCreep" | "unboostCreep" | "runReaction" | "reverseReaction";
type LabTaskBoostCreep = {
    type: "boostCreep";
    creepId: Id<Creep>;
    boostType: MineralBoostConstant;
    bodyPartsCount: number;
    isCarryEnd: boolean;
};
type LabTaskUnboostCreep = {
    type: "unboostCreep";
    creepId: Id<Creep>;
    isCarryEnd: boolean;
};
type LabTaskRunReaction = {
    type: "runReaction";
    materialLabs: Id<StructureLab>[];
    productLabs: Id<StructureLab>[];
    materialType1: LabResourceConstant;
    materialType2: LabResourceConstant;
    productType: LabResourceConstant;
    amount: number;
    gotAmount: number;
    clearLabsOnStart: {
        [labId: string]: boolean;
    };
    clearLabsOnEnd: {
        [labId: string]: boolean;
    };
    /**
     * 是否正在任务完成后清理lab。
     */
    isClearingLabsOnEnd: boolean;
};
type LabTaskReverseReaction = {
    type: "reverseReaction";
    materialLabs: Id<StructureLab>[];
    productLabs: Id<StructureLab>[];
    materialType: LabResourceConstant;
    productType1: LabResourceConstant;
    productType2: LabResourceConstant;
    amount: number;
    gotAmount: number;
    clearLabsOnStart: {
        [labId: string]: boolean;
    };
    clearLabsOnEnd: {
        [labId: string]: boolean;
    };
    /**
     * 是否正在任务完成后清理lab。
     */
    isClearingLabsOnEnd: boolean;
};
export type LabTask = {
    priority: number;
    status: "ready" | "running";
    name: string;
    labList: Id<StructureLab>[];
    /**
     * 开始时间。-1为未开始。
     */
    startTick: number;
} & (LabTaskBoostCreep | LabTaskUnboostCreep | LabTaskRunReaction | LabTaskReverseReaction);
export type LabTaskHistory = LabTask & {
    roomName: string;
    isFailed: boolean;
    /**
     * 结束时间。-1为未结束。
     */
    endTick: number;
};
export type LabAddTaskArgs = {
    priority: number;
    name: string;
} & (LabAddTaskArgsBoostCreep | LabAddTaskArgsUnboostCreep | LabAddTaskArgsRunReaction | LabAddTaskArgsReverseReaction);
type LabAddTaskArgsBoostCreep = {
    type: "boostCreep";
    creepId: Id<Creep>;
    boostType: MineralBoostConstant;
    bodyPartsCount: number;
};
type LabAddTaskArgsUnboostCreep = {
    type: "unboostCreep";
    creepId: Id<Creep>;
};
type LabAddTaskArgsRunReaction = {
    type: "runReaction";
    materialType1: LabResourceConstant;
    materialType2: LabResourceConstant;
    productType: LabResourceConstant;
    amount: number;
};
type LabAddTaskArgsReverseReaction = {
    type: "reverseReaction";
    materialType: LabResourceConstant;
    productType1: LabResourceConstant;
    productType2: LabResourceConstant;
    amount: number;
};
export {};
