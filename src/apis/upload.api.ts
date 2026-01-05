import { UploadPostImageResponseSchema, type UploadPostImageResponse } from '@/schemas/upload.schema';
import { post } from '@/utils/request.util'
import type { AxiosRequestConfig } from 'axios';
import {
  validateResponse
} from "@/utils/validate.util";


export const UploadApi = {
  uploadPostImage: async (
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<UploadPostImageResponse> => {
    const res = await post<UploadPostImageResponse>(
      '/upload/articles/editing/images',
      formData,
      config
    );
    return validateResponse(UploadPostImageResponseSchema, res);
  },
  // uploadUserAvatar: async (
  //   formData: FormData,
  //   config?: AxiosRequestConfig
  // ): Promise<UploadUserAvatarResponse> => {
  //   const res = await post<UploadUserAvatarResponse>(
  //     '/upload/user-avatar',
  //     formData,
  //     config
  //   );
  //   return validateResponse(UploadUserAvatarResponseSchema, res);
  // },
}