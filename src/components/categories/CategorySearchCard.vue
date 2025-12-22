<script lang="ts" setup>
import { ElDatePicker, ElInput, ElMessage, ElSelect } from 'element-plus';
import SearchCard from '../cards/SearchCard.vue';
import type { FormFieldConfig } from '@/types/components/base.type';
import { categorySearchFormSchema } from '@/schemas/category.schema';
import type { CategorySearchFormType } from '@/schemas/category.schema';
import { useCategoryStore } from '@/stores/category.store';
import { storeToRefs } from 'pinia';


/** ---------- 状态管理 ---------- */
const categoryStore = useCategoryStore();
const { searchQuery, pagination } = storeToRefs(categoryStore);

/** ---------- 页面内容 ---------- */
const initialForm: CategorySearchFormType = {
  id: '',
  keyword: '',
  status: '',
  timeRange: [],
}
// 定义表单字段配置
const categoryFormFields: FormFieldConfig[] = [
  {
    label: '分类ID',
    prop: 'id',
    icon: 'ID',
    component: ElInput,
    componentProps: {
      placeholder: '请输入分类ID',
      maxLength: 20,
      clearable: true,
    }
  },
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
]

// 定义提交回调
const handleCategorySearchSubmit = async (formData: CategorySearchFormType) => {
  try {
    const submitData = {
      ...formData,
    }
    searchQuery.value = submitData;
    const res = await categoryStore.searchCategoryList(submitData);
    if (res.success) {
      ElMessage.success('搜索成功！');
    }
  } catch (error) {
    ElMessage.error('分类搜索失败！');
    console.error('提交失败：', error);
  }
};
const handleReset = async () => {
  categoryStore.resetState();
  try {
    const res = await categoryStore.fetchCategoryList(
      {
        page: pagination.value.page,
        pageSize: pagination.value.pageSize,
        ...(searchQuery.value || {}),
      },
      true
    );
    if (res.success) {
      ElMessage.success('重置成功！');
    }
  } catch (error) {
    ElMessage.error('重置失败！');
    console.error('重置失败：', error);
  }
};

</script>

<template>
  <div class="category-search">
    <SearchCard
      title="搜索分类"
      icon="search"
      submitText="搜索"
      resetText="重置"
      labelWidth="80px"
      labelPosition="top"
      :initialForm="initialForm"
      :formSchema="categorySearchFormSchema"
      :formFields="categoryFormFields"
      @submit="handleCategorySearchSubmit"
      @reset="handleReset"
    />
  </div>
</template>

<style lang="scss" scoped>
.category-search {
  width: 100%;
}
</style>
