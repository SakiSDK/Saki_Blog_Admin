import type {
  AxiosRequestConfig
} from 'axios';
import {
  get, patch, post, del,
  put
} from '@/utils/request.util';
import {
  validateRequest, validateResponse
} from "@/utils/validate.util";
import {
  AllTagsResponseSchema,
  TagBulkDeleteParamsSchema,
  TagCreateResponseSchema, TagDeleteParamsSchema, TagDeleteResponseSchema, tagFormSchema, TagListParamsSchema,
  TagListResponseSchema, tagSearchFormSchema, TagStatusParamsSchema, TagStatusResponseSchema,
  TagUpdateResponseSchema,
  type AllTagsResponse,
  type Tag, type TagCreateResponse, type TagDeleteResponse, type TagFormType, type TagListParams,
  type TagListResponse, type TagSearchFormType, type TagStatusResponse,
  type TagUpdateResponse
} from '@/schemas/tag.schema';
import { cleanObject } from '@/utils/sanitize.util';


export const TagApi = {
  getAllTags: async (
    config?: AxiosRequestConfig
  ): Promise<AllTagsResponse> => {
    const res = await get<AllTagsResponse>('/tag/all', undefined, config);
    return validateResponse<AllTagsResponse>(AllTagsResponseSchema, res);
  },

  getTagList: async(
    params?: TagListParams,
    config?: AxiosRequestConfig
  ): Promise<TagListResponse> => {
    const defaultParams: TagListParams = { page: 1, pageSize: 10, sort: 'desc' };
    const unitParams: TagListParams = {
      ...defaultParams,
      ...cleanObject(params || {}),
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
    const res = await del<Tag>(`/tag/bulk?${queryStr}`, undefined, config);
    return validateResponse(TagDeleteResponseSchema, res);
  },

  updateTag: async (
    id: number,
    tag: TagFormType,
    config?: AxiosRequestConfig
  ): Promise<TagUpdateResponse> => {
    const safeId = validateRequest(TagDeleteParamsSchema, id);
    const safeBody = validateRequest(tagFormSchema, tag);
    const res = await put<Tag>(`/tag/${safeId}`, safeBody, config);
    console.log('updatedRes: ', res)
    return validateResponse(TagUpdateResponseSchema, res);
  },

  searchTagList: async (
    formData: TagSearchFormType,
    config?: AxiosRequestConfig
  ): Promise<TagListResponse> => {
    const cleanedQuery = cleanObject(formData)
    const safeQuery = validateRequest(tagSearchFormSchema, cleanedQuery);
    const res = await get<TagListResponse>('/tag/search', safeQuery, config);
    return validateResponse(TagListResponseSchema, res);
  },
} 