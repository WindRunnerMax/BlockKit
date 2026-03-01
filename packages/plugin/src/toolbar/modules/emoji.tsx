import "../styles/emoji.scss";

import { Trigger } from "@arco-design/web-react";
import { cs } from "@block-kit/utils";
import Picker from "@emoji-mart/react";
import type { FC } from "react";

import { EMOJI_KEY } from "../../emoji/types";
import { EmojiIcon } from "../../shared/icons/emoji";
import { useToolbarContext } from "../context/provider";

export const Emoji: FC = () => {
  const { editor } = useToolbarContext();

  return (
    <Trigger
      className="menu-toolbar-emoji-trigger"
      popupAlign={{ bottom: 10 }}
      getPopupContainer={e => e.parentElement || document.body}
      popup={() => (
        <Picker
          theme={document.body.getAttribute("arco-theme") === "dark" ? "dark" : "light"}
          searchPosition="none"
          previewPosition="none"
          categories={[
            "frequent",
            "people",
            "nature",
            "foods",
            "activity",
            "places",
            "objects",
            "symbols",
          ]}
          onEmojiSelect={(emoji: { id: string }) => {
            editor.command.exec(EMOJI_KEY, { value: emoji.id });
          }}
          maxFrequentRows={2}
        ></Picker>
      )}
      trigger="click"
    >
      <div className={cs("menu-toolbar-item")}>
        <EmojiIcon></EmojiIcon>
      </div>
    </Trigger>
  );
};
