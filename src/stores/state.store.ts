/** ---------- 组件状态管理 ---------- */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useDomUtil } from '@/utils/dom.util';
import { useEventListener } from '@vueuse/core';

export const useStateStore = defineStore('state', () => { 
  /** ---------- AsideBar展开状态 ---------- */
  const { respondDown } = useDomUtil();
  const isCollapsedAsideBar = ref<boolean>(false);
  const toggleCollapsedAsideBar = () => {
    isCollapsedAsideBar.value = !isCollapsedAsideBar.value;
  }
  if (respondDown('xs')) {
    isCollapsedAsideBar.value = true;
  }
  useEventListener(window, 'resize', () => {
    if (respondDown('xs')) {
      isCollapsedAsideBar.value = true;
    } else {
      isCollapsedAsideBar.value = false;
    }
  })

  /** ---------- 页面是是否正在加载 ---------- */
  const isGlobalLoading = ref<boolean>(false);
  const setGlobalLoading = (value: boolean) => {
    isGlobalLoading.value = value;
  }
  const isRouteLoading = ref<boolean>(false);
  const setRouteLoading = (value: boolean) => {
    isRouteLoading.value = value;
  }

  /** ---------- 标签编辑弹窗状态 ---------- */
  const isTagEditDialogVisible = ref<boolean>(false);
  const setTagEditDialogVisible = (value: boolean) => {
    isTagEditDialogVisible.value = value;
  }


  return {
    isCollapsedAsideBar,
    toggleCollapsedAsideBar,
    isGlobalLoading,
    setGlobalLoading,
    isRouteLoading,
    setRouteLoading,
    isTagEditDialogVisible,
    setTagEditDialogVisible,
  }
})

