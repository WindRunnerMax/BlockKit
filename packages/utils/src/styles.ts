import { SPACE } from "./constant";
import { isNil, isObject, isPlainNumber, isString } from "./is";
import type { Primitive } from "./types";

/**
 * 样式表工具类
 */
export class Facade {
  /**
   * 转换为像素值
   * @param value
   */
  public static pixelate(value: Primitive.Nil): null;
  public static pixelate(value: string | number): string;
  public static pixelate(value: string | number | Primitive.Nil): string | null {
    if (isNil(value) || value === "") return null;
    if (isString(value) && value.endsWith("px")) return value;
    return isPlainNumber(value) ? value + "px" : null;
  }

  /**
   * 转换为数字值
   * @param value
   */
  public static digitize(value: string | number | Primitive.Nil): number | null {
    if (!value) return null;
    if (isPlainNumber(value)) {
      const num = Number(value);
      return Number.isNaN(num) ? null : num;
    }
    if (value.endsWith("px")) {
      const num = Number(value.replace("px", ""));
      return Number.isNaN(num) ? null : num;
    }
    if (value.endsWith("%")) {
      const num = Number(value.replace("%", "")) / 100;
      return Number.isNaN(num) ? null : num;
    }
    return null;
  }

  /**
   * 设置样式到 DOM
   * @param dom
   * @param styles
   */
  public static setToDOM<T extends keyof CSSStyleDeclaration>(
    dom: HTMLElement,
    styles: Record<T, CSSStyleDeclaration[T]>
  ): void {
    Object.entries(styles).forEach(([key, value]) => {
      dom.style[<T>key] = <CSSStyleDeclaration[T]>value;
    });
  }

  /**
   * 组合计算 class-name plain
   * @param values
   */
  public static classes(...values: Array<unknown>): string {
    return values.filter(r => isString(r)).join(SPACE);
  }

  /**
   * 组合计算 class-name complex
   * @param values
   */
  public static cx(...values: Array<unknown>): string {
    const res: string[] = [];
    for (const item of values) {
      if (!item) {
        continue;
      }
      if (isString(item)) {
        res.push(item);
        continue;
      }
      if (isObject(item)) {
        const keys = Object.keys(item).filter(key => item[key]);
        res.push(...keys);
        continue;
      }
    }
    return res.join(SPACE);
  }

  /**
   * 为 DOM 创建动画效果
   * @param dom
   * @param keyframes
   * @param options
   */
  public static animation(
    dom: Element | Primitive.Nil,
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options?: number | KeyframeAnimationOptions
  ) {
    return dom && dom.animate(keyframes, options);
  }
}

/**
 * 组合计算 class-name plain
 * @param values
 * @example cs(true && "a", false && "b", "c") // "a c"
 */
export const cs = Facade.classes;

/**
 * 组合计算 class-name complex
 * @param values
 * @example cx(true && "a", { b: true, c: false }) // "a b"
 */
export const cx = Facade.cx;
