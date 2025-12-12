<script lang="ts" setup>
import { animate, stagger, splitText } from 'animejs';
import { onMounted, ref } from 'vue';



const loadingEl = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!loadingEl.value) return;
  const { chars } = splitText(loadingEl.value, {
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
})
</script>

<template>
  <div class="request">
    <div class="request__container">
      <div class="request-loading" ref="loadingEl">
        LOADING...
      </div>
      <div class="request-fail">
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
::v-deep(.split-char) {
  @include mix.padding(0 1px);
  border-radius: .25rem;
}
.request,
.request__container { 
  @extend %full-size;
}
.request {
  &__container {
    @extend %flex-center;
  }
  &-loading {
    @include mix.font-style($f: title, $s: title, $w: bolder, $c: var(--primary-base));
  }
}
</style>