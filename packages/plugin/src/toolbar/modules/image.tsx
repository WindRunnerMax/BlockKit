import { IconImage } from "@arco-design/web-react/icon";
import { cs } from "block-kit-utils";
import type { FC } from "react";

import { useToolbarContext } from "../context/provider";

export const Image: FC = () => {
  const { refreshMarks } = useToolbarContext();

  return (
    <div
      className={cs("menu-toolbar-item")}
      onClick={() => {
        refreshMarks();
      }}
    >
      <IconImage />
    </div>
  );
};
