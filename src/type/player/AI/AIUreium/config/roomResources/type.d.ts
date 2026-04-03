import { mineralResource } from "utils/constants/resources";
export interface RoomResourceLimit {
    storage: StorageStructureResourceLimit;
    terminal: TerminalStructureResourceLimit;
}
type capacityType = "max" | "min";
type terminalConfigType = "maxBuyPrice" | "minSellPrice" | "buy" | "sell" | "send";
type labConfigType = "reactionGoal" | "reactionPriority" | "reactionBatchAmount";
export type StorageStructureResourceLimit = {
    [name in ResourceConstant]: Pick<SingleResourceLimit, capacityType> & (name extends MineralCompoundConstant ? Pick<SingleResourceLimit, labConfigType> : {});
};
export type TerminalStructureResourceLimit = {
    [name in ResourceConstant]: Pick<SingleResourceLimit, capacityType | terminalConfigType>;
};
export type TerminalStructureResourceLimitWithoutCapacity = {
    [name in ResourceConstant]: Pick<SingleResourceLimit, terminalConfigType>;
};
export interface SingleResourceLimit {
    /**
     * 资源最高数量。
     *
     * * 对于storage，用于控制是否向terminal放入资源。
     * * 当storage和terminal总资源量大于storage和terminal该值之和乘以比率（roomConfig.market.sellLimitRate）时，开始卖出。
     * * 当storage和terminal总资源量大于storage和terminal该值之和乘以比率（roomConfig.market.sendLimitRate）时，开始向自己的其他terminal发送资源。
     */
    max: number;
    /**
     * 资源最低数量。
     *
     * * 对于storage，用于控制是否从terminal拿取资源。
     * * 当storage和terminal总资源量小于storage和terminal该值之和乘以比率（roomConfig.market.buyLimitRate）时，开始买入。
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
    /**
     * 是否允许买入。
     */
    buy: boolean;
    /**
     * 是否允许卖出。
     */
    sell: boolean;
    /**
     * 是否允许发送到其他自己的terminal。
     */
    send: boolean;
}
export type ResourceType<T extends readonly ResourceConstant[]> = T extends readonly (infer U)[] ? U : never;
export type MineralResource = ResourceType<typeof mineralResource>;
export declare const capacityRate: {
    terminalToStorage: number;
};
export {};
