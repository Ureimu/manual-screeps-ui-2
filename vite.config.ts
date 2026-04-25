import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import vueDevTools from "vite-plugin-vue-devtools";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vueJsx(),
        vueDevTools(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    base: "/manual-screeps-ui-2/",
    build: {
        rollupOptions: {
            external: ["./src/data/index.ts"],
        },
    },
    server: {
        proxy: {
            // 官方服 API: 请求 /api/auth/me → https://screeps.com/api/auth/me
            "/api": {
                target: "https://screeps.com",
                changeOrigin: true,
            },
            // PTR 测试服 API: 请求 /ptr/api/auth/me → https://screeps.com/ptr/api/auth/me
            "/ptr": {
                target: "https://screeps.com",
                changeOrigin: true,
            },
        },
    },
});
