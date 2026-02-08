import { isSubsetAttributes } from "../../src/attributes/diff";

describe("isSubsetAttributes()", () => {
  it("basic is subset", () => {
    expect(isSubsetAttributes({ bold: "true" }, { bold: "true", color: "red" })).toBe(true);
  });

  it("basic is not subset", () => {
    expect(isSubsetAttributes({ bold: "true" }, { color: "red" })).toBe(false);
  });

  it("empty is subset", () => {
    expect(isSubsetAttributes({}, { bold: "true" })).toBe(true);
  });

  it("empty is subset of empty", () => {
    expect(isSubsetAttributes({}, {})).toBe(true);
  });

  it("undefined is subset", () => {
    expect(isSubsetAttributes(undefined, { bold: "true" })).toBe(true);
    expect(isSubsetAttributes({ bold: "true" }, undefined)).toBe(false);
  });

  it("undefined is subset of undefined", () => {
    expect(isSubsetAttributes(undefined, undefined)).toBe(true);
  });

  it("empty values are equal", () => {
    expect(isSubsetAttributes({ bold: "" }, {})).toBe(true);
  });
});
