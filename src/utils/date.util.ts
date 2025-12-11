import dayjs from 'dayjs';
// 按需导入扩展插件
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

// 注册插件
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

/**
 * 日期格式化枚举（常用格式统一管理，避免硬编码）
 */
export const DateFormatEnum = {
  // 年月日 时分秒
  YMD_HMS: 'YYYY-MM-DD HH:mm:ss',
  // 年月日
  YMD: 'YYYY-MM-DD',
  // 年月
  YM: 'YYYY-MM',
  // 时分秒
  HMS: 'HH:mm:ss',
  // 时分
  HM: 'HH:mm',
  // 时间戳（毫秒）
  TIMESTAMP: 'x',
  // 国际标准格式（ISO）
  ISO: 'YYYY-MM-DDTHH:mm:ssZ',
}

/**
 * 日期工具类
 */
const DateUtil = {
  /**
   * 格式化日期
   * @param date 待格式化的日期（支持 Date/字符串/时间戳）
   * @param format 格式化模板（默认 YYYY-MM-DD HH:mm:ss）
   * @returns 格式化后的字符串 | 空字符串（解析失败时）
   * @example
   * DateUtil.format(new Date()); // '2025-12-11 16:30:45'
   * DateUtil.format(1733953845000, DateFormatEnum.YMD_CN); // '2025年12月11日'
   * DateUtil.format('2025-12-11', DateFormatEnum.HM); // '16:30'
   * DateUtil.format(null); // ''（空值处理）
   */
  format(
    date: Date | string | number | undefined | null,
    format: string = DateFormatEnum.YMD_HMS
  ): string {
    if (!date) return '';
    try {
      return dayjs(date).format(format);
    } catch (error) {
      console.error('日期格式化失败：', error, '入参：', date);
      return '';
    }
  },

  /**
   * 获取相对时间（如：1分钟前、3天前、2个月后）
   * @param date 目标日期（支持 Date/字符串/时间戳）
   * @param referenceDate 参考日期（默认当前时间）
   * @returns 相对时间字符串 | 空字符串（解析失败时）
   * @example
   * DateUtil.fromNow('2025-12-10'); // '1天前'
   * DateUtil.fromNow('2025-12-12', '2025-12-10'); // '2天后'
   * DateUtil.fromNow(1733953845000); // '几秒前'（当前时间附近）
   */
  fromNow(
    date: Date | string | number | undefined | null,
    referenceDate: Date | string | number = new Date()
  ): string {
    if (!date) return '';
    try {
      const target = dayjs(date);
      const ref = dayjs(referenceDate);
      return target.from(ref);
    } catch (error) {
      console.error('相对时间计算失败：', error, '入参：', date);
      return '';
    }
  },

  /**
   * 计算两个日期的时间差
   * @param date1 日期1
   * @param date2 日期2
   * @param unit 时间单位（day/year/month/hour/minute/second 等）
   * @returns 时间差（数值）| 0（解析失败时）
   * @example
   * DateUtil.diff('2025-12-11', '2025-12-01', 'day'); // 10
   * DateUtil.diff('2025-12-11 16:30', '2025-12-11 10:00', 'hour'); // 6.5
   * DateUtil.diff('2025-01-01', '2024-01-01', 'year'); // 1
   * DateUtil.diff(null, '2025-12-11'); // 0（空值处理）
   */
  diff(
    date1: Date | string | number | undefined | null,
    date2: Date | string | number | undefined | null,
    unit: dayjs.UnitType = 'day'
  ): number {
    if (!date1 || !date2) return 0;
    try {
      const d1 = dayjs(date1);
      const d2 = dayjs(date2);
      return Math.abs(d1.diff(d2, unit)); // 取绝对值，避免负数
    } catch (error) {
      console.error('时间差计算失败：', error, '入参：', date1, date2);
      return 0;
    }
  },

  /**
   * 日期加减计算
   * @param date 基准日期
   * @param num 增减数量（正数加，负数减）
   * @param unit 单位（day/year/month/hour 等）
   * @param format 格式化模板（默认返回格式化后字符串，传 null 返回 dayjs 实例）
   * @returns 计算后的日期字符串 | dayjs 实例 | 空字符串（解析失败时）
   * @example
   * // 加7天
   * DateUtil.addSubtract(new Date(), 7, 'day'); // '2025-12-18 16:30:45'
   * // 减1个月（返回年月日）
   * DateUtil.addSubtract(new Date(), -1, 'month', DateFormatEnum.YMD); // '2025-11-11'
   * // 加3小时（返回dayjs实例）
   * const newDate = DateUtil.addSubtract(new Date(), 3, 'hour', null);
   * newDate.format(DateFormatEnum.HMS); // '19:30:45'
   */
  addSubtract(
    date: Date | string | number | undefined | null,
    num: number,
    unit: dayjs.ManipulateType = 'day',
    format: string | null = DateFormatEnum.YMD_HMS
  ): string | dayjs.Dayjs {
    if (!date) return '';
    try {
      const result = dayjs(date).add(num, unit);
      return format ? result.format(format) : result;
    } catch (error) {
      console.error('日期加减失败：', error, '入参：', date);
      return '';
    }
  },

  /**
   * 校验日期是否有效
   * @param date 待校验日期
   * @returns true=有效，false=无效
   * @example
   * DateUtil.isValid('2025-13-01'); // false（月份无效）
   * DateUtil.isValid('2025-12-11'); // true
   * DateUtil.isValid(1733953845000); // true
   * DateUtil.isValid('abc'); // false（非法字符串）
   */
  isValid(date: Date | string | number | undefined | null): boolean {
    if (!date) return false;
    try {
      return dayjs(date).isValid();
    } catch (error) {
      return false;
    }
  },

  /**
   * 判断日期1是否在日期2之前（包含等于）
   * @param date1 待比较日期
   * @param date2 参考日期
   * @returns boolean
   * @example
   * DateUtil.isSameOrBefore('2025-12-10', '2025-12-11'); // true
   * DateUtil.isSameOrBefore('2025-12-11', '2025-12-11'); // true（等于）
   * DateUtil.isSameOrBefore('2025-12-12', '2025-12-11'); // false
   */
  isSameOrBefore(
    date1: Date | string | number | undefined | null,
    date2: Date | string | number | undefined | null
  ): boolean {
    if (!date1 || !date2) return false;
    try {
      return dayjs(date1).isSameOrBefore(dayjs(date2));
    } catch (error) {
      console.error('日期比较失败：', error);
      return false;
    }
  },

  /**
   * 判断日期1是否在日期2之后（包含等于）
   * @param date1 待比较日期
   * @param date2 参考日期
   * @returns boolean
   * @example
   * DateUtil.isSameOrAfter('2025-12-12', '2025-12-11'); // true
   * DateUtil.isSameOrAfter('2025-12-11', '2025-12-11'); // true（等于）
   * DateUtil.isSameOrAfter('2025-12-10', '2025-12-11'); // false
   */
  isSameOrAfter(
    date1: Date | string | number | undefined | null,
    date2: Date | string | number | undefined | null
  ): boolean {
    if (!date1 || !date2) return false;
    try {
      return dayjs(date1).isSameOrAfter(dayjs(date2));
    } catch (error) {
      console.error('日期比较失败：', error);
      return false;
    }
  },

  /**
   * 转换为 UTC 时间
   * @param date 目标日期
   * @param format 格式化模板
   * @returns UTC 时间字符串 | 空字符串
   * @example
   * DateUtil.toUtc(new Date()); // '2025-12-11 08:30:45'（假设当前时区是东8区）
   * DateUtil.toUtc('2025-12-11 16:30:45', DateFormatEnum.YMD); // '2025-12-11'
   */
  toUtc(
    date: Date | string | number | undefined | null,
    format: string = DateFormatEnum.YMD_HMS
  ): string {
    if (!date) return '';
    try {
      return dayjs(date).utc().format(format);
    } catch (error) {
      console.error('UTC 转换失败：', error);
      return '';
    }
  },

  /**
   * 转换为指定时区的时间
   * @param date 目标日期
   * @param timezone 时区（如：Asia/Shanghai、America/New_York）
   * @param format 格式化模板
   * @returns 时区转换后的字符串 | 空字符串
   * @example
   * DateUtil.toTimezone(new Date(), 'America/New_York'); // '2025-12-11 03:30:45'（纽约时区）
   * DateUtil.toTimezone('2025-12-11 16:30:45', 'Europe/London', DateFormatEnum.YMD_HMS); // '2025-12-11 08:30:45'
   */
  toTimezone(
    date: Date | string | number | undefined | null,
    timezone: string = 'Asia/Shanghai',
    format: string = DateFormatEnum.YMD_HMS
  ): string {
    if (!date) return '';
    try {
      return dayjs(date).tz(timezone).format(format);
    } catch (error) {
      console.error('时区转换失败：', error);
      return '';
    }
  },

  /**
   * 获取指定日期的开始/结束时间
   * @param date 目标日期
   * @param type 类型（start/end）
   * @param unit 单位（day/week/month/year 等）
   * @param format 格式化模板
   * @returns 格式化后的时间字符串 | 空字符串
   * @example
   * // 今日开始时间
   * DateUtil.getBoundaryTime(new Date(), 'start', 'day'); // '2025-12-11 00:00:00'
   * // 今日结束时间
   * DateUtil.getBoundaryTime(new Date(), 'end', 'day'); // '2025-12-11 23:59:59'
   * // 本月开始时间
   * DateUtil.getBoundaryTime(new Date(), 'start', 'month', DateFormatEnum.YMD); // '2025-12-01'
   * // 本周结束时间（周日23:59:59）
   * DateUtil.getBoundaryTime(new Date(), 'end', 'week'); // '2025-12-14 23:59:59'
   */
  getBoundaryTime(
    date: Date | string | number | undefined | null,
    type: 'start' | 'end' = 'start',
    unit: dayjs.UnitType = 'day',
    format: string = DateFormatEnum.YMD_HMS
  ): string {
    if (!date) return '';
    try {
      const dayjsDate = dayjs(date);
      const result = type === 'start' 
        ? dayjsDate.startOf(unit) 
        : dayjsDate.endOf(unit);
      return result.format(format);
    } catch (error) {
      console.error('获取边界时间失败：', error);
      return '';
    }
  },
};

// 导出工具类（默认导出 + 枚举导出）
export default DateUtil;