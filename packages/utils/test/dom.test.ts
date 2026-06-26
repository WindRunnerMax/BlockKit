/**
 * @jest-environment jsdom
 */
import { isDOMComment, isDOMElement, isDOMNode, isDOMText, isHTMLElement } from "../src/dom";

describe("dom", () => {
  const html = `<div><!-- comment --></div><div>123</div>`;
  const body = new DOMParser().parseFromString(html, "text/html").body;

  it("isDOMText", () => {
    expect(isDOMText(body.childNodes[0].firstChild)).toBe(false);
    expect(isDOMText(body.childNodes[1].firstChild)).toBe(true);
  });

  it("isDOMComment", () => {
    expect(isDOMComment(body.childNodes[0].firstChild)).toBe(true);
    expect(isDOMComment(body.childNodes[1].firstChild)).toBe(false);
  });

  it("isDOMElement", () => {
    expect(isDOMElement(body.childNodes[0])).toBe(true);
    expect(isDOMElement(body.childNodes[1])).toBe(true);
    expect(isDOMElement(body.childNodes[0].firstChild)).toBe(false);
  });

  it("isHTMLElement", () => {
    expect(isHTMLElement(body.childNodes[0])).toBe(true);
    expect(isHTMLElement(body.childNodes[1])).toBe(true);
    expect(isHTMLElement(body.childNodes[0].firstChild)).toBe(false);
  });

  it("isDOMNode", () => {
    expect(isDOMNode(body.childNodes[0])).toBe(true);
    expect(isDOMNode(body.childNodes[1])).toBe(true);
    expect(isDOMNode(body.childNodes[0].firstChild)).toBe(true);
  });
});
