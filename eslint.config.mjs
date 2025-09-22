import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
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
