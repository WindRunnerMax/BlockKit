import type { O } from "@block-kit/utils/dist/es/types";

export const LOG_LEVEL = {
  DEBUG: -1,
  INFO: 0,
  WARNING: 1,
  ERROR: 2,
} as const;

export class Logger {
  public constructor(public level: O.Values<typeof LOG_LEVEL>) {}

  set(level: O.Values<typeof LOG_LEVEL>) {
    this.level = level;
  }

  debug(key: string, ...args: unknown[]) {
    if (this.level <= LOG_LEVEL.DEBUG) {
      console.log("DEBUG -", key, ...args);
    }
  }

  info(key: string, ...args: unknown[]) {
    if (this.level <= LOG_LEVEL.INFO) {
      console.log("Log -", key, ...args);
    }
  }

  warning(key: string, ...args: unknown[]) {
    if (this.level <= LOG_LEVEL.WARNING) {
      console.warn("Warning -", key, ...args);
    }
  }

  error(key: string, ...args: unknown[]) {
    if (this.level <= LOG_LEVEL.ERROR) {
      console.error("Error -", key, ...args);
    }
  }

  trace(key: string, ...args: unknown[]) {
    if (this.level <= LOG_LEVEL.ERROR) {
      console.trace("Trace -", key, ...args);
    }
  }
}
