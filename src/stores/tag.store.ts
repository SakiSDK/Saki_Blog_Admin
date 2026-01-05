import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { TagApi } from '@/apis/tag.api';
import {
  ErrorResponseSchema,
  type ErrorResponse,
  type Pagination
} from '@/schemas/base.schema';
import type { AxiosRequestConfig } from 'axios';
import { useTimeoutFn } from '@vueuse/core';
import type {
  AllTagsResponse,
  Tag, TagCreateResponse, TagDeleteResponse, TagFormType,
  TagListParams, TagListResponse,
  TagSearchFormType,
  TagStatusResponse,
  TagUpdateFormType,
  TagUpdateResponse
} from '@/schemas/tag.schema';


interface BaseResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data: T | null;
}


/** ---------- 常量/初始化 ---------- */
const INIT_PAGINATION: Pagination = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false
};
const INIT_STATE = {
  tagList: [] as Tag[],
  pagination: { ...INIT_PAGINATION },
  selectedTag: null as TagUpdateFormType | null,
  searchQuery: null as TagSearchFormType | null,
  isLoading: false,
  errorMsg: null as string | null,
  errorCode: null as number | null,
  currentParams: {
    orderBy: 'id',
    sort: 'desc',
  } as TagListParams, // 整合分页+搜索参数
  isPageReloaded: false,
}

/** ---------- 通用工具函数（抽离重复逻辑） ---------- */
/**
 * 通用错误处理：生成兜底响应 + 记录错误日志
 * @param error 错误对象
 * @param defaultMsg 默认错误提示
 * @returns 对应类型的兜底响应
 */
const handleRequestError = <T extends BaseResponse<any>>(
  error: unknown,
  defaultMsg: string,
  defaultCode = 500
): T => {
  const message = (error instanceof Error ? error.message : String(error)) || defaultMsg;
  console.error(`❌ ${defaultMsg}：`, error);
  return {
    success: false,
    code: defaultCode,
    message,
    data: null,
  } as T;
};

/**
 * 格式化分页参数（确保合法，避免异常值）
 */
const formatPageParams = (
  params: Partial<TagListParams>,
  isRefresh: boolean
) => {
  const defaultPage = { page: 1, pageSize: 10 };
  if (isRefresh) return defaultPage;
  return {
    ...params,
    page: Math.max(params.page || defaultPage.page, 1),
    pageSize: Math.max(params.pageSize || defaultPage.pageSize, 1),
  };
};



export const useTagStore = defineStore('tag', () => {
  /** ---------- 响应式数据 ---------- */
  const tagList = ref<Tag[]>(INIT_STATE.tagList);
  const pagination = ref<Pagination>({...INIT_PAGINATION})
  const selectedTag = ref<TagUpdateFormType | null>(INIT_STATE.selectedTag);
  const searchQuery = ref<TagSearchFormType | null>(INIT_STATE.searchQuery);

  const isLoading = ref<boolean>(INIT_STATE.isLoading);
  const errorMsg = ref<string | null>(INIT_STATE.errorMsg);
  const errorCode = ref<number | null>(INIT_STATE.errorCode);
  const currentParams = ref<TagListParams & TagSearchFormType>({...INIT_STATE.currentParams});
  const isPageReloaded = ref<boolean>(INIT_STATE.isPageReloaded);

  /** ---------- 计算属性 ---------- */
  const getTagTotal = computed(() => pagination.value.total)
  const getTagtotalPages = computed(() => pagination.value.totalPages)
  const hasNextPage = computed(() => pagination.value.hasNext)
  const hasPrevPage = computed(() => pagination.value.hasPrev)
  /** 根据ID获取标签（优化：缓存函数结果，避免重复计算） */
  const getTagById = computed(() =>
    (id: number) => tagList.value.find(tag => tag.id === id)
  )
  /** 根据名称模糊搜索标签 */
  const getTagByName = computed(() =>
    (name: string) => tagList.value.filter(tag => tag.name.includes(name))
  )

  /** ---------- 基础工具方法 ---------- */
  /** 重复所有状态初始值 */
  const resetState = () => { 
    tagList.value = [...INIT_STATE.tagList];
    pagination.value = { ...INIT_PAGINATION };
    selectedTag.value = INIT_STATE.selectedTag;
    searchQuery.value = INIT_STATE.searchQuery;
    isLoading.value = INIT_STATE.isLoading;
    errorMsg.value = INIT_STATE.errorMsg;
    errorCode.value = INIT_STATE.errorCode;
    currentParams.value = { ...INIT_STATE.currentParams };
    isPageReloaded.value = INIT_STATE.isPageReloaded;
  }

  /** 更新列表加载状态（统一延迟关闭，避免闪烁） */
  const setLoading = (status: boolean) => {
    isLoading.value = status;
    if (!status) {
      useTimeoutFn(() => { isLoading.value = false; }, 500);
    }
  }


  /** ---------- 核心业务方法 ---------- */
  /**
   * 获取所有标签
   */
  const getAllTags = async (): Promise<AllTagsResponse> => {
    setLoading(true);
    errorMsg.value = null

    try {
      const response = await TagApi.getAllTags();
      if (!response.success) {
        // 业务错误解析
        const errorRes = ErrorResponseSchema.parse(response) as ErrorResponse;
        errorMsg.value = `[${errorRes.code}] ${errorRes.message}`;
        throw new Error(errorMsg.value);
      }
      return response;
    } catch (error) {
      return handleRequestError(error, '获取所有标签失败')
    }finally {
      setLoading(false);
    }
  }
  /** 
   * 获取标签列表
   * @param params 分页参数
   * @param isRefresh 是否刷新（重置分页）
   * @param config 请求配置
   */
  const fetchTagList = async(
    params?: TagListParams,
    isRefresh?: boolean,
    config?: AxiosRequestConfig
  ): Promise<TagListResponse> => {
    setLoading(true);
    errorMsg.value = null

    try {
      const shouldUseCache = !isRefresh && !isPageReloaded.value && tagList.value.length > 0;
      if (shouldUseCache) {
        setLoading(false);
        return {
          success: true,
          code: 200,
          message: 'success',
          data: { list: tagList.value, pagination: pagination.value }
        } as TagListResponse;
      }

      // 格式化分页参数
      const pageParams = formatPageParams(params || {}, false);
      currentParams.value = {
        ...currentParams.value,
        ...searchQuery.value,
        ...pageParams
      };

      // 发起请求
      const response = await TagApi.getTagList(currentParams.value, config);

      // 更新状态
      if (response.success) {
        tagList.value = isRefresh 
          ? response.data.list 
          : [...tagList.value, ...response.data.list]; // 加载更多
        pagination.value = response.data.pagination
      } else {
        // 业务错误解析
        const errorRes = ErrorResponseSchema.parse(response) as ErrorResponse;
        errorMsg.value = `[${errorRes.code}] ${errorRes.message}`

        // 按错误等级处理
        switch (Math.floor(errorRes.code / 100)) {
          case 4: console.warn('客户端错误：', errorRes); break;
          case 5: console.error('服务端错误：', errorRes); break;
        }
        throw new Error(errorMsg.value);
      }

      return response
    } catch (error) {
      errorMsg.value = error instanceof Error 
        ? error.message 
        : '获取标签列表失败，请检查网络或联系管理员';
      return handleRequestError(
        error,
        errorMsg.value || '获取标签列表失败'
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * 搜索标签列表（带搜索条件+分页）
   * @param searchForm 搜索条件
   * @param isRefresh 是否刷新分页
   * @param config 请求配置
   */
  const searchTagList = async (
    searchForm: TagSearchFormType,
    isRefresh = true,
    config?: AxiosRequestConfig
  ): Promise<TagListResponse> => {
    setLoading(true);
    errorMsg.value = null;
    searchQuery.value = { ...searchForm }; // 缓存搜索条件

    try {
      // 整合搜索条件+分页参数
      const pageParams = formatPageParams(currentParams.value, isRefresh);
      const requestParams = { ...pageParams, ...searchQuery.value };
      currentParams.value = {...currentParams.value, ...requestParams};

      // 发起搜索请求
      const response = await TagApi.searchTagList(requestParams, config);
      
      if (response.success) {
        tagList.value = response.data.list; // 搜索直接替换列表（不加载更多）
        pagination.value = response.data.pagination;
      } else {
        const errorRes = ErrorResponseSchema.parse(response) as ErrorResponse;
        errorMsg.value = `[${errorRes.code}] ${errorRes.message}`;
        errorCode.value = errorRes.code;
        throw new Error(errorMsg.value);
      }

      return response;
    } catch (error) {
      errorMsg.value = error instanceof Error 
        ? error.message 
        : '标签搜索失败，请检查网络或联系管理员';
      return handleRequestError(error, errorMsg.value);
    } finally {
      setLoading(false);
    }
  };

  /** 
   * 搜索标签
   * @param params 搜索参数
   * @param isRefresh 是否刷新（重置分页）
   * @param config 配置项
   */
  const toggleTagStatus = async (
    id: number,
    isRefresh?: boolean,
    config?: AxiosRequestConfig
  ): Promise<TagStatusResponse> => { 
    setLoading(true);
    
    try {
      const response = await TagApi.toggleTagStatus(id, config);

      if (response.success) {
        // 本地更新状态（无需刷新列表）
        const updatedTag = response.data as Tag;
        const index = tagList.value.findIndex((tag) => tag.id === id);
        if (index !== -1) {
          tagList.value[index] = { ...tagList.value[index], ...updatedTag };
        }
        if (isRefresh) await fetchTagList(currentParams.value, true);
      } else {
        const errorRes = ErrorResponseSchema.parse(response) as ErrorResponse;
        errorMsg.value = `[${errorRes.code}] ${errorRes.message}`;
        throw new Error(errorMsg.value);
      }
      return response;
    } catch (error) {
      // 统一兜底返回格式，确保始终满足 TagStatusResponse 结构
      return handleRequestError(error, '切换标签状态失败');
    } finally {
      setLoading(false);
    }
  }

  /**
   * 创建标签
   * @param tag 标签表单数据
   * @param config 请求配置
   */
  const createTag = async (
    tag: TagFormType,
    config?: AxiosRequestConfig
  ): Promise<TagCreateResponse> => {
    setLoading(true);
    try {
      const response = await TagApi.createTag(tag, config);
      
      if (response.success) {
        // 新增标签插入列表头部（合理逻辑，替代原unshift+pop）
        tagList.value.unshift(response.data);
        // 若列表长度超过分页大小，截断（可选，保持列表长度一致）
        if (tagList.value.length > pagination.value.pageSize) {
          tagList.value = tagList.value.slice(0, pagination.value.pageSize);
        }
      } else {
        const errorRes = ErrorResponseSchema.parse(response) as ErrorResponse;
        errorMsg.value = `[${errorRes.code}] ${errorRes.message}`;
        return {
          success: false,
          code: errorRes.code,
          message: errorRes.message,
          data: null,
        };
      }

      return response;
    } catch (error) {
      return handleRequestError(error, '创建标签失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 删除单个标签
   * @param id 标签ID
   * @param isRefresh 是否刷新列表
   * @param config 请求配置
   */
  const deleteTag = async (
    id: number,
    isRefresh = true,
    config?: AxiosRequestConfig
  ): Promise<TagDeleteResponse> => {
    setLoading(true);
    try {
      const response = await TagApi.deleteTag(id, config);
      // 本地删除（无需等待刷新）
      if (response.success) {
        tagList.value = tagList.value.filter(tag => tag.id !== id);
        pagination.value.total -= 1; // 更新总数
        if (isRefresh) await fetchTagList(currentParams.value, true);
      }
      return response;
    } catch (error) {
      return handleRequestError(error, '删除标签失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 批量删除标签
   * @param ids 标签ID列表
   * @param isRefresh 是否刷新列表
   * @param config 请求配置
   */
  const bulkDeleteTag = async (
    ids: number[],
    isRefresh = true,
    config?: AxiosRequestConfig
  ): Promise<TagDeleteResponse> => {
    setLoading(true);
    try {
      const response = await TagApi.bulkDeleteTag(ids, config);
      // 本地批量删除
      if (response.success) {
        tagList.value = tagList.value.filter(tag => !ids.includes(tag.id));
        pagination.value.total -= ids.length; // 更新总数
        if (isRefresh) await fetchTagList(currentParams.value, true);
      }
      return response;
    } catch (error) {
      return handleRequestError(error, '批量删除标签失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 更新标签
   * @param formData 标签更新数据
   * @param config 请求配置
   */
  const updateTag = async (
    formData: TagUpdateFormType,
    config?: AxiosRequestConfig
  ): Promise<TagUpdateResponse> => {
    setLoading(true);
    try {
      const { id, ...updateData } = formData;
      const response = await TagApi.updateTag(id, updateData as TagFormType, config);
      
      if (response.success) {
        // 本地更新
        tagList.value = tagList.value.map(tag => 
          tag.id === id ? { ...tag, ...updateData } : tag
        );
      } else {
        const errorRes = ErrorResponseSchema.parse(response) as ErrorResponse;
        errorMsg.value = `[${errorRes.code}] ${errorRes.message}`;
      }

      return response;
    } catch (error) {
      return handleRequestError(error, '更新标签失败');
    } finally {
      setLoading(false);
    }
  };

  return {
    /** ---------- 数据 ---------- */
    tagList,
    pagination,
    selectedTag,
    searchQuery,
    /** ---------- 状态 ---------- */
    isLoading,
    errorMsg,
    currentParams,
    errorCode,
    isPageReloaded,
    /** ---------- 计算属性 ---------- */
    getTagTotal,
    hasNextPage,
    hasPrevPage,
    getTagById,
    getTagtotalPages,
    getTagByName,
    /** ---------- 方法 ---------- */
    getAllTags,
    resetState,
    fetchTagList,
    searchTagList,
    toggleTagStatus,
    createTag,
    deleteTag,
    bulkDeleteTag,
    updateTag,
  }
})