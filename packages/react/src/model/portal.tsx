import type { Editor } from "@block-kit/core";
import type { O } from "@block-kit/utils/dist/es/types";
import type { FC, ReactPortal } from "react";
import React, { Fragment, useState } from "react";

import { EDITOR_TO_PORTAL } from "../utils/mount-dom";

const PortalView: FC<{ editor: Editor }> = props => {
  const [portals, setPortals] = useState<O.Map<ReactPortal>>({});

  EDITOR_TO_PORTAL.set(props.editor, setPortals);

  return (
    <Fragment>
      {Object.entries(portals).map(([key, node]) => (
        <Fragment key={key}>{node}</Fragment>
      ))}
    </Fragment>
  );
};

/** Portal Model */
export const PortalModel = React.memo(PortalView);
