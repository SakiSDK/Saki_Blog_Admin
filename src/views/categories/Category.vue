<script lang="ts" setup>
import CategoryCreateCard from '@/components/categories/CategoryCreateCard.vue';
import CategoryListCard from '@/components/categories/CategoryListCard.vue';
import CategorySearchCard from '@/components/categories/CategorySearchCard.vue';
import CategoryEditCard from '@/components/categories/CategoryEditCard.vue';

</script>

<template>
  <div class="category">
    <div class="category__container">
      <CategoryCreateCard/>
      <CategorySearchCard/>
      <CategoryListCard/>
      <CategoryEditCard/>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.category {
  &__container {
    @include mix.padding(sm);
    @extend %flex-column-center;
    @include mix.gap(sm);
  }
}
</style>