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
    .number("优先级必须是数字")
    .int("优先级必须是整数")
    .min(0, "优先级不能小于 0")
    .describe("优先级"),
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
  description: z
    .string('必须是文本')
    .trim()
    .max(50, { message: '标签描述不能超过50个字符' })
    .or(z.literal(""))
    .nullable()
    .optional(),
  order: z.number()
    .int()
    .min(0, { message: '排序值不能小于0' })
    .max(999, { message: '排序值不能大于999' })
    .default(0)
    .optional(),
  status: z.enum(['active', 'inactive'] as const),
})

export const tagSearchFormSchema = z.object({
  id: z.union([
    z.string('标签ID必须是文本类型')
      .regex(/^\d+$/, { message: '标签ID必须是数字' })
      .max(20, { message: '标签ID不能超过20个字符' })
      .transform((val) => Number(val))
      .refine((val) => val >= 1, { message: '标签ID必须大于0' }),
    z.number({ message: '标签ID必须是数字' })
      .int({ message: '标签ID必须是整数' })
      .min(1, { message: '标签ID必须大于0' }),
    z.literal('')
  ]).nullable().optional(),
  keyword: z
    .string('关键词必须是文本类型')
    .max(20, { message: '关键词不能超过20个字符' }) // 原50改为20，匹配表单配置
    .trim()
    .optional(),
  status: z.union([
    z.enum(['active', 'inactive'], { message: '只能选择激活或者未激活' }),
    z.literal('') // 允许空字符串（表单初始值）
  ]).nullable().optional(),
  // 保留：排序字段（原逻辑不变）
  sort: z.enum(['asc', 'desc']).optional(),
  timeRange: z
    .tuple([
      z.date().optional(), // 开始时间（可选）
      z.date().optional()  // 结束时间（可选）
    ]).optional()
    // 自定义校验：结束时间不能早于开始时间（可选但建议加）
    .refine(
      (timeRange) => {
        // 只有两个时间都存在时，才校验顺序
        if (timeRange?.[0] && timeRange?.[1]) {
          return timeRange[0] <= timeRange[1];
        }
        return true; // 有一个为空则不校验
      },
      { message: '结束时间不能早于开始时间' }
    ),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
})

export const tagUpdateFormSchema = z.object({
  id: zId.describe('标签ID'),
  name: zStr
    .max(50, { message: '标签名称不能超过50个字符' })
    .trim()
    .nonempty({ message: '标签名称不能为空' }),
  description: zStr
    .max(50, { message: '标签描述不能超过50个字符' })
    .trim()
    .or(z.literal(""))
    .nullable()
    .optional(),
  order: z.number()
    .int()
    .min(0, { message: '排序值不能小于0' })
    .max(999, { message: '排序值不能大于999' })
    .default(0)
    .optional(),
  status: z.enum(['active', 'inactive']).optional(),
})


export const TagListDataSchema = z.object({
  list: z.array(TagSchema),
  pagination: PaginationSchema
})

export const AllTagsDataSchema = z.object({
  list: z.array(TagSchema),
})
/** ---------- 标签列表完整响应 Schema + 类型推导 ---------- */
// 组合出标签列表接口的完整响应 Schema

export const TagListParamsSchema = z.object({
  page: zPageNum.default(1).optional().describe('页码'),
  pageSize: zPageSize.optional().describe('每页数量'),
  keyword: zStr
    .max(50, "搜索关键词不能超过 50 个字符")
    .optional()
    .describe('搜索关键词'),
  sort: zSort.optional(),
  orderBy: z
    .enum(['id', 'post_count', 'order', 'created_at', 'updated_at'])
    .default('id')
    .optional()
    .describe('排序字段'),
})
export const TagStatusParamsSchema = zId.describe('标签ID');
export const TagDeleteParamsSchema = zId.describe('标签ID');
export const TagBulkDeleteParamsSchema = z.array(zId.describe('标签ID')).describe('标签ID列表');


// 普通返回标签的响应Schema
export const TagListResponseSchema = ResponseSchema(TagListDataSchema);

export const TagStatusResponseSchema = ResponseSchema(TagSchema);

export const TagCreateResponseSchema = ResponseSchema(TagSchema);

export const TagDeleteResponseSchema = ResponseSchema(z.null());

export const TagUpdateResponseSchema = ResponseSchema(TagSchema);

export const AllTagsResponseSchema = ResponseSchema(AllTagsDataSchema);



/** ---------- Tag表单类型 ---------- */
export type TagFormType = z.infer<typeof tagFormSchema>;
export type TagSearchFormType = z.infer<typeof tagSearchFormSchema>;
export type TagUpdateFormType = z.infer<typeof tagUpdateFormSchema>;

/** ---------- Tag返回值类型 ---------- */
export type Tag = z.infer<typeof TagSchema>;

/** ---------- Response返回类型 ---------- */
export type TagListResponse = z.infer<typeof TagListResponseSchema>
export type TagStatusResponse = z.infer<typeof TagStatusResponseSchema>
export type TagCreateResponse = z.infer<typeof TagCreateResponseSchema>
export type TagDeleteResponse = z.infer<typeof TagDeleteResponseSchema>
export type TagUpdateResponse = z.infer<typeof TagUpdateResponseSchema>;
export type AllTagsResponse = z.infer<typeof AllTagsResponseSchema>;

/** ---------- params请求类型 ---------- */
export type TagListParams = z.infer<typeof TagListParamsSchema>
export type TagStatusParams = z.infer<typeof TagStatusParamsSchema>
export type TagCreateBody = z.infer<typeof tagFormSchema>
