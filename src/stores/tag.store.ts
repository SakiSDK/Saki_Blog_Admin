import {
  defineStore
} from 'pinia';
import {
  ref, computed
} from 'vue';
import {
  TagApi
} from '@/apis/tag.api';
import {
  ErrorResponseSchema,
  type ErrorResponse,
  type Pagination
} from '@/schemas/base.schema';
import type {
  AxiosRequestConfig
} from 'axios';
import {
  useTimeoutFn
} from '@vueuse/core';
import type {
  Tag, TagCreateResponse, TagDeleteResponse, TagFormType,
  TagListParams, TagListResponse,
  TagStatusResponse
} from '@/schemas/tag.schema';
import { del } from '@/utils/request.util';



export const useTagStore = defineStore('tag', () => {
  /** ---------- 数据 ---------- */
  const tagList = ref<Tag[]>([]);
  const pagination = ref<Pagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })

  /** ---------- 状态 ---------- */
  const isLoading = ref<boolean>(false);
  const errorMsg = ref<string | null>(null);
  const currentParams = ref<TagListParams>({});
  const errorCode = ref<number | null>(null);
  const isPageReloaded = ref<boolean>(false);

  /** ---------- 计算属性 ---------- */
  const getTagTotal = computed(() => pagination.value.total)
  const getTagtotalPages = computed(() => pagination.value.totalPages)
  const hasNextPage = computed(() => pagination.value.hasNext)
  const hasPrevPage = computed(() => pagination.value.hasPrev)
  const getTagById = computed(() => (id: number) => tagList.value.find(tag => tag.id === id))
  const getTagByName = computed(() => (name: string) => tagList.value.filter(tag => tag.name.includes(name)))

  /** ---------- 逻辑方法 ---------- */
  const resetState = () => { 
    tagList.value = []
    pagination.value = {
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    };
    errorMsg.value = null
    errorCode.value = null
    isPageReloaded.value = false
  }

  /** 
   * 获取标签列表
   */
  const fetchTagList = async(
    params?: TagListParams,
    isRefresh?: boolean,
    config?: AxiosRequestConfig
  ): Promise<TagListResponse> => {
    isLoading.value = true
    errorMsg.value = null
    // 开始前重置是成功状态
    try {
      const shouldUseCache = !isRefresh && !isPageReloaded.value && tagList.value.length > 0;
      if (shouldUseCache) {
        useTimeoutFn(() => {
          isLoading.value = false;
        }, 500)
        return {
          success: true,
          code: 200,
          message: 'success',
          data: {
            list: tagList.value,
            pagination: pagination.value
          }
        } as TagListResponse;
      }
      const defaultParams = { page: 1, pageSize: 10 };
      const pageParams = isRefresh
        ? { pageNum: defaultParams.page, pageSize: defaultParams.pageSize }
        : { pageNum: pagination.value.page, pageSize: pagination.value.pageSize };
      const unitParams = { ...defaultParams, ...pageParams, ...params };
      currentParams.value = unitParams;
      const response = await TagApi.getTagList(unitParams, config);
      if (response.success) {
        if (isRefresh) {
          tagList.value = response.data.list
        } else {
          tagList.value = [...tagList.value, ...response.data.list]
        }
        pagination.value = response.data.pagination
      } else {
        const errorRes = ErrorResponseSchema.parse(response) as ErrorResponse;
        errorMsg.value = `[${errorRes.code}] ${errorRes.message}`
        // 3. 分类错误处理（根据错误码做特殊逻辑）
        switch (Math.floor(errorRes.code / 100)) {
          case 4:
            // 4xx 客户端错误（如参数错误、权限不足）
            console.warn('客户端错误：', errorRes);
            // 可添加额外逻辑：如 401 跳转登录、403 显示无权限提示
            if (errorRes.code === 401) {
              // 示例：跳转登录页（需导入路由）
              // router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
            }
            break;
          case 5:
            // 5xx 服务端错误
            console.error('服务端错误：', errorRes);
            // 可添加额外逻辑：如上报错误到监控平台
            // reportError('tagListFetchError', errorRes);
            break;
        }
        // 抛出错误，允许组件捕获处理
        throw new Error(errorMsg.value);
      }
      return response
    } catch (error) {
      // 捕获两类错误：
      // 1. API 响应的业务错误（上面抛出的）
      // 2. 网络错误、校验错误（如响应格式不符合成功/失败规范）
      if (error instanceof Error) {
        errorMsg.value = error.message;
      } else {
        errorMsg.value = '获取标签列表失败，请检查网络或联系管理员';
      }
      console.error('❌ 标签列表请求失败：', error);
      throw error;
    } finally {
      // 8. 无论成功失败，结束加载状态
      useTimeoutFn(() => {
        isLoading.value = false;
      }, 500)
    }
  }

  const toggleTagStatus = async (
    id: number,
    isRefresh?: boolean,
    config?: AxiosRequestConfig
  ): Promise<TagStatusResponse> => { 
    try {
      const res = await TagApi.toggleTagStatus(id, config);
      if (!res.success) {
        const errorRes = ErrorResponseSchema.parse(res) as ErrorResponse;
        errorMsg.value = `[${errorRes.code}] ${errorRes.message}`;
        throw new Error(errorMsg.value);
      }
      const updatedTag = res.data as Tag;
      const index = tagList.value.findIndex((tag) => tag.id === updatedTag.id);
      if (index !== -1) {
        tagList.value[index] = {
          ...tagList.value[index],
          ...updatedTag,
        };
      }
      // 若要刷新（比如后台更新分页后不一致），重新 fetch
      if (isRefresh) {
        await fetchTagList(currentParams.value, true);
      }
      return res;
    } catch (error) {
      // 统一兜底返回格式，确保始终满足 TagStatusResponse 结构
      const fallbackResponse: TagStatusResponse = {
        success: false,
        code: 500,
        message: '操作失败',
        data: null
      };
      if (error instanceof Error) {
        fallbackResponse.message = error.message;
      }
      console.error('❌ 标签状态切换失败：', error);
      return fallbackResponse;
    }
  }

  /** 
   * 创建Tag
   */
  const createTag = async (
    tag: TagFormType,
    config?: AxiosRequestConfig
  ): Promise<TagCreateResponse> => {
    try {
      const res = await TagApi.createTag(tag, config);
      if (!res.success) {
        const errorRes = ErrorResponseSchema.parse(res) as ErrorResponse;
        errorMsg.value = `[${errorRes.code}] ${errorRes.message}`;

        // 返回失败响应结构
        return {
          success: false,
          code: errorRes.code,
          message: errorRes.message,
          data: null,
        } as TagCreateResponse;
      }
      tagList.value.unshift(res.data);
      tagList.value.pop();
      // 成功则返回原始响应
      return res;
    } catch (error) {
      errorMsg.value = '创建标签失败，请检查网络或联系管理员';

      // 构造兜底失败响应
      const fallbackResponse: TagCreateResponse = {
        success: false,
        code: 500,
        message: error instanceof Error ? error.message : '未知错误',
        data: null,
      };

      console.error('❌ 标签创建失败：', error);
      return fallbackResponse;
    }
  };

  const deleteTag = async (
    id: number,
    isRefresh?: boolean,
    config?: AxiosRequestConfig
  ): Promise<TagDeleteResponse> => { 
    try {
      const res = await TagApi.deleteTag(id, config);
      if (isRefresh && res.success) {
        await fetchTagList(currentParams.value, true);
      }
      return res;
    } catch (error) {
      // 统一兜底返回格式，确保始终满足 TagStatusResponse 结构
      const fallbackResponse: TagStatusResponse = {
        success: false,
        code: 500,
        message: '操作失败',
        data: null
      };
      if (error instanceof Error) {
        fallbackResponse.message = error.message;
      }
      console.error('❌ 标签状态切换失败：', error);
      return fallbackResponse;
    }
  }

  /** 
   * 批量删除Tag
   */
  const bulkDeleteTag = async (
    ids: number[],
    isRefresh?: boolean,
    config?: AxiosRequestConfig
  ): Promise<TagDeleteResponse> => { 
    try {
      const res = await TagApi.bulkDeleteTag(ids, config);
      if (isRefresh && res.success) {
        await fetchTagList(currentParams.value, true);
      }
      return res;
    }catch (error) {
      // 统一兜底返回格式，确保始终满足 TagStatusResponse 结构
      const fallbackResponse: TagStatusResponse = {
        success: false,
        code: 500,
        message: '操作失败',
        data: null
      };
      if (error instanceof Error) {
        fallbackResponse.message = error.message;
      }
      console.error('❌ 批量删除标签失败：', error);
      return fallbackResponse;
    }
  }

  return {
    /** ---------- 数据 ---------- */
    tagList,
    pagination,
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
    resetState,
    fetchTagList,
    toggleTagStatus,
    createTag,
    deleteTag,
    bulkDeleteTag,
  }
})