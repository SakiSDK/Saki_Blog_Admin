<script lang="ts" setup>
import ListCard from '@/components/cards/ListCard.vue';
import SearchCard from '../cards/SearchCard.vue';
import { ref } from 'vue';
import type { FormFieldConfig } from '@/types/components/base.type';
import { ElDatePicker, ElInput, ElMessage, ElMessageBox, ElSelect } from 'element-plus';
import { albumSearchFormSchema } from '@/schemas/album.schema';
import type { AlbumSearchFormType } from '@/types/schemas/album.type';


interface AlbumItem {
  id: number;
  name: string;
  cover: string;
  description: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}
const albums = ref<AlbumItem[]>([
  {
    id: 1,
    name: '相册1',
    cover: 'https://picsum.photos/200/300',
    description: '这是相册1的描述',
    status: true,
    createdAt: '2023-01-01 00:00:00',
    updatedAt: '2023-01-01 00:00:00'
  },
  {
    id: 2,
    name: '相册2',
    cover: 'https://picsum.photos/200/300',
    description: '这是相册2的描述',
    status: true,
    createdAt: '2023-01-01 00:00:00',
    updatedAt: '2023-01-01 00:00:00'
  },
  {
    id: 3,
    name: '相册3',
    cover: 'https://picsum.photos/200/300',
    description: '这是相册2的描述',
    status: true,
    createdAt: '2023-01-01 00:00:00',
    updatedAt: '2023-01-01 00:00:00'
  },
  {
    id: 4,
    name: '相册4',
    cover: 'https://picsum.photos/200/300',
    description: '这是相册2的描述',
    status: true,
    createdAt: '2023-01-01 00:00:00',
    updatedAt: '2023-01-01 00:00:00'
  }
])
const albumTableColumns = ref<{
  label: string;
  prop: string;
  width?: number;
}[]>([
  {
    label: 'ID',
    prop: 'id',
    width: 60
  },
  {
    label: '名称',
    prop: 'name',
    width: 100
  },
  {
    label: '封面',
    prop: 'cover',
    width: 100
  },
  {
    label: '描述',
    prop: 'description',
    width: 100
  },
  {
    label: '状态',
    prop: 'status',
    width: 80,
  },
  {
    label: '创建时间',
    prop: 'createdAt',
    width: 100
  },
  {
    label: '更新时间',
    prop: 'updatedAt',
    width: 100
  }
])
const selectedRows = ref<AlbumItem[]>([]);


const initialForm = {
  keyword: '',
  status: '',
  timeRange: [],
}
// 定义表单字段配置
const albumFormFields: FormFieldConfig[] = [
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
// 编辑标签
const handleEdit = (row: AlbumItem) => {
  ElMessage.info(`准备编辑标签: ${row.name}`);
  // 打开编辑弹窗逻辑
};
const handleDelete = async (row: AlbumItem) => {
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
    const index = albums.value.findIndex(album => album.id === row.id);
    if (index !== -1) {
      albums.value.splice(index, 1);
      ElMessage.success('标签删除成功');
    }
  } catch {
    ElMessage.info('已取消删除操作');
  }
};

// 切换状态
const handleToggleStatus = async (row: AlbumItem) => {
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
// 操作列配置
const actionColumnConfig = {
  label: '操作',
  width: 200,
  actions: [
    {
      name: 'plus',
      icon: 'plus',
      tooltip: '添加图片',
      handler: (row: unknown) => {
        ElMessage.info('打开添加图片弹窗');
      }
    },
    {
      name: 'edit',
      icon: 'edit',
      tooltip: '编辑相册',
      handler: (row: unknown) => handleEdit(row as AlbumItem)
    },
    {
      name: 'delete',
      icon: 'trush', // 注意这里拼写错误，应该是 trash？
      tooltip: '删除相册',
      confirm: true,
      confirmText: '确定要删除该相册吗？',
      handler: (row: unknown) => handleDelete(row as AlbumItem)
    },
    {
      name: 'toggleStatus',
      icon: 'play',
      tooltip: '切换状态',
      confirm: true,
      confirmText: '确定要切换相册状态吗？',
      handler: (row: unknown) => handleToggleStatus(row as AlbumItem)
    }
  ]
};
// 定义提交回调
const handleAlbumSearchSubmit = async (formData: AlbumSearchFormType) => {
  try {
    // 模拟接口提交
    console.log('提交相册数据：', formData);
    ElMessage.success('相册创建成功！');
    // 实际项目中替换为接口请求：await tagApi.create(formData)
  } catch (error) {
    ElMessage.error('相册创建失败！');
    console.error('提交失败：', error);
  }
};

const pageSize = ref<number>(10);
const currentPage = ref<number>(1);
</script>

<template>
  <div class="album-list">
    <SearchCard
      title="搜索相册"
      icon="search"
      submit-text="搜索"
      reset-text="重置"
      label-width="80px"
      label-position="top"
      :initial-form="initialForm"
      :form-schema="albumSearchFormSchema"
      :form-fields="albumFormFields"
      @submit="handleAlbumSearchSubmit"
    />
    <ListCard
      title="相册列表"
      icon="album"
      :data="albums"
      :columns="albumTableColumns"
      :selected-rows="selectedRows"
      :show-selection="true"
      :show-pagination="true"
      :page-size="pageSize"
      :current-page="currentPage"
      :show-action-column="true"
      :action-column-config="actionColumnConfig"
    />
  </div>
</template>

<style lang="scss" scoped>
.album-list {
  width: 100%;
  @include mix.flex-box($d: column, $g: sm);
}
</style>