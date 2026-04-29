export interface SpawnRenewTask {
    type: "renewCreep";
    id: string;
    taskName: string;
    /**
     * renew任务的优先级。
     */
    priority: number;
    /**
     * creep名称。
     */
    creepName: string;
    /**
     * creep的当前任务情况。分为allocating:在任务池等待分配spawn，ready:等待进入任务池，running:正在执行renew。
     */
    state: "ready" | "allocating" | "running";
    /**
     * 用于renewCreep的spawn名称。
     */
    spawnName?: string;
    /**
     * renewCreep执行的房间名称。
     */
    roomName: string;
}
