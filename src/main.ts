import './assets/main.css'

import { createApp, type App as VueApp } from 'vue'
import { createPinia } from 'pinia'
import { decode } from 'js-base64'

import ElementPlus from 'element-plus'

import App from './App.vue'
import router from './router'
import type { OriginScreepsData } from './type/origin'
import { testData } from './data'

// ==================== 渲染函数 ====================
/**
 * 渲染Screeps数据到UI
 * @param data 要渲染的Screeps数据
 */
function runRender(data: OriginScreepsData): void {
    console.log('开始渲染数据:', data)
    // TODO: 在这里实现具体的渲染逻辑
    // 例如：更新Pinia store、更新Vue组件等
    try {
        // 这里可以调用相关的store或其他渲染函数
        console.log('数据渲染完成')
    } catch (error) {
        console.error('渲染过程中出错:', error)
        throw error
    }
}

// ==================== 初始化应用 ====================
const vueApp: VueApp<Element> = createApp(App)

vueApp.use(createPinia())
vueApp.use(router)
vueApp.use(ElementPlus, { size: 'small', zIndex: 3000 })
vueApp.mount('#app')

// ==================== 数据处理逻辑 ====================
// 检查开发环境/生产环境标识 (使用import.meta.env代替process.env以适配Vite)
const isDevelopment = import.meta.env.DEV

if (isDevelopment) {
    // 开发环境：使用测试数据
    console.log('运行在开发环境，使用测试数据')
    const fullData: OriginScreepsData = testData
    try {
        runRender(fullData)
    } catch (error) {
        console.error('开发环境渲染出错:', error)
    }
} else {
    // 生产环境：监听来自游戏的数据
    console.log('运行在生产环境，等待游戏数据...')
    let fullData: OriginScreepsData

    window.addEventListener('message', ({ data }) => {
        try {
            fullData = data
            console.log('收到游戏数据:', fullData)

            if (typeof fullData === 'string') {
                // 如果数据是字符串，尝试进行Base64解码和JSON解析
                const decodedData = decode(fullData)
                const parsedData = JSON.parse(decodedData) as OriginScreepsData
                console.log('解码后的数据:', parsedData)
                runRender(parsedData)
            } else {
                // 如果数据已经是对象，直接渲染
                runRender(fullData)
            }
        } catch (error) {
            const errorMessage = `代码错误，如果可以的话，请联系 Ureium\n${(error as Error).stack}`
            alert(errorMessage)
            console.error('消息处理错误:', error)
            throw error
        }
    })

    // 监听游戏传入进来的数据并进行渲染
    if (window.opener) {
        console.log('向游戏窗口发送就绪信号')
        window.opener.postMessage('ready', '*')
    }
}
