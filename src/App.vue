<script setup lang="ts">
// 导入全局组件
import AsideBar from './components/global/AsideBar.vue';
import FooterBar from './components/global/FooterBar.vue';
import TopBar from './components/global/TopBar.vue';

</script>

<template>
  <div class="app">
    <!-- <template> -->
      <el-container class="app__container">
        <el-header class="app__header">
          <TopBar/>
        </el-header>
        <el-container>
          <el-aside 
            width="180px" 
            class="app__aside"
          >
            <AsideBar/>
          </el-aside>
          <el-container>
            <el-main class="app__main">
              <router-view/>
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
.app {
  &__container {
    @include mix.min-size(100vw, 100vh);
  }
  &__header,
  &__footer,
  &__aside {
    @include mix.container-style($p: lg, $r: 0);
  }
  &__header {
    @include mix.padding(0);
    border-bottom: var(--border-base);
  }
  &__footer {
    border-top: var(--border-base);
    @include anim.transition($p: height);
    @include mix.respond-down(xs) {
      height: 90px;
      @include mix.padding(sm);
    }
  }
  &__aside {
    border-right: var(--border-base);
    @include mix.padding(0);
    @include anim.transition($p: width);
    @include mix.respond-down(xs) {
      width: 120px;
    }
    @include mix.respond-down(xxs) {
      width: 100px;
    }
  }
}
</style>
