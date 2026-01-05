<script lang="ts" setup>
import { useThemeStore } from '@/stores/theme.store';
import VIcon from './VIcon.vue';
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import AvatarImg from '@/assets/imgs/avatar.webp'
import { useStateStore } from '@/stores/state.store';
import { useAuthStore } from '@/stores/auth.store';


/** ---------- 状态管理 ---------- */
// 获取用户状态
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
// 获取主题状态
const themeStore = useThemeStore();
const { theme } = storeToRefs(themeStore);
/** ---------- 侧边栏状态 ---------- */
const stateStore = useStateStore();

/** ---------- TopBar文案内容 ---------- */
const topbarFields = ref([
  {
    icon: 'bell',
    action: () => {
      console.log('点击了bell');
    },
    tip: {
      title: '通知',
      content: '点击查看通知'
    } 
  },
  {
    icon: 'email',
    action: () => {
      console.log('点击了邮件');
    },
    tip: {
      title: '邮箱',
      content: '点击查看邮件'
    } 
  },
  {
    icon: computed(()=>theme.value==='dark'?'moon':'sunny'),
    action: () => {
      themeStore.toggleTheme();
    },
    tip: {
      title: computed(() => theme.value === 'dark' ? '浅色主题' : '深色主题'),
      content: computed(() => theme.value === 'dark' ? '点击切换到浅色模式' : '点击切换到深色模式')
    } 
  },
])


/** ---------- 逻辑方法 ---------- */
/**
 * 处理下拉菜单命令
 * @param command 命令字符串
 */
function handleCommand(command: string) {

}

console.log(user)
</script>

<template>
  <div class="topbar">
    <div class="topbar__container">
      <div class="topbar__header">
        <span class="topbar-logo">
          <VIcon name="pen"/>
        </span>
        <span class="topbar-sitename">
          博客管理
        </span>

        <el-popover 
          width="50" 
          title="折叠侧边栏" 
          trigger="click" 
          placement="bottom" 
          popper-class="topbar__popover"
        >
          <template #default>
            <div class="topbar__item-popover-content">
              点击折叠侧边栏
            </div>
          </template>
          <template #reference>
            <div 
              class="topbar__item topbar__item-expand" 
              @click="stateStore.toggleCollapsedAsideBar()"
              :class="{
                'topbar__item-expand--active': stateStore.isCollapsedAsideBar
              }"
            >
              <div v-for="_ in 3"></div>
            </div>
          </template>
        </el-popover>
      </div>
      <div class="topbar__body">
        <el-popover 
          v-for="field,index in topbarFields"
          :key="index"
          width="50" 
          :title="field.tip.title" 
          trigger="hover" 
          placement="bottom" 
        >
          <div class="topbar__item-popover-content">
            {{ field.tip.content || '提示内容' }}
          </div>
          <template #reference>
            <div class="topbar__item" @click="field.action()">
              <VIcon :name="field.icon" />
            </div>
          </template>
        </el-popover>
        <el-dropdown @command="handleCommand" trigger="click">
          <div class="topbar__user">
            <div class="topbar__user-avatar">
              <img :src="user?.avatar || AvatarImg" alt="user">
            </div>
            <span class="topbar__user-role">{{ '管理员' }}</span>
            <div class="topbar__dropdown">
              <VIcon name="arrow-down-s" />
            </div>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.topbar,
.topbar__container {
  @extend %full-size;
}
.topbar {
  &__container {
    @include mix.flex-box($j: space-between);
    @include mix.container-style($p: 0 lg);
    @include anim.transition($p: padding);
    @include mix.respond-down(xs) {
      @include mix.padding(0 sm);
    }
  }
  &__header,
  &-logo,
  &__body,
  &__item,
  &__user {
    @extend %flex-center;
  }
  &__header {
    @include mix.gap(sm);
    @include mix.respond-down(xs) {
      @include mix.gap(xs);
    }
  }
  &-logo {
    @include mix.container-style($p: xs, $bg: var(--primary-base));
    @include mix.font-style($s: xxl, $c: var(--white-base));
    @include anim.transition($p: font-size);
    @include mix.respond-down(xs){
      @include mix.font-style($s: xl);
    }
  }
  &-sitename {
    @include mix.font-style($s: xl, $f: title);
    @include anim.transition($p: font-size);
    @include mix.respond-down(xs){
      @include mix.font-size(sm);
    }
  }
  &__body {
    @include mix.gap(sm);
  }
  &__item,
  &__user-avatar {
    @include mix.size(30px);
  }
  &__item {
    @include mix.font-style($s: md, $c: var(--text-subtle));
    @include mix.container-style(
      $p: 0, 
      $r: sm, 
      $bg: var(--interactive-base), 
      $b: var(--border-base)
    );
    @include anim.transition($p: color transform with height font-size);
    @include hov.color(var(--primary-base));
    @include hov.scale(1.1);
    &:active {
      transform: scale(1);
    }
    @include mix.respond-down(xs) {
      @include mix.size(25px);
      @include mix.font-style($s: sm);
    }
    &-popover-content {
      @include mix.font-style($c: var(--text-subtler))
    }
    &-expand {
      display: block;
      @include mix.padding(xs);
      @include mix.margin-d(l, xxl);
      @include anim.transition($p: margin transform);
      @include mix.respond-down(xs) {
        @include mix.margin-d(l, xs);
      }
      &:hover {
        &>div {
          background-color: var(--primary-base);
        }
      }
      &>div {
        @include mix.size(100%, 3px);
        background: var(--text-subtle);
        @include mix.margin-d(b, 4px);
        @include anim.transition($p: width bg margin);
        @include mix.respond-down(xs) {
          @include mix.margin-d(b, 2px);
        }
      }
      &--active {
        $indexes: ( 1, 2, 3);
        @each $i in $indexes {
          &>div:nth-child(#{$i}) {
            width: 90% - 20% * ($i - 1);
          }
        }
      }
    }
  }
  &__user {
    height: 40px;
    @include mix.gap(sm);
    @include mix.container-style(
      $p: 0 sm, 
      $r: md, 
      $bg: var(--interactive-base), 
      $b: var(--border-base)
    );
    @include anim.transition($p: height transform);
    @include hov.scale(1.1);
    &:hover {
      .topbar__user-avatar {
        transform: rotate(360deg);
      }
    }
    @include mix.respond-down(xs) {
      height: 35px;
    }
    &-avatar {
      @include mix.radius(sm);
      overflow: hidden;
      @include anim.transition($p: with height transform, $dr: 'slower');
      @include mix.respond-down(xs) {
        @include mix.size(25px);
      }
    }
    &-role {
      @include mix.font-style($s: sm, $f: title);
      @include anim.transition($p: font-size);
      @include mix.respond-down(xs){
        @include mix.font-style($s: xs);
      }
    }
  }
}
</style>