import { z } from 'zod'; 
import { zStr } from './base.schema';

/** ---------- 定义标签创建的Zod校验Schema ---------- */
export const tagFormSchema = z.object({
  name: zStr
    .max(50, { message: '标签名称不能超过50个字符' })
    .trim()
    .nonempty({ message: '标签名称不能为空' }),
  description: zStr
    .max(200, { message: '标签描述不能超过200个字符' })
    .trim()
    .optional(),
  order: z.number()
    .int()
    .min(0, { message: '排序值不能小于0' })
    .max(999, { message: '排序值不能大于999' })
    .default(0)
    .optional(),
})
export const tagSearchFormSchema = z.object({
  keyword: zStr
    .max(50, { message: '标签名称不能超过50个字符' })
    .trim()
    .optional(),
  status: z.enum(['active', 'inactive'], {message: '只能选择激活或者未激活'}).nullable().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
})
export const tagUpdateFormSchema = z.object({
  name: zStr
    .max(50, { message: '标签名称不能超过50个字符' })
    .trim()
    .nonempty({ message: '标签名称不能为空' }),
  description: zStr
    .max(200, { message: '标签描述不能超过200个字符' })
    .trim()
    .optional(),
  order: z.number()
    .int()
    .min(0, { message: '排序值不能小于0' })
    .max(999, { message: '排序值不能大于999' })
    .default(0)
    .optional(),
  sort: z.enum(['asc', 'desc']).optional(),
})


export type TagFormType = z.infer<typeof tagFormSchema>;
export type TagSearchFormType = z.infer<typeof tagSearchFormSchema>;
export type TagUpdateFormType = z.infer<typeof tagUpdateFormSchema>;