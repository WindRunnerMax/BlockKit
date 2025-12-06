import type { BlockState } from "../../state/modules/block-state";

export const STATE_TO_RENDER = new WeakMap<BlockState, () => void>();
