import type {
  AxiosRequestConfig
} from 'axios';
import {
  get, patch, post, del
} from '@/utils/request.util';
import {
  validateRequest, validateResponse
} from "@/utils/validate.util";
import {
  TagBulkDeleteParamsSchema,
  TagCreateResponseSchema, TagDeleteParamsSchema, TagDeleteResponseSchema, tagFormSchema, TagListParamsSchema,
  TagListResponseSchema, TagStatusParamsSchema, TagStatusResponseSchema,
  type Tag, type TagCreateResponse, type TagDeleteResponse, type TagFormType, type TagListParams,
  type TagListResponse, type TagStatusResponse
} from '@/schemas/tag.schema';


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
    const safeId = validateRequest(TagStatusParamsSchema, id);
    const res = await patch<TagStatusResponse>(`/tag/${safeId}/status`, undefined, config);
    return validateResponse(TagStatusResponseSchema, res);
  },

  createTag: async (
    tag: TagFormType,
    config?: AxiosRequestConfig
  ): Promise<TagCreateResponse> => {
    const safeBody = validateRequest(tagFormSchema, tag);
    const res = await post<Tag>('/tag/', safeBody, config);
    return validateResponse(TagCreateResponseSchema, res);
  },

  deleteTag: async (
    id: number,
    config?: AxiosRequestConfig
  ): Promise<TagDeleteResponse> => {
    const safeId = validateRequest(TagDeleteParamsSchema, id);
    const res = await del<Tag>(`/tag/${safeId}`, undefined, config);
    return validateResponse(TagDeleteResponseSchema, res);
  },
  
  bulkDeleteTag: async (
    ids: number[],
    config?: AxiosRequestConfig
  ): Promise<TagDeleteResponse> => {
    const safeIds = validateRequest(TagBulkDeleteParamsSchema, ids);
    const queryStr = safeIds.map(id => `ids=${id}`).join('&');
    const res = await del<Tag>(`/tag/bulk?${queryStr}`, { ids: safeIds }, config);
    return validateResponse(TagDeleteResponseSchema, res);
  },
} 