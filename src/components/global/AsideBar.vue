<script lang="ts" setup>
import { ref } from 'vue';
import VIcon from './VIcon.vue';

/** ---------- 页面文案 ---------- */
const menuItems = ref([
  {
    index: 'dashboard',
    icon: 'home',
    label: '仪表盘',
  },
  {
    index: '/article',
    icon: 'pen',
    label: '文章管理',
    // 子菜单
    children: [
      { index: '/articles/list', icon: 'list', label: '文章列表' },
      { index: '/articles/create', icon: 'plus', label: '新增文章' },
      { index: '/articles/draft', icon: 'file-text', label: '草稿箱' },
    ],
  },
  {
    index: '/album',
    icon: 'album',
    label: '相册管理',
  },
  {
    index: '/category',
    icon: 'category',
    label: '分类管理',
  },
  {
    index: '/tag',
    icon: 'tags',
    label: '标签管理',
  },
  {
    index: '/system',
    icon: 'setting',
    label: '系统设置',
    children: [
      { index: '/settings/basic', icon: 'cog', label: '基础设置' },
      { index: '/settings/user', icon: 'user', label: '用户管理' },
      { index: '/settings/security', icon: 'shield', label: '安全设置' },
    ],
  }
])
</script>

<template>
  <div class="aside">
    <div class="aside__container">

      <el-menu :default-active="1" class="aside__menu">
        <div class="aside__title">
          主导航
        </div>
        <el-menu-item index="1">
          <el-icon> <VIcon name="home"/> </el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="2"> 
          <el-icon> <VIcon name="pen"/>  </el-icon>
          <span>文章管理</span>
        </el-menu-item>
        <el-menu-item index="3"> 
          <el-icon> <VIcon name="album"/>  </el-icon>
          <span>相册管理</span>
        </el-menu-item>
        <el-menu-item index="4"> 
          <el-icon> <VIcon name="category"/>  </el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="5"> 
          <el-icon> <VIcon name="tags"/>  </el-icon>
          <span>标签管理</span>
        </el-menu-item>
        <el-menu-item index="6"> 
          <el-icon> <VIcon name="user"/>  </el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <div class="aside__title">
          系统设置
        </div>
        <el-menu-item index="7"> 
          <el-icon> <VIcon name="setting"/>  </el-icon>
          <span>系统设置</span>
        </el-menu-item>
      </el-menu>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.aside {
  @extend %full-size;
  &__container {
    @include mix.padding(lg 0);
  }
  &__title {
    text-align: center;
    @include mix.padding-y(sm);
    border-top: 1px solid var(--el-border-color);
    @include mix.font-style($s: xs, $c: var(--text-subtler));
  }
}
</style>