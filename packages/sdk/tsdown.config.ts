import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  format: ["esm", "cjs"],
  platform: "node",
  target: "node20",
  dts: true,
  sourcemap: true,
  exports: true,
  clean: true,
  deps: {
    skipNodeModulesBundle: true,
  },
});
