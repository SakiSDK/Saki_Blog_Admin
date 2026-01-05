import { z } from 'zod';
import { zId, zStr } from './common.schema';

/** ---------- 定义Album相关的Schema ---------- */
export const AlbumSearchFormSchema = z.object({
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

export const AlbumSchema = z.object({
  id: zId.describe('相册ID'),
  name: zStr
    .max(50, { message: '相册名称不能超过50个字符' })
    .trim()
    .nonempty({ message: '相册名称不能为空' }),
  description: zStr
    .max(200, { message: '相册描述不能超过200个字符' })
    .trim()
    .optional(),
  creator: zStr.trim().optional(),
  coverId: zStr.trim().optional(),
  coverUrl: zStr.trim().optional(),
  thumbnailUrl: zStr.trim().optional(),
  photoCount: z.number('照片数量必须是数字').min(0,'照片数量不能小于0').default(0),
  status: z.enum(['active', 'inactive']).default('active'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})


export type AlbumSearchFormType = z.infer<typeof AlbumSearchFormSchema>;
export type Album = z.infer<typeof AlbumSchema>;