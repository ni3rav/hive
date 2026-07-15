import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  format: ["esm", "cjs"],
  platform: "browser",
  target: "es2020",
  dts: true,
  sourcemap: true,
  exports: true,
  clean: true,
  external: ["react", "react-dom"],
});
