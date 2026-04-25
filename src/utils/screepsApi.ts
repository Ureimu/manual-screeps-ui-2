/**
 * Screeps API 模块
 *
 * 实现了 Screeps WebSocket 和 REST API 的通信协议。
 * 参考自: https://github.com/HoPGoldy/screeps-commander
 *
 * WebSocket 协议细节:
 *   - URL: wss://screeps.com/socket/{3位随机数字}/{8位随机字母}/websocket
 *   - 认证格式: 发送 ["auth ${token}"]
 *   - 订阅格式: 发送 ["subscribe user:${userId}/console"]
 *   - 响应格式: 首字符为消息类型(a/m)，之后为 JSON 字符串
 *   - 认证成功响应: a["auth ok <newToken>"]
 *   - 认证失败响应: a["auth failed"]
 */

import { ElMessage } from "element-plus";

// ==================== 类型定义 ====================

export interface PlayerInfo {
    username: string;
    userId: string;
    sessionToken: string;
}

export interface AuthResult {
    ws: WebSocket;
    sessionToken: string;
}

export interface ConsoleMessageData {
    log: string[];
    results: string[];
}

// ==================== WebSocket URL 生成 ====================

/**
 * 获取指定长度的随机字符串
 * @param type "number" | "string"
 * @param length 目标长度
 */
function getRandStr(type: "number" | "string", length: number): string {
    const target = type === "number" ? "0123456789" : "abcdefghijklmnopqrstuvwxyz";

    let result = "";
    for (let i = 0; i < length; i++) {
        result += target.charAt(Math.floor(Math.random() * target.length));
    }
    return result;
}

/**
 * 获取 Screeps WebSocket URL
 * @param server 服务器地址，如 "screeps.com" 或 "screeps.com/ptr"
 */
export function getWebSocketUrl(server: string = "screeps.com"): string {
    const rand3 = getRandStr("number", 3);
    const rand8 = getRandStr("string", 8);

    if (server === "screeps.com/ptr") {
        return `wss://screeps.com/ptr/socket/${rand3}/${rand8}/websocket`;
    }
    return `wss://screeps.com/socket/${rand3}/${rand8}/websocket`;
}

// ==================== REST API ====================

/**
 * 当前服务器标识
 * 用于 REST API 请求的路径前缀
 */
let currentServer = "screeps.com";

/**
 * 设置当前服务器
 * @param server 服务器地址，如 "screeps.com" 或 "screeps.com/ptr"
 */
export function setCurrentServer(server: string): void {
    currentServer = server;
}

/**
 * 获取当前服务器
 */
export function getCurrentServer(): string {
    return currentServer;
}

/**
 * 执行 REST API 请求
 * 使用原生 fetch，自动处理 token 刷新
 */
async function apiRequest<T>(
    method: "GET" | "POST",
    path: string,
    token: string,
    body?: unknown,
): Promise<{ data: T; newToken: string }> {
    // 构建 API URL
    // 开发模式: Vite proxy 将 /api/* 转发到 screeps.com
    // 生产模式: 需要自建 proxy 或使用浏览器插件
    const origin = window.location.origin;
    const prefix = currentServer === "screeps.com/ptr" ? "/ptr" : "";
    const url = `${prefix}/api${path}`;
    // 使用相对路径，开发时由 Vite proxy 处理，生产时需额外配置
    const fullUrl = `${origin}${url}`;

    const headers: Record<string, string> = {
        "X-Token": token,
        "X-Username": token,
    };

    const options: RequestInit = { method, headers };

    if (body !== undefined) {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
    }

    const response = await fetch(fullUrl, options);

    if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
    }

    // 检查响应头中是否有新的 token
    const newToken = response.headers.get("X-Token") || token;
    const data = (await response.json()) as T;

    return { data, newToken };
}

/**
 * 获取玩家信息
 * @param token SESSION_TOKEN
 * @returns 玩家信息
 */
export async function getPlayerInfo(token: string): Promise<PlayerInfo> {
    try {
        const { data, newToken } = await apiRequest<{
            ok: number;
            _id: string;
            username: string;
        }>("GET", "/auth/me", token);

        if (data.ok !== 1) {
            throw new Error("获取用户信息失败");
        }

        return {
            username: data.username,
            userId: data._id,
            sessionToken: newToken,
        };
    } catch (error) {
        const msg = error instanceof Error ? error.message : "获取用户信息失败";
        throw new Error(`获取用户信息失败: ${msg}`);
    }
}

/**
 * 获取用户有 CPU 的分片列表
 *
 * 从 /api/auth/me 的 cpuShard 字段获取分片 CPU 分配信息，
 * 只返回 CPU 用量大于 0 的分片名称。
 * cpuShard 格式: { [shardName: string]: number }
 *
 * @param token SESSION_TOKEN
 * @returns CPU 用量大于 0 的分片名称数组
 */
export async function getUserShards(token: string): Promise<string[]> {
    try {
        const { data } = await apiRequest<{
            ok: number;
            cpuShard?: Record<string, number>;
        }>("GET", "/auth/me", token);

        if (data.ok !== 1) {
            throw new Error("获取用户信息失败");
        }

        const cpuShard = data.cpuShard;
        if (!cpuShard || typeof cpuShard !== "object") {
            return [];
        }

        // 只保留 cpu 用量大于 0 的分片
        return Object.entries(cpuShard)
            .filter(([, cpu]) => cpu > 0)
            .map(([shard]) => shard)
            .sort();
    } catch (error) {
        const msg = error instanceof Error ? error.message : "获取分片列表失败";
        throw new Error(msg);
    }
}

/**
 * 发送控制台命令 (REST API)
 * @param cmd 命令内容
 * @param shard 目标分片
 * @param token SESSION_TOKEN
 */
export async function sendConsoleCommand(cmd: string, shard: string, token: string): Promise<void> {
    try {
        const { data } = await apiRequest<{ ok: number }>("POST", "/user/console", token, {
            expression: cmd,
            shard,
        });

        if (data.ok !== 1) {
            throw new Error("服务器返回失败");
        }
    } catch (error) {
        const msg = error instanceof Error ? error.message : "发送命令失败";
        throw new Error(msg);
    }
}

/**
 * 使用邮箱密码登录获取 Token
 * @param email 邮箱
 * @param password 密码
 * @returns SESSION_TOKEN
 */
export async function getSessionToken(email: string, password: string): Promise<string> {
    try {
        // 登录不需要 X-Token
        const origin = window.location.origin;
        const prefix = currentServer === "screeps.com/ptr" ? "/ptr" : "";
        const response = await fetch(`${origin}${prefix}/api/auth/signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error(`登录失败: ${response.status}`);
        }

        const data = (await response.json()) as { ok: number; token: string };
        if (data.ok !== 1 || !data.token) {
            throw new Error("登录失败，请检查邮箱和密码");
        }

        return data.token;
    } catch (error) {
        const msg = error instanceof Error ? error.message : "登录失败";
        throw new Error(msg);
    }
}

// ==================== WebSocket 相关 ====================

/**
 * 初始化 Screeps WebSocket 连接
 * @param server 服务器地址
 * @returns 可用的 WebSocket 实例
 */
export function initWebSocket(server: string = "screeps.com"): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
        try {
            const url = getWebSocketUrl(server);
            console.log(`[screepsApi] 连接 WebSocket: ${url}`);
            const ws = new WebSocket(url);

            ws.onopen = () => {
                console.log("[screepsApi] WebSocket 连接已建立");
                resolve(ws);
            };

            ws.onerror = (e: Event) => {
                console.error("[screepsApi] WebSocket 连接失败", e);
                reject(new Error("WebSocket 连接失败"));
            };
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * 向 Screeps WebSocket 发送认证
 *
 * 使用 addEventListener 而非直接设置 onmessage，
 * 这样外部的 onmessage 处理器不会被覆盖，
 * 认证完成后会自动移除事件监听器。
 *
 * @param ws WebSocket 实例
 * @param sessionToken SESSION_TOKEN
 * @returns 认证结果（包含新的 token）
 */
export function authSessionToken(ws: WebSocket, sessionToken: string): Promise<AuthResult> {
    return new Promise((resolve, reject) => {
        // 发送认证：格式为 ["auth ${token}"]
        ws.send(`["auth ${sessionToken}"]`);

        // 使用 addEventListener 监听认证响应，不覆盖 onmessage
        const handler = (e: MessageEvent) => {
            const raw = e.data as string;

            // 只处理类型为 'a' 的消息（认证回应）
            if (raw[0] !== "a") return;

            try {
                // 去掉首字符，解析 JSON
                const parsed: string[] = JSON.parse(raw.substring(1));
                const authResult = parsed[0];

                if (authResult) {
                    if (authResult.includes("auth ok")) {
                        // 提取新的 token: "auth ok <newToken>"
                        const parts = authResult.split(" ");
                        const newToken = parts[2] || sessionToken;
                        console.log("[screepsApi] 认证成功");
                        ws.removeEventListener("message", handler);
                        resolve({ ws, sessionToken: newToken });
                    } else if (authResult.includes("auth failed")) {
                        console.error("[screepsApi] 认证失败:", authResult);
                        ws.removeEventListener("message", handler);
                        reject(new Error("Token 认证失败"));
                    }
                }
            } catch (err) {
                // 解析失败则忽略，可能是其他消息
            }
        };
        ws.addEventListener("message", handler);
    });
}

/**
 * 订阅控制台
 * @param ws WebSocket 实例
 * @param userId 用户 ID
 * @returns WebSocket 实例
 */
export function subscribeConsole(ws: WebSocket, userId: string): Promise<WebSocket> {
    return new Promise((resolve) => {
        ws.send(`["subscribe user:${userId}/console"]`);
        console.log("[screepsApi] 已订阅控制台");
        resolve(ws);
    });
}

/**
 * 解析 Screeps WebSocket 消息
 *
 * 服务器消息格式：
 *   - 首字符: 消息类型 ('a' 或 'm')
 *   - 之后: ["<json字符串>"]  外层为数组，内部为 JSON 编码的字符串
 *
 * 控制台消息示例（需二次解析）：
 *   a["[\"user:xxx/console\",{\"messages\":{\"log\":[\"...\"]}}]"]
 *   → 第一次解析得到 ["[\"user...\"]"]
 *   → 第二次解析得到 ["user:xxx/console", {messages:...}]
 *
 * 认证消息示例（无需二次解析）：
 *   a["auth ok <token>"]
 *   → 一次解析得到 ["auth ok <token>"]
 *
 * @param message 原始消息字符串
 * @returns 解析后的数据数组
 */
export function parseMessage(message: string): unknown[] {
    if (message[0] !== "a" && message[0] !== "m") {
        return [""];
    }

    try {
        const outer = JSON.parse(message.substring(1));

        // 外层必须是数组
        if (!Array.isArray(outer)) {
            return [""];
        }

        // 对外层数组的第一个元素尝试二次 JSON 解析
        // （console 消息在此层被编码为 JSON 字符串，auth 消息则是普通字符串）
        if (
            outer.length === 1 &&
            typeof outer[0] === "string" &&
            (outer[0].startsWith("[") || outer[0].startsWith("{"))
        ) {
            try {
                const inner = JSON.parse(outer[0]);
                return Array.isArray(inner) ? inner : outer;
            } catch {
                // 二次解析失败，说明是普通字符串（例如 auth 消息），返回外层
                return outer;
            }
        }

        return outer;
    } catch {
        return [""];
    }
}

/**
 * 关闭 WebSocket 连接
 * @param ws WebSocket 实例
 */
export function closeWebSocket(ws: WebSocket | null): void {
    if (!ws) return;
    try {
        ws.close();
    } catch {
        // 忽略关闭时的错误
    }
}

/**
 * 完整的 Screeps API 初始化流程
 * 1. 获取玩家信息（userId）
 * 2. 初始化 WebSocket
 * 3. 认证 WebSocket
 * 4. 订阅控制台
 *
 * @param token SESSION_TOKEN
 * @param server 服务器地址
 * @returns 初始化结果
 */
export async function initScreepsApi(
    token: string,
    server: string = "screeps.com",
): Promise<{
    ws: WebSocket;
    playerInfo: PlayerInfo;
}> {
    // 1. 获取玩家信息
    const playerInfo = await getPlayerInfo(token);
    console.log("[screepsApi] 玩家信息:", playerInfo.username);

    // 2. 初始化 WebSocket
    const ws = await initWebSocket(server);

    // 3. 认证
    const { sessionToken } = await authSessionToken(ws, playerInfo.sessionToken);
    playerInfo.sessionToken = sessionToken;

    // 4. 订阅控制台
    await subscribeConsole(ws, playerInfo.userId);

    return { ws, playerInfo };
}
