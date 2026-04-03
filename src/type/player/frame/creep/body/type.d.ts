export type ControllerLevels = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
export type creepBodyConfigDetail = Partial<{
    [p in ControllerLevels]: creepBodyConfigSingleDetail;
}>;
export type creepBodyConfigSingleDetail = {
    body: string;
};
