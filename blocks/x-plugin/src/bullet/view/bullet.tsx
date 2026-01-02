import "../styles/index.scss";

import type { ReactBlockWrapContext } from "@block-kit/x-react";
import type { FC } from "react";
import { useEffect, useState } from "react";

export const BulletText: FC<{
  context: ReactBlockWrapContext;
  children: React.ReactNode;
}> = props => {
  const context = props.context;
  const state = context.state;
  const [linear, setLinear] = useState(state.linear);
  const dot = ["●", "◯", "■"][(linear - 1) % 3];

  useEffect(() => {
    const onMetaUpdated = () => {
      setLinear(state.linear);
    };
    state.onMetaUpdated = onMetaUpdated;
    return () => {
      state.onMetaUpdated = null;
    };
  }, [state]);

  return (
    <div className="block-kit-x-bullet">
      <div className="block-kit-x-bullet-marker" contentEditable={false}>
        {dot}
      </div>
      {props.children}
    </div>
  );
};
