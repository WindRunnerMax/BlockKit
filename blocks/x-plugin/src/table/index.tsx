import type { ReactBlockContext } from "@block-kit/x-react";
import { BlockXPlugin } from "@block-kit/x-react";

import { Table } from "./component/table";
import { Trs } from "./component/trs";
import { TABLE_KEY } from "./types/index";

export class TableXPlugin extends BlockXPlugin {
  public key: string = TABLE_KEY;

  public destroy(): void {}

  public renderBlock(context: ReactBlockContext): React.ReactNode {
    const state = context.state;
    return (
      <Table state={state}>
        <Trs />
      </Table>
    );
  }
}
