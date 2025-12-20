import { Range } from "@block-kit/core";
import { Point } from "@block-kit/core";
import { Delta } from "@block-kit/delta";
import { preventReactEvent, useEditorStatic } from "@block-kit/react";
import type { FC } from "react";
import React from "react";

import type { SkillPluginOptions } from "../utils/types";

export const SkillInput: FC<{
  value: string;
  options: SkillPluginOptions;
}> = props => {
  const { editor } = useEditorStatic();

  const onClean = (e: React.MouseEvent) => {
    e.preventDefault();
    editor.state.setContent(new Delta().insertEOL());
    const point = new Point(0, 0);
    editor.selection.set(new Range(point, point.clone()), true);
  };

  return (
    <span className="editable-skill-container" onMouseDownCapture={preventReactEvent}>
      {props.value}
      {props.options.cleanable && (
        <svg
          className="editable-selector-close"
          viewBox="0 0 1024 1024"
          width="1em"
          height="1em"
          fill="currentColor"
          onClick={onClean}
        >
          <path d="M720.298667 768c-12.714667 0-23.850667-4.778667-33.408-14.293333L270.293333 337.066667c-19.072-19.114667-19.072-49.322667 0-66.816 19.114667-19.072 49.322667-19.072 66.816 0l416.597334 415.018666c19.072 19.072 19.072 49.28 0 66.773334-9.557333 11.136-22.272 15.914667-33.408 15.914666z"></path>
          <path d="M303.701333 768c-12.714667 0-23.850667-4.778667-33.408-14.293333-19.072-19.114667-19.072-49.322667 0-66.816l415.018667-416.597334c19.072-19.072 49.28-19.072 66.773333 0 19.114667 19.114667 19.114667 49.322667 0 66.816l-414.976 416.597334a45.781333 45.781333 0 0 1-33.408 14.293333z"></path>
        </svg>
      )}
    </span>
  );
};
