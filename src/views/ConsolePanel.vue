<template>
    <div class="panel-with-sidebar">
        <PanelSidebar
            title="控制台"
            :categories="sidebarCategories"
            :activeCategory="activeCategory"
            @select="scrollToCategory"
        />
        <div ref="mainContentRef" class="panel-main-content">
            <div class="panel-main">
                <!-- 登录设置 -->
                <div ref="loginRef" class="section-anchor">
                    <el-card class="console-card">
                        <template #header>
                            <span>连接设置</span>
                        </template>
                        <div class="login-form">
                            <el-form :model="loginForm" label-width="80px" label-position="top">
                                <el-form-item label="登录方式">
                                    <el-radio-group
                                        v-model="loginForm.loginMethod"
                                        :disabled="wsConnected"
                                    >
                                        <el-radio value="token">Token 登录</el-radio>
                                        <el-radio value="password">邮箱密码登录</el-radio>
                                    </el-radio-group>
                                </el-form-item>
                                <el-form-item
                                    v-if="loginForm.loginMethod === 'token'"
                                    label="Token"
                                >
                                    <el-input
                                        v-model="loginForm.token"
                                        type="password"
                                        show-password
                                        placeholder="输入 Screeps Token"
                                        :disabled="wsConnected"
                                    />
                                </el-form-item>
                                <template v-if="loginForm.loginMethod === 'password'">
                                    <el-form-item label="邮箱">
                                        <el-input
                                            v-model="loginForm.email"
                                            placeholder="输入邮箱地址"
                                            :disabled="wsConnected"
                                        />
                                    </el-form-item>
                                    <el-form-item label="密码">
                                        <el-input
                                            v-model="loginForm.password"
                                            type="password"
                                            show-password
                                            placeholder="输入密码"
                                            :disabled="wsConnected"
                                        />
                                    </el-form-item>
                                    <el-form-item>
                                        <el-checkbox
                                            v-model="loginForm.rememberPassword"
                                            :disabled="wsConnected"
                                        >
                                            记住密码
                                        </el-checkbox>
                                    </el-form-item>
                                </template>
                                <el-form-item label="服务器">
                                    <el-select
                                        v-model="loginForm.server"
                                        :disabled="wsConnected"
                                        @change="handleServerChange"
                                    >
                                        <el-option
                                            label="screeps.com (官方服)"
                                            value="screeps.com"
                                        />
                                        <el-option
                                            label="screeps.com/ptr (PTR 测试服)"
                                            value="screeps.com/ptr"
                                        />
                                        <el-option
                                            label="本地服务器 (127.0.0.1:21025)"
                                            value="127.0.0.1:21025"
                                        />
                                        <el-option label="自定义..." value="__custom__" />
                                    </el-select>
                                </el-form-item>
                                <el-form-item
                                    v-if="loginForm.server === '__custom__'"
                                    label="自定义服务器"
                                >
                                    <div class="custom-server-inputs">
                                        <el-input
                                            v-model="loginForm.customHost"
                                            placeholder="主机地址 (如 127.0.0.1)"
                                            :disabled="wsConnected"
                                            class="custom-host-input"
                                        />
                                        <span class="custom-server-separator">:</span>
                                        <el-input
                                            v-model="loginForm.customPort"
                                            placeholder="端口 (如 21025)"
                                            :disabled="wsConnected"
                                            class="custom-port-input"
                                        />
                                    </div>
                                </el-form-item>
                                <el-form-item>
                                    <el-button
                                        v-if="!wsConnected"
                                        type="primary"
                                        @click="handleConnect"
                                        :loading="connecting"
                                    >
                                        连接
                                    </el-button>
                                    <el-button v-else type="danger" @click="handleDisconnect">
                                        断开
                                    </el-button>
                                    <el-button @click="handleClearToken" :disabled="wsConnected">
                                        清除凭据
                                    </el-button>
                                </el-form-item>
                            </el-form>
                            <div class="connection-status">
                                <span class="status-label">连接状态：</span>
                                <el-tag :type="statusTagType" size="small">
                                    {{ connectionStatusText }}
                                </el-tag>
                                <span v-if="userName" class="user-name"
                                    >已登录：{{ userName }}</span
                                >
                            </div>
                            <div v-if="wsConnected" class="connection-info">
                                <span class="info-text">
                                    WebSocket 已连接，正在监听控制台消息...
                                </span>
                            </div>

                            <!-- 调试日志 -->
                            <el-collapse class="debug-collapse" v-if="debugLogs.length > 0">
                                <el-collapse-item title="调试日志" name="debug">
                                    <div class="debug-log-list">
                                        <div
                                            v-for="(log, idx) in debugLogs"
                                            :key="idx"
                                            :class="['debug-log-line', `debug-level-${log.level}`]"
                                        >
                                            <span class="debug-log-time">{{ log.time }}</span>
                                            <el-tag
                                                size="small"
                                                :type="debugTagType(log.level)"
                                                class="debug-log-level"
                                            >
                                                {{ log.level }}
                                            </el-tag>
                                            <span class="debug-log-msg">{{ log.message }}</span>
                                        </div>
                                    </div>
                                </el-collapse-item>
                            </el-collapse>
                        </div>
                    </el-card>
                </div>

                <!-- 控制台输出 -->
                <div ref="consoleRef" class="section-anchor">
                    <el-card class="console-card">
                        <template #header>
                            <div class="console-header">
                                <span>控制台输出</span>
                                <div class="console-header-actions">
                                    <el-select
                                        v-model="shardFilter"
                                        placeholder="筛选分片"
                                        size="small"
                                        style="width: 160px; margin-right: 8px"
                                    >
                                        <el-option label="全部（不筛选）" value="" />
                                        <el-option
                                            v-for="s in availableShards"
                                            :key="s"
                                            :label="s"
                                            :value="s"
                                        />
                                    </el-select>
                                    <el-button
                                        size="small"
                                        @click="handleClearConsole"
                                        :disabled="filteredConsoleMessages.length === 0"
                                    >
                                        清空
                                    </el-button>
                                    <el-button
                                        size="small"
                                        @click="handleCopyConsole"
                                        :disabled="filteredConsoleMessages.length === 0"
                                    >
                                        复制
                                    </el-button>
                                    <el-button
                                        size="small"
                                        :type="autoScroll ? 'primary' : 'default'"
                                        :title="autoScroll ? '自动滚动已开启' : '自动滚动已关闭'"
                                        @click="toggleAutoScroll"
                                    >
                                        自动滚动
                                    </el-button>
                                </div>
                            </div>
                        </template>
                        <div
                            v-if="filteredConsoleMessages.length === 0"
                            class="console-output console-placeholder"
                        >
                            <el-empty description="暂无控制台消息" :image-size="80" />
                        </div>
                        <div
                            v-else
                            ref="consoleListRef"
                            class="console-output console-list"
                            @scroll="handleConsoleScroll"
                        >
                            <div
                                v-for="item in filteredConsoleMessages"
                                :key="item.id"
                                :class="['console-line', `console-line-${item.type}`]"
                            >
                                <span class="console-timestamp">{{ item.time }}</span>
                                <span v-if="item.shard" class="console-shard-label"
                                    >[{{ item.shard }}]</span
                                >
                                <span
                                    :class="[
                                        'console-type-label',
                                        item.type === 'result'
                                            ? 'console-type-result'
                                            : 'console-type-log',
                                    ]"
                                    >{{ item.type }}</span
                                >
                                <span class="console-text" v-html="item.displayHtml"></span>
                            </div>
                        </div>
                    </el-card>
                </div>

                <!-- 命令输入 -->
                <div ref="commandRef" class="section-anchor">
                    <el-card class="console-card">
                        <template #header>
                            <span>发送命令</span>
                        </template>
                        <div class="command-input-area">
                            <el-form
                                :model="commandForm"
                                label-width="60px"
                                @submit.prevent="handleSendCommand"
                            >
                                <el-form-item label="分片">
                                    <el-select v-model="commandForm.shard" placeholder="选择分片">
                                        <el-option
                                            v-for="s in availableShards"
                                            :key="s"
                                            :label="s"
                                            :value="s"
                                        />
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="命令">
                                    <el-input
                                        v-model="commandForm.expression"
                                        type="textarea"
                                        :rows="3"
                                        placeholder="输入 JavaScript 代码，如：Game.rooms['W1N1'].energyAvailable"
                                        @keydown="handleCommandKeydown"
                                    />
                                </el-form-item>
                                <el-form-item>
                                    <el-button
                                        type="primary"
                                        @click="handleSendCommand"
                                        :disabled="
                                            !wsConnected ||
                                            !commandForm.shard ||
                                            !commandForm.expression.trim()
                                        "
                                        :loading="sendingCommand"
                                    >
                                        发送 (Ctrl+Enter)
                                    </el-button>
                                    <el-button @click="handleClearCommand"> 清空 </el-button>
                                    <span class="command-hint">按 Ctrl+Enter 快速发送</span>
                                </el-form-item>
                            </el-form>
                        </div>
                    </el-card>
                </div>

                <!-- 命令工具箱 -->
                <div ref="toolboxRef" class="section-anchor">
                    <el-card class="console-card">
                        <template #header>
                            <span>命令工具箱</span>
                        </template>
                        <div class="toolbox-list">
                            <div v-for="cmd in toolboxCommands" :key="cmd.id" class="toolbox-item">
                                <div class="toolbox-item-header">
                                    <span class="toolbox-item-name">{{ cmd.label }}</span>
                                    <el-tag size="small" type="info">{{ cmd.id }}</el-tag>
                                </div>
                                <div class="toolbox-item-desc">{{ cmd.description }}</div>
                                <el-button
                                    size="small"
                                    type="primary"
                                    :disabled="!wsConnected"
                                    @click="executeToolboxCommand(cmd)"
                                >
                                    执行
                                </el-button>
                            </div>
                        </div>
                    </el-card>
                </div>

                <!-- 历史命令 -->
                <div ref="historyRef" class="section-anchor">
                    <el-card class="console-card">
                        <template #header>
                            <div class="console-header">
                                <span>历史命令</span>
                                <el-button
                                    size="small"
                                    @click="handleClearHistory"
                                    :disabled="commandHistory.length === 0"
                                >
                                    清空历史
                                </el-button>
                            </div>
                        </template>
                        <div v-if="commandHistory.length === 0" class="history-placeholder">
                            <el-empty description="暂无历史命令" :image-size="60" />
                        </div>
                        <div v-else class="history-list">
                            <div
                                v-for="(item, index) in commandHistory"
                                :key="index"
                                class="history-item"
                                @click="reuseCommand(item)"
                                @dblclick="resendCommand(item)"
                            >
                                <span class="history-shard-tag">
                                    <el-tag size="small">{{ item.shard }}</el-tag>
                                </span>
                                <code class="history-expression">{{ item.expression }}</code>
                                <span class="history-time">{{ item.time }}</span>
                            </div>
                        </div>
                    </el-card>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";

import PanelSidebar from "@/components/sidebar/PanelSidebar.vue";
import type { SidebarCategory } from "@/components/sidebar/PanelSidebar.vue";
import { ElMessage } from "element-plus";
import {
    getPlayerInfo,
    getSessionToken,
    initWebSocket,
    authSessionToken,
    subscribeConsole,
    parseMessage,
    sendConsoleCommand,
    closeWebSocket as apiCloseWs,
    setCurrentServer,
    getUserShards,
} from "@/utils/screepsApi";
import { loadUploadedData } from "@/utils/uploadData";

// ==================== 类型定义 ====================

interface ConsoleMessage {
    id: number;
    type: "log" | "result";
    text: string;
    displayHtml: string;
    shard: string | null;
    time: string;
}

interface CommandHistoryItem {
    expression: string;
    shard: string;
    time: string;
}

interface DebugLog {
    level: "info" | "warn" | "error" | "success";
    message: string;
    time: string;
}

// ==================== 状态 ====================

// 侧栏
const activeCategory = ref("login");
const mainContentRef = ref<HTMLElement | null>(null);
const loginRef = ref<HTMLElement | null>(null);
const consoleRef = ref<HTMLElement | null>(null);
const commandRef = ref<HTMLElement | null>(null);
const toolboxRef = ref<HTMLElement | null>(null);
const historyRef = ref<HTMLElement | null>(null);

const categoryRefMap: Record<string, ReturnType<typeof ref<HTMLElement | null>>> = {
    login: loginRef,
    console: consoleRef,
    command: commandRef,
    toolbox: toolboxRef,
    history: historyRef,
};

const sidebarCategories = computed<SidebarCategory[]>(() => [
    { key: "login", label: "连接设置" },
    { key: "console", label: "控制台输出" },
    { key: "command", label: "发送命令" },
    { key: "toolbox", label: "命令工具箱" },
    { key: "history", label: "历史命令" },
]);

function scrollToCategory(key: string): void {
    activeCategory.value = key;
    categoryRefMap[key]?.value?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ==================== Token & 连接 ====================

const STORAGE_KEY_TOKEN = "screeps-console-token";
const STORAGE_KEY_SERVER = "screeps-console-server";
const STORAGE_KEY_HISTORY = "screeps-console-history";
const STORAGE_KEY_CUSTOM_HOST = "screeps-console-custom-host";
const STORAGE_KEY_CUSTOM_PORT = "screeps-console-custom-port";
const STORAGE_KEY_LOGIN_METHOD = "screeps-console-login-method";
const STORAGE_KEY_EMAIL = "screeps-console-email";
const STORAGE_KEY_REMEMBER_PASSWORD = "screeps-console-remember-password";
const STORAGE_KEY_PASSWORD = "screeps-console-password";

const loginForm = ref({
    loginMethod: (localStorage.getItem(STORAGE_KEY_LOGIN_METHOD) || "token") as
        | "token"
        | "password",
    token: localStorage.getItem(STORAGE_KEY_TOKEN) || "",
    email: localStorage.getItem(STORAGE_KEY_EMAIL) || "",
    password: "",
    rememberPassword: localStorage.getItem(STORAGE_KEY_REMEMBER_PASSWORD) === "true",
    server: localStorage.getItem(STORAGE_KEY_SERVER) || "screeps.com",
    customHost: localStorage.getItem(STORAGE_KEY_CUSTOM_HOST) || "127.0.0.1",
    customPort: localStorage.getItem(STORAGE_KEY_CUSTOM_PORT) || "21025",
});

const wsConnected = ref(false);
const connecting = ref(false);
const userName = ref("");

let ws: WebSocket | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

const connectionStatusText = computed(() => {
    if (connecting.value) return "连接中...";
    if (wsConnected.value) return "已连接";
    return "未连接";
});

const statusTagType = computed<"warning" | "success" | "info">(() => {
    if (connecting.value) return "warning";
    if (wsConnected.value) return "success";
    return "info";
});

// ==================== 调试日志 ====================

const debugLogs = ref<DebugLog[]>([]);

function addDebugLog(level: DebugLog["level"], message: string): void {
    const now = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    debugLogs.value.push({ level, message, time });
    if (debugLogs.value.length > 100) {
        debugLogs.value = debugLogs.value.slice(-100);
    }
    console.log(`[ConsolePanel][${level}] ${message}`);
}

function debugTagType(level: DebugLog["level"]): "info" | "warning" | "danger" | "success" {
    switch (level) {
        case "info":
            return "info";
        case "warn":
            return "warning";
        case "error":
            return "danger";
        case "success":
            return "success";
    }
}

// ==================== 控制台消息 ====================

const consoleMessages = ref<ConsoleMessage[]>([]);
const shardFilter = ref<string>("");
const consoleListRef = ref<HTMLElement | null>(null);
const availableShards = ref<string[]>([]);
const consoleMsgIdCounter = ref(0);
const autoScroll = ref(true);

const filteredConsoleMessages = computed(() => {
    if (shardFilter.value === "") return consoleMessages.value;
    return consoleMessages.value.filter((m) => m.shard === shardFilter.value);
});

// ==================== 消息触发器系统 ====================

/** 消息触发器：匹配特定前缀的消息并自动执行回调 */
interface MessageTrigger {
    /** 用于匹配的前缀 */
    prefix: string;
    /** 触发时执行的回调，参数为完整消息文本（已剥离分片前缀）和分片 */
    handler: (text: string, shard: string | null) => void | Promise<void>;
    /** 是否抑制该前缀消息在控制台中的输出（默认 false，即正常输出） */
    suppressConsoleOutput?: boolean;
    /** 是否在控制台消息列表中输出触发器执行成功的消息（默认 false） */
    logTriggerSuccess?: boolean;
}

/** 已注册的消息触发器列表 */
const messageTriggers: MessageTrigger[] = [];

/**
 * 注册一个消息触发器。当控制台收到以指定前缀开头的消息时，自动调用 handler。
 * @param prefix - 要匹配的消息前缀（只匹配纯文本，不考虑时间/分片等信息）
 * @param handler - 匹配成功后执行的回调函数
 * @param options - 可选配置
 * @param options.suppressConsoleOutput - 若为 true，该前缀的消息不会显示在控制台输出中
 * @param options.logTriggerSuccess - 若为 true，handler 执行成功后自动在控制台输出一条成功消息
 */
function registerMessageTrigger(
    prefix: string,
    handler: MessageTrigger["handler"],
    options?: { suppressConsoleOutput?: boolean; logTriggerSuccess?: boolean },
): void {
    // 避免重复注册相同前缀
    if (messageTriggers.some((t) => t.prefix === prefix)) {
        addDebugLog("warn", `消息触发器 "${prefix}" 已存在，跳过重复注册`);
        return;
    }
    messageTriggers.push({
        prefix,
        handler,
        suppressConsoleOutput: options?.suppressConsoleOutput ?? false,
        logTriggerSuccess: options?.logTriggerSuccess ?? false,
    });
    const flags: string[] = [];
    if (options?.suppressConsoleOutput) flags.push("抑制控制台输出");
    if (options?.logTriggerSuccess) flags.push("记录触发成功");
    addDebugLog(
        "info",
        `已注册消息触发器: "${prefix}"${flags.length > 0 ? ` (${flags.join(", ")})` : ""}`,
    );
}

/**
 * 取消注册一个消息触发器
 * @param prefix - 要取消的前缀
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function unregisterMessageTrigger(prefix: string): void {
    const idx = messageTriggers.findIndex((t) => t.prefix === prefix);
    if (idx !== -1) {
        messageTriggers.splice(idx, 1);
        addDebugLog("info", `已取消消息触发器: "${prefix}"`);
    }
}

/**
 * 同步检查：消息是否被任意触发器的 suppressConsoleOutput 抑制。
 */
function checkMessageSuppression(text: string): boolean {
    for (const trigger of messageTriggers) {
        if (text.startsWith(trigger.prefix) && trigger.suppressConsoleOutput) {
            return true;
        }
    }
    return false;
}

/**
 * 执行匹配的触发器回调。
 * - 同步 handler：直接执行，异常由 try/catch 捕获
 * - 异步 handler：fire-and-forget，通过 .then/.catch 处理后续
 * - logTriggerSuccess 的消息在 handler 完成后推入控制台消息列表
 */
function executeMessageTriggers(text: string, shard: string | null): void {
    for (const trigger of messageTriggers) {
        if (!text.startsWith(trigger.prefix)) continue;

        const onSuccess = () => {
            if (trigger.logTriggerSuccess) {
                consoleMessages.value.push({
                    id: ++consoleMsgIdCounter.value,
                    type: "log",
                    text: `触发器 "${trigger.prefix}" 执行成功`,
                    displayHtml: `触发器 &quot;${trigger.prefix}&quot; 执行成功`,
                    shard,
                    time: formatTime(),
                });
                if (consoleMessages.value.length > 100) {
                    consoleMessages.value = consoleMessages.value.slice(-100);
                }
            }
        };
        const onError = (e: unknown) => {
            addDebugLog("error", `消息触发器 "${trigger.prefix}" 执行异常: ${e}`);
        };

        try {
            const result = trigger.handler(text, shard);
            if (result instanceof Promise) {
                result.then(onSuccess).catch(onError);
            } else {
                onSuccess();
            }
        } catch (e) {
            onError(e);
        }
    }
}

// ==================== 命令工具箱 ====================

interface ToolboxCommand {
    id: string;
    label: string;
    description: string;
    expression: string;
}

const toolboxCommands = ref<ToolboxCommand[]>([
    {
        id: "uiDataDownload",
        label: "更新 UI 数据",
        description: "更新当前 shard 的数据到 UI 面板",
        expression: "uiDataDownload",
    },
]);

function executeToolboxCommand(cmd: ToolboxCommand): void {
    // 自动选择一个分片
    if (!commandForm.value.shard && availableShards.value.length > 0) {
        commandForm.value.shard = availableShards.value[0]!;
    }
    // 填充命令表达式，复用 handleSendCommand 的发送/历史/错误处理
    commandForm.value.expression = cmd.expression;
    handleSendCommand();
}

// ==================== 命令 ====================

const commandForm = ref({ shard: "", expression: "" });
const sendingCommand = ref(false);
const commandHistory = ref<CommandHistoryItem[]>(loadHistory());

function saveHistory(): void {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(commandHistory.value));
}

function loadHistory(): CommandHistoryItem[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
        if (raw) return JSON.parse(raw) as CommandHistoryItem[];
    } catch {
        // ignore
    }
    return [];
}

// ==================== 工具函数 ====================

function formatTime(): string {
    const now = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function extractShard(text: string): string | undefined {
    const m = text.match(/^\[([^\]]+)\]/);
    if (m) return m[1];
    const m2 = text.match(/^\(([^)]+)\)/);
    if (m2) return m2[1];
    return undefined;
}

function parseConsoleHtml(text: string): string {
    let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    html = html.replace(/&lt;text\s+style="color:\s*([^"]+?)"\s*&gt;/g, '<span style="color: $1">');
    html = html.replace(/&lt;text\s+style='color:\s*([^']+?)'\s*&gt;/g, "<span style='color: $1'>");
    html = html.replace(/&lt;\/text&gt;/g, "</span>");
    return html;
}

function addConsoleMessage(
    type: "log" | "result",
    text: string,
    explicitShard?: string | null,
): void {
    const shard = explicitShard ?? extractShard(text);
    const cleanText = text;
    const resolvedShard = shard || commandForm.value.shard || null;

    // 更新可用分片列表（无论是否抑制输出都需要）
    if (resolvedShard && !availableShards.value.includes(resolvedShard)) {
        availableShards.value.push(resolvedShard);
        if (availableShards.value.length === 1) {
            commandForm.value.shard = resolvedShard;
        }
    }

    // 同步检查抑制：若匹配的触发器要求抑制，只执行回调而不添加原始消息到控制台
    if (checkMessageSuppression(cleanText)) {
        executeMessageTriggers(cleanText, resolvedShard);
        return;
    }

    const displayHtml = parseConsoleHtml(cleanText);

    consoleMessages.value.push({
        id: ++consoleMsgIdCounter.value,
        type,
        text: cleanText,
        displayHtml,
        shard: resolvedShard,
        time: formatTime(),
    });
    if (consoleMessages.value.length > 100) {
        consoleMessages.value = consoleMessages.value.slice(-100);
    }
    if (autoScroll.value) {
        nextTick(() => {
            const el = consoleListRef.value;
            if (el) {
                el.scrollTop = el.scrollHeight;
            }
        });
    }

    // 执行匹配的触发器（非抑制路径）
    executeMessageTriggers(cleanText, resolvedShard);
}

// ==================== 自动滚动 ====================

const SCROLL_AT_BOTTOM_THRESHOLD = 20;

function handleConsoleScroll(): void {
    const el = consoleListRef.value;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_AT_BOTTOM_THRESHOLD;
    autoScroll.value = atBottom;
}

function toggleAutoScroll(): void {
    autoScroll.value = !autoScroll.value;
    if (autoScroll.value) {
        nextTick(() => {
            const el = consoleListRef.value;
            if (el) {
                el.scrollTop = el.scrollHeight;
            }
        });
    }
}

// ==================== 重连逻辑 ====================

function stopHeartbeat(): void {
    if (heartbeatTimer !== null) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }
}

function cancelReconnect(): void {
    if (reconnectTimer !== null) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }
}

// ==================== 连接 ====================

/** 根据 loginForm 解析出实际使用的服务器字符串 */
function resolveServer(): string {
    if (loginForm.value.server === "__custom__") {
        const host = loginForm.value.customHost.trim();
        const port = loginForm.value.customPort.trim();
        if (!host || !port) return "";
        return `${host}:${port}`;
    }
    return loginForm.value.server;
}

/** 服务器选择切换时，保存自定义配置到 localStorage */
function handleServerChange(): void {
    localStorage.setItem(STORAGE_KEY_SERVER, loginForm.value.server);
    localStorage.setItem(STORAGE_KEY_CUSTOM_HOST, loginForm.value.customHost);
    localStorage.setItem(STORAGE_KEY_CUSTOM_PORT, loginForm.value.customPort);
}

async function handleConnect(): Promise<void> {
    const server = resolveServer();

    if (!server) {
        ElMessage.warning("请输入自定义服务器的主机地址和端口");
        return;
    }

    // 保存服务器设置
    localStorage.setItem(STORAGE_KEY_SERVER, loginForm.value.server);
    localStorage.setItem(STORAGE_KEY_CUSTOM_HOST, loginForm.value.customHost);
    localStorage.setItem(STORAGE_KEY_CUSTOM_PORT, loginForm.value.customPort);
    localStorage.setItem(STORAGE_KEY_LOGIN_METHOD, loginForm.value.loginMethod);
    setCurrentServer(server);

    connecting.value = true;

    // 根据登录方式获取 token
    let token: string;
    if (loginForm.value.loginMethod === "password") {
        const email = loginForm.value.email.trim();
        const password = loginForm.value.password;
        if (!email) {
            connecting.value = false;
            ElMessage.warning("请输入邮箱");
            return;
        }
        if (!password) {
            connecting.value = false;
            ElMessage.warning("请输入密码");
            return;
        }
        addDebugLog("info", `服务器: ${server}`);
        addDebugLog("info", `邮箱登录: ${email}`);
        try {
            addDebugLog("info", "正在通过邮箱密码获取 Token...");
            token = await getSessionToken(email, password);
            addDebugLog("success", `Token 获取成功 (${token.length}字符)`);
            // 保存获取到的 token 和邮箱
            localStorage.setItem(STORAGE_KEY_TOKEN, token);
            localStorage.setItem(STORAGE_KEY_EMAIL, email);
            localStorage.setItem(
                STORAGE_KEY_REMEMBER_PASSWORD,
                String(loginForm.value.rememberPassword),
            );
            if (loginForm.value.rememberPassword) {
                localStorage.setItem(STORAGE_KEY_PASSWORD, password);
            } else {
                localStorage.removeItem(STORAGE_KEY_PASSWORD);
            }
            loginForm.value.token = token;
        } catch (error) {
            connecting.value = false;
            const msg = error instanceof Error ? error.message : "登录失败";
            addDebugLog("error", `邮箱登录失败: ${msg}`);
            ElMessage.error(msg);
            return;
        }
    } else {
        token = loginForm.value.token.trim();
        if (!token) {
            connecting.value = false;
            ElMessage.warning("请输入 Token");
            return;
        }
        localStorage.setItem(STORAGE_KEY_TOKEN, token);
        addDebugLog("info", `服务器: ${server}`);
        addDebugLog("info", `Token: ${token.substring(0, 8)}... (${token.length}字符)`);
    }

    try {
        // ===== step 1: 获取玩家信息 =====
        addDebugLog("info", "步骤1: 获取玩家信息...");
        const playerInfo = await getPlayerInfo(token);
        userName.value = playerInfo.username;
        addDebugLog("success", `玩家: ${playerInfo.username} (${playerInfo.userId})`);

        // ===== step 2: 建立 WebSocket 连接 =====
        addDebugLog("info", "步骤2: 连接 WebSocket...");
        ws = await initWebSocket(server);
        addDebugLog("success", "WebSocket 已连接");

        // ===== step 3: 设置消息处理器（认证前就位，确保不丢任何消息）=====
        addDebugLog("info", "步骤3: 设置消息处理器...");
        addDebugLog("info", "步骤3: 设置消息处理器...");
        let msgCount = 0;
        ws.onmessage = (event: MessageEvent) => {
            const raw = event.data as string;
            msgCount++;
            addDebugLog("info", `[WS消息 #${msgCount}] 原始长度=${raw.length}，首字符="${raw[0]}"`);

            addDebugLog("info", `[WS消息 #${msgCount} 原文] ${raw}`);

            // 使用 parseMessage 解码（去掉首字符类型标记，解析 JSON）
            let parsed;
            try {
                parsed = parseMessage(raw);
                addDebugLog(
                    "info",
                    `[WS消息 #${msgCount}] parseMessage 结果: length=${parsed.length}`,
                );

                // 处理双重编码: 实际格式为 m[["channel", data]] 而非 m["channel", data]
                // parsed[0] 才是真正的 [channel, data] 数组
                if (parsed.length === 1 && Array.isArray(parsed[0]) && parsed[0].length >= 2) {
                    addDebugLog("info", `[WS消息 #${msgCount}] 检测到外层数组包装，自动展开`);
                    parsed = parsed[0];
                    addDebugLog("info", `[WS消息 #${msgCount}] 展开后 length=${parsed.length}`);
                }

                if (parsed.length > 0) {
                    addDebugLog(
                        "info",
                        `[WS消息 #${msgCount}] parsed[0]="${String(parsed[0]).substring(0, 100)}"`,
                    );
                }
                if (parsed.length > 1) {
                    addDebugLog(
                        "info",
                        `[WS消息 #${msgCount}] parsed[1]=${JSON.stringify(parsed[1]).substring(0, 200)}`,
                    );
                }
            } catch (e) {
                addDebugLog("error", `[WS消息 #${msgCount}] parseMessage 异常: ${e}`);
                parsed = [""];
            }

            if (!parsed || parsed.length < 2) {
                addDebugLog("warn", `[WS消息 #${msgCount}] parsed 长度不足，跳过`);
                return;
            }

            const channel = parsed[0] as string;
            const payload = parsed[1] as Record<string, unknown> | undefined;

            addDebugLog("info", `[WS消息 #${msgCount}] channel="${channel}"`);

            if (!payload) {
                addDebugLog("warn", `[WS消息 #${msgCount}] payload 为空`);
                return;
            }

            addDebugLog(
                "info",
                `[WS消息 #${msgCount}] payload keys=${Object.keys(payload).join(", ")}`,
            );

            // 控制台消息: channel 包含 "/console"
            if (channel.includes("/console")) {
                const msgPayload = payload as {
                    messages: { log: string[]; results: string[] };
                    shard: string;
                };
                const messages = msgPayload.messages;

                addDebugLog(
                    "info",
                    `[WS消息 #${msgCount}] 控制台消息，messages=${messages ? "存在" : "不存在"}`,
                );

                if (!messages) {
                    addDebugLog(
                        "warn",
                        `[WS消息 #${msgCount}] messages 字段不存在，payload=${JSON.stringify(payload).substring(0, 200)}`,
                    );
                    return;
                }

                const logArr = messages.log;
                const resultArr = messages.results;
                const logCount = Array.isArray(logArr) ? logArr.length : 0;
                const resultCount = Array.isArray(resultArr) ? resultArr.length : 0;

                addDebugLog(
                    "info",
                    `[WS消息 #${msgCount}] log=${logCount}条, result=${resultCount}条`,
                );

                if (logCount > 0 && logArr) {
                    for (const msg of logArr) {
                        addDebugLog("info", `[log] ${String(msg).substring(0, 200)}`);
                        addConsoleMessage("log", String(msg), msgPayload.shard);
                    }
                }
                if (resultCount > 0 && resultArr) {
                    for (const msg of resultArr) {
                        addDebugLog("info", `[result] ${String(msg).substring(0, 200)}`);
                        addConsoleMessage("result", String(msg), msgPayload.shard);
                    }
                }

                if (logCount === 0 && resultCount === 0) {
                    addDebugLog("warn", `[WS消息 #${msgCount}] 数组为空或无数据`);
                }
            } else {
                addDebugLog("info", `[WS消息 #${msgCount}] 非控制台消息 (channel="${channel}")`);
            }
        };

        // ===== step 4: 发送认证（authSessionToken 使用 addEventListener，不覆盖 onmessage）=====
        addDebugLog("info", "步骤4: 发送认证...");
        await authSessionToken(ws, playerInfo.sessionToken);
        addDebugLog("success", "WebSocket 认证通过");

        // ===== step 5: 订阅控制台 =====
        addDebugLog("info", "步骤5: 订阅控制台...");
        await subscribeConsole(ws, playerInfo.userId);
        addDebugLog("success", "已订阅控制台");

        // ===== step 6: 获取用户可用分片列表 =====
        try {
            addDebugLog("info", "步骤6: 获取用户可用分片列表...");
            const shards = await getUserShards(token);
            availableShards.value = shards;
            addDebugLog("success", `获取到 ${shards.length} 个分片: ${shards.join(", ")}`);
            if (shards.length > 0) {
                commandForm.value.shard = shards[0] as string;
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : "获取分片失败";
            addDebugLog("warn", `获取分片列表失败: ${msg}`);
        }

        wsConnected.value = true;
        connecting.value = false;
        ElMessage.success("已连接到 Screeps 控制台");
    } catch (error) {
        const msg = error instanceof Error ? error.message : "连接失败";
        addDebugLog("error", `连接失败: ${msg}`);
        connecting.value = false;
        wsConnected.value = false;
        ElMessage.error(msg);
    }
}

function handleDisconnect(): void {
    cancelReconnect();
    stopHeartbeat();
    apiCloseWs(ws);
    ws = null;
    wsConnected.value = false;
    userName.value = "";
    ElMessage.info("已断开连接");
}

function handleClearToken(): void {
    loginForm.value.token = "";
    loginForm.value.email = "";
    loginForm.value.password = "";
    loginForm.value.rememberPassword = false;
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_EMAIL);
    localStorage.removeItem(STORAGE_KEY_PASSWORD);
    localStorage.removeItem(STORAGE_KEY_REMEMBER_PASSWORD);
    ElMessage.info("凭据已清除");
}

// ==================== 发送命令 ====================

async function handleSendCommand(): Promise<void> {
    const expression = commandForm.value.expression.trim();
    const shard = commandForm.value.shard;

    if (!expression || !shard) return;
    if (!ws || !wsConnected.value) {
        ElMessage.error("WebSocket 未连接");
        return;
    }

    // 在控制台显示发送的命令
    addConsoleMessage("result", `[${shard}] > ${expression}`);

    const token = loginForm.value.token.trim();
    sendingCommand.value = true;
    addDebugLog("info", `发送命令 [${shard}]: ${expression.substring(0, 80)}...`);

    try {
        await sendConsoleCommand(expression, shard, token);

        // 合并相同历史命令：删除旧条目，将新条目移到顶部
        const existingIdx = commandHistory.value.findIndex(
            (h) => h.expression === expression && h.shard === shard,
        );
        if (existingIdx !== -1) {
            commandHistory.value.splice(existingIdx, 1);
        }
        commandHistory.value.unshift({ expression, shard, time: formatTime() });
        if (commandHistory.value.length > 100)
            commandHistory.value = commandHistory.value.slice(0, 100);
        saveHistory();
        commandForm.value.expression = "";
        addDebugLog("success", "命令已发送");
    } catch (error) {
        const msg = error instanceof Error ? error.message : "发送失败";
        addDebugLog("error", `命令发送失败: ${msg}`);
        ElMessage.error(msg);
    } finally {
        sendingCommand.value = false;
    }
}

function handleCommandKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === "Enter") {
        event.preventDefault();
        handleSendCommand();
    }
}

function handleClearCommand(): void {
    commandForm.value.expression = "";
}
function handleClearConsole(): void {
    consoleMessages.value = [];
    ElMessage.info("控制台已清空");
}

function handleCopyConsole(): void {
    const text = filteredConsoleMessages.value
        .map(
            (m) => `[${m.time}]${m.shard ? ` [${m.shard}]` : ""} ${m.text.replace(/<[^>]*>/g, "")}`,
        )
        .join("\n");
    navigator.clipboard.writeText(text).then(
        () => ElMessage.success("已复制"),
        () => ElMessage.error("复制失败"),
    );
}

function handleClearHistory(): void {
    commandHistory.value = [];
    saveHistory();
    ElMessage.info("历史已清空");
}

function reuseCommand(item: CommandHistoryItem): void {
    commandForm.value.expression = item.expression;
    commandForm.value.shard = item.shard;
    scrollToCategory("command");
}

function resendCommand(item: CommandHistoryItem): void {
    commandForm.value.expression = item.expression;
    commandForm.value.shard = item.shard;
    handleSendCommand();
}

// ==================== 生命周期 ====================

/** 关闭标签页 / 组件真正销毁时清理 WebSocket */
function cleanupWs(): void {
    cancelReconnect();
    stopHeartbeat();
    apiCloseWs(ws);
    ws = null;
}

onMounted(() => {
    const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    const savedServer = localStorage.getItem(STORAGE_KEY_SERVER);
    const savedLoginMethod = localStorage.getItem(STORAGE_KEY_LOGIN_METHOD);
    const savedEmail = localStorage.getItem(STORAGE_KEY_EMAIL);
    if (savedToken) loginForm.value.token = savedToken;
    if (savedServer) loginForm.value.server = savedServer;
    if (savedLoginMethod) loginForm.value.loginMethod = savedLoginMethod as "token" | "password";
    if (savedEmail) loginForm.value.email = savedEmail;
    // 恢复已保存的密码
    if (loginForm.value.rememberPassword) {
        const savedPassword = localStorage.getItem(STORAGE_KEY_PASSWORD);
        if (savedPassword) loginForm.value.password = savedPassword;
    }

    // ===== 注册消息触发器 =====

    // (ui data) 前缀：用于接收 UI 数据消息（抑制控制台输出，避免大量数据刷屏）
    registerMessageTrigger(
        "(ui data)",
        async (text, shard) => {
            addDebugLog(
                "success",
                `[UI Data] 收到消息 (shard=${shard}): ${text.substring(0, 50)}...`,
            );

            // 剥离 "(ui data)" 前缀，提取实际数据内容
            const dataContent = text.substring("(ui data)".length).trim();
            if (!dataContent) {
                addDebugLog("warn", "[UI Data] 消息内容为空，跳过处理");
                return;
            }

            try {
                const data = await loadUploadedData(dataContent);
                addDebugLog(
                    "success",
                    `[UI Data] 数据加载成功！tick=${data.timeData?.tick}, shard=${data.shardData?.shardName}`,
                );
                ElMessage.success("UI 数据已接收并加载！");
            } catch (error) {
                const msg = error instanceof Error ? error.message : "未知错误";
                addDebugLog("error", `[UI Data] 解析失败: ${msg}`);
                ElMessage.error(`UI 数据解析失败: ${msg}`);
            }
        },
        { suppressConsoleOutput: true, logTriggerSuccess: true },
    );

    // 关闭标签页时断开 WebSocket（比 onUnmounted 更可靠地处理标签页关闭）
    window.addEventListener("beforeunload", cleanupWs);
});

onUnmounted(() => {
    window.removeEventListener("beforeunload", cleanupWs);
    cleanupWs();
});
</script>

<style scoped>
@import "@/assets/styles/panels.css";

/* ==================== 控制台卡片 ==================== */

.console-card {
    margin-bottom: 1rem;
}
.console-card:last-child {
    margin-bottom: 0;
}

:deep(.el-card) {
    background: #ffffff;
    border: 1px solid #e1e8ed;
}

:deep(.el-card__header) {
    padding: 0.75rem 1.25rem;
    border-bottom: 1px solid #e1e8ed;
    font-size: 0.95rem;
    font-weight: 600;
    color: #303133;
}

:deep(.el-card__body) {
    padding: 1.25rem;
}

/* ==================== 登录表单 ==================== */

.login-form {
    max-width: 500px;
}

.custom-server-inputs {
    display: flex;
    align-items: center;
    gap: 4px;
}

.custom-host-input {
    flex: 1;
}

.custom-server-separator {
    font-size: 18px;
    font-weight: bold;
    color: #909399;
    margin: 0 2px;
}

.custom-port-input {
    width: 140px;
    flex-shrink: 0;
}

.connection-status {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 0;
    font-size: 0.9rem;
}

.status-label {
    color: #606266;
}
.user-name {
    color: #409eff;
    font-weight: 500;
}
.connection-info {
    padding-top: 0.25rem;
}
.info-text {
    font-size: 0.85rem;
    color: #909399;
}

/* ==================== 控制台输出 ==================== */

.console-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.console-header-actions {
    display: flex;
    align-items: center;
}

.console-output {
    background-color: #1e1e1e;
    color: #d4d4d4;
    font-family: "Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, "Courier New", monospace;
    font-size: 0.85rem;
    line-height: 1.6;
    border-radius: 4px;
    height: 400px;
}

/* 控制台消息列表 */
.console-list {
    padding: 0.75rem;
    overflow-y: auto;
}

.console-placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.console-line {
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
    padding: 1px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.console-line:last-child {
    border-bottom: none;
}
.console-line-log {
    color: #d4d4d4;
}

.console-line-result {
    color: #6a9955;
    background-color: rgba(106, 153, 85, 0.08);
    border-radius: 2px;
}

.console-timestamp {
    color: #808080;
    font-size: 0.78rem;
    flex-shrink: 0;
    min-width: 4.2rem;
}

.console-shard-label {
    flex-shrink: 0;
    font-size: 0.75rem;
    color: #409eff;
    font-weight: 500;
}

.console-type-label {
    flex-shrink: 0;
    font-size: 0.7rem;
    font-weight: 500;
    padding: 0 3px;
    border-radius: 2px;
}

.console-type-result {
    color: #67c23a;
    background: rgba(103, 194, 58, 0.12);
}

.console-type-log {
    color: #909399;
    background: rgba(144, 147, 153, 0.1);
}
.console-text {
    flex: 1;
    white-space: pre-wrap;
    word-break: break-all;
    overflow-wrap: break-word;
}

.console-output::-webkit-scrollbar {
    width: 6px;
}
.console-output::-webkit-scrollbar-track {
    background: #2d2d2d;
}
.console-output::-webkit-scrollbar-thumb {
    background: #555555;
    border-radius: 3px;
}
.console-output::-webkit-scrollbar-thumb:hover {
    background: #777777;
}

/* ==================== 命令输入 ==================== */

.command-input-area {
    max-width: 800px;
}

.command-hint {
    font-size: 0.8rem;
    color: #909399;
    margin-left: 0.75rem;
}

/* ==================== 命令工具箱 ==================== */

.toolbox-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.toolbox-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    background: #fafbfc;
    transition: background 0.2s;
}

.toolbox-item:hover {
    background: #f0f3f8;
}

.toolbox-item-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 140px;
}

.toolbox-item-name {
    font-weight: 600;
    font-size: 0.9rem;
    color: #303133;
}

.toolbox-item-desc {
    flex: 1;
    font-size: 0.85rem;
    color: #909399;
}

/* ==================== 历史命令 ==================== */

.history-placeholder {
    padding: 1rem 0;
}
.history-list {
    max-height: 300px;
    overflow-y: auto;
}

.history-item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.15s;
    border-bottom: 1px solid #f0f0f0;
}

.history-item:hover {
    background-color: #f5f7fa;
}
.history-item:last-child {
    border-bottom: none;
}
.history-shard-tag {
    flex-shrink: 0;
}

.history-expression {
    flex: 1;
    font-family: "Cascadia Code", "Fira Code", Consolas, monospace;
    font-size: 0.85rem;
    color: #303133;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.history-time {
    flex-shrink: 0;
    font-size: 0.78rem;
    color: #909399;
}

.history-list::-webkit-scrollbar {
    width: 4px;
}
.history-list::-webkit-scrollbar-track {
    background: transparent;
}
.history-list::-webkit-scrollbar-thumb {
    background: #d0d5dd;
    border-radius: 2px;
}

/* ==================== 调试日志 ==================== */

.debug-collapse {
    margin-top: 0.75rem;
}

:deep(.debug-collapse .el-collapse-item__header) {
    font-size: 0.85rem;
    font-weight: 500;
    padding-left: 0.5rem;
    height: 36px;
    line-height: 36px;
}

:deep(.debug-collapse .el-collapse-item__wrap) {
    border-bottom: none;
}
:deep(.debug-collapse .el-collapse-item__content) {
    padding: 0.25rem 0.5rem 0.5rem;
}

.debug-log-list {
    max-height: 200px;
    overflow-y: auto;
    font-family: "Cascadia Code", "Fira Code", Consolas, monospace;
    font-size: 0.78rem;
    background-color: #1e1e1e;
    border-radius: 4px;
    padding: 0.4rem;
}

.debug-log-line {
    display: flex;
    align-items: flex-start;
    gap: 0.3rem;
    padding: 2px 0;
    color: #d4d4d4;
}

.debug-log-time {
    color: #808080;
    flex-shrink: 0;
    min-width: 3.8rem;
}

.debug-log-level {
    flex-shrink: 0;
    font-family: inherit;
    font-size: 0.65rem;
    padding: 0 0.3rem;
    height: auto;
    line-height: 1.3;
}

.debug-log-msg {
    flex: 1;
    word-break: break-all;
    color: #d4d4d4;
}
.debug-level-error .debug-log-msg {
    color: #f48771;
}
.debug-level-warn .debug-log-msg {
    color: #cca700;
}
.debug-level-success .debug-log-msg {
    color: #6a9955;
}

.debug-log-list::-webkit-scrollbar {
    width: 4px;
}
.debug-log-list::-webkit-scrollbar-track {
    background: #2d2d2d;
}
.debug-log-list::-webkit-scrollbar-thumb {
    background: #555555;
    border-radius: 2px;
}
</style>
