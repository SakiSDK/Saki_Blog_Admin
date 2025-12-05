<script lang="ts" setup>
import TagCreateCard from '@/components/tags/TagCreateCard.vue';
import TagListCard from '@/components/tags/TagListCard.vue';
import TagSearchCard from '@/components/tags/TagSearchCard.vue';

</script>

<template>
  <div class="tag">
    <div class="tag__container">
      <TagCreateCard/>
      <TagSearchCard/>
      <TagListCard/>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tag {
  &__container {
    @include mix.padding(sm);
    @extend %flex-column-center;
    @include mix.gap(sm);
  }

}
</style>