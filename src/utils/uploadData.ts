/**
 * 上传数据工具模块
 *
 * 提供从文件内容字符串加载 Screeps 数据的功能。
 * 支持两种格式：
 *   1. TypeScript 模块格式（export const testData: OriginScreepsData = {...}）
 *   2. 纯 JSON 格式
 *
 * 从 NavigationBar.vue 中抽取，供 ConsolePanel 等组件复用。
 */

import { useAppStore } from "@/stores/app";
import { convertScreepsData } from "@/utils/convertScreepsData";
import type { OriginScreepsData } from "@/type/player/AI/AIUreium/ui/type";

/**
 * 解析上传/接收到的数据内容，并更新应用 store。
 *
 * @param content - 文件内容字符串（TypeScript 模块或纯 JSON）
 * @returns 解析并转换后的 OriginScreepsData
 * @throws 如果解析或验证失败，抛出错误
 */
export async function loadUploadedData(content: string): Promise<OriginScreepsData> {
    let data: OriginScreepsData;

    // 检查是否是 TypeScript 模块格式
    if (content.includes("export const testData")) {
        // 找到赋值语句中 JSON 对象的起始位置
        const prefix = "export const testData: OriginScreepsData =";
        const prefixIndex = content.indexOf(prefix);
        if (prefixIndex === -1) {
            throw new Error("无法找到 testData 导出语句");
        }

        // 从 prefix 之后找到第一个 '{'
        let braceStart = content.indexOf("{", prefixIndex + prefix.length);
        if (braceStart === -1) {
            // 原始内容中找不到，尝试 decodeURIComponent 解码后再查找
            content = decodeURIComponent(content);
            // 重新定位 prefix（解码后位置可能变化）
            const decodedPrefixIndex = content.indexOf(prefix);
            if (decodedPrefixIndex !== -1) {
                braceStart = content.indexOf("{", decodedPrefixIndex + prefix.length);
            }
            if (braceStart === -1) {
                throw new Error("无法找到 JSON 对象的起始位置");
            }
        }

        // 通过大括号计数找到匹配的 '}'
        let depth = 0;
        let jsonEnd = -1;
        for (let i = braceStart; i < content.length; i++) {
            const ch = content[i];
            if (ch === "{") {
                depth++;
            } else if (ch === "}") {
                depth--;
                if (depth === 0) {
                    jsonEnd = i;
                    break;
                }
            }
        }

        if (jsonEnd === -1) {
            throw new Error("无法找到 JSON 对象的结束位置");
        }

        const dataStr = content.slice(braceStart, jsonEnd + 1);
        // 不要对整个 JSON 调用 decodeURIComponent——外层是纯 JSON。
        // 内层字符串（rawTimeSeriesData、memoryString）由 convertScreepsData 单独解码。
        data = JSON.parse(dataStr);
    } else {
        // 尝试直接解析为 JSON
        data = JSON.parse(content);
    }

    // 验证数据格式
    if (!data.type || data.type !== "OriginScreepsData") {
        throw new Error("无效的数据格式：缺少 OriginScreepsData 类型标识");
    }

    // 更新 store 中的数据
    const appStore = useAppStore();
    appStore.setScreepsData(convertScreepsData(data));

    return data;
}
