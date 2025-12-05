<script lang="ts" setup>
import { computed } from 'vue';
import type { CardHeaderProps } from '@/types/components/base.type';
import VIcon from '../global/VIcon.vue';


const props = withDefaults(defineProps<CardHeaderProps>(), {
  align: 'left',
  bordered: true,
  padding: '10px 10px',
  background: 'none',
  icon: '',
});
const headerClass = computed(() => ({
  'is-center': props.align === 'center',
  'is-right': props.align === 'right',
  'is-left': props.align === 'left',
  'with-border': props.bordered
}))
</script>

<template>
  <div class="card-header" >
    <div 
      class="card-header__container"
      :class="headerClass"
      :style="{
        '--card-header-padding': padding,
        '--card-header-background': background
      }"
    >
    <div class="card-header__wrapper">
      <div class="card-header-icon">
        <slot name="icon">
          <VIcon v-if="icon" :name="icon" />
        </slot>
      </div>
      <!-- 左侧：标题 + 副标题 -->
      <div class="card-header-title">
        <!-- 如果用户没有传 slot，则显示 title props -->
        <slot name="title">
          <h3 v-if="title">{{ title }}</h3>
          <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
        </slot>
      </div>
    </div>
      <!-- 右侧操作区（按钮等） -->
      <div class="card-header-actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.with-border.card-header__container {
  border-bottom: var(--border-base);
}
.is-center.card-header__container {
  justify-content: center;
}
.is-right.card-header__container {
  justify-content: flex-end;
}
.is-left.card-header__container {
  justify-content: flex-start;
}
.card-header {
  width: 100%;
  &__container {
    position: relative;
    @include mix.container-style(
      $r: 0, 
      $p: var(--card-header-padding), 
      $bg: var(--card-header-background)
    );
    @include mix.flex-box($j: flex-start, $g: lg);
  }
  &__wrapper {
    @extend %flex-center;
  }
  &-title {
    @include mix.flex-box($d: column, $a: flex-start, $g: sm);
    @include mix.margin-d(l, lg);
    @include anim.transition($p: margin);
    @include mix.respond-down(xs){
      @include mix.margin-d(l, sm);
    }
    h3,
    .subtitle {
      margin: 0;
    }
    h3 {
      @include mix.font-style($s: lg, $w: 600, $f: 'title');
      @include anim.transition($p: font-size);
      @include mix.respond-down(xs){
        @include mix.font-size(md);
      }
    }
    .subtitle {
      @include mix.font-style($s: sm, $c: var(--text-subtler));
    }
  }
  &-actions {
    @include mix.flex-box($a: center, $j: flex-start, $g: sm);
    @include mix.position-style($p: absolute, $r: sm, $t: sm);
  }
  &-icon {
    @include mix.size(30px);
    @extend %flex-center;
    flex-shrink: 0;
    @include mix.container-style($p: 0, $bg: var(--primary-base), $r: sm);
    @include mix.font-style($s: xl, $c: var(--white-base));
    @include anim.transition($p: width height font-size);
    @include mix.respond-down(xs) {
      @include mix.size(25px);
      @include mix.font-size(md);
    }
  }
}
</style>