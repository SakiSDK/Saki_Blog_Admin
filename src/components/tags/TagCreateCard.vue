<script lang="ts" setup>
import { ElInput, ElInputNumber, ElMessage, ElSelect } from 'element-plus';
import type { TagFormType } from '@/types/schemas/tag.type';
import { tagFormSchema } from '@/schemas/tag.schema';
import CreateCard from '../cards/CreateCard.vue';
import type { FormFieldConfig } from '@/types/components/base.type';


// 定义初始表单数据
const initialForm: TagFormType = {
  name: '',
  description: '',
  order: 0
};
// 定义表单字段配置
const tagFormFields:FormFieldConfig[] = [
  {
    label: '标签名称',
    icon: 'tag',
    prop: 'name',
    row: 1,
    component: ElInput,
    componentProps: {
      placeholder: '请输入标签名称',
      maxlength: 20,
      clearable: true
    }
  },
  {
    label: '标签描述',
    icon: 'description',
    prop: 'description',
    row: 2,
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
    label: '优先级',
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
          value: 1
        },
        {
          label: '禁用',
          value: 0
        }
      ]
    }
  }
];
// 定义提交回调
const handleTagSubmit = async (formData: TagFormType) => {
  try {
    // 模拟接口提交
    console.log('提交标签数据：', formData);
    ElMessage.success('标签创建成功！');
    // 实际项目中替换为接口请求：await tagApi.create(formData)
  } catch (error) {
    ElMessage.error('标签创建失败！');
    console.error('提交失败：', error);
  }
};
</script>

<template>
  <div class="tag-create">
    <CreateCard
      title="创建标签"
      icon="tag"
      submitText="创建标签"
      resetText="重置"
      :initial-form="initialForm"
      :form-schema="tagFormSchema"
      :form-fields="tagFormFields"
      :on-submit="handleTagSubmit"
      label-width="80px"
      label-position="top"
    />
  </div>
</template>

<style lang="scss" scoped>
.tag-create { 
  width: 100%;
}
</style>