import { z } from 'zod';
import { zStr } from './common.schema';

/** ---------- 定义Album相关的Schema ---------- */
export const albumSearchFormSchema = z.object({
  name: zStr
    .max(50, { message: '相册名称不能超过50个字符' })
    .trim()
    .nonempty({ message: '相册名称不能为空' }),
  description: zStr
    .max(200, { message: '相册描述不能超过200个字符' })
    .trim()
    .optional(),
  order: z.number()
    .int()
    .min(0, { message: '排序值不能小于0' })
    .max(999, { message: '排序值不能大于999' })
    .default(0)
    .optional(),
  sort: z.enum(['asc', 'desc']).optional(),
});


export type AlbumSearchFormType = z.infer<typeof albumSearchFormSchema>;