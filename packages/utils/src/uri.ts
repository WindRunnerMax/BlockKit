import { isNil } from "./is";
import type { O } from "./types";

/** URI 类 */
export class URI {
  /**
   * 锚点
   * - #id / ""
   */
  public hash: string;
  /**
   * 端口
   * - 80 / ""
   */
  public port: string;
  /**
   * 路径
   * - "/path" / ""
   */
  public path: string;
  /**
   * 主机名
   * - example.com / ""
   */
  public hostname: string;
  /**
   * 协议
   * - https: / ""
   */
  public protocol: string;
  /**
   * 查询参数
   * - URI Params
   */
  public readonly params: URIParams;

  /**
   * 构造函数
   */
  constructor() {
    this.path = "";
    this.port = "";
    this.hash = "";
    this.hostname = "";
    this.protocol = "";
    this.params = new URIParams();
  }

  /**
   * 主机
   * @returns hostname + port
   */
  public get host(): string {
    const port = this.port ? ":" + this.port : "";
    return this.hostname + port;
  }

  /**
   * 来源
   * @returns protocol + hostname + port
   */
  public get origin(): string {
    const host = this.host;
    if (!host) return "";
    if (this.protocol === ":") return "//" + host;
    const protocol = this.protocol ? this.protocol + "//" : "";
    return protocol + host;
  }

  /**
   * 查询参数
   * @returns "" / ?key=value&key=value
   */
  public get search(): string {
    return this.params.format();
  }

  /**
   * 链接
   * @returns protocol + hostname + port + path + search + hash
   */
  public get href(): string {
    return this.format();
  }

  /**
   * 设置协议
   * - 协议设置为 : 时, 则表示为 //host:port/path
   * @param protocol https
   */
  public setProtocol(protocol: string): this {
    if (!protocol) {
      this.protocol = "";
      return this;
    }
    this.protocol = protocol.endsWith(":") ? protocol : protocol + ":";
    return this;
  }

  /**
   * 设置主机名
   * @param hostname www.example.com
   */
  public setHostname(hostname: string): this {
    this.hostname = hostname.endsWith("/") ? hostname.slice(0, -1) : hostname;
    return this;
  }

  /**
   * 设置端口
   * @param port 80
   */
  public setPort(port: string | number): this {
    this.port = port.toString();
    return this;
  }

  /**
   * 设置路径
   * @param path /get/email
   * @param normalize 是否归一化路径
   */
  public setPath(path: string, normalize = true): this {
    const pathname = normalize ? URI.resolvePath(path) : path;
    this.path = pathname.startsWith("/") ? pathname : "/" + pathname;
    return this;
  }

  /**
   * 设置锚点
   * @param hash #heading
   */
  public setHash(hash: string): this {
    if (!hash || hash === "#") {
      this.hash = "";
      return this;
    }
    this.hash = hash.startsWith("#") ? hash : "#" + hash;
    return this;
  }

  /**
   * 输出格式化链接
   */
  public format(): string {
    return this.origin + this.path + this.search + this.hash;
  }

  /**
   * 输出格式化链接
   */
  public toString(): string {
    return this.format();
  }

  /**
   * 克隆 URI 实例
   */
  public clone(): URI {
    const Constructor = this.constructor as typeof URI;
    const instance = new Constructor();
    instance.setProtocol(this.protocol);
    instance.setHostname(this.hostname);
    instance.setPort(this.port);
    instance.setPath(this.path);
    instance.setHash(this.hash);
    for (const [key, value] of Object.entries(this.params.raw)) {
      instance.params.assign(key, value);
    }
    return instance;
  }

  /**
   * 从 Location 解析
   * @param location
   */
  public static from(this: typeof URI, location: Location): URI {
    const instance = new this();
    instance.setPath(location.pathname);
    instance.setProtocol(location.protocol);
    instance.setHostname(location.hostname);
    instance.setPort(location.port);
    instance.setHash(location.hash);
    const search = new URLSearchParams(location.search);
    for (const [key, value] of search.entries()) {
      instance.params.append(key, value);
    }
    return instance;
  }

  /**
   * 解析链接
   * @param uri
   * @example /search?q=1&q=2&w=3#world
   * @example https://www.google.com:333/search?q=1&q=2&w=3#world
   */
  public static parse(this: typeof URI, uri: string): URI {
    const instance = new this();
    // 默认基准 URL, 支持解析相对路径
    const DEF_BASE_URL = "ftp://u";
    const url = new URL(uri, DEF_BASE_URL);
    const isAbsoluteURL = url.origin !== DEF_BASE_URL || uri.startsWith(DEF_BASE_URL);
    const isProtocolRelative = uri.startsWith("//");
    if (isAbsoluteURL) {
      instance.setProtocol(isProtocolRelative ? ":" : url.protocol);
      instance.setHostname(url.hostname);
    }
    instance.setPort(url.port);
    instance.setPath(url.pathname);
    instance.setHash(url.hash);
    for (const [key, value] of url.searchParams.entries()) {
      instance.params.append(key, value);
    }
    return instance;
  }

  /**
   * 从路径解析数据
   * @param path
   * @param template
   * @example ("/user/123", "/user/:id") => { id: "123" }
   */
  public static parsePathParams(path: string, template: string): O.Map<string> {
    const pathValue = path.startsWith("/") ? path.slice(1) : path;
    const templateValue = template.startsWith("/") ? template.slice(1) : template;
    const keys = templateValue.split("/");
    const values = pathValue.split("/");
    const len = Math.min(keys.length, values.length);
    const result: Record<string, string> = {};
    for (let i = 0; i < len; i++) {
      const key = keys[i];
      const value = values[i];
      // 参数值匹配
      if (key && key.startsWith(":")) {
        result[key.slice(1)] = value;
        continue;
      }
      // 路径与模板不匹配
      if (key !== "*" && key !== value) {
        break;
      }
    }
    return result;
  }

  /**
   * 合并查询路径片段
   * - 类似 path.join 合并 URL 路径的实现
   * - 确保路径以 / 开头, 默认移除尾部 /
   * - 确保连续的 /[///] 为一个 /
   * @param args 路径片段数组
   */
  public static resolvePath(...args: Array<string | number | undefined | null>): string {
    let pathname = "/" + args.filter(p => !isNil(p)).join("/");
    pathname = pathname.replace(/\.\//g, "/").replace(/\/{2,}/g, "/");
    if (pathname.endsWith("/") && pathname !== "/") {
      pathname = pathname.slice(0, -1);
    }
    return pathname;
  }
}

/** URI 查询参数 */
export class URIParams {
  /**
   * 查询参数
   * - Query Object -> { [q]: [v1, v2] }
   */
  public readonly raw: O.Map<string[]>;

  /**
   * 构造函数
   */
  public constructor() {
    this.raw = {};
  }

  /**
   * 获取 key 下首个查询参数
   * @param key
   * @returns 查询参数值 value
   */
  public get(key: string): string | null {
    const value = this.raw[key];
    return value && value.length ? value[0] : null;
  }

  /**
   * 获取 key 下所有查询参数
   * @param key
   * @returns 查询参数值数组 ["value1", "value2"]
   */
  public getAll(key: string): string[] {
    const value = this.raw[key];
    return value || [];
  }

  /**
   * 分配查询参数
   * @param key
   * @param value
   */
  public set(key: string, value: string | string[]): this {
    return this.assign(key, value);
  }

  /**
   * 分配查询参数
   * @param key
   * @param value
   */
  public assign(key: string, value: string | string[]): this {
    if (!key || isNil(value)) return this;
    this.raw[key] = Array.isArray(value) ? value.slice() : [value];
    return this;
  }

  /**
   * 追加查询参数
   * @param key
   * @param value
   */
  public append(key: string, value: string): this {
    if (!key || isNil(value)) return this;
    if (!this.raw[key]) this.raw[key] = [];
    this.raw[key].push(value);
    return this;
  }

  /**
   * 删除完整查询参数
   * @param key
   */
  public remove(key: string): this {
    delete this.raw[key];
    return this;
  }

  /**
   * 删除单个查询参数
   * @param key
   */
  public omit(key: string, value: string): this {
    const list = this.raw[key];
    if (list) {
      this.raw[key] = list.filter(v => v !== value);
    }
    const newList = this.raw[key];
    if (newList && !newList.length) {
      delete this.raw[key];
    }
    return this;
  }

  /**
   * 迭代查询参数
   * @param callback 回调函数
   */
  public forEach(callback: (key: string, value: string[]) => void): this {
    for (const [key, list] of Object.entries(this.raw)) {
      callback(key, list);
    }
    return this;
  }

  /**
   * 输出格式化查询参数
   * @returns "" / ?key=value&key=value
   */
  public format(): string {
    const nodes: string[] = [];
    const encode = encodeURIComponent;
    for (const [key, value] of Object.entries(this.raw)) {
      value.forEach(v => nodes.push(encode(key) + "=" + encode(v)));
    }
    if (!nodes.length) return "";
    return "?" + nodes.join("&");
  }

  /**
   * 输出格式化查询参数
   */
  public toString(): string {
    return this.format();
  }

  /**
   * 克隆 URIParams 实例
   */
  public clone(): URIParams {
    const Constructor = this.constructor as typeof URIParams;
    const instance = new Constructor();
    for (const [key, value] of Object.entries(this.raw)) {
      instance.assign(key, value);
    }
    return instance;
  }

  /**
   * 解析查询参数 search
   * @param query
   * @example ?q=1&w=3
   */
  public static parse(
    this: typeof URIParams,
    query: ConstructorParameters<typeof URLSearchParams>["0"]
  ): URIParams {
    const search = new URLSearchParams(query);
    const instance = new this();
    for (const [key, value] of search.entries()) {
      instance.append(key, value);
    }
    return instance;
  }

  /**
   * 生成 URI Search 参数
   * @param params
   * @example {} => ""
   * @example { q: "1", w: "2" } => "?q=1&w=2"
   */
  public static stringify(params: O.Map<string | number | null | undefined>): string {
    const init: O.Map<string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (isNil(value)) continue;
      init[key] = String(value);
    }
    const search = new URLSearchParams(init).toString();
    return search ? "?" + search : "";
  }
}
