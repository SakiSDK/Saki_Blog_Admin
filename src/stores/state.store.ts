/** ---------- 组件状态管理 ---------- */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useDomUtil } from '@/utils/dom.util';

export const useStateStore = defineStore('state', () => { 
  /** ---------- AsideBar展开状态 ---------- */
  const { respondDown } = useDomUtil();
  const isCollapsedAsideBar = ref<boolean>(false);
  const toggleCollapsedAsideBar = () => {
    isCollapsedAsideBar.value = !isCollapsedAsideBar.value;
  }
  if (respondDown('xs')) {
    console.log('xxxx')
    isCollapsedAsideBar.value = true;
  }

  /** ---------- 页面是是否正在加载 ---------- */
  const isGlobalLoading = ref<boolean>(false);
  const setGlobalLoading = (value: boolean) => {
    isGlobalLoading.value = value;
  }
  const isRouteLoading = ref<boolean>(false);
  const setRouteLoading = (value: boolean) => {
    isRouteLoading.value = value;
  }

  return {
    isCollapsedAsideBar,
    toggleCollapsedAsideBar,
    isGlobalLoading,
    setGlobalLoading,
    isRouteLoading,
    setRouteLoading,
  }
})

