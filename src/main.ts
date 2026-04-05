import "./assets/main.css";

import { createApp, type App as VueApp } from "vue";
import { createPinia } from "pinia";

import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

import App from "./App.vue";
import router from "./router";
import { useAppStore } from "./stores/app";
import type { OriginScreepsData } from "@/type/player/AI/AIUreium/ui/type";
import { convertScreepsData } from "./utils/convertScreepsData";

// ==================== 渲染函数 ====================
/**
 * 渲染Screeps数据到UI
 * @param data 要渲染的Screeps数据
 */
function runRender(data: OriginScreepsData): void {
    console.log("开始渲染数据:", data);
    try {
        const appStore = useAppStore();

        appStore.setScreepsData(convertScreepsData(data));
        console.log("数据已更新到 Pinia store");
    } catch (error) {
        console.error("渲染过程中出错:", error);
        throw error;
    }
}

// ==================== 初始化应用 ====================
const pinia = createPinia();
const vueApp: VueApp<Element> = createApp(App);

vueApp.use(pinia);
vueApp.use(router);
vueApp.use(ElementPlus, { size: "small", zIndex: 3000 });
vueApp.mount("#app");

// ==================== 数据处理逻辑 ====================
// 检查开发环境/生产环境标识
const isDevelopment = import.meta.env.DEV;

if (isDevelopment) {
    // 开发环境：检测测试数据模块是否存在，如果存在则导入
    console.log("运行在开发环境，检测测试数据模块...");

    // 使用 Vite 的 import.meta.glob 来检查模块是否存在
    try {
        // 使用 import.meta.glob 动态检查模块
        const modules = import.meta.glob("./data/index.ts", { eager: false });

        if (modules["./data/index.ts"]) {
            // 模块存在，动态导入
            const module = (await modules["./data/index.ts"]()) as unknown as {
                testData: OriginScreepsData;
            };
            if (module && module.testData) {
                console.log("测试数据模块存在，加载测试数据...");
                const fullData: OriginScreepsData = module.testData;
                runRender(fullData);
                console.log("测试数据加载完成");
            } else {
                console.log("测试数据模块存在，但没有 testData 导出，跳过测试数据加载");
            }
        } else {
            console.log("测试数据模块不存在，跳过测试数据加载");
        }
    } catch (error) {
        // 模块加载失败
        console.log("测试数据模块加载失败:", error);
    }
} else {
    // 生产环境：监听来自游戏的数据
    console.log("运行在生产环境，等待游戏数据...");
    let fullData: OriginScreepsData;

    window.addEventListener("message", ({ data }) => {
        try {
            fullData = data;

            console.log("收到游戏数据:", fullData);

            if (typeof fullData === "string") {
                // 如果数据是字符串，尝试进行JSON解析
                const parsedData = JSON.parse(fullData) as OriginScreepsData;
                if (parsedData.type !== "OriginScreepsData") {
                    return;
                }
                console.log("解码后的数据:", parsedData);
                runRender(parsedData);
            } else {
                if (fullData.type !== "OriginScreepsData") {
                    return;
                }
                // 如果数据已经是对象，直接渲染
                runRender(fullData);
            }
        } catch (error) {
            const errorMessage = `代码错误，如果可以的话，请联系 Ureium\n${(error as Error).stack}`;
            alert(errorMessage);
            console.error("消息处理错误:", error);
            throw error;
        }
    });

    // 监听游戏传入进来的数据并进行渲染
    if (window.opener) {
        console.log("向游戏窗口发送就绪信号");
        window.opener.postMessage("ready", "*");
    }
}
