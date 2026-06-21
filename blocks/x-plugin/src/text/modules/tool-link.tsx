import "../styles/tool-link.scss";

import { Button, Form, Input, Switch, Trigger } from "@arco-design/web-react";
import useForm from "@arco-design/web-react/es/Form/useForm";
import { IconLink, IconRight } from "@arco-design/web-react/icon";
import { EDITOR_EVENT } from "@block-kit/core";
import { LINK_BLANK_KEY, LINK_KEY, LINK_TEMP_KEY } from "@block-kit/plugin";
import { cs, NIL, TRULY } from "@block-kit/utils";
import type { FC } from "react";
import { useEffect, useState } from "react";

import type { RenderToolbarContext } from "../../toolbar/utils/schedule";

export const LinkTool: FC<{
  context: RenderToolbarContext;
  filterXSS?: (link: string) => string;
}> = props => {
  const { keys, editor, forceUpdate, range } = props.context;
  const [form] = useForm();
  const [visible, setVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const onConfirm = () => {
    const sel = editor.selection.get();
    if (!sel) return void 0;
    const insert = form.getFieldValue("link-insert");
    const href = form.getFieldValue(LINK_KEY);
    const blank = form.getFieldValue(LINK_BLANK_KEY);
    if (!href) return void 0;
    const filteredHref = props.filterXSS ? props.filterXSS(href) : href;
    if (sel.isCollapsed) {
      // 折叠选区的情况下则插入文本
      if (!insert) return void 0;
      editor.lookup.marks = { ...editor.lookup.marks, [LINK_KEY]: filteredHref };
      if (blank) {
        editor.lookup.marks[LINK_BLANK_KEY] = TRULY;
      }
      editor.perform.insertText(sel, insert);
    } else {
      // 非折叠选区则应用链接
      editor.perform.applyMarks(
        sel,
        {
          [LINK_KEY]: filteredHref,
          [LINK_BLANK_KEY]: blank ? TRULY : NIL,
          [LINK_TEMP_KEY]: NIL,
        },
        { autoCaret: false }
      );
    }
    setVisible(false);
    forceUpdate();
    editor.selection.updateDOMSelection();
  };

  const onDelete = () => {
    const sel = editor.selection.get();
    if (!sel || sel.isCollapsed) {
      setVisible(false);
      return void 0;
    }
    editor.perform.applyMarks(
      sel,
      { [LINK_TEMP_KEY]: NIL, [LINK_BLANK_KEY]: NIL, [LINK_KEY]: NIL },
      { autoCaret: false }
    );
    setVisible(false);
    forceUpdate();
  };

  useEffect(() => {
    if (visible) {
      form.resetFields();
      const sel = editor.selection.get();
      const state = sel && sel.isCollapsed;
      setCollapsed(!!state);
    }
  }, [editor.selection, form, visible]);

  const onFocus = () => {
    const sel = editor.selection.get();
    if (sel && !sel.isCollapsed) {
      // 由于焦点转移, 因此需要将临时标记应用到选区
      editor.perform.applyMarks(
        sel,
        { [LINK_TEMP_KEY]: TRULY },
        { autoCaret: false, undoable: false, client: true }
      );
      editor.event.once(EDITOR_EVENT.SELECTION_CHANGE, () => {
        // 这里是需要等待渲染后再执行, 否则会导致选区校正无法获取 LineNode
        Promise.resolve().then(() => {
          editor.perform.applyMarks(
            sel,
            { [LINK_TEMP_KEY]: NIL },
            { autoCaret: false, undoable: false, client: true }
          );
        });
      });
    }
  };

  const go = () => {
    const href = form.getFieldValue(LINK_KEY);
    if (!href) return void 0;
    window.open(href, "_blank");
  };

  // 非文本选区则不显示链接 Toolbar
  if (!range.isTextRange) return null;

  return (
    <Trigger
      popupVisible={visible}
      onVisibleChange={setVisible}
      trigger="click"
      popupAlign={{ bottom: 10 }}
      getPopupContainer={e => e.parentElement || document.body}
      popup={() => {
        return (
          <div className="block-kit-x-link-popup">
            <Form
              initialValues={keys}
              form={form}
              size="small"
              labelCol={{ span: 6, offset: 0 }}
              wrapperCol={{ span: 18, offset: 0 }}
              labelAlign="left"
              onSubmit={onConfirm}
            >
              {collapsed && (
                <Form.Item label="文本内容" field="link-insert">
                  <Input data-pass-focus autoComplete="off" size="mini" placeholder="输入文本" />
                </Form.Item>
              )}
              <Form.Item label="链接地址" field={LINK_KEY}>
                <Input
                  data-pass-focus
                  autoComplete="off"
                  size="mini"
                  placeholder="输入链接"
                  onFocus={onFocus}
                  addAfter={<IconRight onClick={go} className="block-kit-x-link-popup-go" />}
                />
              </Form.Item>
              <Form.Item label="新页面打开" field={LINK_BLANK_KEY} triggerPropName="checked">
                <Switch />
              </Form.Item>
            </Form>
            <div className="block-kit-x-link-popup-button">
              <Button size="mini" htmlType="submit" type="primary" onClick={onConfirm}>
                确定
              </Button>
              <Button size="mini" type="primary" status="danger" onClick={onDelete}>
                删除
              </Button>
            </div>
          </div>
        );
      }}
    >
      <div className={cs("block-kit-x-toolbar-item", keys[LINK_KEY] && "active")}>
        <IconLink />
      </div>
    </Trigger>
  );
};
