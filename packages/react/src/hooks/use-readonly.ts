import React, { createContext } from "react";

export const ReadonlyContext = createContext<boolean>(false);
ReadonlyContext.displayName = "Readonly";

export const useReadonly = () => {
  const readonly = React.useContext(ReadonlyContext);
  return { readonly };
};
