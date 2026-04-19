import { URI } from "../src/uri";

describe("uri", () => {
  it("parser", () => {
    const url = URI.parse("https://www.google.com:333/search?q=1&q=2&w=3#world");
    expect(url.protocol).toBe("https:");
    expect(url.hostname).toBe("www.google.com");
    expect(url.port).toBe("333");
    expect(url.path).toBe("/search");
    expect(url.host).toBe("www.google.com:333");
    expect(url.origin).toBe("https://www.google.com:333");
    expect(url.get("q")).toBe("1");
    expect(url.getAll("q")).toEqual(["1", "2"]);
    expect(url.search).toBe("?q=1&q=2&w=3");
    expect(url.hash).toBe("#world");
    expect(url.href).toBe("https://www.google.com:333/search?q=1&q=2&w=3#world");
  });

  it("setter", () => {
    const url = new URI();
    url
      .setProtocol("https")
      .setHostname("www.google.com")
      .setPort("333")
      .setPath("/search")
      .append("q", "1")
      .append("q", "2")
      .append("w", "3")
      .setHash("world");
    expect(url.href).toBe("https://www.google.com:333/search?q=1&q=2&w=3#world");
  });

  it("query parse", () => {
    const url = URI.parseParams("?q=1&q=2&w=3");
    expect(url.get("q")).toBe("1");
    expect(url.getAll("q")).toEqual(["1", "2"]);
    expect(url.search).toBe("?q=1&q=2&w=3");
  });

  it("query setter", () => {
    const url = new URI().setPath("/search").append("q", "1").append("q", "2").append("w", "3");
    expect(url.href).toBe("/search?q=1&q=2&w=3");
  });

  it("match path", () => {
    const res1 = URI.parsePathParams("/search/1", "/s/:id");
    const res2 = URI.parsePathParams("/search/1", "/*/:id");
    const res3 = URI.parsePathParams("/search/1/hi", "/search/:id/:name");
    expect(res1).toEqual({});
    expect(res2).toEqual({ id: "1" });
    expect(res3).toEqual({ id: "1", name: "hi" });
  });

  it("parse no hash", () => {
    const uri = URI.parse("https://www.google.com/");
    expect(uri.format()).toBe("https://www.google.com/");
  });

  it("uri parse inherit", () => {
    class URI2 extends URI {
      public setHash(hash: string): this {
        this.hash = "#mock" + hash;
        return this;
      }
    }
    const uri2 = URI2.parse("https://www.google.com/");
    expect(uri2.format()).toBe("https://www.google.com/#mock");
  });

  it("uri stringify params", () => {
    const search = URI.stringifyParams({ a: 1, b: "2" });
    expect(search).toBe("?a=1&b=2");
  });

  it("uri stringify empty params", () => {
    const search = URI.stringifyParams({});
    expect(search).toBe("");
  });

  it("uri clone", () => {
    const uri = URI.parse("https://www.google.com:333/search?q=1&q=2&w=3#world");
    const clone = uri.clone();
    expect(clone.format()).toBe(uri.format());
  });

  it("non protocol", () => {
    const uri = new URI();
    uri.setHostname("www.baidu.com").setPath("/xx");
    expect(uri.href).toBe("www.baidu.com/xx");
    const uri2 = uri.clone().setProtocol("");
    expect(uri2.href).toBe("//www.baidu.com/xx");
  });

  it("uri normalize", () => {
    const uri = new URI();
    uri.setPath("search");
    expect(uri.format()).toBe("/search");
    uri.setPath("/search///");
    expect(uri.format()).toBe("/search/");
    uri.setPath("search/");
    expect(uri.format()).toBe("/search/");
    uri.setPath("search/s1");
    expect(uri.format()).toBe("/search/s1");
    uri.setPath("search//s1");
    expect(uri.format()).toBe("/search/s1");
    uri.setPath("search///s1");
    expect(uri.format()).toBe("/search/s1");
    uri.setPath("search", false);
    expect(uri.format()).toBe("/search");
    uri.setPath("/search///", false);
    expect(uri.format()).toBe("/search///");
  });
});
