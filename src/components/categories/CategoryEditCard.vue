<script lang="ts" setup>
import { ref } from 'vue'
import EditCard from '../cards/EditCard.vue';
import { ElInput, ElInputNumber, ElSelect } from 'element-plus';
import { categoryUpdateFormSchema, type CategoryUpdateFormType } from '@/schemas/category.schema';
import { useStateStore } from '@/stores/state.store';
import { storeToRefs } from 'pinia';
import { useCategoryStore } from '@/stores/category.store';
import type { FormFieldConfig } from '@/types/components/base.type';


/** ---------- Category编辑状态 ---------- */
const stateStore = useStateStore();
const { isCategoryEditDialogVisible } = storeToRefs(stateStore);
const categoryStore = useCategoryStore();
const { selectedCategory } = storeToRefs(categoryStore);

// 表单字段配置
const formFields = ref<FormFieldConfig[]>([
  {
    label: '分类名称',
    icon: 'folder',
    prop: 'name',
    component: ElInput,
    componentProps: {
      placeholder: '请输入分类名称',
      maxLength: 50,
      clearable: true
    }
  },
  {
    label: '分类描述',
    icon: 'description',
    prop: 'description',
    component: ElInput,
    componentProps: {
      placeholder: '请输入分类描述',
      maxlength: 50,
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


// 包装updateCategory方法
const handleConfirm = async (formData: Record<string, any>) => {
  if (!selectedCategory.value?.id) return;
  const payload: CategoryUpdateFormType = {
    id: selectedCategory.value.id,
    name: formData.name ?? '',
    description: formData.description,
    order: formData.order,
    status: formData.status
  };
  const res = await categoryStore.updateCategory(payload);
}
</script>

<template>
  <div class="edit-card">
    <EditCard
      title="分类编辑"
      headerIcon="edit"
      label-position="top"
      :show-close-btn="false"
      :initialForm="selectedCategory || {}"
      :formFields="formFields"
      :formSchema="categoryUpdateFormSchema"
      v-model:is-show-edit="isCategoryEditDialogVisible"
      @confirm="handleConfirm"
    />
  </div>
</template>

<style lang="scss" scoped>


</style>
