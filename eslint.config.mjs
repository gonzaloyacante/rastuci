import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";

const eslintConfig = [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        global: "readonly",
        fetch: "readonly",
        Response: "readonly",
        Request: "readonly",
        Headers: "readonly",
        FormData: "readonly",
        URLSearchParams: "readonly",
        AbortController: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "react-hooks": reactHooks,
    },
    rules: {
      // React hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // TypeScript specific rules
      "no-unused-vars": "off", // Turn off base rule
      "@typescript-eslint/no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "ignoreRestSiblings": true,
        "args": "after-used"
      }],
      // Disable HTML entity escaping rule temporarily
      "react/no-unescaped-entities": "off",
      // Enforce semantic color utilities instead of Tailwind palette or hex colors in UI
      // Flags e.g. bg-gray-100, text-red-600, border-blue-200, and hex colors like #ffffff
      "no-restricted-syntax": [
        "error",
        {
          selector:
            'JSXAttribute[name.name="className"] > Literal[value=/\\b(bg|text|border)-(gray|red|green|blue|yellow)(?:-[0-9]{1,3})?\\b|#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\b/]',
          message:
            "Use semantic color utilities (surface, surface-secondary, muted, text-primary, text-success, text-error, badge-*) instead of Tailwind palette classes or hex colors.",
        },
        {
          // Template literals: className={`text-red-600 ${foo}`}
          selector:
            'JSXAttribute[name.name="className"] > JSXExpressionContainer > TemplateLiteral > TemplateElement[value.raw=/\\b(bg|text|border)-(gray|red|green|blue|yellow)(?:-[0-9]{1,3})?\\b|#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\b/]',
          message:
            "Use semantic color utilities (surface, surface-secondary, muted, text-primary, text-success, text-error, badge-*) instead of Tailwind palette classes or hex colors.",
        },
        {
          // String concatenations: className={"text-red-600 " + foo}
          selector:
            'JSXAttribute[name.name="className"] > JSXExpressionContainer > BinaryExpression[left.value=/\\b(bg|text|border)-(gray|red|green|blue|yellow)(?:-[0-9]{1,3})?\\b|#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\b/]',
          message:
            "Use semantic color utilities (surface, surface-secondary, muted, text-primary, text-success, text-error, badge-*) instead of Tailwind palette classes or hex colors.",
        },
      ],
    },
  },
];

export default eslintConfig;
