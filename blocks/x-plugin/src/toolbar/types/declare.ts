import type { RenderToolbarContext } from "../utils/schedule";

declare module "@block-kit/x-react/dist/es/plugin" {
  export interface BlockXPlugin {
    renderToolbar?(context: RenderToolbarContext): React.ReactNode;
  }
}
