<script lang="ts" setup>
import { ElInput, ElInputNumber, ElMessage, ElSelect } from 'element-plus';
import type { CategoryFormType } from '@/schemas/category.schema';
import { categoryFormSchema } from '@/schemas/category.schema';
import CreateCard from '../cards/CreateCard.vue';
import type { FormFieldConfig } from '@/types/components/base.type';
import { useCategoryStore } from '@/stores/category.store';


/** ---------- 状态管理 ---------- */
const categoryStore = useCategoryStore();

// 定义初始表单数据
const initialForm: CategoryFormType = {
  name: '',
  description: '',
  order: 0,
  status: 'active'
};
// 定义表单字段配置
const categoryFormFields:FormFieldConfig[] = [
  {
    label: '分类名称',
    icon: 'folder',
    prop: 'name',
    row: 1,
    component: ElInput,
    componentProps: {
      placeholder: '请输入分类名称',
      maxlength: 50,
      clearable: true
    }
  },
  {
    label: '分类描述',
    icon: 'description',
    prop: 'description',
    row: 2,
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
    label: '权重',
    icon: 'sort',
    prop: 'order',
    group: 'group1',
    row: 3,
    component: ElInputNumber,
    componentProps: {
      placeholder: '请输入排序',
      min: 0,
      step: 1,
    }
  },
  {
    label: '状态',
    icon: 'switch',
    prop: 'status',
    group: 'group1',
    row: 3,
    component: ElSelect,
    componentProps: {
      placeholder: '请选择状态',
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
  }
];
// 定义提交回调
const handleCategorySubmit = async (formData: CategoryFormType) => {
  try {
    // 模拟接口提交
    const res = await categoryStore.createCategory(formData);
    if (res.success) {
      ElMessage.success('分类创建成功！');
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    ElMessage.error('分类创建失败！');
    console.error('提交失败：', error);
  }
};
</script>

<template>
  <div class="category-create">
    <CreateCard
      title="创建分类"
      icon="folder"
      submitText="创建分类"
      resetText="重置"
      :initial-form="initialForm"
      :form-schema="categoryFormSchema"
      :form-fields="categoryFormFields"
      :on-submit="handleCategorySubmit"
      label-width="80px"
      label-position="top"
    />
  </div>
</template>

<style lang="scss" scoped>
.category-create { 
  width: 100%;
}
</style>
