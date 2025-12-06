<script lang="ts" setup>
import { ElMessage, ElMessageBox, type ListItem } from 'element-plus';
import ListCard from '@/components/cards/ListCard.vue';
import { computed, ref } from 'vue';

// 定义标签类型接口
interface TagItem {
  id: number;
  name: string;
  description: string;
  order: number;
  postCount: number;
  createdAt: string;
  status: boolean;
  isSelected?: boolean;
}

// 模拟数据
const tags = ref<TagItem[]>([
  {
    id: 1,
    name: "JavaScript",
    order: 1,
    description: "前端开发语言，用于网页交互",
    postCount: 145,
    createdAt: "2023-01-15",
    status: true,
  },
  { id: 2, name: "UI设计", description: "用户界面设计与优化", order: 1, postCount: 89, createdAt: "2023-02-10", status: true },
  { id: 3, name: "项目管理", description: "项目进度管理与团队协作", order: 1, postCount: 67, createdAt: "2023-02-28", status: true },
  { id: 4, name: "React", description: "流行的前端JavaScript框架",order: 1, postCount: 132, createdAt: "2023-03-05", status: true },
  { id: 5, name: "市场营销", description: "产品推广与市场策略",order: 1, postCount: 56, createdAt: "2023-03-12", status: true },
  // 更多数据...
]);

// 表格列配置
const tableColumns = ref([
  {
    label: '标签ID',
    prop: 'id',
    width: 100,
  },
  {
    label: '标签名称',
    prop: 'name',
    width: 180,
  },
  {
    label: '标签描述',
    prop: 'description',
    width: 250,
  },
  {
    label: '优先级',
    prop: 'order',
    width: 100,
  },
  {
    label: '文章数量',
    prop: 'postCount',
    width: 120,
  },
  {
    label: '创建时间',
    prop: 'createdAt',
    width: 180,
  },
  {
    label: '状态',
    prop: 'status',
    width: 120,
  }
]);

// 选中的行
const selectedRows = ref<TagItem[]>([]);

// 处理选择变化
const handleSelectionChange = (val: TagItem[]) => {
  selectedRows.value = val;
};

// 编辑标签
const handleEdit = (row: TagItem) => {
  ElMessage.info(`准备编辑标签: ${row.name}`);
  // 打开编辑弹窗逻辑
};

// 删除标签
const handleDelete = async (row: TagItem) => {
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
    const index = tags.value.findIndex(tag => tag.id === row.id);
    if (index !== -1) {
      tags.value.splice(index, 1);
      ElMessage.success('标签删除成功');
    }
  } catch {
    ElMessage.info('已取消删除操作');
  }
};

// 切换状态
const handleToggleStatus = async (row: TagItem) => {
  const action = row.status ? '禁用' : '启用';
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}标签 "${row.name}" 吗?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: row.status ? 'warning' : 'info'
      }
    );
    
    row.status = !row.status;
    ElMessage.success(`标签已${row.status ? '启用' : '禁用'}`);
  } catch {
    ElMessage.info(`已取消${action}操作`);
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
    tags.value = tags.value.filter(tag => !selectedIds.includes(tag.id));
    selectedRows.value = [];
    ElMessage.success(`成功删除 ${selectedIds.length} 个标签`);
  }).catch(() => {
    ElMessage.info('已取消批量删除操作');
  });
};

// 操作列配置
const actionColumnConfig = {
  label: '操作',
  width: 200,
  actions: [
    {
      name: 'edit',
      icon: 'edit',
      tooltip: '编辑标签',
      type: 'primary' as const,
      handler: (row: unknown) => handleEdit(row as TagItem)
    },
    {
      name: 'delete',
      icon: 'trush', // 注意这里拼写错误，应该是 trash？
      tooltip: '删除标签',
      type: 'danger' as const,
      confirm: true,
      confirmText: '确定要删除该标签吗？',
      handler: (row: unknown) => handleDelete(row as TagItem)
    },
    {
      name: 'toggleStatus',
      icon: 'play',
      tooltip: '切换状态',
      type: 'success' as const,
      confirm: true,
      confirmText: '确定要切换标签状态吗？',
      handler: (row: unknown) => handleToggleStatus(row as TagItem)
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


const pageSize = ref<number>(10);
const currentPage = ref<number>(1);
</script>

<template>
  <div class="tag-list">
    <ListCard
      title="标签列表"
      icon="list"
      :data="tags"
      :selectedRows="selectedRows"
      :columns="tableColumns"
      :show-selection="true"
      :show-pagination="true"
      :pageSize="pageSize"
      :currentPage="currentPage"
      :pageTotals="Math.ceil(tags.length/pageSize)"
      :total="tags.length"
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