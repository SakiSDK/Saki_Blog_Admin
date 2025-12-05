<script lang="ts" setup>

</script>

<template>
  <div class="footer">
    <div class="footer__container">
      <span class="footer__content">
        <span class="footer-copyright">
          © 2025 SakiSDK 后台管理系统. 
        </span>
        <span class="footer-illustration">
          保留所有权利。
        </span>
      </span>
      <span class="footer-links">
        <a>隐私政策</a>
        <a>使用条款</a>
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.footer {
  @extend %full-size;
  &__container,
  &__content {
    @include mix.respond-down(xs) {
      flex-direction: column;
    }
  }
  &__container {
    @extend %full-size;
    @include mix.flex-box($j: space-between, $g: xxs);
    @include mix.respond-down(xs) {
      justify-content: center;
    }
  }
  &__content {
    @extend %flex-center;
    @include mix.gap(xs);
  }
  &-copyright,
  &-illustration,
  &-links {
    @include mix.font-style($c: var(--text-subtler), $s: sm);
    text-wrap: nowrap;
  }
  &-copyright {
    text-wrap: wrap;
  }
  &-links {
    &>a {
      cursor: pointer;
      @include anim.transition($p: color);
      @include hov.color(var(--primary-base));
      @include hov.underline-style($bt: -2px, $bg: var(--primary-base));
    }
    &>a:not(:last-child) {
      margin-right: 0.5rem;
    }
  }
}
</style>