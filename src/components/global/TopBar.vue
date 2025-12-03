<script lang="ts" setup>
import { useThemeStore } from '@/stores/theme.store';
import VIcon from './VIcon.vue';
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import AvatarImg from '@/assets/imgs/avatar.webp'
import { useStateStore } from '@/stores/state.store';

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
    }
  },
  {
    icon: 'email',
    action: () => {
      console.log('点击了邮件');
    }
  },
  {
    icon: computed(()=>theme.value==='dark'?'moon':'sunny'),
    action: () => {
      themeStore.toggleTheme();
    }
  },
])
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
        <div class="topbar__item topbar__item-expand" @click="stateStore.toggleCollapsedAsideBar()">
          <div 
            class="topbar__expand"
            :class="{
              'topbar__expand--active': stateStore.isCollapsedAsideBar
            }"
          >
            <div v-for="_ in 3"></div>
          </div>
        </div>
      </div>
      <div class="topbar__body">
        <div 
          class="topbar__item" 
          v-for="field, index in topbarFields" 
          :key="index" 
          @click="field.action()"
        >
          <VIcon :name="field.icon"/>
        </div>
        <div class="topbar__user">
          <div class="topbar__user-avatar">
            <img :src="AvatarImg" alt="user">
          </div>
          <span class="topbar__user-role">管理员</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.topbar {
  @extend %full-size;
  &__container {
    @extend %full-size;
    @include mix.flex-box($j: space-between);
    @include mix.container-style($p: 0 lg);
  }
  &__header {
    @extend %flex-center;
    @include mix.gap(sm);
  }
  &-logo {
    @extend %flex-center;
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
      @include mix.font-size(md);
    }
  }
  &__body {
    @extend %flex-center;
    @include mix.gap(sm);
  }
  &__item,
  &__user-avatar {
    @include mix.size(30px);
  }
  &__item {
    @extend %flex-center;
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
    &-expand {
      @include mix.margin-d(l, xxl);
      &:hover {
        .topbar__expand {
          &>div {
            background: var(--primary-base) !important;
          }
        }
      }
    }
  }
  &__user {
    height: 40px;
    @extend %flex-center;
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
  &__expand { 
    @include mix.size(15px);
    @include mix.flex-box($d: column, $j: center, $a: flex-start, $g: xxs);
    &>div {
      width: 100%;
      height: 3px;
      background: var(--text-subtler);
      @include anim.transition($p: width bg);
    }
    &--active {
      &>div:nth-child(1) {
        width: 100%;
      }
      &>div:nth-child(2) {
        width: 70%;
      }
      &>div:nth-child(3) {
        width: 40%;
      }

    }
  }
}
</style>