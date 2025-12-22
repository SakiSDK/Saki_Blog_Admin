import { get, put, patch, post, del } from '@/utils/request.util';
import type { AxiosRequestConfig } from 'axios';
import { validateRequest, validateResponse } from '@/utils/validate.util';
import {
  AllCategoriesResponseSchema,
  CategoryBulkDeleteParamsSchema,
  CategoryCreateResponseSchema, CategoryDeleteParamsSchema, CategoryDeleteResponseSchema, categoryFormSchema, CategoryListParamsSchema,
  CategoryListResponseSchema, categorySearchFormSchema, CategoryStatusParamsSchema, CategoryStatusResponseSchema,
  CategoryUpdateResponseSchema,
  type AllCategoriesResponse,
  type Category, type CategoryCreateResponse, type CategoryDeleteResponse, type CategoryFormType, type CategoryListParams,
  type CategoryListResponse, type CategorySearchFormType, type CategoryStatusResponse,
  type CategoryUpdateResponse
} from '@/schemas/category.schema';
import { cleanObject } from '@/utils/sanitize.util';


export const CategoryApi = {
  getAllCategories: async (
    config?: AxiosRequestConfig
  ): Promise<AllCategoriesResponse> => {
    const res = await get<AllCategoriesResponse>('/category', {}, config);
    return validateResponse(AllCategoriesResponseSchema, res);
  },

  getCategoryList: async(
    params?: CategoryListParams,
    config?: AxiosRequestConfig
  ): Promise<CategoryListResponse> => { 
    const defaultParams: CategoryListParams = { page: 1, pageSize: 10, sort: 'desc' };
    const unitParams: CategoryListParams = {
      ...defaultParams,
      ...cleanObject(params || {}),
    }
    const safeParams = validateRequest(CategoryListParamsSchema, unitParams);
    const res = await get<CategoryListResponse>('/category', safeParams, config);
    return validateResponse(CategoryListResponseSchema, res);
  },

  toggleCategoryStatus: async (
    id: number,
    config?: AxiosRequestConfig
  ): Promise<CategoryStatusResponse> => {
    const safeId = validateRequest(CategoryStatusParamsSchema, id);
    const res = await patch<CategoryStatusResponse>(`/category/${safeId}/status`, undefined, config);
    return validateResponse(CategoryStatusResponseSchema, res);
  },

  createCategory: async (
    category: CategoryFormType,
    config?: AxiosRequestConfig
  ): Promise<CategoryCreateResponse> => {
    const safeCategory = validateRequest(categoryFormSchema, category);
    const res = await post<CategoryCreateResponse>('/category', safeCategory, config);
    return validateResponse(CategoryCreateResponseSchema, res);
  },

  updateCategory: async (
    id: number,
    category: CategoryFormType,
    config?: AxiosRequestConfig
  ): Promise<CategoryUpdateResponse> => {
    const safeId = validateRequest(CategoryStatusParamsSchema, id);
    const safeCategory = validateRequest(categoryFormSchema, category);
    const res = await put<CategoryUpdateResponse>(`/category/${safeId}`, safeCategory, config);
    return validateResponse(CategoryUpdateResponseSchema, res);
  },

  deleteCategory: async (
    id: number,
    config?: AxiosRequestConfig
  ): Promise<CategoryDeleteResponse> => {
    const safeId = validateRequest(CategoryDeleteParamsSchema, id);
    const res = await del<CategoryDeleteResponse>(`/category/${safeId}`, undefined, config);
    return validateResponse(CategoryDeleteResponseSchema, res);
  },

  bulkDeleteCategory: async (
    ids: number[],
    config?: AxiosRequestConfig
  ): Promise<CategoryDeleteResponse> => {
    const safeIds = validateRequest(CategoryBulkDeleteParamsSchema, ids);
    const queryStr = safeIds.map(id => `ids=${id}`).join('&');
    const res = await del<CategoryDeleteResponse>(`/category/bulk?${queryStr}`, undefined, config);
    return validateResponse(CategoryDeleteResponseSchema, res);
  },

  searchCategoryList: async (
    formData: CategorySearchFormType,
    config?: AxiosRequestConfig
  ): Promise<CategoryListResponse> => {
    const cleanedQuery = cleanObject(formData)
    const safeQuery = validateRequest(categorySearchFormSchema, cleanedQuery);
    const res = await get<CategoryListResponse>('/category/search', safeQuery, config);
    return validateResponse(CategoryListResponseSchema, res);
  },
}