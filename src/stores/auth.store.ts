import { AuthApi } from '@/apis/auth.api';
import type { UserData } from '@/schemas/auth.schema';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useTokenStore } from './token.store';


/** 认证状态管理 */
export const useAuthStore = defineStore('auth', () => {
  const tokenStore = useTokenStore();

  /** 用于登录验证nonce */
  const nonce = ref<string | null>(null);
  /** loading */
  const loading = ref<boolean>(false);

  /** 登录状态 (代理 tokenStore) */
  const isAuthenticated = computed(() => tokenStore.isLoggedIn);
  
  /** 当前用户 (代理 tokenStore) */
  const user = computed<UserData | null>(() => tokenStore.userInfo);

  /** token (代理 tokenStore) */
  const accessToken = computed(() => tokenStore.token);


  /** 初始化认证状态 */
  const initAuth = () => {
    console.log('InitAuth - UserInfo:', tokenStore.userInfo)
    console.log('InitAuth - Token:', tokenStore.token)
    // 初始化 token 状态（检查过期、自动刷新等）
    tokenStore.initialize();
  }

  const fetchLoginNonce = async () => {
    try {
      const res = await AuthApi.getNonce()
      if (res.success) {
        nonce.value = res.data!.nonce
      }
    } catch (error) {
      console.error("获取Nonce失败", error)
      // 可以选择是否向上抛出错误，或者只是记录
    }
  }

  const login = async (params: {
    email: string;
    password: string;
  }) => {
    loading.value = true
    try {
      if (!nonce.value) {
        await fetchLoginNonce()
      }
      
      // 如果 fetchLoginNonce 失败导致 nonce 仍然为空，应该终止登录
      if (!nonce.value) {
        throw new Error('无法获取登录凭证')
      }

      const res = await AuthApi.login({
        ...params,
        nonce: nonce.value as string,
      })

      if (res.success) {
        const { accessToken, expiresIn, user } = res.data!;
        // 使用 tokenStore 管理 token 和用户信息，并开启自动刷新
        tokenStore.setTokenWithAutoRefresh(accessToken, expiresIn);
        if (user) {
          tokenStore.setUserInfo(user);
        }
        return true
      }
      return false

    } catch (error) {
      console.error(error, "登录失败")
      // 登录失败后清除 nonce，以便下次重试获取新的
      nonce.value = null
      throw error
    } finally {
      loading.value = false
    }
  }

  /** 退出登录 */
  const logout = () => {
    tokenStore.clearToken();
    nonce.value = null;
  }

  return {
    isAuthenticated,
    user,
    nonce,
    loading,
    accessToken,
    initAuth,
    fetchLoginNonce,
    login,
    logout,
  };
});