import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "examples",
  base: "/demos/",
  resolve: {
    alias: {
      "@shaisrc/tty": resolve(__dirname, "src/index.ts"),
    },
  },
  build: {
    outDir: "../docs/public/demos",
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "examples/index.html"),
        "basic-game": resolve(__dirname, "examples/basic-game.ts"),
        "menu-demo": resolve(__dirname, "examples/menu-demo.ts"),
        "rpg-ui": resolve(__dirname, "examples/rpg-ui.ts"),
        "snake-game": resolve(__dirname, "examples/snake-game.ts"),
        "space-invaders": resolve(__dirname, "examples/space-invaders.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        format: "es",
      },
    },
  },
});
