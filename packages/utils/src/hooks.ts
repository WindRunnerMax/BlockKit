import type { MutableRefObject, SetStateAction } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { IS_DOM_ENV } from "./env";
import type { F, Func, P } from "./types";

/**
 * 当前组件挂载状态
 */
export const useIsMounted = () => {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    /** 是否挂载 MutableRefObject */
    mounted: isMounted,
    /** 是否挂载 Function */
    isMounted: useCallback(() => isMounted.current, []),
  };
};

/**
 * 组件挂载时 useState
 * @param value 状态
 * @param mounted 组件挂载状态
 */
export const useMountState = <S = undefined>(value: S, mounted: MutableRefObject<boolean>) => {
  const [state, setStateOrigin] = useState<S>(value);

  const setCurrentState = useCallback((next: SetStateAction<S>) => {
    if (!mounted.current) return void 0;
    setStateOrigin(next);
  }, []);

  return [
    /** 状态 */
    state,
    /** 更新状态 Function */
    setCurrentState,
  ] as const;
};

/**
 * 安全地使用 useState
 * @param value 状态
 */
export const useSafeState = <S = undefined>(value: S | (() => S)) => {
  const [state, setStateOrigin] = useState<S>(value);
  const unmounted = useRef(false);

  useEffect(() => {
    return () => {
      unmounted.current = true;
    };
  }, []);

  const setCurrentState = useCallback((next: SetStateAction<S>) => {
    if (unmounted.current) return void 0;
    setStateOrigin(next);
  }, []);

  return [
    /** 状态 */
    state,
    /** 更新状态 Function */
    setCurrentState,
  ] as const;
};

/**
 * State 与 Ref 的使用与更新
 * @param value 状态
 */
export const useStateRef = <S = undefined>(value: S) => {
  const [state, setStateOrigin] = useSafeState<S>(value);
  const ref = useRef(state);

  const setState = useCallback((next: S) => {
    ref.current = next;
    setStateOrigin(next);
  }, []);

  return [
    /** 状态 */
    state,
    /** 更新状态 Function */
    setState,
    /** 状态 MutableRefObject */
    ref,
  ] as const;
};

/**
 * 避免挂载时触发副作用
 * @param effect 副作用依赖
 * @param deps 依赖
 */
export const useUpdateEffect: typeof useEffect = (effect, deps?) => {
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      return effect();
    }
  }, deps);
};

/**
 * 避免挂载时触发副作用
 * @param effect 副作用依赖
 * @param deps 依赖
 */
export const useUpdateLayoutEffect: typeof useLayoutEffect = (effect, deps?) => {
  const isMounted = useRef(false);

  useLayoutEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      return effect();
    }
  }, deps);
};

/**
 * 保证 re-render 时的同一函数引用
 * - 类似于 useCallback 而不需要依赖
 * @param {Func.Any} fn 方法
 */
export const useMemoFn = <T extends Func.Any>(fn: T) => {
  const fnRef = useRef(fn);
  const memoFn = useRef<Func.Any>();

  fnRef.current = fn;
  if (!memoFn.current) {
    memoFn.current = function MemoFn(this: unknown, ...args: unknown[]) {
      return fnRef.current.apply(this, args);
    };
  }

  return memoFn.current as T;
};

/**
 * 强制更新组件
 */
export const useForceUpdate = () => {
  const [index, setState] = useState(1);

  const update = useCallback(() => {
    setState(prev => prev + 1);
  }, []);

  return {
    /** 索引值 */
    index,
    /** 强制刷新组件 */
    update,
    /** 强制刷新组件 */
    forceUpdate: update,
  };
};

/**
 * 判断首次渲染
 */
export const useIsFirstRender = () => {
  const isFirst = useRef<boolean>(true);

  useEffect(() => {
    isFirst.current = false;
  }, []);

  return {
    /** 是否首次渲染 MutableRefObject */
    firstRender: isFirst,
    /** 是否首次渲染 Function */
    isFirstRender: useCallback(() => isFirst.current, []),
  };
};

/**
 * Prevent warning on SSR by falling back to useEffect when DOM isn't available
 */
export const useIsomorphicLayoutEffect = IS_DOM_ENV ? useLayoutEffect : useEffect;

/**
 * 带 re-render 前后值参数的 use-effect
 * @param effect 副作用依赖
 * @param deps 依赖 [1, "1"] as const
 */
export const usePreviousEffect = <T extends readonly unknown[]>(
  effect: (prev: T | P.Undef, next: T) => F.Plain | void,
  deps: T
) => {
  const prev = useRef<T>();

  useEffect(() => {
    const cleanup = effect(prev.current, deps);
    prev.current = deps;
    return cleanup;
  }, deps);
};
