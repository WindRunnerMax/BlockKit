import "../styles/index.scss";

import type { ReactBlockWrapContext } from "@block-kit/x-react";
import type { FC } from "react";

export const BulletText: FC<{
  context: ReactBlockWrapContext;
  children: React.ReactNode;
}> = props => {
  const context = props.context;
  const state = context.state;
  const marker = ["●", "◯", "■"][(state.linear - 1) % 3];

  return (
    <div className="block-kit-x-bullet">
      <div className="block-kit-x-bullet-marker" contentEditable={false}>
        {marker}
      </div>
      {props.children}
    </div>
  );
};
