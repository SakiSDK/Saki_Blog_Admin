/** ---------- 组件状态管理 ---------- */
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useStateStore = defineStore('state', () => { 
  const isCollapsedAsideBar = ref<boolean>(false);

  const toggleCollapsedAsideBar = () => {
    isCollapsedAsideBar.value = !isCollapsedAsideBar.value;
  }
  return {
    isCollapsedAsideBar,
    toggleCollapsedAsideBar
  }
})

