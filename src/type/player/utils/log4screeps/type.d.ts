import { Colors } from "utils/console/colorful/type";
export declare const LogLevelToColor: {
    [name in LogLevel]: Colors;
};
export type LogLevel = "debug" | "info" | "error" | "warning";
export declare const logLevelList: {
    debug: number;
    info: number;
    warning: number;
    error: number;
};
