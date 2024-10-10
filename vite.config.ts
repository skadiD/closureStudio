import { defineConfig, type PluginOption } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import viteCompression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
    define: {
        __VUE_PROD_DEVTOOLS__: true,
        __APP_VERSION__: process.env.VITE_APP_VERSION,
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: "modern-compiler",
            },
        },
    },
    plugins: [
        vue({
            isProduction: true,
        }),
        VitePWA({
            filename: "sw.ts",
            registerType: "autoUpdate",
            strategies: "injectManifest",
            devOptions: {
                enabled: true,
                type: "module",
            },
            srcDir: "src",
            injectRegister: false,
            manifest: {
                name: "可露希尔小程序",
                short_name: "ClosurePWA",
                theme_color: "#212121",
                icons: [
                    {
                        src: "./assets/pwa/pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                        purpose: "any",
                    },
                    {
                        src: "./assets/pwa/pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any",
                    },
                    {
                        src: "./assets/pwa/pwa-maskable-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                        purpose: "maskable",
                    },
                    {
                        src: "./assets/pwa/pwa-maskable-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable",
                    },
                ],
                start_url: ".",
                display: "standalone",
                background_color: "#212121",
                description: "ClosureApp",
            },
        }),
        viteCompression({
            verbose: true,
            disable: false,
            threshold: 10240,
            algorithm: "gzip",
            ext: ".gz",
        }),
        visualizer() as any,
    ],
    build: {
        rollupOptions: {
            output: {
                chunkFileNames: "static/js/[hash].js",
                entryFileNames: "static/js/[hash].js",
                assetFileNames: "static/[ext]/[hash].[ext]",
            },
        },
    },
    server: {
        //host: "192.168.8.238"
    },
});
