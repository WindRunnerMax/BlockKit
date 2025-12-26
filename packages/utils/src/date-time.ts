import { isNumber, isString } from "./is";
import type { O } from "./types";

export class DateTime extends Date {
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
    // 无参构建
    if (p1 === void 0) {
      super();
      return this;
    }
    // 第一个参数为 Date 或者 Number 且无第二个参数
    if (p1 instanceof Date || (isNumber(p1) && p2 === void 0)) {
      super(p1);
      return this;
    }
    // 第一和第二个参数都为 Number
    if (isNumber(p1) && isNumber(p2)) {
      super(p1, p2, p3 || 1, p4 || 0, p5 || 0, p6 || 0, p7 || 0);
      return this;
    }
    // 第一个参数为 String
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
    // https://stackoverflow.com/questions/55176208/inconsistent-behavior-of-javascript-date-function-in-ios
    if (isString(p1)) {
      // ISO/RFC 时间格式则直接解析
      // 2024-12-12T13:53:51.829Z / Sat Jun 21 2025 20:05:06 GMT+0800
      if (p1.indexOf("T") > -1) {
        super(p1);
        return this;
      }
      const normalize = p1.replace(/\d+-\d+-\d+/, m => m.replace(/-/g, "/"));
      super(normalize);
      return this;
    }
    throw new Error("No suitable parameters");
  }

  /**
   * 格式化时间日期
   * - yyyy 年 MM 月 dd 日 hh 小时 mm 分 ss 秒 S 毫秒
   * @param fmt [?=yyyy-MM-dd]
   */
  public format(fmt = "yyyy-MM-dd"): string {
    const preset: O.Map<string | number> = {
      "M+": this.getMonth() + 1, // 月份
      "d+": this.getDate(), // 日
      "h+": this.getHours(), // 小时
      "m+": this.getMinutes(), // 分
      "s+": this.getSeconds(), // 秒
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, this.getFullYear().toString().slice(-RegExp.$1.length));
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
    if (days) this.setDate(this.getDate() + days);
    if (months) this.setMonth(this.getMonth() + months);
    if (years) this.setFullYear(this.getFullYear() + years);
    return this;
  }

  /**
   * 精确的时间差 取绝对值
   * - years / months / days 累计所有时间差计算
   * - hours / minutes / seconds 独立按天时间差计算
   * @param newDate
   */
  public diff(newDate: DateTime) {
    // 先转为秒
    const diffTime = Math.abs(newDate.getTime() - this.getTime()) / 1000;
    const years = Math.floor(diffTime / 31536000);
    const months = Math.floor(diffTime / 2592000);
    const days = Math.floor(diffTime / 86400);
    const hours = Math.floor(diffTime / 3600) - 24 * days;
    const minutes = Math.floor((diffTime % 3600) / 60);
    const seconds = Math.floor(diffTime % 60);
    return { years, months, days, hours, minutes, seconds };
  }

  /**
   * 延后到第 N 个月的 1 号 [mutate]
   * @param n
   */
  public nextMonth(n: number = 1) {
    this.setMonth(this.getMonth() + n);
    this.setDate(1);
    this.setHours(0, 0, 0, 0);
    return this;
  }

  /**
   * 延后到第 N 天的 0 点 [mutate]
   * @param n
   */
  public nextDay(n: number = 1) {
    this.setDate(this.getDate() + n);
    this.setHours(0, 0, 0, 0);
    return this;
  }

  /**
   * 延后到第 N 小时的 0 分钟 [mutate]
   * @param n
   */
  public nextHour(n: number = 1) {
    this.setHours(this.getHours() + n);
    this.setMinutes(0, 0, 0);
    return this;
  }

  /**
   * 延后到第 N 分钟的 0 秒 [mutate]
   * @param n
   */
  public nextMinute(n: number = 1) {
    this.setMinutes(this.getMinutes() + n);
    this.setSeconds(0, 0);
    return this;
  }

  /**
   * 延后 N 个月 [mutate]
   * @param n
   */
  public deferMonth(n: number = 1) {
    this.setMonth(this.getMonth() + n);
    return this;
  }

  /**
   * 延后 N 天 [mutate]
   * @param n
   */
  public deferDay(n: number = 1) {
    this.setDate(this.getDate() + n);
    return this;
  }

  /**
   * 延后 N 小时 [mutate]
   * @param n
   */
  public deferHour(n: number = 1) {
    this.setHours(this.getHours() + n);
    return this;
  }

  /**
   * 延后 N 分钟 [mutate]
   * @param n
   */
  public deferMinute(n: number = 1) {
    this.setMinutes(this.getMinutes() + n);
    return this;
  }

  /**
   * 克隆当前时间日期
   */
  public clone(): DateTime {
    return new DateTime(this.getTime());
  }

  /**
   * 转换为 DateTime
   */
  public static from(date: Date | DateTime): DateTime {
    return new DateTime(date);
  }
}
