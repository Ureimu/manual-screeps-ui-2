export interface RoomStatusRemoteResource {
    lastRunTime: number;
    resources: {
        [name: string]: {
            isInUse: boolean;
            isChosen: boolean;
            isRemoved: boolean;
            reason: string;
        };
    };
}
export interface RoomStatusData {
    remoteResource?: RoomStatusRemoteResource;
}
