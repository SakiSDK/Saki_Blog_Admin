import { z } from 'zod';
import { ResponseSchema } from './base.schema';


/** ---------- 基础图片信息 ---------- */
export const ArticleImageDataSchema = z.object({
  url: z.string(),
})




/** ---------- 返回响应schema ---------- */
export const UploadPostImageResponseSchema = ResponseSchema(ArticleImageDataSchema);  
export const DeleteArticleImageResponseSchema = ResponseSchema(z.null());

/** ---------- 文章图片上传返回类型 ---------- */
export type ArticleImageData = z.infer<typeof ArticleImageDataSchema>;


/** ---------- 图片上传返回响应类型 ---------- */
export type UploadPostImageResponse = z.infer<typeof UploadPostImageResponseSchema>;
export type DeleteArticleImageResponse = z.infer<typeof DeleteArticleImageResponseSchema>;
