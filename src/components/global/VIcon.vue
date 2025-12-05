<script lang="ts" setup>
import { computed } from 'vue';
import type { IconProps } from '@/types/components/base.type';
import type { CSSProperties } from 'vue';

defineOptions({
  name: 'Icon',
});

// 1. 定义 props
const props = defineProps<IconProps>();

// 2. 计算样式
const iconStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {};
  
  // 处理颜色
  if (props.color) {
    style.color = props.color;
  }
  
  // 处理大小
  if (props.size) {
    style.fontSize = typeof props.size === 'number' ? `${props.size}px` : props.size;
  }
  
  return style;
});
</script>

<template>
  <svg
    :class="['icon', className]"
    :style="iconStyle"
    aria-hidden="true"
    :title="title"
  >
    <use :xlink:href="`#icon-${name}`"></use>
  </svg>
</template>

<style lang="scss" scoped>
/* 基础样式 (与你提供的通用 CSS 一致) */
.icon {
  @include mix.size(1em);
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>