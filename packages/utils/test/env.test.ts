import { IS_DOM_ENV, IS_NODE_ENV, IS_TEST } from "../src/env";

describe("env", () => {
  it("node", () => {
    expect(IS_TEST).toBeTruthy();
    expect(IS_NODE_ENV).toBeTruthy();
    expect(IS_DOM_ENV).toBeTruthy();
  });
});
