<script lang="ts" setup>
import { ElMessage, ElMessageBox, ElSelect } from 'element-plus';
import ListCard from '@/components/cards/ListCard.vue';
import type { TableColumnField } from '@/types/components/base.type';
import { computed, onMounted, ref, watch } from 'vue';
import { useCategoryStore } from '@/stores/category.store';
import { storeToRefs } from 'pinia';
import { useStateStore } from '@/stores/state.store';
import type { Category } from '@/schemas/category.schema';


/** ---------- 状态管理 ---------- */
const categoryStore = useCategoryStore();
const {
  pagination, categoryList, isLoading, selectedCategory,
  currentParams
} = storeToRefs(categoryStore);
const stateStore = useStateStore();


// 表格列配置
const tableColumns = ref<TableColumnField[]>([
  {
    label: '分类ID',
    prop: 'id',
    width: 70,
  },
  {
    label: '分类名称',
    prop: 'name',
    width: 140,
  },
  {
    label: '分类描述',
    prop: 'description',
    width: 250,
  },
  {
    label: '优先级',
    prop: 'order',
    width: 70,
  },
  {
    label: '文章数量',
    prop: 'postCount',
    width: 90,
  },
  {
    label: '状态',
    prop: 'status',
    width: 100,
  },
  {
    label: '创建时间',
    prop: 'createdAt',
    width: 180,
  },
  {
    label: '更新时间',
    prop: 'updatedAt',
    width: 180,
  },
]);

// 选中的行
const selectedRows = ref<Category[]>([]);

// 处理选择变化
const handleSelectionChange = (val: Category[]) => {
  selectedRows.value = val;
};

// 编辑分类
const handleEdit = (row: Category) => {
  ElMessage.info(`准备编辑分类: ${row.name}`);
  // 打开编辑弹窗逻辑
  stateStore.setCategoryEditDialogVisible(true);
  selectedCategory.value = {
    id: row.id,
    name: row.name,
    description: row.description,
    order: row.order,
    status: row.status,
  };
};

// 删除分类
const handleDelete = async (row: Category) => {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除该分类, 是否继续?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    const res = await categoryStore.deleteCategory(row.id, true);
    if (res.success) {
      ElMessage({
        message: res.message || '删除成功',
        type: 'success'
      });
      // 执行删除逻辑
      const index = categoryList.value.findIndex(category => category.id === row.id);
      if (index !== -1) {
        categoryList.value.splice(index, 1);
      }
    } else {
      throw new Error(res.message);
    }
  } catch(error: any) {
    ElMessage.error(error.message || error || '删除失败');
  }
};

// 切换状态
const handleToggleStatus = async (row: Category) => {
  const action = row.status==='active' ? '禁用' : '启用';
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}分类 "${row.name}" 吗?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        customClass: 'custom-category-confirm-box', 
        type: row.status==='inactive' ? 'warning' : 'info'
      }
    )
    const res = await categoryStore.toggleCategoryStatus(row.id);
    if (res.data) {
      row.status = res.data.status;
    } else {
      ElMessage.error('响应数据异常，无法更新状态');
    }
    if (res.success) {
      ElMessage(
        {
          message: res.message || '操作成功',
          type: 'success'
        }
      );
    }
  } catch(error: any) {
    ElMessage.error(`操作失败：${error.message || error}`);
  }
};

// 批量删除
const handleBulkDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的分类');
    return;
  }
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个分类吗?`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    // 执行批量删除
    const selectedIds = selectedRows.value.map(row => row.id);
    const res = await categoryStore.bulkDeleteCategory(selectedIds, true);
    if (res.success) {
      categoryList.value = categoryList.value.filter(category => !selectedIds.includes(category.id));
      selectedRows.value = [];
      ElMessage.success(`成功删除 ${selectedIds.length} 个分类`);
    } else {
      throw new Error(res.message);
    }
  } catch (error: any) {
    ElMessage.error(`操作失败：${error.message || error}`);
  }
};

// 操作列配置
const actionColumnConfig = {
  label: '操作',
  width: 140,
  actions: [
    {
      name: 'edit',
      icon: 'edit',
      tooltip: '编辑分类',
      type: 'primary' as const,
      handler: (row: unknown) => handleEdit(row as Category)
    },
    {
      name: 'delete',
      icon: 'trush', // 保持一致
      tooltip: '删除分类',
      type: 'danger' as const,
      confirm: true,
      confirmText: '确定要删除该分类吗？',
      handler: (row: unknown) => handleDelete(row as Category)
    },
    {
      name: 'toggleStatus',
      icon: 'play',
      tooltip: '切换状态',
      type: 'success' as const,
      confirm: false,
      confirmText: '确定要切换分类状态吗？',
      handler: (row: unknown) => handleToggleStatus(row as Category)
    }
  ]
};

// 排列方式
const sortFields = [
  {
    label: '排序字段',
    prop: 'orderBy',
    icon: 'orderBy',
    component: ElSelect,
    componentProps: {
      placeholder: '请选择排序字段',
      clearable: true,
      options: [
        {
          label: '分类ID',
          value: 'id'
        },
        {
          label: '创建时间',
          value: 'created_at'
        },
        {
          label: '更新时间',
          value: 'updated_at'
        },
        {
          label: '文章数量',
          value: 'post_count' 
        }
      ]
    },
  },
  {
    label: '排序方式',
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

// 头部操作按钮
const headerActions = [
  {
    name: '批量删除',
    label: 'delete',
    icon: 'trush',
    type: 'danger' as const,
    handler: handleBulkDelete,
    disabled: computed(() => selectedRows.value.length === 0),
  },
];

/** ---------- 生命周期 ---------- */
onMounted(async () => {
  try {
    const res = await categoryStore.fetchCategoryList();
    console.log(res);
  } catch (error) {
    
  }
})


/** ---------- 监听 ---------- */
watch(
  () => [pagination.value.page, pagination.value.pageSize],
  async ([page, pageSize], [oldPage, oldPageSize]) => {
    // 只有真正改变才触发请求
    if (page === oldPage && pageSize === oldPageSize) return
    
    await categoryStore.fetchCategoryList({ page, pageSize }, true)
  }
)
watch(
  () => [currentParams.value.sort, currentParams.value.orderBy],
  async ([sort, orderBy], [oldSort, oldOrderBy]) => {
    if (sort === oldSort && orderBy === oldOrderBy) return
    await categoryStore.fetchCategoryList(currentParams.value, true)
  }
)
</script>

<template>
  <div class="category-list">
    <ListCard
      :loading="isLoading"
      title="分类列表"
      icon="list"
      :data="categoryList"
      v-model:selected-rows="selectedRows"
      :columns="tableColumns"
      :show-selection="true"
      :show-pagination="true"
      v-model:current-page="pagination.page"
      v-model:pageSize="pagination.pageSize"
      v-model:currentParams="currentParams"
      v-model:sort="currentParams.sort"
      :page-totals="pagination.totalPages"
      :total="pagination.total"
      :show-action-column="true"
      :action-column-config="actionColumnConfig"
      :header-actions="headerActions"
      :sort-fields="sortFields"
      @selection-change="handleSelectionChange"
    />
  </div>
</template>

<style lang="scss" scoped>
.category-list {
  width: 100%;
}
</style>
