import { isNumber, isString } from "./is";
import type { O } from "./types";

export class DateTime {
  /**
   * Raw Date Object
   */
  public readonly raw: Date;

  /**
   * 构造函数
   */
  public constructor();
  public constructor(date: Date);
  public constructor(timestamp: number);
  public constructor(dateTimeStr: string);
  public constructor(
    year: number,
    month: number,
    date?: number,
    hours?: number,
    minutes?: number,
    seconds?: number,
    ms?: number
  );
  public constructor(
    p1?: Date | number | string,
    p2?: number,
    p3?: number,
    p4?: number,
    p5?: number,
    p6?: number,
    p7?: number
  ) {
    // 内建 Date 对象, 避免直接继承 Date, 导致 ES6 类编译降级问题
    // 该情况在主流浏览器不会出问题, 目前仅发现在 Google Bot 中抛出异常
    // 无参数构建
    if (p1 === void 0) {
      this.raw = new Date();
      return this;
    }
    // 第一个参数为 Date 或者 Number 且无第二个参数
    if (p1 instanceof Date || (isNumber(p1) && p2 === void 0)) {
      this.raw = new Date(p1);
      return this;
    }
    // 第一和第二个参数都为 Number
    if (isNumber(p1) && isNumber(p2)) {
      this.raw = new Date(p1, p2, p3 || 1, p4 || 0, p5 || 0, p6 || 0, p7 || 0);
      return this;
    }
    // 第一个参数为 String
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
    // https://stackoverflow.com/questions/55176208/inconsistent-behavior-of-javascript-date-function-in-ios
    if (isString(p1)) {
      // ISO/RFC 时间格式则直接解析
      // 2024-12-12T13:53:51.829Z / Sat Jun 21 2025 20:05:06 GMT+0800
      if (p1.indexOf("T") > -1) {
        this.raw = new Date(p1);
        return this;
      }
      const normalize = p1.replace(/\d+-\d+-\d+/, m => m.replace(/-/g, "/"));
      this.raw = new Date(normalize);
      return this;
    }
    throw new Error("No suitable parameters");
  }

  /**
   * 格式化时间日期
   * - yyyy[year] MM[month] dd[date] hh[hour] mm[minute] ss[second]
   * @param fmt [?=yyyy-MM-dd]
   */
  public format(fmt = "yyyy-MM-dd"): string {
    const raw = this.raw;
    const preset: O.Map<number> = {
      "M+": raw.getMonth() + 1, // 月份
      "d+": raw.getDate(), // 日
      "h+": raw.getHours(), // 小时
      "m+": raw.getMinutes(), // 分
      "s+": raw.getSeconds(), // 秒
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, raw.getFullYear().toString().slice(-RegExp.$1.length));
    }
    for (const k of Object.keys(preset)) {
      if (new RegExp(`(${k})`).test(fmt)) {
        const val = preset[k].toString();
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length === 1 ? val : val.padStart(RegExp.$1.length, "0")
        );
      }
    }
    return fmt;
  }

  /**
   * 调整时间 [mutate]
   * @param years 年
   * @param months 月
   * @param days 日
   */
  public add(years: number = 0, months: number = 0, days: number = 0): DateTime {
    const raw = this.raw;
    if (days) raw.setDate(raw.getDate() + days);
    if (months) raw.setMonth(raw.getMonth() + months);
    if (years) raw.setFullYear(raw.getFullYear() + years);
    return this;
  }

  /**
   * 精确的时间差 取绝对值
   * - minus (this - param) 当前时间小于参数时间
   * - years / months / days 累计所有时间差计算
   * - hours / minutes / seconds 独立按天时间差计算
   */
  public diff(newDate: DateTime) {
    const thisTime = this.raw.getTime();
    const newDateTime = newDate.raw.getTime();
    const minus = thisTime < newDateTime;
    const total = Math.abs(thisTime - newDateTime) / 1000;
    const years = Math.floor(total / 31536000);
    const months = Math.floor(total / 2592000);
    const days = Math.floor(total / 86400);
    const hours = Math.floor(total / 3600) - 24 * days;
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = Math.floor(total % 60);
    type DiffResult = {
      /** this 时间是否小于 param 时间 */ minus: boolean;
      /** 年差绝对值 */ years: number;
      /** 月差绝对值 */ months: number;
      /** 日差绝对值 */ days: number;
      /** 天内小时差绝对值 */ hours: number;
      /** 天内分钟差绝对值 */ minutes: number;
      /** 天内秒差绝对值 */ seconds: number;
      /** 总秒差绝对值 */ total: number;
    };
    const result: DiffResult = { minus, years, months, days, hours, minutes, seconds, total };
    return result;
  }

  /**
   * 延后到第 N 个月的 1 号 [mutate]
   * @param n
   */
  public nextMonth(n: number = 1) {
    const raw = this.raw;
    raw.setMonth(raw.getMonth() + n);
    raw.setDate(1);
    raw.setHours(0, 0, 0, 0);
    return this;
  }

  /**
   * 延后到第 N 天的 0 点 [mutate]
   * @param n
   */
  public nextDay(n: number = 1) {
    const raw = this.raw;
    raw.setDate(raw.getDate() + n);
    raw.setHours(0, 0, 0, 0);
    return this;
  }

  /**
   * 延后到第 N 小时的 0 分钟 [mutate]
   * @param n
   */
  public nextHour(n: number = 1) {
    const raw = this.raw;
    raw.setHours(raw.getHours() + n);
    raw.setMinutes(0, 0, 0);
    return this;
  }

  /**
   * 延后到第 N 分钟的 0 秒 [mutate]
   * @param n
   */
  public nextMinute(n: number = 1) {
    const raw = this.raw;
    raw.setMinutes(raw.getMinutes() + n);
    raw.setSeconds(0, 0);
    return this;
  }

  /**
   * 延后 N 个月 [mutate]
   * @param n
   */
  public deferMonth(n: number = 1) {
    const raw = this.raw;
    raw.setMonth(raw.getMonth() + n);
    return this;
  }

  /**
   * 延后 N 天 [mutate]
   * @param n
   */
  public deferDay(n: number = 1) {
    const raw = this.raw;
    raw.setDate(raw.getDate() + n);
    return this;
  }

  /**
   * 延后 N 小时 [mutate]
   * @param n
   */
  public deferHour(n: number = 1) {
    const raw = this.raw;
    raw.setHours(raw.getHours() + n);
    return this;
  }

  /**
   * 延后 N 分钟 [mutate]
   * @param n
   */
  public deferMinute(n: number = 1) {
    const raw = this.raw;
    raw.setMinutes(raw.getMinutes() + n);
    return this;
  }

  /**
   * 克隆当前时间日期
   */
  public clone(): DateTime {
    const raw = this.raw;
    return new DateTime(raw.getTime());
  }

  /**
   * 获取时间戳
   */
  public getTime(): number {
    return this.raw.getTime();
  }

  /**
   * 转换为 DateTime
   */
  public static from(date: Date | DateTime): DateTime {
    return new DateTime(date.getTime());
  }
}
