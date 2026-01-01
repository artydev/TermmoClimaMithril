import { defineConfig } from "vite";

export default defineConfig({
    server: {
        port: 3000,
        open: true,
        cors: true,
    },
    build: {
        outDir: "dist",
        emptyOutDir: true,
        sourcemap: false,
    },
    resolve: {
        alias: {
            "@": "/src",
        },

    },
});