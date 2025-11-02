/// <reference types="../../../packages/plugin/src/global.d.ts" />
/// <reference types="../../../packages/utils/src/global.d.ts" />

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
  }
}
