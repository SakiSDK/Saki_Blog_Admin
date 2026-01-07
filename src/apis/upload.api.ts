import { DeleteArticleImageResponseSchema, UploadPostImageResponseSchema, type DeleteArticleImageResponse, type UploadPostImageResponse } from '@/schemas/upload.schema';
import { post, del } from '@/utils/request.util'
import type { AxiosRequestConfig } from 'axios';
import {
  validateResponse
} from "@/utils/validate.util";


export const UploadApi = {
  /** 上传文章内图片 */
  uploadArticleImage: async(
    file: File,
    config?: AxiosRequestConfig
  ): Promise<UploadPostImageResponse> => {
    console.log("file: ", file)
    const formData = new FormData();
    formData.append('image', file);
    const res = await post<UploadPostImageResponse>(
      '/upload/article/image',
      formData,
      {
        ...config,
        headers: {
          'Content-Type': undefined // 让浏览器自动生成 boundary
        }
      }
    );
    console.log("res: ", res)
    return validateResponse( UploadPostImageResponseSchema, res );
  },
  /** 删除文章内图片 */
  deleteArticleImage: async(
    filename: string,
    config?: AxiosRequestConfig
  ): Promise<DeleteArticleImageResponse> => {
    const res = await del<DeleteArticleImageResponse>(
      `/upload/article/image/${filename}`,
      config
    );
    //? 完善下这个返回值验证
    return validateResponse( DeleteArticleImageResponseSchema, res );
  },
}