/**
 *
 *
 * @export
 * @interface creepGroupDetail
 */
export interface creepGroupDetail {
    creepNameList: string[];
}
export type CreepGroupMemory<T extends CreepGroupMode = CreepGroupMode> = T extends "route" ? {
    mode: "route";
    creepNameList: string[];
    routeName?: string;
    ifShow: boolean;
    arguments: string[];
    projectName?: string;
} : T extends "role" ? {
    mode: "role";
    creepNameList: string[];
    roleName?: string;
    ifShow: boolean;
    arguments: string[];
    projectName?: string;
    isInterShard?: boolean;
} : never;
export type CreepGroupMode = "route" | "role";
export declare function creepGroupModeIsRoute(memory: CreepGroupMemory<CreepGroupMode>): memory is CreepGroupMemory<"route">;
