<script setup lang="ts">
// 导入全局组件
import { storeToRefs } from 'pinia';
import AsideBar from './components/global/AsideBar.vue';
import FooterBar from './components/global/FooterBar.vue';
import TopBar from './components/global/TopBar.vue';
import { useStateStore } from './stores/state.store';
import { animate, stagger, splitText } from 'animejs';
import { nextTick, onMounted, ref } from 'vue';
import { waitForAllRequests } from './utils/apiTracker.util';
import { useEventListener } from '@vueuse/core';


const domReady = ref(false); // 标记 DOM 是否加载完成
const stateStore = useStateStore();
const { isCollapsedAsideBar } = storeToRefs(stateStore);

// 原有隐藏加载页逻辑（保留）
const handleHideLoader = () => {
  setTimeout(() => {
    stateStore.setGlobalLoading(false);
  }, 300); // 对应 CSS transition 时长
}
const checkAllReady = () => {
  if (domReady.value) {
    handleHideLoader();
  }
};
const waitForApis = async () => {
  await waitForAllRequests(); // 自动等待所有跟踪的接口
  checkAllReady();
};

useEventListener('DOMContentLoaded', () => {
  domReady.value = true;
  checkAllReady(); // 检查是否可以隐藏全局加载
});


const svg = 
`
  <path
    class="path"
    d="
      M 30 15
      L 28 17
      M 25.61 25.61
      A 15 15, 0, 0, 1, 15 30
      A 15 15, 0, 1, 1, 27.99 7.5
      L 15 15
    "
    style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"
  />
`
onMounted(async() => {
  stateStore.setGlobalLoading(true); // 初始化显示全局加载
  await nextTick();
  const { chars } = splitText('.el-loading-text', {
    chars: {
      class: 'split-char'
    },
    words: true,
  })
  animate(chars, {
    y: ['0rem', '-1rem', '0rem'],
    loop: true,
    delay: stagger(100),
  })
  await waitForApis();
})
</script>

<template>
  <div class="app">
    <el-container class="app__container">
      <el-header class="app__header">
        <TopBar/>
      </el-header>
      <el-container>
        <el-aside 
          :width="isCollapsedAsideBar?'60px':'180px'"
          class="app__aside"
        >
          <AsideBar/>
        </el-aside>
        <el-container>
          <el-main 
            class="app__main" 
          >
            <Transition name="loading-fade">
              <div 
                class="app__mask"
                v-loading="stateStore.isGlobalLoading||stateStore.isRouteLoading"
                element-loading-text="LOADING..."
                :element-loading-spinner="svg"
                element-loading-svg-view-box="-10, -10, 50, 50"
                fullscreen
                v-if="stateStore.isGlobalLoading||stateStore.isRouteLoading"
              >
              </div>
            </Transition>
            <Transition name="fade">
              <router-view/>
            </Transition>
          </el-main>
          <el-footer class="app__footer" height="75px">
            <FooterBar/>
          </el-footer>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-loading-mask) {
  @extend %full-size;
  background-color: var(--bg-base);
}
:deep(.el-loading-spinner) {
  .el-loading-text {
    @include mix.margin-d(t, sm);
    @include mix.font-style($c: var(--primary-base), $f: pixel, $s: md);
  }
  .path {
    stroke: var(--primary-base);
  }
}
.app {
  &__mask {
    @include mix.position-style($p: absolute, $t: 0, $l: 0);
    @extend %full-size;
  }
  &__container {
    @include mix.min-size(100vw, 100vh);
  }
  &__main {
    position: relative;
    @include mix.padding(0);
    max-height: calc(100vh - 60px);
    @include mix.respond-down(xs) {
      max-height: calc(100vh - 50px);
    }
  }
  &__header,
  &__footer,
  &__aside {
    @include mix.container-style($p: lg, $r: 0);
  }
  &__header {
    height: 60px;
    @include mix.padding(0);
    border-bottom: var(--border-base);
    @include anim.transition($p: height);
    @include mix.respond-down(xs) {
      height: 50px;
    }
  }
  &__footer {
    border-top: var(--border-base);
    @include anim.transition($p: height);
    @include mix.respond-down(xs) {
      height: 70px;
      @include mix.padding(xs);
    }
  }
  &__aside {
    border-right: var(--border-base);
    @include mix.padding(0);
    @include anim.transition($p: width);
  }
}
</style>
