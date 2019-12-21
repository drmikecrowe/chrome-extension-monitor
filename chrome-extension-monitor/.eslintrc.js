module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  extends: ['@vue/typescript',"plugin:vue/essential", "@vue/prettier", "@vue/typescript", "airbnb", "prettier"],
  plugins: ["prettier"],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
  },
  parserOptions: {
    parser: "@typescript-eslint/parser",
sourceType: "module",
  },
};
