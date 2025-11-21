import type { AttributeMap } from "./interface";

/**
 * 反转属性
 * - 以 base 为基础, 生成 attr 的反转属性, 即 attr 的目标是 base
 * - 如果 base 参数为空, 则表示 attr 是新增的属性, 反转结果均为删除属性
 * @param attr
 * @param base
 */
export const invertAttributes = (
  attr: AttributeMap = {},
  base: AttributeMap = {}
): AttributeMap => {
  const baseInverted = Object.keys(base).reduce<AttributeMap>((memo, key) => {
    if (base[key] !== attr[key] && attr[key] !== undefined) {
      memo[key] = base[key];
    }
    return memo;
  }, {});
  return Object.keys(attr).reduce<AttributeMap>((memo, key) => {
    if (attr[key] !== base[key] && base[key] === undefined) {
      memo[key] = "";
    }
    return memo;
  }, baseInverted);
};
