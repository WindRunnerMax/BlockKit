import { isNil } from "@block-kit/utils";
import type { O } from "@block-kit/utils/dist/es/types";
import type { ApplyChange, BlockEditor } from "@block-kit/x-core";
import type { BlockState } from "@block-kit/x-core";
import type { BlockModule } from "@block-kit/x-json";

const store = new WeakMap<BlockEditor, O.Map<O.Map<unknown>>>();

export class BlockConvert {
  public static register(editor: BlockEditor, type: string, data: O.Map<unknown>) {
    const map = store.get(editor) || {};
    store.set(editor, map);
    map[type] = data;
  }

  public static get(editor: BlockEditor, type: string) {
    const map = store.get(editor) || {};
    return map[type];
  }

  public static transform<T extends keyof BlockModule, R extends keyof BlockModule>(
    editor: BlockEditor,
    basic: BlockState,
    payload: { from: T; to: R; merge?: O.Map<unknown> }
  ) {
    const { from, to, merge } = payload;
    const basicRaw = basic.data as unknown as O.Map<unknown>;
    const fromDef = BlockConvert.get(editor, from) as O.Map<unknown>;
    const toDef = BlockConvert.get(editor, to) as O.Map<unknown>;
    if (!fromDef || !toDef) return null;
    const atom = editor.perform.atom;
    const changes: ApplyChange[] = [];
    const fromDefKeysSet = new Set(Object.keys(fromDef));
    const toDefKeysSet = new Set(Object.keys(toDef));
    // 首先更新 block type 字段
    changes.push(atom.updateAttr(basic.id, ["type"], to));
    for (const key of fromDefKeysSet) {
      // 在目标定义中不存在，需要 delete
      if (!toDefKeysSet.has(key)) {
        changes.push(atom.updateAttr(basic.id, [key], void 0));
      }
    }
    for (const key of toDefKeysSet) {
      // 在源定义中不存在, 并且定义值必填的情况下, 需要 insert
      if (!fromDefKeysSet.has(key) && !isNil(toDef[key])) {
        changes.push(atom.updateAttr(basic.id, [key], toDef[key]));
      }
    }
    // 强制合并的字段值
    if (merge) {
      for (const key of Object.keys(merge)) {
        const value = merge[key];
        if (value === basicRaw[key]) continue;
        changes.push(atom.updateAttr(basic.id, [key], value));
      }
    }
    return changes;
  }
}
