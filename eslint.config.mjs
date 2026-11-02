import js from "@eslint/js";
import tseslint from "typescript-eslint";

const forbiddenPatterns = [
  {
    selector: "CallExpression[callee.name='parseFloat']",
    message: "No uses parseFloat en cálculos."
  },
  {
    selector: "CallExpression[callee.property.name='toFixed']",
    message: "No uses toFixed en cálculos."
  },
  {
    selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
    message: "dangerouslySetInnerHTML está prohibido."
  },
  {
    selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
    message: "Date.now() está prohibido; inyecta Clock."
  }
];

const localRules = {
  rules: {
    "no-hardcoded-colors": {
      meta: {
        type: "problem",
        schema: [],
        messages: { forbidden: "Los colores deben provenir de tokens de diseño." }
      },
      create(context) {
        return {
          Literal(node) {
            if (typeof node.value === "string" && /#[0-9a-f]{3,8}\\b/i.test(node.value)) {
              context.report({ node, messageId: "forbidden" });
            }
          }
        };
      }
    }
  }
};

export default tseslint.config(
  { ignores: [".next/**", "node_modules/**", "coverage/**", "playwright-report/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    plugins: { local: localRules },
    rules: {
      complexity: ["error", 10],
      "no-restricted-syntax": ["error", ...forbiddenPatterns],
      "local/no-hardcoded-colors": "error"
    }
  },
  {
    files: ["tests/**/*.mjs"],
    languageOptions: {
      globals: { URL: "readonly" }
    }
  }
);
