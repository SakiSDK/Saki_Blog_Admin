<script lang="ts" setup>
import { ElMessage, ElMessageBox, ElSelect } from 'element-plus';
import ListCard from '@/components/cards/ListCard.vue';
import type { TableColumnField } from '@/types/components/base.type';
import { computed, onMounted, ref, watch } from 'vue';
import { useTagStore } from '@/stores/tag.store';
import { storeToRefs } from 'pinia';
import { useStateStore } from '@/stores/state.store';
import type { Tag } from '@/schemas/tag.schema';


/** ---------- 状态管理 ---------- */
const tagStore = useTagStore();
const {
  pagination, tagList, isLoading, selectedTag,
  currentParams
} = storeToRefs(tagStore);
const stateStore = useStateStore();


// 表格列配置
const tableColumns = ref<TableColumnField[]>([
  {
    label: '标签ID',
    prop: 'id',
    width: 70,
  },
  {
    label: '标签名称',
    prop: 'name',
    width: 140,
  },
  {
    label: '标签描述',
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
const selectedRows = ref<Tag[]>([]);

// 处理选择变化
const handleSelectionChange = (val: Tag[]) => {
  selectedRows.value = val;
};

// 编辑标签
const handleEdit = (row: Tag) => {
  ElMessage.info(`准备编辑标签: ${row.name}`);
  // 打开编辑弹窗逻辑
  stateStore.setTagEditDialogVisible(true);
  selectedTag.value = {
    id: row.id,
    name: row.name,
    description: row.description,
    order: row.order,
    status: row.status,
  };
};

// 删除标签
const handleDelete = async (row: Tag) => {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除该标签, 是否继续?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    const res = await tagStore.deleteTag(row.id, true);
    if (res.success) {
      ElMessage({
        message: res.message || '删除成功',
        type: 'success'
      });
      // 执行删除逻辑
      const index = tagList.value.findIndex(tag => tag.id === row.id);
      if (index !== -1) {
        tagList.value.splice(index, 1);
      }
    } else {
      throw new Error(res.message);
    }
  } catch(error: any) {
    ElMessage.error(error.message || error || '删除失败');
  }
};

// 切换状态
const handleToggleStatus = async (row: Tag) => {
  const action = row.status==='active' ? '禁用' : '启用';
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}标签 "${row.name}" 吗?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        customClass: 'custom-tag-confirm-box', 
        type: row.status==='inactive' ? 'warning' : 'info'
      }
    )
    const res = await tagStore.toggleTagStatus(row.id);
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
    ElMessage.warning('请先选择要删除的标签');
    return;
  }
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个标签吗?`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    // 执行批量删除
    const selectedIds = selectedRows.value.map(row => row.id);
    const res = await tagStore.bulkDeleteTag(selectedIds, true);
    if (res.success) {
      tagList.value = tagList.value.filter(tag => !selectedIds.includes(tag.id));
      selectedRows.value = [];
      ElMessage.success(`成功删除 ${selectedIds.length} 个标签`);
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
      tooltip: '编辑标签',
      type: 'primary' as const,
      handler: (row: unknown) => handleEdit(row as Tag)
    },
    {
      name: 'delete',
      icon: 'trush', // 注意这里拼写错误，应该是 trash？
      tooltip: '删除标签',
      type: 'danger' as const,
      confirm: true,
      confirmText: '确定要删除该标签吗？',
      handler: (row: unknown) => handleDelete(row as Tag)
    },
    {
      name: 'toggleStatus',
      icon: 'play',
      tooltip: '切换状态',
      type: 'success' as const,
      confirm: false,
      confirmText: '确定要切换标签状态吗？',
      handler: (row: unknown) => handleToggleStatus(row as Tag)
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
          label: '标签ID',
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
    await tagStore.fetchTagList();
  } catch (error) {
    
  }
})


/** ---------- 监听 ---------- */
watch(
  () => [pagination.value.page, pagination.value.pageSize],
  async ([page, pageSize], [oldPage, oldPageSize]) => {
    // 只有真正改变才触发请求
    if (page === oldPage && pageSize === oldPageSize) return
    
    await tagStore.fetchTagList({ page, pageSize }, true)
  }
)
watch(
  () => [currentParams.value.sort, currentParams.value.orderBy],
  async ([sort, orderBy], [oldSort, oldOrderBy]) => {
    console.log(sort, orderBy);
    if (sort === oldSort && orderBy === oldOrderBy) return
    await tagStore.fetchTagList(currentParams.value, true)
  }
)
</script>

<template>
  <div class="tag-list">
    <ListCard
      :loading="isLoading"
      title="标签列表"
      icon="list"
      :data="tagList"
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
.tag-list {
  width: 100%;
}
</style>