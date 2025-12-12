import { z } from 'zod'; 
import { zId, zPageNum, zPageSize, zSort, zStr } from './common.schema';
import { PaginationSchema, ResponseSchema } from './base.schema';

/** ---------- 返回值Tag类型 ---------- */
const TagSchema = z.object({
  id: zId.describe("标签ID"),
  name: zStr
    .max(50, "标签名最多50个字符")
    .regex(/^[a-zA-Z0-9_\u4e00-\u9fa5\-\s]+$/, "标签名只能包含中英文、数字、下划线、横线和空格")
    .describe("标签名称"),
  slug: zStr
    .max(50, "标签别名最多50个字符")
    .regex(/^[a-z0-9\-]+$/, "标签别名只能包含小写字母、数字和横线")
    .toLowerCase()
    .describe("标签别名"),
  description: zStr
    .max(500, "描述最多 500 个字符")
    .optional()
    .nullable()
    .describe("描述"),
  postCount: z
    .number("文章数量必须是数字")
    .int("文章数量必须是整数")
    .min(0, "文章数量不能小于 0")
    .describe("文章数量"),
  order: z
    .number("排序必须是数字")
    .int("排序必须是整数")
    .min(0, "排序不能小于 0")
    .describe("排序"),
  status: z.enum(['active', 'inactive'] as const),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

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


export const TagListDataSchema = z.object({
  list: z.array(TagSchema),
  pagination: PaginationSchema
})

/** ---------- 标签列表完整响应 Schema + 类型推导 ---------- */
// 组合出标签列表接口的完整响应 Schema
export const TagListResponseSchema = ResponseSchema(TagListDataSchema);
export const TagListParamsSchema = z.object({
  page: zPageNum.default(1).optional().describe('页码'),
  pageSize: zPageSize.optional().describe('每页数量'),
  keyword: zStr.max(50, "搜索关键词不能超过 50 个字符").optional().describe('搜索关键词'),
  sort: zSort.optional(),
})
// 普通返回标签的响应Schema
export const TagStatusResponseSchema = ResponseSchema(TagSchema);
export const TagStatusParamsSchema = z.object({
  id: zId.describe('标签ID'),
})


export type TagFormType = z.infer<typeof tagFormSchema>;
export type TagSearchFormType = z.infer<typeof tagSearchFormSchema>;
export type TagUpdateFormType = z.infer<typeof tagUpdateFormSchema>;

/** ---------- Tag返回值类型 ---------- */
export type Tag = z.infer<typeof TagSchema>;

/** ---------- Response返回类型 ---------- */
export type TagListResponse = z.infer<typeof TagListResponseSchema>
export type TagStatusResponse = z.infer<typeof TagStatusResponseSchema>

/** ---------- params请求类型 ---------- */
export type TagListParams = z.infer<typeof TagListParamsSchema>
export type TagStatusParams = z.infer<typeof TagStatusParamsSchema>