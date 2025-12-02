<script lang="ts" setup>

</script>

<template>
  <div class="aside">
    <div class="aside__container">
      <el-menu :default-active="1" class="aside__menu">
        <div class="aside__group-name">
          主导航
        </div>
        <el-sub-menu>
          <template #title>Workspace</template>
          <el-menu-item index="1"></el-menu-item>
          <el-menu-item index="2"></el-menu-item>
        </el-sub-menu>
        <el-menu-item index="1">
          仪表盘
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
  &__group-name {
    text-align: center;
    @include mix.font-style($s: xs, $c: var(--text-subtler));
  }
}
</style>