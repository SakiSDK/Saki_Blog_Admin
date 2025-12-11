import type { AxiosRequestConfig } from 'axios';
import { get } from '@/utils/request.util';
import type { TagListResponse, TagListParams } from '@/types/entities/tag.type';
import { validateRequest, validateResponse } from "@/utils/validate.util";
import { TagListParamsSchema, TagListResponseSchema } from '@/schemas/tag.schema';


export const TagApi = {
  getTagList: async(
    params?: TagListParams,
    config?: AxiosRequestConfig
  ): Promise<TagListResponse> => {
    // 默认参数：pageNum=1，pageSize=10
    const defaultParams: TagListParams = { page: 1, pageSize: 10, sort: 'desc' };
    const unitParams: TagListParams = {
      ...defaultParams,
      ...params
    }
    const safeParams = validateRequest(TagListParamsSchema, unitParams);
    const res = await get<TagListResponse>('/tag/', safeParams, config);
    return validateResponse(TagListResponseSchema, res);
  }
} 