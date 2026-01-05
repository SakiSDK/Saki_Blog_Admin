import { z } from 'zod';
import { ResponseSchema } from './base.schema';


/** ---------- 基础图片信息 ---------- */
export const ImageInfoSchema = z.object({
  filename: z.string().describe('文件名'),
  originalname: z.string().describe('原始文件名'),
  size: z.number().describe('图片大小（字节）'),
  mineType: z.string().describe('图片类型（如：image/jpeg）'),
  url: z.string().describe('图片URL'),
  path: z.string().describe('图片路径'),
  relativePath: z.string().describe('图片相对路径'),
  extension: z.string().describe('图片扩展名'),
  resourceId: z.number().describe('资源ID'),
  timestamp: z.number().describe('图片上传时间'),
})


/** ---------- 返回响应schema ---------- */
export const UploadPostImageResponseSchema = ResponseSchema(ImageInfoSchema);


/** ---------- 图片上传返回类型 ---------- */
export type ImageInfo = z.infer<typeof ImageInfoSchema>;


/** ---------- 图片上传返回响应类型 ---------- */
export type UploadPostImageResponse = z.infer<typeof UploadPostImageResponseSchema>;

