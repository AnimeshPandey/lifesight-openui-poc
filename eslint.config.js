import js from "@eslint/js"
import reactHooks from "eslint-plugin-react-hooks"
import tseslint from "typescript-eslint"

export default tseslint.config(
  { ignores: ["dist", "node_modules"] },

  // ── Base rules for all TypeScript/TSX files ───────────────────────────────
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      // React hooks standard rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // General quality
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },

  // ── OpenUI component definitions override ─────────────────────────────────
  // OpenUI uses `component: ({ props }) => JSX` (lowercase property name).
  // The `useRenderNode()` and `useTriggerAction()` hooks are called inside
  // these functions, which is valid because the OpenUI <Renderer> sets up
  // the correct React hook context. ESLint cannot see the runtime call chain,
  // so we disable rules-of-hooks for OpenUI component definition files only.
  {
    files: ["src/openui/components/**/*.tsx"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },

  // ── Feature pages — intentional setState-in-effects for streaming ─────────
  // Streaming pages call setResponse/setIsStreaming inside async effects that
  // drive progressive rendering. This is intentional and correct for the SSE
  // streaming pattern. The react-hooks plugin v5 warns on this pattern but it
  // is the standard approach for streaming UIs.
  {
    files: ["src/features/**/*.tsx"],
    rules: {
      // Downgrade the setState-in-effect rule to warn (it's intentional here)
      "react-hooks/exhaustive-deps": "warn",
    },
  }
)
