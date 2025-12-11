<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import VIcon from './VIcon.vue';
import { useNavigator } from '@/utils/navigator.util';
import type { MenuItem } from '@/types/components/base.type';
import { useStateStore } from '@/stores/state.store';
import { storeToRefs } from 'pinia';


/** ---------- 页面逻辑 ---------- */
const navigator = useNavigator();


/** ---------- 状态管理 ---------- */
// 当前激活的菜单项
const activeMenu = ref('/dashboard');
// 展开的菜单项
const openedMenus = ref<string[]>([]);
// 侧边栏是否折叠
const stateStore = useStateStore();
const { isCollapsedAsideBar } = storeToRefs(stateStore);




/** ---------- 逻辑方法 ---------- */
// 处理菜单点击
const handleMenuSelect = (index: string) => {
  if (index.startsWith('http')) {
    window.open(index, '_blank');
  } else {
    navigator.go(index);
  }
};
// 初始化菜单状态
const initMenuState = () => {
  const currentPath = navigator.route?.path;
  
  // 设置当前激活的菜单
  activeMenu.value = currentPath;
  
  // 根据当前路由设置展开的菜单
  const parentPath = findParentMenu(currentPath);
  if (parentPath && !openedMenus.value.includes(parentPath)) {
    openedMenus.value.push(parentPath);
  }
};
// 查找父级菜单
const findParentMenu = (path: string): string | null => {
  for (const item of menuItems.value) {
    if (item.children) {
      const child = item.children.find(child => child.index === path);
      if (child) {
        return item.index;
      }
    }
  }
  return null;
};


/** ---------- 页面文案 ---------- */
const menuItems = ref<MenuItem[]>([
  {
    index: '/dashboard',
    icon: 'home',
    label: '仪表盘',
  },
  {
    index: '/article',
    icon: 'pen',
    label: '文章管理',
    // 子菜单
    children: [
      { index: '/article/list', icon: 'article', label: '文章列表' },
      { index: '/article/create', icon: 'plus', label: '新增文章' },
      { index: '/article/edit', icon: 'edit', label: '编辑文章'},
      { index: '/article/draft', icon: 'draft', label: '草稿箱' },
      { index: '/article/category', icon: 'category', label: '分类管理' },
      { index: '/article/tag', icon: 'tag', label: '标签管理' },
    ],
  },
  {
    index: '/album',
    icon: 'album',
    label: '相册管理',
    // 子菜单
    children: [
      { index: '/album/list', icon: 'album', label: '相册列表' },
      { index: '/album/create', icon: 'plus', label: '新增相册' },
    ],
  }
])
// 系统设置
const systemSettings = {
  index: '/system',
  icon: 'setting',
  label: '系统设置',
  children: [
    { index: '/setting/basic', icon: 'basic', label: '基础设置' },
    { index: '/setting/email', icon: 'email', label: '邮箱设置'},
    { index: '/setting/upload', icon: 'upload', label: '上传设置' },
    { index: '/setting/seo', icon: 'security', label: '安全设置' },
  ],
}

/** ---------- 生命周期 ---------- */
onMounted(() => {
  initMenuState();
});

// 监听路由变化
watch(() => navigator.route?.path, (newPath) => {
  activeMenu.value = newPath;
  const parentPath = findParentMenu(newPath);
  if (parentPath && !openedMenus.value.includes(parentPath)) {
    openedMenus.value.push(parentPath);
  }
});
</script>

<template>
  <div class="aside">
    <div class="aside__container">
      <el-menu 
        :default-active="1" 
        :collapse="isCollapsedAsideBar"
        collapse-transition
        :unique-opened="true"
        @select="handleMenuSelect"
        class="aside__menu"
      >
        <Transition name="title-fade">
          <div class="aside__title" v-if="!isCollapsedAsideBar">
            主导航
          </div>
        </Transition>
        <template v-for="item in menuItems" :key="item.index">
          <!-- 有子菜单的项 -->
          <el-sub-menu
            v-if="item.children && item.children.length > 0"
            :index="item.index"
          >
            <template #title>
              <el-icon> 
                <VIcon :name="item.icon"/>
              </el-icon>
              <span>{{ item.label }}</span>
            </template>
            <!-- 子菜单项 -->
            <el-menu-item 
              v-for="child in item.children" 
              :key="child.index" 
              :index="child.index"
              class="aside__menu-item"
              :class="{
                'aside__menu-item--active': activeMenu === child.index
              }"
            >
              <el-icon>
                <VIcon :name="child.icon"/>
              </el-icon>
              <template #title>
                <span>{{ child.label }}</span>
              </template>
            </el-menu-item>
          </el-sub-menu>
          <!-- 没有子菜单的项 -->
          <el-menu-item 
            v-else :index="item.index"
            class="aside__menu-item"
            :class="{
              'aside__menu-item--active': activeMenu === item.index
            }"
          >
            <el-icon>
              <VIcon :name="item.icon"/>
            </el-icon>
            <template #title>
              <span>{{ item.label }}</span>
            </template>
          </el-menu-item>
        </template>
        <!-- 系统设置部分 -->
        <Transition name="title-fade">
          <div class="aside__title" v-if="!isCollapsedAsideBar">
            系统设置
          </div>
        </Transition>
        <el-sub-menu 
          :index="systemSettings.index"
        > 
          <template #title>
            <el-icon>
              <VIcon name="setting"/>
            </el-icon>
            <span>{{ systemSettings.label }}</span>
          </template>
          <el-menu-item 
            v-for="child in systemSettings.children" 
            :key="child.index" 
            :index="child.index"
            class="aside__menu-item"
            :class="{
              'aside__menu-item--active': activeMenu === child.index
            }"
          >
            <el-icon>
              <VIcon :name="child.icon"/>
            </el-icon>
            <template #title>
              <span>{{ child.label }}</span>
            </template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-menu) {
  .el-menu-item {
    .el-icon,
    &>span {
      @include anim.transition($p: transform);
    }
    &:active {
      .el-icon,
      &>span {
        transform: translateX(-7px);
      }
    }
  }
}
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
    &:first-child {
      border-top: none;
    }
  }
  &__menu {
    border: none;
    @include anim.transition($p: height padding width height);
    &-item {
      @include mix.padding-d(l, lg, true);
      @include anim.transition($p: border-color bg color, $dr: slower);
      border-left: 3px solid transparent;
      &--active {
        border-color: var(--primary-base);
        background: var(--primary-transparent);
        color: var(--primary-base);
        :deep(.el-icon),
        &>span {
          transform: translateX(-10px);
        }
      }
    }
  }

}
</style>