import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

// @vercel/style-guide's typescript config uses typed linting, so it only
// applies to files covered by tsconfig.json.
const vercelTypescript = compat
  .extends(require.resolve("@vercel/style-guide/eslint/typescript"))
  .map((config) => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"],
  }));

const eslintConfig = [
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "next-env.d.ts"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...compat.extends(
    require.resolve("@vercel/style-guide/eslint/browser"),
    require.resolve("@vercel/style-guide/eslint/react"),
    require.resolve("@vercel/style-guide/eslint/next"),
  ),
  ...vercelTypescript,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // `??` only falls back on null/undefined, but for these strings an empty
      // value means "not set" too: a blank CONTENTFUL_ENVIRONMENT should still
      // resolve to "master", and a blank asset title should still fall back to
      // the vehicle name. `||` is the correct operator there.
      "@typescript-eslint/prefer-nullish-coalescing": [
        "error",
        { ignorePrimitives: { string: true } },
      ],
    },
  },
  // Next.js requires default exports for pages, layouts, route segments, and
  // config files; ESLint flat config requires one too.
  {
    files: ["app/**", "*.config.mjs", "eslint.config.mjs"],
    rules: {
      "import/no-default-export": "off",
    },
  },
  // CLI scripts talk to the user via the console.
  {
    files: ["scripts/**"],
    rules: {
      "no-console": "off",
    },
  },
];

export default eslintConfig;
