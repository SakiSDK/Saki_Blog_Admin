<script lang="ts" setup>
import { ref } from 'vue'
import EditCard from '../cards/EditCard.vue';
import { ElInput, ElInputNumber, ElSelect } from 'element-plus';
import { tagUpdateFormSchema, type TagUpdateFormType } from '@/schemas/tag.schema';
import { useStateStore } from '@/stores/state.store';
import { storeToRefs } from 'pinia';
import { useTagStore } from '@/stores/tag.store';
import type { FormFieldConfig } from '@/types/components/base.type';


/** ---------- Tag编辑状态 ---------- */
const stateStore = useStateStore();
const { isTagEditDialogVisible } = storeToRefs(stateStore);
const tagStore = useTagStore();
const { selectedTag } = storeToRefs(tagStore);

// 表单字段配置
const formFields = ref<FormFieldConfig[]>([
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
          label: '正常',
          value: 'active'
        },
        {
          label: '禁用',
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


// 包装updateTag方法
const handleConfirm = async (formData: Record<string, any>) => {
  if (!selectedTag.value?.id) return;
  const payload: TagUpdateFormType = {
    id: selectedTag.value.id,
    name: formData.name ?? '',
    description: formData.description,
    order: formData.order,
    status: formData.status
  };
  const res = await tagStore.updateTag(payload);
}
</script>

<template>
  <div class="edit-card">
    <EditCard
      title="标签编辑"
      headerIcon="edit"
      label-position="top"
      :show-close-btn="false"
      :initialForm="selectedTag || {}"
      :formFields="formFields"
      :formSchema="tagUpdateFormSchema"
      v-model:is-show-edit="isTagEditDialogVisible"
      @confirm="handleConfirm"
    />
  </div>
</template>

<style lang="scss" scoped>


</style>