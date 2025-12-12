<script lang="ts" setup>
import { ElMessage, ElMessageBox } from 'element-plus';
import ListCard from '@/components/cards/ListCard.vue';
import type { TableColumnField } from '@/types/components/base.type';
import { computed, onMounted, ref, watch } from 'vue';
import { useTagStore } from '@/stores/tag.store';
import { storeToRefs } from 'pinia';
import { useStateStore } from '@/stores/state.store';
import type { Tag } from '@/schemas/tag.schema';


/** ---------- 状态管理 ---------- */
const tagStore = useTagStore();
const { pagination, tagList, isLoading } = storeToRefs(tagStore);
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
    
    // 执行删除逻辑
    const index = tagList.value.findIndex(tag => tag.id === row.id);
    if (index !== -1) {
      tagList.value.splice(index, 1);
      ElMessage.success('标签删除成功');
    }
  } catch {
    ElMessage.info('已取消删除操作');
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
    )    // 点击了确定才会执行这里
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
  } catch(err: any) {
    ElMessage.error(`操作失败：${err.message || err}`);
  }
};

// 批量删除
const handleBulkDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的标签');
    return;
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 个标签吗?`,
    '批量删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 执行批量删除
    const selectedIds = selectedRows.value.map(row => row.id);
    tagList.value = tagList.value.filter(tag => !selectedIds.includes(tag.id));
    selectedRows.value = [];
    ElMessage.success(`成功删除 ${selectedIds.length} 个标签`);
  }).catch(() => {
    ElMessage.info('已取消批量删除操作');
  });
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

// 头部操作按钮
const headerActions = [
  {
    name: '批量删除',
    icon: 'trush',
    type: 'danger' as const,
    handler: handleBulkDelete,
    disabled:  computed(() => selectedRows.value.length === 0).value
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
</script>

<template>
  <div class="tag-list">
    <ListCard
      :loading="isLoading"
      title="标签列表"
      icon="list"
      :data="tagList"
      :selected-rows="selectedRows"
      :columns="tableColumns"
      :show-selection="true"
      :show-pagination="true"
      v-model:pageSize="pagination.pageSize"
      v-model:currentPage="pagination.page"
      :page-totals="pagination.totalPages"
      :total="pagination.total"
      :show-action-column="true"
      :action-column-config="actionColumnConfig"
      :header-actions="headerActions"
      @selection-change="handleSelectionChange"
    />
  </div>
</template>

<style lang="scss" scoped>
.tag-list {
  width: 100%;
}
</style>