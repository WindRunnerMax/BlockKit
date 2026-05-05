import { json, text } from "../src";

describe("list", () => {
  json.registerSubtype(text);

  describe("apply", () => {
    it("inserts", () => {
      expect(json.apply(["b", "c"], [{ p: [0], li: "a" }])).toEqual(["a", "b", "c"]);
      expect(json.apply(["a", "c"], [{ p: [1], li: "b" }])).toEqual(["a", "b", "c"]);
      expect(json.apply(["a", "b"], [{ p: [2], li: "c" }])).toEqual(["a", "b", "c"]);
    });

    it("deletes", () => {
      expect(json.apply(["a", "b", "c"], [{ p: [0], ld: "a" }])).toEqual(["b", "c"]);
      expect(json.apply(["a", "b", "c"], [{ p: [1], ld: "b" }])).toEqual(["a", "c"]);
      expect(json.apply(["a", "b", "c"], [{ p: [2], ld: "c" }])).toEqual(["a", "b"]);
    });

    it("replaces", () => {
      expect(json.apply(["a", "x", "b"], [{ p: [1], ld: "x", li: "y" }])).toEqual(["a", "y", "b"]);
    });

    it("moves", () => {
      expect(json.apply(["b", "a", "c"], [{ p: [1], lm: 0 }])).toEqual(["a", "b", "c"]);
      expect(json.apply(["b", "a", "c"], [{ p: [0], lm: 1 }])).toEqual(["a", "b", "c"]);
    });

    it("throws when keying a list replacement with a string", () => {
      expect(() => json.apply(["a", "b", "c"], [{ p: ["0"], li: "x", ld: "a" }])).toThrow();
    });

    it("throws when keying a list insertion with a string", () => {
      expect(() => json.apply(["a", "b", "c"], [{ p: ["0"], li: "x" }])).toThrow();
    });

    it("throws when keying a list deletion with a string", () => {
      expect(() => json.apply(["a", "b", "c"], [{ p: ["0"], ld: "a" }])).toThrow();
    });

    it("throws when keying a list move with a string", () => {
      expect(() => json.apply(["a", "b", "c"], [{ p: ["0"], lm: 0 }])).toThrow();
    });

    it("prevent clone ops", () => {
      const obj = {};
      const applied1 = json.apply(["a", "b", "c"], [{ p: [0], li: obj }]);
      const applied2 = json.apply(["a", "b", "c"], [{ p: [0], li: obj }], {
        preventCloneOps: true,
      });
      expect(applied1[0]).not.toBe(obj);
      expect(applied2[0]).toBe(obj);
    });

    it("throws when specifying a string as a list move target", () => {
      // @ts-expect-error type error
      expect(() => json.apply(["a", "b", "c"], [{ p: [1], lm: "0" }])).toThrow();
    });

    it("throws when an array index part-way through the path is a string", () => {
      expect(() =>
        json.apply({ arr: [{ x: "a" }] }, [{ p: ["arr", "0", "x"], od: "a" }])
      ).toThrow();
    });

    /*
        it('null moves compose to nops', () => {
        expect(json.compose([], [{p:[3],lm:3}])).toEqual([]);
        expect(json.compose([], [{p:[0,3],lm:3}])).toEqual([]);
        expect(json.compose([], [{p:['x','y',0],lm:0}])).toEqual([]);
        });
      */
  });

  describe("#transform()", () => {
    it("bumps paths when list elements are inserted or removed", () => {
      expect(json.transform([{ p: [1, 200], si: "hi" }], [{ p: [0], li: "x" }], "left")).toEqual([
        { p: [2, 200], si: "hi" },
      ]);
      expect(json.transform([{ p: [0, 201], si: "hi" }], [{ p: [0], li: "x" }], "right")).toEqual([
        { p: [1, 201], si: "hi" },
      ]);
      expect(json.transform([{ p: [0, 202], si: "hi" }], [{ p: [1], li: "x" }], "left")).toEqual([
        { p: [0, 202], si: "hi" },
      ]);
      expect(
        json.transform(
          [{ p: [1], t: "text0", o: [{ p: 200, i: "hi" }] }],
          [{ p: [0], li: "x" }],
          "left"
        )
      ).toEqual([{ p: [2], t: "text0", o: [{ p: 200, i: "hi" }] }]);
      expect(
        json.transform(
          [{ p: [0], t: "text0", o: [{ p: 201, i: "hi" }] }],
          [{ p: [0], li: "x" }],
          "right"
        )
      ).toEqual([{ p: [1], t: "text0", o: [{ p: 201, i: "hi" }] }]);
      expect(
        json.transform(
          [{ p: [0], t: "text0", o: [{ p: 202, i: "hi" }] }],
          [{ p: [1], li: "x" }],
          "left"
        )
      ).toEqual([{ p: [0], t: "text0", o: [{ p: 202, i: "hi" }] }]);

      expect(json.transform([{ p: [1, 203], si: "hi" }], [{ p: [0], ld: "x" }], "left")).toEqual([
        { p: [0, 203], si: "hi" },
      ]);
      expect(json.transform([{ p: [0, 204], si: "hi" }], [{ p: [1], ld: "x" }], "left")).toEqual([
        { p: [0, 204], si: "hi" },
      ]);
      expect(
        json.transform([{ p: ["x", 3], si: "hi" }], [{ p: ["x", 0, "x"], li: 0 }], "left")
      ).toEqual([{ p: ["x", 3], si: "hi" }]);
      expect(
        json.transform([{ p: ["x", 3, "x"], si: "hi" }], [{ p: ["x", 5], li: 0 }], "left")
      ).toEqual([{ p: ["x", 3, "x"], si: "hi" }]);
      expect(
        json.transform([{ p: ["x", 3, "x"], si: "hi" }], [{ p: ["x", 0], li: 0 }], "left")
      ).toEqual([{ p: ["x", 4, "x"], si: "hi" }]);
      expect(
        json.transform(
          [{ p: [1], t: "text0", o: [{ p: 203, i: "hi" }] }],
          [{ p: [0], ld: "x" }],
          "left"
        )
      ).toEqual([{ p: [0], t: "text0", o: [{ p: 203, i: "hi" }] }]);
      expect(
        json.transform(
          [{ p: [0], t: "text0", o: [{ p: 204, i: "hi" }] }],
          [{ p: [1], ld: "x" }],
          "left"
        )
      ).toEqual([{ p: [0], t: "text0", o: [{ p: 204, i: "hi" }] }]);
      expect(
        json.transform(
          [{ p: ["x"], t: "text0", o: [{ p: 3, i: "hi" }] }],
          [{ p: ["x", 0, "x"], li: 0 }],
          "left"
        )
      ).toEqual([{ p: ["x"], t: "text0", o: [{ p: 3, i: "hi" }] }]);

      expect(json.transform([{ p: [0], ld: 2 }], [{ p: [0], li: 1 }], "left")).toEqual([
        { p: [1], ld: 2 },
      ]);
      expect(json.transform([{ p: [0], ld: 2 }], [{ p: [0], li: 1 }], "right")).toEqual([
        { p: [1], ld: 2 },
      ]);
    });

    it("converts ops on deleted elements to noops", () => {
      expect(json.transform([{ p: [1, 0], si: "hi" }], [{ p: [1], ld: "x" }], "left")).toEqual([]);
      expect(
        json.transform(
          [{ p: [1], t: "text0", o: [{ p: 0, i: "hi" }] }],
          [{ p: [1], ld: "x" }],
          "left"
        )
      ).toEqual([]);
      expect(json.transform([{ p: [0], li: "x" }], [{ p: [0], ld: "y" }], "left")).toEqual([
        { p: [0], li: "x" },
      ]);
      expect(json.transform([{ p: [0], na: -3 }], [{ p: [0], ld: 48 }], "left")).toEqual([]);
    });

    it("converts ops on replaced elements to noops", () => {
      expect(
        json.transform([{ p: [1, 0], si: "hi" }], [{ p: [1], ld: "x", li: "y" }], "left")
      ).toEqual([]);
      expect(
        json.transform(
          [{ p: [1], t: "text0", o: [{ p: 0, i: "hi" }] }],
          [{ p: [1], ld: "x", li: "y" }],
          "left"
        )
      ).toEqual([]);
      expect(
        json.transform([{ p: [0], li: "hi" }], [{ p: [0], ld: "x", li: "y" }], "left")
      ).toEqual([{ p: [0], li: "hi" }]);
    });

    it("changes deleted data to reflect edits", () => {
      expect(json.transform([{ p: [1], ld: "a" }], [{ p: [1, 1], si: "bc" }], "left")).toEqual([
        { p: [1], ld: "abc" },
      ]);
      expect(
        json.transform(
          [{ p: [1], ld: "a" }],
          [{ p: [1], t: "text0", o: [{ p: 1, i: "bc" }] }],
          "left"
        )
      ).toEqual([{ p: [1], ld: "abc" }]);
    });

    it("Puts the left op first if two inserts are simultaneous", () => {
      expect(json.transform([{ p: [1], li: "a" }], [{ p: [1], li: "b" }], "left")).toEqual([
        { p: [1], li: "a" },
      ]);
      expect(json.transform([{ p: [1], li: "b" }], [{ p: [1], li: "a" }], "right")).toEqual([
        { p: [2], li: "b" },
      ]);
    });

    it("converts an attempt to re-delete a list element into a no-op", () => {
      expect(json.transform([{ p: [1], ld: "x" }], [{ p: [1], ld: "x" }], "left")).toEqual([]);
      expect(json.transform([{ p: [1], ld: "x" }], [{ p: [1], ld: "x" }], "right")).toEqual([]);
    });
  });

  describe("#compose()", () => {
    it("composes insert then delete into a no-op", () => {
      expect(json.compose([{ p: [1], li: "abc" }], [{ p: [1], ld: "abc" }])).toEqual([]);
      expect(
        json.transform([{ p: [0], ld: null, li: "x" }], [{ p: [0], li: "The" }], "right")
      ).toEqual([{ p: [1], ld: null, li: "x" }]);
    });

    it("doesn't change the original object", () => {
      const a = [{ p: [0], ld: "abc", li: null }];
      expect(json.compose(a, [{ p: [0], ld: null }])).toEqual([{ p: [0], ld: "abc" }]);
      expect(a).toEqual([{ p: [0], ld: "abc", li: null }]);
    });

    it("composes together adjacent string ops", () => {
      expect(json.compose([{ p: [100], si: "h" }], [{ p: [101], si: "i" }])).toEqual([
        { p: [100], si: "hi" },
      ]);
      expect(
        json.compose(
          [{ p: [], t: "text0", o: [{ p: 100, i: "h" }] }],
          [{ p: [], t: "text0", o: [{ p: 101, i: "i" }] }]
        )
      ).toEqual([{ p: [], t: "text0", o: [{ p: 100, i: "hi" }] }]);
    });
  });

  it("moves ops on a moved element with the element", () => {
    // Basic move transformations
    expect(json.transform([{ p: [4], ld: "x" }], [{ p: [4], lm: 10 }], "left")).toEqual([
      { p: [10], ld: "x" },
    ]);
    expect(json.transform([{ p: [4, 1], si: "a" }], [{ p: [4], lm: 10 }], "left")).toEqual([
      { p: [10, 1], si: "a" },
    ]);
    expect(
      json.transform([{ p: [4], t: "text0", o: [{ p: 1, i: "a" }] }], [{ p: [4], lm: 10 }], "left")
    ).toEqual([{ p: [10], t: "text0", o: [{ p: 1, i: "a" }] }]);
    expect(json.transform([{ p: [4, 1], li: "a" }], [{ p: [4], lm: 10 }], "left")).toEqual([
      { p: [10, 1], li: "a" },
    ]);
    expect(json.transform([{ p: [4, 1], ld: "b", li: "a" }], [{ p: [4], lm: 10 }], "left")).toEqual(
      [{ p: [10, 1], ld: "b", li: "a" }]
    );

    // Edge cases with null/empty values
    expect(json.transform([{ p: [0], li: null }], [{ p: [0], lm: 1 }], "left")).toEqual([
      { p: [0], li: null },
    ]);

    // Complex move scenarios with comments
    // Scenario 1: Insertion with move
    // Original: [_,_,_,_,5,6,7,_]
    // Client: [_,_,_,_,5,'x',6,7,_]   p:5 li:'x'
    // Server: [_,6,_,_,_,5,7,_]       p:5 lm:1
    // Correct result: [_,6,_,_,_,5,'x',7,_]
    expect(json.transform([{ p: [5], li: "x" }], [{ p: [5], lm: 1 }], "left")).toEqual([
      { p: [6], li: "x" },
    ]);

    // Scenario 2: Deletion with move
    // Original: [_,_,_,_,5,6,7,_]
    // Client: [_,_,_,_,5,6,7,_]  p:5 ld:6
    // Server: [_,6,_,_,_,5,7,_]  p:5 lm:1
    // Correct result: [_,_,_,_,5,7,_]
    expect(json.transform([{ p: [5], ld: 6 }], [{ p: [5], lm: 1 }], "left")).toEqual([
      { p: [1], ld: 6 },
    ]);

    // Additional edge cases
    expect(json.transform([{ p: [0], li: [] }], [{ p: [1], lm: 0 }], "left")).toEqual([
      { p: [0], li: [] },
    ]);
    expect(json.transform([{ p: [2], li: "x" }], [{ p: [0], lm: 1 }], "left")).toEqual([
      { p: [2], li: "x" },
    ]);
  });

  it("moves target index on ld/li", () => {
    expect(json.transform([{ p: [0], lm: 2 }], [{ p: [1], ld: "x" }], "left")).toEqual([
      { p: [0], lm: 1 },
    ]);
    expect(json.transform([{ p: [2], lm: 4 }], [{ p: [1], ld: "x" }], "left")).toEqual([
      { p: [1], lm: 3 },
    ]);
    expect(json.transform([{ p: [0], lm: 2 }], [{ p: [1], li: "x" }], "left")).toEqual([
      { p: [0], lm: 3 },
    ]);
    expect(json.transform([{ p: [2], lm: 4 }], [{ p: [1], li: "x" }], "left")).toEqual([
      { p: [3], lm: 5 },
    ]);
    expect(json.transform([{ p: [0], lm: 0 }], [{ p: [0], li: 28 }], "left")).toEqual([
      { p: [1], lm: 1 },
    ]);
  });

  it("tiebreaks lm vs. ld/li", () => {
    expect(json.transform([{ p: [0], lm: 2 }], [{ p: [0], ld: "x" }], "left")).toEqual([]);
    expect(json.transform([{ p: [0], lm: 2 }], [{ p: [0], ld: "x" }], "right")).toEqual([]);
    expect(json.transform([{ p: [0], lm: 2 }], [{ p: [0], li: "x" }], "left")).toEqual([
      { p: [1], lm: 3 },
    ]);
    expect(json.transform([{ p: [0], lm: 2 }], [{ p: [0], li: "x" }], "right")).toEqual([
      { p: [1], lm: 3 },
    ]);
  });

  it("replacement vs. deletion", () => {
    expect(json.transform([{ p: [0], ld: "x", li: "y" }], [{ p: [0], ld: "x" }], "right")).toEqual([
      { p: [0], li: "y" },
    ]);
  });

  it("replacement vs. insertion", () => {
    expect(
      json.transform([{ p: [0], ld: {}, li: "brillig" }], [{ p: [0], li: 36 }], "left")
    ).toEqual([{ p: [1], ld: {}, li: "brillig" }]);
  });

  it("replacement vs. replacement", () => {
    expect(
      json.transform([{ p: [0], ld: null, li: [] }], [{ p: [0], ld: null, li: 0 }], "right")
    ).toEqual([]);
    expect(
      json.transform([{ p: [0], ld: null, li: 0 }], [{ p: [0], ld: null, li: [] }], "left")
    ).toEqual([{ p: [0], ld: [], li: 0 }]);
  });

  it("composes replace with delete of replaced element results in insert", () => {
    expect(json.compose([{ p: [2], ld: [], li: null }], [{ p: [2], ld: null }])).toEqual([
      { p: [2], ld: [] },
    ]);
  });

  it("lm vs lm", () => {
    // Basic move transformations
    expect(json.transform([{ p: [0], lm: 2 }], [{ p: [2], lm: 1 }], "left")).toEqual([
      { p: [0], lm: 2 },
    ]);
    expect(json.transform([{ p: [3], lm: 3 }], [{ p: [5], lm: 0 }], "left")).toEqual([
      { p: [4], lm: 4 },
    ]);

    // Move index adjustments
    expect(json.transform([{ p: [2], lm: 0 }], [{ p: [1], lm: 0 }], "left")).toEqual([
      { p: [2], lm: 0 },
    ]);
    expect(json.transform([{ p: [2], lm: 0 }], [{ p: [1], lm: 0 }], "right")).toEqual([
      { p: [2], lm: 1 },
    ]);

    // Complex move scenarios
    expect(json.transform([{ p: [2], lm: 0 }], [{ p: [5], lm: 0 }], "right")).toEqual([
      { p: [3], lm: 1 },
    ]);
    expect(json.transform([{ p: [2], lm: 0 }], [{ p: [5], lm: 0 }], "left")).toEqual([
      { p: [3], lm: 0 },
    ]);

    // Move target adjustments
    expect(json.transform([{ p: [2], lm: 5 }], [{ p: [2], lm: 0 }], "left")).toEqual([
      { p: [0], lm: 5 },
    ]);
    expect(json.transform([{ p: [1], lm: 0 }], [{ p: [0], lm: 5 }], "right")).toEqual([
      { p: [0], lm: 0 },
    ]);
    expect(json.transform([{ p: [1], lm: 0 }], [{ p: [0], lm: 1 }], "right")).toEqual([
      { p: [0], lm: 0 },
    ]);

    // Move interaction cases
    expect(json.transform([{ p: [0], lm: 1 }], [{ p: [1], lm: 0 }], "left")).toEqual([
      { p: [1], lm: 1 },
    ]);
    expect(json.transform([{ p: [0], lm: 1 }], [{ p: [5], lm: 0 }], "right")).toEqual([
      { p: [1], lm: 2 },
    ]);
    expect(json.transform([{ p: [2], lm: 1 }], [{ p: [5], lm: 0 }], "right")).toEqual([
      { p: [3], lm: 2 },
    ]);

    // Cross-move scenarios
    expect(json.transform([{ p: [3], lm: 1 }], [{ p: [1], lm: 3 }], "left")).toEqual([
      { p: [2], lm: 1 },
    ]);
    expect(json.transform([{ p: [1], lm: 3 }], [{ p: [3], lm: 1 }], "left")).toEqual([
      { p: [2], lm: 3 },
    ]);

    // Stable move cases
    expect(json.transform([{ p: [2], lm: 6 }], [{ p: [0], lm: 1 }], "left")).toEqual([
      { p: [2], lm: 6 },
    ]);
    expect(json.transform([{ p: [2], lm: 6 }], [{ p: [0], lm: 1 }], "right")).toEqual([
      { p: [2], lm: 6 },
    ]);
    expect(json.transform([{ p: [2], lm: 6 }], [{ p: [1], lm: 0 }], "left")).toEqual([
      { p: [2], lm: 6 },
    ]);
    expect(json.transform([{ p: [2], lm: 6 }], [{ p: [1], lm: 0 }], "right")).toEqual([
      { p: [2], lm: 6 },
    ]);

    // Move composition cases
    expect(json.transform([{ p: [0], lm: 1 }], [{ p: [2], lm: 1 }], "left")).toEqual([
      { p: [0], lm: 2 },
    ]);
    expect(json.transform([{ p: [2], lm: 1 }], [{ p: [0], lm: 1 }], "right")).toEqual([
      { p: [2], lm: 0 },
    ]);

    // Edge cases
    expect(json.transform([{ p: [0], lm: 0 }], [{ p: [1], lm: 0 }], "left")).toEqual([
      { p: [1], lm: 1 },
    ]);
    expect(json.transform([{ p: [0], lm: 1 }], [{ p: [1], lm: 3 }], "left")).toEqual([
      { p: [0], lm: 0 },
    ]);

    // Final complex cases
    expect(json.transform([{ p: [2], lm: 1 }], [{ p: [3], lm: 2 }], "left")).toEqual([
      { p: [3], lm: 1 },
    ]);
    expect(json.transform([{ p: [3], lm: 2 }], [{ p: [2], lm: 1 }], "left")).toEqual([
      { p: [3], lm: 3 },
    ]);
  });

  it("changes indices correctly around a move", () => {
    // Insertions around moves
    expect(json.transform([{ p: [0, 0], li: {} }], [{ p: [1], lm: 0 }], "left")).toEqual([
      { p: [1, 0], li: {} },
    ]);

    // Move operations with deletions
    expect(json.transform([{ p: [1], lm: 0 }], [{ p: [0], ld: {} }], "left")).toEqual([
      { p: [0], lm: 0 },
    ]);
    expect(json.transform([{ p: [0], lm: 1 }], [{ p: [1], ld: {} }], "left")).toEqual([
      { p: [0], lm: 0 },
    ]);
    expect(json.transform([{ p: [6], lm: 0 }], [{ p: [2], ld: {} }], "left")).toEqual([
      { p: [5], lm: 0 },
    ]);
    expect(json.transform([{ p: [1], lm: 0 }], [{ p: [2], ld: {} }], "left")).toEqual([
      { p: [1], lm: 0 },
    ]);
    expect(json.transform([{ p: [2], lm: 1 }], [{ p: [1], ld: 3 }], "right")).toEqual([
      { p: [1], lm: 1 },
    ]);

    // Deletions with moves
    expect(json.transform([{ p: [2], ld: {} }], [{ p: [1], lm: 2 }], "right")).toEqual([
      { p: [1], ld: {} },
    ]);
    expect(json.transform([{ p: [1], ld: {} }], [{ p: [2], lm: 1 }], "left")).toEqual([
      { p: [2], ld: {} },
    ]);
    expect(json.transform([{ p: [1], ld: {} }], [{ p: [0], lm: 1 }], "right")).toEqual([
      { p: [0], ld: {} },
    ]);

    // Replacements around moves
    expect(json.transform([{ p: [1], ld: 1, li: 2 }], [{ p: [1], lm: 0 }], "left")).toEqual([
      { p: [0], ld: 1, li: 2 },
    ]);
    expect(json.transform([{ p: [1], ld: 2, li: 3 }], [{ p: [0], lm: 1 }], "left")).toEqual([
      { p: [0], ld: 2, li: 3 },
    ]);
    expect(json.transform([{ p: [0], ld: 3, li: 4 }], [{ p: [1], lm: 0 }], "left")).toEqual([
      { p: [1], ld: 3, li: 4 },
    ]);
  });

  it("li vs lm", () => {
    const li = (p: number) => [{ p: [p], li: [] }];
    const lm = (f: number, t: number) => [{ p: [f], lm: t }];
    const xf = json.transform.bind(json);

    expect(li(0)).toEqual(xf(li(0), lm(1, 3), "left"));
    expect(li(1)).toEqual(xf(li(1), lm(1, 3), "left"));
    expect(li(1)).toEqual(xf(li(2), lm(1, 3), "left"));
    expect(li(2)).toEqual(xf(li(3), lm(1, 3), "left"));
    expect(li(4)).toEqual(xf(li(4), lm(1, 3), "left"));

    expect(lm(2, 4)).toEqual(xf(lm(1, 3), li(0), "right"));
    expect(lm(2, 4)).toEqual(xf(lm(1, 3), li(1), "right"));
    expect(lm(1, 4)).toEqual(xf(lm(1, 3), li(2), "right"));
    expect(lm(1, 4)).toEqual(xf(lm(1, 3), li(3), "right"));
    expect(lm(1, 3)).toEqual(xf(lm(1, 3), li(4), "right"));

    expect(li(0)).toEqual(xf(li(0), lm(1, 2), "left"));
    expect(li(1)).toEqual(xf(li(1), lm(1, 2), "left"));
    expect(li(1)).toEqual(xf(li(2), lm(1, 2), "left"));
    expect(li(3)).toEqual(xf(li(3), lm(1, 2), "left"));

    expect(li(0)).toEqual(xf(li(0), lm(3, 1), "left"));
    expect(li(1)).toEqual(xf(li(1), lm(3, 1), "left"));
    expect(li(3)).toEqual(xf(li(2), lm(3, 1), "left"));
    expect(li(4)).toEqual(xf(li(3), lm(3, 1), "left"));
    expect(li(4)).toEqual(xf(li(4), lm(3, 1), "left"));

    expect(lm(4, 2)).toEqual(xf(lm(3, 1), li(0), "right"));
    expect(lm(4, 2)).toEqual(xf(lm(3, 1), li(1), "right"));
    expect(lm(4, 1)).toEqual(xf(lm(3, 1), li(2), "right"));
    expect(lm(4, 1)).toEqual(xf(lm(3, 1), li(3), "right"));
    expect(lm(3, 1)).toEqual(xf(lm(3, 1), li(4), "right"));

    expect(li(0)).toEqual(xf(li(0), lm(2, 1), "left"));
    expect(li(1)).toEqual(xf(li(1), lm(2, 1), "left"));
    expect(li(3)).toEqual(xf(li(2), lm(2, 1), "left"));
    expect(li(3)).toEqual(xf(li(3), lm(2, 1), "left"));
  });
});
