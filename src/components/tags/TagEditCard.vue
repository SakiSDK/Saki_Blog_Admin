<script lang="ts" setup>
import { ref } from 'vue'
import EditCard from '../cards/EditCard.vue';
import { ElInput, ElInputNumber, ElSelect } from 'element-plus';
import { tagUpdateFormSchema } from '@/schemas/tag.schema';
import { useStateStore } from '@/stores/state.store';
import { storeToRefs } from 'pinia';
import type { TagUpdateFormType } from '@/types/schemas/tag.type'


/** ---------- Tag编辑状态 ---------- */
const tagStore = useStateStore();
const { isTagEditDialogVisible } = storeToRefs(tagStore);

const initialForm: TagUpdateFormType = {
  name: '',
  description: '',
  order: 0,
}
// 表单字段配置
const formFields = ref([
  {
    label: '标签名称',
    icon: 'tag',
    prop: 'name',
    component: ElInput,
    componentProps: {
      placeholder: '请输入标签名称',
      maxLength: 30,
      clearable: true
    }
  },
  {
    label: '标签描述',
    icon: 'description',
    prop: 'description',
    component: ElInput,
    componentProps: {
      placeholder: '请输入标签描述',
      maxlength: 200,
      type: 'textarea',
      rows: 4,
      clearable: true
    }
  },
  {
    label: '状态',
    prop: 'status',
    icon: 'switch',
    component: ElSelect,
    componentProps: {
      placeholder: '请选择状态',
      clearable: true,
      options: [
        {
          label: '激活',
          value: 'active'
        },
        {
          label: '未激活',
          value: 'inactive'
        }
      ]
    }
  },
  {
    label: '优先级',
    icon: 'sort',
    prop: 'order',
    component: ElInputNumber,
    componentProps: {
      placeholder: '请输入排序',
      min: 0,
      step: 1
    }
  }
]);

</script>

<template>
  <div class="edit-card">
    <EditCard
      title="标签编辑"
      headerIcon="edit"
      label-position="top"
      :show-close-btn="false"
      :initialForm="initialForm"
      :formFields="formFields"
      :formSchema="tagUpdateFormSchema"
      :is-show-edit="isTagEditDialogVisible"
    />
  </div>
</template>

<style lang="scss" scoped>


</style>