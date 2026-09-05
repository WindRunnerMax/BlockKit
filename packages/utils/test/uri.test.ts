import { URI, URIParams } from "../src/uri";

describe("uri", () => {
  it("parser", () => {
    const url = URI.parse("https://www.google.com:333/search?q=1&q=2&w=3#world");
    expect(url.protocol).toBe("https:");
    expect(url.hostname).toBe("www.google.com");
    expect(url.port).toBe("333");
    expect(url.path).toBe("/search");
    expect(url.host).toBe("www.google.com:333");
    expect(url.origin).toBe("https://www.google.com:333");
    expect(url.params.get("q")).toBe("1");
    expect(url.params.getAll("q")).toEqual(["1", "2"]);
    expect(url.search).toBe("?q=1&q=2&w=3");
    expect(url.hash).toBe("#world");
    expect(url.href).toBe("https://www.google.com:333/search?q=1&q=2&w=3#world");
    expect(url.format()).toBe(url.href);
    expect(url.toString()).toBe(url.href);
  });

  it("setter", () => {
    const url = new URI();
    url
      .setProtocol("https")
      .setHostname("www.google.com")
      .setPort("333")
      .setPath("/search")
      .setHash("world")
      .params.append("q", "1")
      .append("q", "2")
      .append("w", "3");
    expect(url.href).toBe("https://www.google.com:333/search?q=1&q=2&w=3#world");
  });

  it("query parse", () => {
    const params = URIParams.parse("?q=1&q=2&w=3");
    expect(params.get("q")).toBe("1");
    expect(params.getAll("q")).toEqual(["1", "2"]);
    expect(params.format()).toBe("?q=1&q=2&w=3");
    expect(params.toString()).toBe(params.format());
  });

  it("query setter", () => {
    const url = new URI().setPath("/search");
    url.params.append("q", "1").append("q", "2").append("w", "3");
    expect(url.href).toBe("/search?q=1&q=2&w=3");
  });

  it("match path", () => {
    const res1 = URI.parsePathParams("/search/1", "/s/:id");
    const res2 = URI.parsePathParams("/search/1", "/*/:id");
    const res2_2 = URI.parsePathParams("/search/1", "*/:id");
    const res2_3 = URI.parsePathParams("search/1", "/*/:id");
    const res3 = URI.parsePathParams("/search/1/hi", "/search/:id/:name");
    expect(res1).toEqual({});
    expect(res2).toEqual({ id: "1" });
    expect(res2_2).toEqual({ id: "1" });
    expect(res2_3).toEqual({ id: "1" });
    expect(res3).toEqual({ id: "1", name: "hi" });
  });

  it("match path partial", () => {
    const res1 = URI.parsePathParams("/search/1/c/2/3", "/search/:m1/c/:m2/:m3");
    const res2 = URI.parsePathParams("/search/1/c/2/3", "/search/:m1/c/:m2/");
    const res3 = URI.parsePathParams("/search/1/c/2/3", "/search/:m1/d/:m2/:m3");
    expect(res1).toEqual({ m1: "1", m2: "2", m3: "3" });
    expect(res2).toEqual({ m1: "1", m2: "2" });
    expect(res3).toEqual({ m1: "1" });
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
    const search = URIParams.stringify({ a: 1, b: "2" });
    expect(search).toBe("?a=1&b=2");
  });

  it("uri stringify empty params", () => {
    const search = URIParams.stringify({});
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
    const uri2 = uri.clone().setProtocol(":");
    expect(uri2.href).toBe("//www.baidu.com/xx");
  });

  it("uri path normalize", () => {
    const uri = new URI();
    uri.setPath("search");
    expect(uri.format()).toBe("/search");
    uri.setPath("/search///");
    expect(uri.format()).toBe("/search");
    uri.setPath("search/");
    expect(uri.format()).toBe("/search");
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

  it("parse relative path", () => {
    const uri = URI.parse("/search?q=1&q=2&w=3#world");
    expect(uri.hash).toBe("#world");
    expect(uri.path).toBe("/search");
    expect(uri.search).toBe("?q=1&q=2&w=3");
    expect(uri.protocol).toBe("");
    expect(uri.host).toBe("");
    expect(uri.format()).toBe("/search?q=1&q=2&w=3#world");
  });

  it("uri query stringify", () => {
    const search = URIParams.stringify({ q: "1", w: "2", e: null, z: undefined });
    expect(search).toBe("?q=1&w=2");
    expect(URIParams.stringify({})).toBe("");
  });

  it("uri resolve path", () => {
    const pathname = URI.resolvePath("search", null, undefined, "s1", "s2");
    expect(pathname).toBe("/search/s1/s2");
    const p2 = URI.resolvePath("/search", "////s1", "s2");
    expect(p2).toBe("/search/s1/s2");
    const p3 = URI.resolvePath("/search/", "/s1//", "s2//");
    expect(p3).toBe("/search/s1/s2");
    const p4 = URI.resolvePath("/");
    expect(p4).toBe("/");
    const p5 = URI.resolvePath("////");
    expect(p5).toBe("/");
    expect(URI.resolvePath("/s/")).toBe("/s");
  });

  it("uri resolve path 2", () => {
    expect(URI.resolvePath("")).toBe("/");
    expect(URI.resolvePath("")).toBe("/");
    expect(URI.resolvePath("///")).toBe("/");
    expect(URI.resolvePath("///")).toBe("/");
    expect(URI.resolvePath("/s/")).toBe("/s");
    expect(URI.resolvePath("/s")).toBe("/s");
    expect(URI.resolvePath("/s/////")).toBe("/s");
    expect(URI.resolvePath("/s/////")).toBe("/s");
    expect(URI.resolvePath("/././")).toBe("/./.");
    expect(URI.resolvePath("/./ss/.../")).toBe("/./ss/...");
    expect(URI.resolvePath("/./../.../")).toBe("/./../...");
  });

  it("relative path verification", () => {
    const uri = URI.parse("/search");
    expect(uri.format()).toBe("/search");
    const uri2 = URI.parse("https://u/search");
    expect(uri2.format()).toBe("https://u/search");
    const uri3 = URI.parse("ftp://u/search");
    expect(uri3.format()).toBe("ftp://u/search");
    const uri4 = URI.parse("ftp://u:777/search");
    expect(uri4.format()).toBe("ftp://u:777/search");
    const uri5 = URI.parse("ftp://n/search");
    expect(uri5.format()).toBe("ftp://n/search");
    const uri6 = URI.parse("http://n:777/search");
    expect(uri6.format()).toBe("http://n:777/search");
    const uri7 = URI.parse("//n/search");
    expect(uri7.format()).toBe("//n/search");
  });

  it("query encoding round-trip", () => {
    // 包含需要编码的特殊字符
    const uri = URI.parse("/search?q=hello%20world&key=%26%3D");
    expect(uri.params.get("q")).toBe("hello world");
    expect(uri.params.get("key")).toBe("&=");
    // 格式化后应与输入一致 注意 %20 可能变成 +, 但标准允许
    const formatted = uri.search;
    // 使用 URLSearchParams 再解析检查
    const parsedAgain = new URLSearchParams(formatted);
    expect(parsedAgain.get("q")).toBe("hello world");
    expect(parsedAgain.get("key")).toBe("&=");
  });

  it("query encode on output", () => {
    const params = new URIParams();
    params.append("key&1", "val=ue");
    expect(params.format()).toBe("?key%261=val%3Due");
  });

  it("params omit removes empty key", () => {
    const params = new URIParams();
    params.append("a", "1").append("a", "2").append("b", "3");
    params.omit("a", "1");
    expect(params.raw["a"]).toEqual(["2"]);
    params.omit("a", "2");
    expect(params.raw).not.toHaveProperty("a");
    expect(params.format()).toBe("?b=3");
  });

  it("params remove clears key", () => {
    const params = new URIParams();
    params.append("a", "1");
    params.remove("a");
    expect(params.raw).not.toHaveProperty("a");
    expect(params.format()).toBe("");
  });

  it("set port 0", () => {
    const uri = new URI().setHostname("localhost").setPort(0);
    expect(uri.host).toBe("localhost:0");
  });

  it("resolve path with nil", () => {
    expect(URI.resolvePath("api", 0, "v1")).toBe("/api/0/v1");
    expect(URI.resolvePath("api", "", "v1")).toBe("/api/v1");
  });

  it("parse base URL itself", () => {
    const uri = URI.parse("ftp://u");
    expect(uri.protocol).toBe("ftp:");
    expect(uri.hostname).toBe("u");
    expect(uri.path).toBe("/");
    expect(uri.format()).toBe("ftp://u/");
  });

  it("parse protocol-relative without path", () => {
    const uri = URI.parse("//example.com");
    expect(uri.protocol).toBe(":");
    expect(uri.hostname).toBe("example.com");
    expect(uri.path).toBe("/");
    expect(uri.format()).toBe("//example.com/");
  });

  it("parse URL with user info", () => {
    const uri = URI.parse("https://user:pass@example.com/path");
    expect(uri.hostname).toBe("example.com");
    expect(uri.path).toBe("/path");
    expect(uri.format()).toBe("https://example.com/path");
  });

  it("parse empty string", () => {
    const uri = URI.parse("");
    expect(uri.protocol).toBe("");
    expect(uri.hostname).toBe("");
    expect(uri.path).toBe("/");
    expect(uri.format()).toBe("/");
  });

  it("setPath with empty string", () => {
    const uri = new URI().setPath("");
    expect(uri.path).toBe("/");
  });

  it("clone independence", () => {
    const uri = URI.parse("https://example.com/path?q=1");
    const cloned = uri.clone();
    cloned.setPath("/new").params.append("q", "2");
    expect(uri.format()).toBe("https://example.com/path?q=1");
    expect(cloned.format()).toBe("https://example.com/new?q=1&q=2");
  });

  it("clone preserves subclass", () => {
    class MyURI extends URI {}
    const myUri = new MyURI();
    const cloned = myUri.clone();
    expect(cloned instanceof MyURI).toBe(true);
  });
});
