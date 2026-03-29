import "../styles/tool-color.scss";

import { Trigger } from "@arco-design/web-react";
import { IconDown } from "@arco-design/web-react/icon";
import { BACKGROUND_KEY, FONT_COLOR_KEY } from "@block-kit/plugin";
import { BACKGROUND_PRESET as BACKGROUND, COLOR_PRESET as COLOR } from "@block-kit/plugin";
import { cs } from "@block-kit/utils";
import type { FC } from "react";

import { FontColorIcon } from "../../shared/icons/font-color";
import type { RenderToolbarContext } from "../../toolbar/utils/schedule";

export const FontColorTool: FC<{
  context: RenderToolbarContext;
}> = props => {
  const { keys } = props.context;

  return (
    <Trigger
      trigger="click"
      popupAlign={{ bottom: 10 }}
      getPopupContainer={e => e.parentElement || document.body}
      popup={() => (
        <div className="block-kit-x-toolbar-dropdown block-kit-x-color-picker">
          <div className="block-kit-x-color-picker-label">字体颜色</div>
          <div className="block-kit-x-picker-group">
            {COLOR.map(it => (
              <div
                className={cs(
                  "block-kit-x-picker-item-wrapper",
                  keys[FONT_COLOR_KEY] === it && "active",
                  !keys[FONT_COLOR_KEY] && !it && "active"
                )}
                key={it}
                style={{ color: it ? it : void 0 }}
              >
                <div className="block-kit-x-picker-item">
                  <FontColorIcon></FontColorIcon>
                </div>
              </div>
            ))}
          </div>
          <div className="block-kit-x-color-picker-label">背景颜色</div>
          <div className="block-kit-x-picker-group block-kit-x-picker-background-case">
            {BACKGROUND.map(it => (
              <div
                className={cs(
                  "block-kit-x-picker-item-wrapper",
                  keys[BACKGROUND_KEY] === it && "active",
                  !keys[BACKGROUND_KEY] && !it && "active"
                )}
                key={it}
              >
                <div
                  style={{ background: it ? it : void 0 }}
                  className={cs(
                    "block-kit-x-picker-item",
                    !it && "block-kit-x-picker-item-empty-background"
                  )}
                ></div>
              </div>
            ))}
          </div>
        </div>
      )}
    >
      <div className="block-kit-x-toolbar-item block-kit-x-color-case">
        <div
          className="block-kit-x-color-block"
          style={{ color: keys[FONT_COLOR_KEY], background: keys[BACKGROUND_KEY] }}
        >
          <FontColorIcon></FontColorIcon>
        </div>
        <IconDown className="block-kit-x-toolbar-icon-down" />
      </div>
    </Trigger>
  );
};
