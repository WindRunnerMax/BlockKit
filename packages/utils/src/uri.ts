import { isNil } from "./is";
import type { O } from "./types";

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
   * - Query Object -> { [q]: [v1, v2] }
   */
  public params: Record<string, string[]>;

  /**
   * 构造函数
   */
  constructor() {
    this.path = "";
    this.port = "";
    this.hash = "";
    this.params = {};
    this.hostname = "";
    this.protocol = "";
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
    if (this.protocol === ":") return "//" + this.host;
    const protocol = this.protocol ? this.protocol + "//" : "";
    return protocol + this.host;
  }

  /**
   * 查询参数
   * @returns ?key=value&key=value / ""
   */
  public get search(): string {
    const nodes: string[] = [];
    for (const [key, value] of Object.entries(this.params)) {
      value.forEach(v => nodes.push(key + "=" + v));
    }
    if (!nodes.length) return "";
    return "?" + nodes.join("&");
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
   * @param protocol https
   */
  public setProtocol(protocol: string): this {
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
    let pathname = path;
    // 确保路径以 / 开头 (而是否存在尾 / 都是合法的)
    !path.startsWith("/") && (pathname = "/" + path);
    // 替换连续的 /[///] 为一个 /
    normalize && (pathname = pathname.replace(/\/{2,}/g, "/"));
    this.path = pathname;
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
   * 获取 key 下首个查询参数
   * @param key
   * @returns 查询参数值 value
   */
  public get(key: string): string | null {
    const value = this.params[key];
    return value && value.length ? value[0] : null;
  }

  /**
   * 获取 key 下所有查询参数
   * @param key
   * @returns 查询参数值数组 ["value1", "value2"]
   */
  public getAll(key: string): string[] {
    const value = this.params[key];
    return value || [];
  }

  /**
   * 分配查询参数
   * @param key
   * @param value
   */
  public assign(key: string, value: string): this {
    if (!key || isNil(value)) {
      return this;
    }
    this.params[key] = [value];
    return this;
  }

  /**
   * 追加查询参数
   * @param key
   * @param value
   */
  public append(key: string, value: string): this {
    if (!key || isNil(value)) {
      return this;
    }
    if (!this.params[key]) {
      this.params[key] = [];
    }
    this.params[key].push(value);
    return this;
  }

  /**
   * 删除完整查询参数
   * @param key
   */
  public remove(key: string): this {
    delete this.params[key];
    return this;
  }

  /**
   * 删除单个查询参数
   * @param key
   */
  public omit(key: string, value: string): this {
    const list = this.params[key];
    if (list) {
      this.params[key] = list.filter(v => v !== value);
    }
    return this;
  }

  /**
   * 迭代查询参数
   * @param callback 回调函数
   */
  public forEach(callback: (key: string, value: string[]) => void): this {
    for (const [key, list] of Object.entries(this.params)) {
      callback(key, list);
    }
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
    const instance = new URI();
    instance.setProtocol(this.protocol);
    instance.setHostname(this.hostname);
    instance.setPort(this.port);
    instance.setPath(this.path);
    instance.setHash(this.hash);
    for (const [key, value] of Object.entries(this.params)) {
      value.forEach(v => instance.append(key, v));
    }
    return instance;
  }

  /**
   * 从 Location 解析
   * @param location
   */
  public static from(location: Location): URI {
    const instance = URI.parseParams(location.search);
    instance.setPath(location.pathname);
    instance.setProtocol(location.protocol);
    instance.setHostname(location.hostname);
    instance.setPort(location.port);
    instance.setHash(location.hash);
    return instance;
  }

  /**
   * 解析完整链接
   * @param uri
   * @param baseUrl
   * @example https://www.google.com:333/search?q=1&q=2&w=3#world
   */
  public static parse(this: typeof URI, uri: string, baseUrl?: string): URI {
    const url = new URL(uri, baseUrl);
    const instance = new this();
    instance.setProtocol(url.protocol);
    instance.setHostname(url.hostname);
    instance.setPort(url.port);
    instance.setPath(url.pathname);
    instance.setHash(url.hash);
    for (const [key, value] of url.searchParams.entries()) {
      instance.append(key, value);
    }
    return instance;
  }

  /**
   * 解析查询参数 search
   * @param query
   * @example ?q=1&w=3
   */
  public static parseParams(query: ConstructorParameters<typeof URLSearchParams>["0"]): URI {
    const search = new URLSearchParams(query);
    const instance = new URI();
    for (const [key, value] of search.entries()) {
      instance.append(key, value);
    }
    return instance;
  }

  /**
   * 从路径解析数据
   * @param path
   * @param template
   * @example ("/user/123", "/user/:id") => { id: "123" }
   */
  public static parsePathParams(path: string, template: string): Record<string, string> {
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
   * 生成 URI Search 参数
   * @param params
   * @example {} => ""
   * @example { q: "1", w: "2" } => "?q=1&w=2"
   */
  public static stringifyParams(params: O.Map<string | number>): string {
    const init: O.Map<string> = {};
    for (const [key, value] of Object.entries(params)) {
      init[key] = String(value);
    }
    const search = new URLSearchParams(init).toString();
    return search ? "?" + search : "";
  }
}
