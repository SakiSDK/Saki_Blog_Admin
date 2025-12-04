import { useStringUtil } from "./string.util";

/** ---------- 常量 ---------- */
export const breakpoints = {
  xxs: 450,
  xs: 560,
  sm: 700,
  md: 900,
  lg: 1200,
  xl: 1400,
  xxl: 1536,
}
export type BreakpointKey = keyof typeof breakpoints;

/** 生成随机整数 */
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
/**
 * DOM 操作
 * @description 提供一系列常用的 DOM 操作工具函数
 */
// 类型定义
export const useDomUtil = () => {
  const scrollToNextView = () => {
    const target = window.innerHeight; // = 100vh
    window.scrollTo({
      top: target,
      behavior: 'smooth'
    });
  }
  const scrollToTop = () => [
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  ]

/** 屏幕宽度是否低于断点（max-width），可选 callback */
const respondDown = (key: BreakpointKey, cb?: () => void): boolean => {
  const match = window.innerWidth <= breakpoints[key];
  if (match && typeof cb === 'function') cb();
  return match;
};

/** 屏幕宽度是否高于断点（min-width），可选 callback */
const respondUp = (key: BreakpointKey, cb?: () => void): boolean => {
  const match = window.innerWidth >= breakpoints[key];
  if (match && typeof cb === 'function') cb();
  return match;
};

/** 屏幕是否在两个断点之间（min ≤ w ≤ max），可选 callback */
const respondBetween = (
  min: BreakpointKey,
  max: BreakpointKey,
  cb?: () => void
): boolean => {
  const w = window.innerWidth;
  const match = w >= breakpoints[min] && w <= breakpoints[max];
  if (match && typeof cb === 'function') cb();
  return match;
};

  /** 生成随机 HEX 颜色 */
    const randomHex = (): string => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[rand(0, 15)];
    }
    return color;
  };

  /** 生成随机 RGB 颜色 */
  const randomRgb = (): string => {
    return `rgb(${rand(0, 255)}, ${rand(0, 255)}, ${rand(0, 255)})`;
  };

  /** 生成随机 RGBA（透明度可选） */
  const randomRgba = (alpha: number = 1): string => {
    return `rgba(${rand(0, 255)}, ${rand(0, 255)}, ${rand(0, 255)}, ${alpha})`;
  };

  /** 生成指定明度的 HSL 颜色 */
  const randomHsl = (
    saturation: number = 70,
    lightness: number = 55,
  ): string => {
    return `hsl(${rand(0, 360)}, ${saturation}%, ${lightness}%)`;
  };

  /** 生成随机渐变色 */
  const randomGradient = (): string => {
    return `linear-gradient(45deg, ${randomHex()}, ${randomHex()})`;
  };

  /** 返回随机颜色（自动格式） */
  const randomColor = (): string => {
    const modes: string[] = [randomHex(), randomRgb(), randomHsl()];
    return modes[rand(0, modes.length - 1)] as string;
  };
  
  const randomBrightColor = (minL = 30, maxL = 70) => {
    const h = Math.floor(Math.random() * 360);      // 随机色相
    const s = Math.floor(Math.random() * 40) + 60;  // 饱和度维持在 60%~100%
    const l = Math.floor(Math.random() * (maxL - minL)) + minL;

    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  interface BrightColorOptions {
    key?: string;
    minL?: number;
    maxL?: number;
    alpha?: number;
  }
  const brightColorByHash = ({
    key = '',
    minL = 30,
    maxL = 70,
    alpha = 1
  }: BrightColorOptions = {}) => {
    const { stringToHash } = useStringUtil();
    const hash = stringToHash(key);

    const h = hash % 360; // 色相
    const s = 60 + (hash % 40); // 饱和度 60%~100%
    const l = minL + (hash % (maxL - minL)); // 亮度范围

    // 返回透明度颜色（HSL 支持 / 分隔的 alpha）
    return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
  }
  return {
    scrollToNextView,
    scrollToTop,
    respondDown,
    respondUp,
    respondBetween,
    randomHex, randomRgb, randomRgba, randomHsl, randomGradient, randomColor, randomBrightColor, brightColorByHash
  }
}