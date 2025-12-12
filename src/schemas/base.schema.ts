import { z } from 'zod';


/** ---------- 定义统一响应的基础Schema（所有接口复用） ---------- */
/** 成功响应的基础结构 */
export const SuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) => {
  return z.object({
    code: z.literal(200),
    success: z.literal(true),
    message: z.string().optional(),
    data: dataSchema,
  })
}
/** 失败的响应Schema */
export const ErrorResponseSchema = z.object({
  code: z.number().refine(value => value >= 400 || value < 600, {
    message: '请检查code值是否正确',
  }),
  success: z.literal(false),
  message: z.string().optional(),
  detail: z.object().optional(),
  data: z.null()
});

/** 合并陈成功和失败的返回值结构， 二选一 */
export const ResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  SuccessResponseSchema(dataSchema).or(ErrorResponseSchema);

export const PaginationSchema = z.object({
  total: z.number({ message: '必须是数字类型'}).int().nonnegative(), // 总条数：非负整数
  page: z.number({ message: '必须是数字类型'}).int().positive().nonnegative(), // 当前页：正整数
  pageSize: z.number({ message: '必须是数字类型'}).int().positive().nonnegative(), // 每页条数：正整数
  totalPages: z.number({ message: '必须是数字类型'}).int().nonnegative().optional(), // 总页数：可选（根据后端实际返回调整）
  hasNext: z.boolean().optional(),
  hasPrev: z.boolean().optional(),
});


export type Pagination = z.infer<typeof PaginationSchema>;
export type Response<T extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>> = z.infer<ReturnType<typeof ResponseSchema<T>>>;
export type SuccessResponse<T extends z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>> = z.infer<ReturnType<typeof SuccessResponseSchema<T>>>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;