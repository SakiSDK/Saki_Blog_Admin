import {
  defineStore
} from 'pinia';
import {
  ref, computed
} from 'vue';
import {
  CategoryApi
} from '@/apis/category.api';
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
  AllCategoriesResponse,
  Category, CategoryCreateResponse, CategoryDeleteResponse, CategoryFormType,
  CategoryListParams, CategoryListResponse,
  CategorySearchFormType,
  CategoryStatusResponse,
  CategoryUpdateFormType,
  CategoryUpdateResponse
} from '@/schemas/category.schema';


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
  categoryList: [] as Category[],
  pagination: { ...INIT_PAGINATION },
  selectedCategory: null as CategoryUpdateFormType | null,
  searchQuery: null as CategorySearchFormType | null,
  isLoading: false,
  errorMsg: null as string | null,
  errorCode: null as number | null,
  currentParams: {
    orderBy: 'id',
    sort: 'desc',
  } as CategoryListParams, // 整合分页+搜索参数
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
  params: Partial<CategoryListParams>,
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



export const useCategoryStore = defineStore('category', () => {
  /** ---------- 响应式数据 ---------- */
  const categoryList = ref<Category[]>(INIT_STATE.categoryList);
  const pagination = ref<Pagination>({...INIT_PAGINATION})
  const selectedCategory = ref<CategoryUpdateFormType | null>(INIT_STATE.selectedCategory);
  const searchQuery = ref<CategorySearchFormType | null>(INIT_STATE.searchQuery);

  const isLoading = ref<boolean>(INIT_STATE.isLoading);
  const errorMsg = ref<string | null>(INIT_STATE.errorMsg);
  const errorCode = ref<number | null>(INIT_STATE.errorCode);
  const currentParams = ref<CategoryListParams & CategorySearchFormType>({...INIT_STATE.currentParams});
  const isPageReloaded = ref<boolean>(INIT_STATE.isPageReloaded);

  /** ---------- 计算属性 ---------- */
  const getCategoryTotal = computed(() => pagination.value.total)
  const getCategorytotalPages = computed(() => pagination.value.totalPages)
  const hasNextPage = computed(() => pagination.value.hasNext)
  const hasPrevPage = computed(() => pagination.value.hasPrev)
  /** 根据ID获取分类（优化：缓存函数结果，避免重复计算） */
  const getCategoryById = computed(() =>
    (id: number) => categoryList.value.find(category => category.id === id)
  )
  /** 根据名称模糊搜索分类 */
  const getCategoryByName = computed(() =>
    (name: string) => categoryList.value.filter(category => category.name.includes(name))
  )

  /** ---------- 基础工具方法 ---------- */
  /** 重复所有状态初始值 */
  const resetState = () => { 
    categoryList.value = [...INIT_STATE.categoryList];
    pagination.value = { ...INIT_PAGINATION };
    selectedCategory.value = INIT_STATE.selectedCategory;
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
   * 获取所有分类
   */
  const getAllCategories = async (): Promise<AllCategoriesResponse> => {
    setLoading(true);
    errorMsg.value = null

    try {
      const response = await CategoryApi.getAllCategories();
      if (!response.success) {
        // 业务错误解析
        const errorRes = ErrorResponseSchema.parse(response) as ErrorResponse;
        errorMsg.value = `[${errorRes.code}] ${errorRes.message}`;
        throw new Error(errorMsg.value);
      }
      return response;
    } catch (error) {
      return handleRequestError(error, '获取所有分类失败')
    }finally {
      setLoading(false);
    }
  }
  /** 
   * 获取分类列表
   * @param params 分页参数
   * @param isRefresh 是否刷新（重置分页）
   * @param config 请求配置
   */
  const fetchCategoryList = async(
    params?: CategoryListParams,
    isRefresh?: boolean,
    config?: AxiosRequestConfig
  ): Promise<CategoryListResponse> => {
    setLoading(true);
    errorMsg.value = null

    try {
      const shouldUseCache = !isRefresh && !isPageReloaded.value && categoryList.value.length > 0;
      if (shouldUseCache) {
        setLoading(false);
        return {
          success: true,
          code: 200,
          message: 'success',
          data: { list: categoryList.value, pagination: pagination.value }
        } as CategoryListResponse;
      }

      // 格式化分页参数
      const pageParams = formatPageParams(params || {}, false);
      currentParams.value = {
        ...currentParams.value,
        ...searchQuery.value,
        ...pageParams
      };

      // 发起请求
      const response = await CategoryApi.getCategoryList(currentParams.value, config);
      console.log(response);
      // 更新状态
      if (response.success) {
        categoryList.value = isRefresh 
          ? response.data.list 
          : [...categoryList.value, ...response.data.list]; // 加载更多
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
        : '获取分类列表失败，请检查网络或联系管理员';
      return handleRequestError(
        error,
        errorMsg.value || '获取分类列表失败'
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * 搜索分类列表（带搜索条件+分页）
   * @param searchForm 搜索条件
   * @param isRefresh 是否刷新分页
   * @param config 请求配置
   */
  const searchCategoryList = async (
    searchForm: CategorySearchFormType,
    isRefresh = true,
    config?: AxiosRequestConfig
  ): Promise<CategoryListResponse> => {
    setLoading(true);
    errorMsg.value = null;
    searchQuery.value = { ...searchForm }; // 缓存搜索条件

    try {
      // 整合搜索条件+分页参数
      const pageParams = formatPageParams(currentParams.value, isRefresh);
      const requestParams = { ...pageParams, ...searchQuery.value };
      currentParams.value = {...currentParams.value, ...requestParams};

      // 发起搜索请求
      const response = await CategoryApi.searchCategoryList(requestParams, config);
      console.log(response);
      if (response.success) {
        categoryList.value = response.data.list; // 搜索直接替换列表（不加载更多）
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
        : '分类搜索失败，请检查网络或联系管理员';
      return handleRequestError(error, errorMsg.value);
    } finally {
      setLoading(false);
    }
  };

  /** 
   * 搜索分类
   * @param params 搜索参数
   * @param isRefresh 是否刷新（重置分页）
   * @param config 配置项
   */
  const toggleCategoryStatus = async (
    id: number,
    isRefresh?: boolean,
    config?: AxiosRequestConfig
  ): Promise<CategoryStatusResponse> => { 
    setLoading(true);
    
    try {
      const response = await CategoryApi.toggleCategoryStatus(id, config);

      if (response.success) {
        // 本地更新状态（无需刷新列表）
        const updatedCategory = response.data as Category;
        const index = categoryList.value.findIndex((category) => category.id === id);
        if (index !== -1) {
          categoryList.value[index] = { ...categoryList.value[index], ...updatedCategory };
        }
        if (isRefresh) await fetchCategoryList(currentParams.value, true);
      } else {
        const errorRes = ErrorResponseSchema.parse(response) as ErrorResponse;
        errorMsg.value = `[${errorRes.code}] ${errorRes.message}`;
        throw new Error(errorMsg.value);
      }
      return response;
    } catch (error) {
      // 统一兜底返回格式，确保始终满足 CategoryStatusResponse 结构
      return handleRequestError(error, '切换分类状态失败');
    } finally {
      setLoading(false);
    }
  }

  /**
   * 创建分类
   * @param category 分类表单数据
   * @param config 请求配置
   */
  const createCategory = async (
    category: CategoryFormType,
    config?: AxiosRequestConfig
  ): Promise<CategoryCreateResponse> => {
    setLoading(true);
    try {
      const response = await CategoryApi.createCategory(category, config);
      
      if (response.success) {
        // 新增分类插入列表头部（合理逻辑，替代原unshift+pop）
        categoryList.value.unshift(response.data);
        // 若列表长度超过分页大小，截断（可选，保持列表长度一致）
        if (categoryList.value.length > pagination.value.pageSize) {
          categoryList.value = categoryList.value.slice(0, pagination.value.pageSize);
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
      return handleRequestError(error, '创建分类失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 删除单个分类
   * @param id 分类ID
   * @param isRefresh 是否刷新列表
   * @param config 请求配置
   */
  const deleteCategory = async (
    id: number,
    isRefresh = true,
    config?: AxiosRequestConfig
  ): Promise<CategoryDeleteResponse> => {
    setLoading(true);
    try {
      const response = await CategoryApi.deleteCategory(id, config);
      // 本地删除（无需等待刷新）
      if (response.success) {
        categoryList.value = categoryList.value.filter(category => category.id !== id);
        pagination.value.total -= 1; // 更新总数
        if (isRefresh) await fetchCategoryList(currentParams.value, true);
      }
      return response;
    } catch (error) {
      return handleRequestError(error, '删除分类失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 批量删除分类
   * @param ids 分类ID列表
   * @param isRefresh 是否刷新列表
   * @param config 请求配置
   */
  const bulkDeleteCategory = async (
    ids: number[],
    isRefresh = true,
    config?: AxiosRequestConfig
  ): Promise<CategoryDeleteResponse> => {
    setLoading(true);
    try {
      const response = await CategoryApi.bulkDeleteCategory(ids, config);
      // 本地批量删除
      if (response.success) {
        categoryList.value = categoryList.value.filter(category => !ids.includes(category.id));
        pagination.value.total -= ids.length; // 更新总数
        if (isRefresh) await fetchCategoryList(currentParams.value, true);
      }
      return response;
    } catch (error) {
      return handleRequestError(error, '批量删除分类失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 更新分类
   * @param formData 分类更新数据
   * @param config 请求配置
   */
  const updateCategory = async (
    formData: CategoryUpdateFormType,
    config?: AxiosRequestConfig
  ): Promise<CategoryUpdateResponse> => {
    setLoading(true);
    try {
      const { id, ...updateData } = formData;
      const response = await CategoryApi.updateCategory(id, updateData as CategoryFormType, config);
      
      if (response.success) {
        // 本地更新
        categoryList.value = categoryList.value.map(category => 
          category.id === id ? { ...category, ...updateData } : category
        );
      } else {
        const errorRes = ErrorResponseSchema.parse(response) as ErrorResponse;
        errorMsg.value = `[${errorRes.code}] ${errorRes.message}`;
      }

      return response;
    } catch (error) {
      return handleRequestError(error, '更新分类失败');
    } finally {
      setLoading(false);
    }
  };

  return {
    /** ---------- 数据 ---------- */
    categoryList,
    pagination,
    selectedCategory,
    searchQuery,
    /** ---------- 状态 ---------- */
    isLoading,
    errorMsg,
    currentParams,
    errorCode,
    isPageReloaded,
    /** ---------- 计算属性 ---------- */
    getCategoryTotal,
    hasNextPage,
    hasPrevPage,
    getCategoryById,
    getCategorytotalPages,
    getCategoryByName,
    /** ---------- 方法 ---------- */
    getAllCategories,
    resetState,
    fetchCategoryList,
    searchCategoryList,
    toggleCategoryStatus,
    createCategory,
    deleteCategory,
    bulkDeleteCategory,
    updateCategory,
  }
})
