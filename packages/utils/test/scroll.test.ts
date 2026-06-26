/**
 * @jest-environment jsdom
 */
import { Scroll } from "../src/scroll";

describe("scroll", () => {
  it("scrollIntoViewY", () => {
    document.body.innerHTML = `
      <div id="$1" style="width: 200px; height: 100px; overflow: auto;">
        <div id="$2" style="margin: 1000px 0px; height: 20px; width: 100px;"></div>
      </div>
    `;
    const scroll = document.getElementById("$1");
    const element = document.getElementById("$2")!;
    element.getBoundingClientRect = () => ({
      top: 1000,
      bottom: 1020,
      left: 0,
      right: 100,
      width: 100,
      height: 20,
      x: 0,
      y: 1000,
      toJSON: () => {},
    });
    Scroll.scrollIntoViewY(scroll!, element, { threshold: 10 });
    expect(scroll!.scrollTop).toBe(990);
  });

  it("scrollIntoViewX", () => {
    document.body.innerHTML = `
      <div id="$1" style="width: 200px; height: 100px; overflow: auto;">
        <div id="$2" style="margin: 0px 1000px; height: 20px; width: 100px;"></div>
      </div>
    `;
    const scroll = document.getElementById("$1");
    const element = document.getElementById("$2")!;
    element.getBoundingClientRect = () => ({
      top: 0,
      bottom: 20,
      left: 1000,
      right: 1100,
      width: 100,
      height: 20,
      x: 1000,
      y: 0,
      toJSON: () => {},
    });
    Scroll.scrollIntoViewX(scroll!, element, { threshold: 10 });
    expect(scroll!.scrollLeft).toBe(990);
  });
});
