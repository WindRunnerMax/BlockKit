module.exports = {
  moduleFileExtensions: ["js", "ts"],
  moduleDirectories: ["node_modules", "src", "test"],
  moduleNameMapper: {
    "src/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "\\.(js|ts)$": [
      "@swc/jest",
      {
        jsc: {
          parser: { syntax: "typescript", decorators: true },
          transform: { legacyDecorator: true, decoratorMetadata: true },
        },
      },
    ],
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
  collectCoverage: false,
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/test/**/*.test.ts"],
};
