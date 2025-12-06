import { createContext, useContext } from "react";

export const LayoutEffectContext = createContext<(id: string) => void>(() => null);
LayoutEffectContext.displayName = "LayoutEffectContext";

export const useLayoutEffectContext = () => {
  const context = useContext(LayoutEffectContext);
  return { forceLayoutEffect: context };
};
