export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "convex/_generated/**",
      "**/*.ts",
      "**/*.tsx"
    ]
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        URL: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn"
    }
  }
];
