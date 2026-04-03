import { SpawnCreepDetail } from "frame/spawn/spawnPool/type";
export interface ReadyCondition {
    loop: (spawnCreepDetail: SpawnCreepDetail) => void;
    notLoop: (spawnCreepDetail: SpawnCreepDetail) => void;
    shift: (spawnCreepDetail: SpawnCreepDetail) => void;
    sub: (spawnCreepDetail: SpawnCreepDetail) => void;
}
