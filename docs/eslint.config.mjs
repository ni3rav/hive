import { createRequire } from "module";

const require = createRequire(import.meta.url);

const eslintConfig = [
  ...require("eslint-config-next/core-web-vitals"),
  ...require("eslint-config-next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      ".source/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
