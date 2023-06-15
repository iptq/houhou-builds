import js from "@eslint/js";
import reactRecommended from "eslint-plugin-react/configs/recommended.js";
import reactJsxRuntime from "eslint-plugin-react/configs/jsx-runtime.js";

export default [
  { ignores: ["src-tauri/**/*", "dist/**/*"] },
  { settings: { react: { version: "detect" } } },
  {
    files: ["**/*.js"],
    rules: js.configs.recommended.rules,
  },
  reactRecommended,
  reactJsxRuntime,
];
