import { Entry, Range } from "../../src";

describe("selection collapse", () => {
  it("range empty", () => {
    const range = new Range([]);
    expect(range.isCollapsed).toBe(true);
  });

  it("range single block entry", () => {
    const entry = Entry.create("1", "B");
    const range = new Range([entry]);
    expect(range.isCollapsed).toBe(true);
  });

  it("range multi block entry", () => {
    const entry1 = Entry.create("1", "B");
    const entry2 = Entry.create("2", "B");
    const range = new Range([entry1, entry2]);
    expect(range.isCollapsed).toBe(false);
  });

  it("range single text entry", () => {
    const entry = Entry.create("1", "T", 1, 2);
    const range = new Range([entry]);
    expect(range.isCollapsed).toBe(false);
  });

  it("range single text entry", () => {
    const entry = Entry.create("1", "T", 1, 0);
    const range = new Range([entry]);
    expect(range.isCollapsed).toBe(true);
  });
});
