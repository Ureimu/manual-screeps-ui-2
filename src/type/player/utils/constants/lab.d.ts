import { OmitIndexSignature, UnionToTuple } from "type-fest";
export type LabResourceConstant = MineralConstant | MineralCompoundConstant;
/**
 *  按照产品划分的REACTIONS原料数组对象。
 */
export declare const REACTIONS_BY_PRODUCT: {
    [productCompound: string]: [material1: LabResourceConstant, material2: LabResourceConstant];
};
type ReactionType = OmitIndexSignature<typeof REACTIONS>;
/**
 * 对应化合物的原料联合类型。
 */
export type ReactionMaterialsUnion<T extends LabResourceConstant> = {
    [K in keyof ReactionType]: T extends ReactionType[K][keyof ReactionType[K]] ? K : never;
}[keyof ReactionType];
/**
 * 对应化合物的原料数组。
 *
 * 不保证顺序，不应依赖结果顺序。
 */
export type ReactionMaterials<T extends LabResourceConstant> = UnionToTuple<ReactionMaterialsUnion<T>>;
/**
 * 对应化合物的递归原料联合类型。包含了合成该化合物的合成链条上的所有化合物和基本矿物。
 */
export type ReactionMaterialsRecursiveUnion<T extends LabResourceConstant> = T extends any ? ReactionMaterialsUnion<T> | {
    [K in ReactionMaterialsUnion<T>]: K extends MineralCompoundConstant ? ReactionMaterialsRecursiveUnion<K> : K;
}[ReactionMaterialsUnion<T>] : never;
/**
 * 对应化合物的递归原料数组。包含了合成该化合物的合成链条上的所有化合物和基本矿物。
 *
 * 不保证顺序，不应依赖结果顺序。
 */
export type ReactionMaterialsRecursive<T extends LabResourceConstant> = UnionToTuple<ReactionMaterialsRecursiveUnion<T>>;
/**
 * 对应化合物的递归基本矿物原料数组。包含了合成该化合物的合成链条上的所有基本矿物。
 *
 * 不保证顺序，不应依赖结果顺序。
 */
export type ReactionBaseMaterialsRecursive<T extends LabResourceConstant> = UnionToTuple<ReactionMaterialsRecursiveUnion<T> & MineralConstant>;
/**
 * 对应化合物的递归中间化合物原料数组。包含了合成该化合物的合成链条上的所有中间化合物。
 *
 * 不保证顺序，不应依赖结果顺序。
 */
export type ReactionCompoundMaterialsRecursive<T extends LabResourceConstant> = UnionToTuple<ReactionMaterialsRecursiveUnion<T> & MineralCompoundConstant>;
export {};
