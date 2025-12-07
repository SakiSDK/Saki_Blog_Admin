<script lang="ts" setup>
import { ElDatePicker, ElInput, ElMessage, ElSelect } from 'element-plus';
import SearchCard from '../cards/SearchCard.vue';
import type { FormFieldConfig } from '@/types/components/base.type';
import { tagSearchFormSchema } from '@/schemas/tag.schema';
import type { TagSearchFormType } from '@/types/schemas/tag.type';

const initialFrom = {
  keyword: '',
  status: '',
  timeRange: [],
}
// 定义表单字段配置
const tagFormFields: FormFieldConfig[] = [
  {
    label: '关键词',
    prop: 'keyword',
    icon: 'keyword',
    component: ElInput,
    componentProps: {
      placeholder: '请输入关键词',
      maxLength: 20,
      clearable: true,
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
    label: '时间',
    icon: 'time',
    prop: 'timeRange',
    connector: '-',
    component: 'group',
    children: [
      {
        label: '开始时间',
        prop: 'startTime',
        icon: 'time',
        component: ElDatePicker,
        componentProps: {
          placeholder: '请选择开始时间',
          clearable: true,
          type: 'datetime',
        }
      },
      {
        label: '结束时间',
        prop: 'endTime',
        icon: 'time',
        component: ElDatePicker,
        componentProps: {
          placeholder: '请选择结束时间',
          clearable: true,
          type: 'datetime',
        }
      }
    ]
  },
  {
    label: '排列方式',
    prop: 'sort',
    icon: 'sort',
    component: ElSelect,
    componentProps: {
      placeholder: '请选择排序方式',
      clearable: true,
      options: [
        {
          label: '升序',
          value: 'asc'
        },
        {
          label: '降序',
          value: 'desc'
        }
      ]
    }
  }
]

// 定义提交回调
const handleTagSearchSubmit = async (formData: TagSearchFormType) => {
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
  <div class="tag-search">
    <SearchCard
      title="搜索标签"
      icon="search"
      submitText="搜索"
      resetText="重置"
      labelWidth="80px"
      labelPosition="top"
      :initialForm="initialFrom"
      :formSchema="tagSearchFormSchema"
      :formFields="tagFormFields"
      :onSubmit="handleTagSearchSubmit"
    />
  </div>
</template>

<style lang="scss" scoped>
.tag-search {
  width: 100%;
}
</style>