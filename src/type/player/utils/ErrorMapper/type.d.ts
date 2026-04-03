export interface ErrorSegmentMemory {
    messageList: {
        short: string;
        full: string[];
        ticks: number[];
    }[];
    isFull: boolean;
    uncaughtErrorNum: number;
}
export interface ErrorCache {
    [time: number]: SingleErrorCache;
}
export interface SingleErrorCache {
    messageList: {
        short: string;
        full: string[];
    }[];
    tick: number;
}
