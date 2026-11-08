module.exports = {
  moduleFileExtensions: ["js", "ts", "jsx", "tsx"],
  moduleDirectories: ["node_modules", "src", "test"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/test/config/styles.ts",
  },
  transform: {
    "\\.(js|jsx|ts|tsx)$": [
      "@swc/jest",
      {
        jsc: {
          parser: { syntax: "typescript", jsx: true, decorators: true },
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
            react: { runtime: "automatic" },
          },
        },
      },
    ],
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
  collectCoverage: false,
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/test/**/*.test.ts", "<rootDir>/test/**/*.test.tsx"],
};
