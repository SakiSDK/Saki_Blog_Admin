import type { AxiosRequestConfig } from 'axios';
import { get, patch } from '@/utils/request.util';
import { validateRequest, validateResponse } from "@/utils/validate.util";
import { TagListParamsSchema, TagListResponseSchema, TagStatusResponseSchema, type Tag, type TagListParams, type TagListResponse, type TagStatusResponse } from '@/schemas/tag.schema';


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
    const res = await get<TagListResponse>('/tag', safeParams, config);
    return validateResponse(TagListResponseSchema, res);
  },

  toggleTagStatus: async (
    id: number,
    config?: AxiosRequestConfig
  ): Promise<TagStatusResponse> => {
    const res = await patch<TagStatusResponse>(`/tag/${id}/status`, undefined, config);
    return validateResponse(TagStatusResponseSchema, res);
  }
} 