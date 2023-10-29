import { defineConfig, type PluginOption } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import viteCompression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __VUE_PROD_DEVTOOLS__: true,
  },
  plugins: [
    vue({
      isProduction: true
    }),
    VitePWA({
      filename: 'sw.ts',
      registerType: "autoUpdate",
      strategies: "injectManifest",
      devOptions:{
        enabled: true,
        type: 'module',
      },
      srcDir: 'src',
      injectRegister: false,
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
        chunkFileNames: 'static/js/[hash].js',
        entryFileNames: 'static/js/[hash].js',
        assetFileNames: 'static/[ext]/[hash].[ext]',
      },
    }
  },
  server: {
    //host: "192.168.8.238"
  },
});
