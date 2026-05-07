import { fileURLToPath, URL } from "node:url";
import http from "node:http";
import https from "node:https";

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
        // 动态代理自定义服务器请求
        {
            name: "custom-api-proxy",
            configureServer(server) {
                server.middlewares.use("/custom-api", (req, res) => {
                    const host = req.headers["x-custom-host"] as string | undefined;
                    const port = req.headers["x-custom-port"] as string | undefined;

                    if (!host || !port) {
                        res.writeHead(400, { "Content-Type": "text/plain" });
                        res.end("Missing X-Custom-Host or X-Custom-Port headers");
                        return;
                    }

                    // 去掉 /custom-api 前缀，拼接实际路径
                    const targetPath = (req.url || "/").replace(/^\/custom-api/, "") || "/";
                    const protocol = port === "443" ? "https" : "http";

                    const proxyReq = (protocol === "https" ? https : http).request(
                        {
                            hostname: host,
                            port: Number(port),
                            path: targetPath,
                            method: req.method,
                            headers: {
                                ...Object.fromEntries(
                                    Object.entries(req.headers).filter(
                                        ([k]) =>
                                            !["host", "x-custom-host", "x-custom-port"].includes(
                                                k.toLowerCase(),
                                            ),
                                    ),
                                ),
                                host: `${host}:${port}`,
                            },
                        },
                        (proxyRes) => {
                            res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
                            proxyRes.pipe(res);
                        },
                    );

                    proxyReq.on("error", (err) => {
                        res.writeHead(502, { "Content-Type": "text/plain" });
                        res.end(`Proxy error: ${err.message}`);
                    });

                    req.pipe(proxyReq);
                });
            },
        },
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
            // 自定义服务器 API: 即 /custom-api，由下方 configureServer 中间件动态代理
        },
        host: "127.0.0.1",
        port: 5189,
        open: true,
    },
});
