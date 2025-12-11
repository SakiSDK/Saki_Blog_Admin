<script lang="ts" setup>
import AlbumListCard from '@/components/albums/AlbumListCard.vue';

</script>

<template>
  <div class="album-list">
    <div class="album-list__container">
      <AlbumListCard/>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.album-list {
  width: 100%;
  &__container {
    width: 100%;
    @include mix.padding(sm);
  }
}

</style>