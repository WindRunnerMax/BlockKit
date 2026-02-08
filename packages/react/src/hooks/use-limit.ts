import type { Func } from "@block-kit/utils";
import { debounce, throttle } from "@block-kit/utils";
import { useMemoFn } from "@block-kit/utils/dist/es/hooks";
import { useMemo } from "react";

export const useDebounceMemoFn = <T extends Func.Any>(
  fn: T,
  options: Func.Parameters<typeof debounce>[1]
) => {
  const memorized = useMemoFn(fn);

  const debouncedFn = useMemo(() => {
    return debounce(memorized, options);
  }, [memorized]);

  return debouncedFn;
};

export const useThrottleMemoFn = <T extends Func.Any>(
  fn: T,
  options: Func.Parameters<typeof throttle>[1]
) => {
  const memorized = useMemoFn(fn);

  const throttledFn = useMemo(() => {
    return throttle(memorized, options);
  }, [memorized]);

  return throttledFn;
};
