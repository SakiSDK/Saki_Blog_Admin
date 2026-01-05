import type { Album } from '@/schemas/album.schema';
import { defineStore } from 'pinia';
import { ref } from 'vue';


export const useAlbumStore = defineStore('album', () => {
  /** ---------- 响应式数据 ---------- */
  const albumList = ref<Album[]>([]);
  /** ---------- 计算数据 ---------- */

  /** ---------- 基础工具函数 ---------- */


})