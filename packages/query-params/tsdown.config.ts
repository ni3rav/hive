import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "react-router": "src/react-router.ts",
    vanilla: "src/vanilla.ts",
  },
  format: ["esm", "cjs"],
  platform: "browser",
  target: "es2020",
  dts: true,
  sourcemap: true,
  exports: true,
  clean: true,
  external: ["react", "react-router-dom"],
});
