<script lang="ts" setup>
import { ElMessage } from 'element-plus';
import CardHeader from '../bases/CardHeader.vue';
import VIcon from '../global/VIcon.vue';
import { onMounted, ref } from 'vue';
import { useDomUtil } from '@/utils/dom.util';
import { useEventListener } from '@vueuse/core';

// 定义标签类型接口
interface TagItem {
  id: number;
  name: string;
  description: string;
  order: number;
  postCount: number;
  createdAt: string;
  status: boolean;
}

const tags: TagItem[] = [
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
  { id: 6, name: "Python", description: "多功能的后端编程语言",order: 1, postCount: 98, createdAt: "2023-03-20", status: true },
  { id: 7, name: "用户体验", description: "优化用户与产品的交互体验",order: 1, postCount: 77, createdAt: "2023-04-01", status: true },
  { id: 8, name: "数据分析", description: "数据统计、分析与可视化",order: 1, postCount: 45, createdAt: "2023-04-10", status: true },
  { id: 9, name: "品牌策划", description: "品牌定位与推广方案",order: 1, postCount: 34, createdAt: "2023-04-15", status: true },
  { id: 10, name: "财务管理", description: "财务预算、核算与分析",order: 1, postCount: 29, createdAt: "2023-05-02", status: true },
  { id: 11, name: "Vue.js", description: "渐进式JavaScript框架",order: 1, postCount: 76, createdAt: "2023-05-10", status: true },
  { id: 12, name: "插画设计", description: "平面插画与视觉设计", order: 1,postCount: 42, createdAt: "2023-05-18", status: true },
  { id: 13, name: "内容营销", description: "通过内容吸引潜在客户",order: 1, postCount: 38, createdAt: "2023-06-05", status: true },
  { id: 14, name: "Node.js", description: "服务器端JavaScript运行环境",order: 1, postCount: 91, createdAt: "2023-06-12", status: true },
  { id: 15, name: "产品设计", description: "产品功能与用户体验设计",order: 1, postCount: 53, createdAt: "2023-06-20", status: true },
  { id: 16, name: "人力资源", description: "招聘、培训与员工管理",order: 1, postCount: 27, createdAt: "2023-07-01", status: true },
  { id: 17, name: "社交媒体", description: "社交媒体平台运营",order: 1, postCount: 48, createdAt: "2023-07-10", status: true },
  { id: 18, name: "TypeScript", description: "JavaScript的超集，添加类型系统",order: 1, postCount: 63, createdAt: "2023-07-18", status: true },
  { id: 19, name: "平面设计", description: "视觉传达与版面设计",order: 1, postCount: 39, createdAt: "2023-08-05", status: true },
  { id: 20, name: "战略规划", description: "企业长期发展战略",order: 1, postCount: 22, createdAt: "2023-08-12", status: true },
];


// 新增 tableColumnField 接口定义
interface tableColumnField {
  label: string;
  prop: string;
  component?: string;
  componentProps?: Record<string, any>;
}

const headerBtnSize = ref<'default' | 'small'>('default');
const tableColumnFields: tableColumnField[] = [
  {
    label: '标签ID',
    prop: 'id',
    component: 'el-input-number',
    componentProps: {
      placeholder: '请输入标签ID',
    },
  },
  {
    label: '标签名称',
    prop: 'name',
    component: 'el-input',
    componentProps: {
      placeholder: '请输入标签名称',
    },
  },
  {
    label: '标签描述',
    prop: 'description',
    component: 'el-input',
    componentProps: {
      placeholder: '请输入标签描述',
    },
  },
  {
    label: '优先级',
    prop: 'order',
    component: 'el-input-number',
    componentProps: {
      placeholder: '请输入排序',
    },
  },
  {
    label: '文章数量',
    prop: 'postCount',
    component: 'el-input-number',
    componentProps: {
      placeholder: '请输入文章数量',
    },
  },
  {
    label: '创建时间',
    prop: 'createdAt',
    component: 'el-date-picker',
    componentProps: {
      type: 'datetime',
      placeholder: '请选择创建时间',
    },
  },
  {
    label: '状态',
    prop: 'status',
    component: 'el-select',
    componentProps: {
      placeholder: '请选择状态',
      options: [
        {
          label: '正常',
          value: 1,
        },
        {
          label: '禁用',
          value: 0,
        },
      ],
    },
  }
]

const handleEdit = (row: TagItem) => {
  console.log(row);
};
// 删除标签
const handleDelete = (id: number) => {
  // 执行删除逻辑（如接口请求/数据过滤）
  ElMessage.success('标签删除成功');
};

// 取消删除
const handleCancelDelete = () => {
  ElMessage.info('已取消删除操作');
};
// 切换标签启用/禁用状态
const handleToggleStatus = (row: TagItem) => {
  row.status = !row.status;
  ElMessage.success(`标签已${row.status ? '启用' : '禁用'}`);
};
const handleBulkDelete = () => {
  ElMessage.success('批量删除成功');
};
const handleRefresh = () => {
  ElMessage.success('刷新成功');
};
onMounted(() => {
  const domUtil = useDomUtil();
  useEventListener(window, 'resize', () => {
    domUtil.respondDown('xs',()=> {
      headerBtnSize.value='small'
    })
    domUtil.respondUp('xs',() => {
      headerBtnSize.value='default'
    })
  })
})
</script>

<template>
  <div class="tag-list">
    <div class="tag-list__container">
      <CardHeader icon="list" title="标签列表">
        <template #actions>
          <div class="tag-list-header__options">
            <div class="tag-list-header__options-btn">
              <el-button type="danger" :size="headerBtnSize" @click="handleBulkDelete">
                <span class="tag-list-header__options-icon">
                  <VIcon name="trush"/>
                </span>
                批量删除
              </el-button>
            </div>
            <div class="tag-list-header__options-btn">
              <el-button type="info" :size="headerBtnSize" @click="handleRefresh">
                <span class="tag-list-header__options-icon">
                  <VIcon name="refresh"/>
                </span>
                刷新
              </el-button>
            </div>
          </div>
        </template>
      </CardHeader>
      <div class="tag-list__body">
        <el-table
          :data="tags"
          style="width: 100%"
          
        >
          <el-table-column 
            v-for="field in tableColumnFields" 
            :key="field.prop"
            :label="field.label"
            :prop="field.prop"
            align="center"
          >
            <template #default="scope" v-if="field.prop==='name'">
              <el-tag type="">{{ scope.row[field.prop] }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column 
            label="操作" 
            align="center"
          >
            <template #default="scope">
              <div class="tag-list__options">
                <!-- 编辑按钮 -->
                <el-tooltip 
                  content="编辑标签" 
                  placement="bottom"
                >
                  <el-icon 
                    class="tag-list__icon tag-list__icon--edit" 
                    @click.stop="handleEdit(scope.row)"
                  >
                    <VIcon name="edit"/>
                  </el-icon>
                </el-tooltip>
                <!-- 删除按钮（带确认弹窗） -->
                <el-popconfirm
                  title="确定删除该标签吗？"
                  confirm-button-text="确认"
                  cancel-button-text="取消"
                  trigger="hover"
                  @confirm="handleDelete(scope.row.id)"
                  @cancel="handleCancelDelete"
                >
                  <template #reference>
                    <el-icon 
                      class="tag-list__icon tag-list__icon--delete" 
                    >
                      <VIcon name="trush"/>
                    </el-icon>
                  </template>
                </el-popconfirm>
                <!-- 启用/禁用按钮（根据状态切换图标和提示） -->
                <el-tooltip 
                  :content="scope.row.active ? '禁用标签' : '启用标签'" 
                  placement="bottom"
                >
                  <el-icon 
                    class="tag-list__icon" 
                    :class="{
                      'tag-list__icon--enable': scope.row.active,
                      'tag-list__icon--disable': !scope.row.active
                    }"
                    @click.stop="handleToggleStatus(scope.row)"
                  >
                    <VIcon :name="scope.row.active ? 'pause' : 'play'"/>
                  </el-icon>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div class="tag-list__pagination">
          <el-pagination background layout="prev, pager, next, jumper" :total="1000" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-pager li) {
  @include anim.transition($p: bg transform color);
  @include hov.bg(var(--primary-weak));
  @include hov.move-y;
  @include hov.color(var(--primary-base));
}
:deep(.el-pagination.is-background .el-pager li.is-active) {
  background-color: var(--primary-base);
}
:deep(.el-tag){
  @include anim.transition($p: color bg border-color);
}
:deep(.el-tag.el-tag--primary) {
  --el-tag-text-color: var(--primary-base);
  --el-tag-bg-color: var(--primary-transparent);
  --el-tag-border-color: var(--primary-weak);
}
:deep(.el-table) {
  @include mix.radius(md);
  .cell {
    position: relative;
    @include mix.z-index(base);
  }
  tr {
    background: var(--surface-base);
    &:hover>td.el-table__cell {
      background-color: var(--bg-base);
      &:first-child,
      &:last-child {
        border-color: transparent;
        &::before {
          border-color: var(--el-table-border-color);
        }
        &::after {
          background-color: var(--surface-base);
        }
      }
      &:first-child,
      &:first-child::before {
        @include mix.radius-d(bl, md);
        @include mix.radius-d(tl, md);
      }
      &:last-child,
      &:last-child::before {
        @include mix.radius-d(br, md);
        @include mix.radius-d(tr, md);
      }
    }
  }
  .el-table__cell {
    @include anim.transition($p: bg border-color border-radius, $dr: 'slow');
    &:first-child,
    &:last-child {
      position: relative;
      &::before {
        content: '';
        @extend %full-size;
        @include mix.position-style($p: absolute, $t: -1px, $l: 0, $z: 1);
        box-sizing: content-box;
        border: 1px solid transparent;
        border-right: none;
        border-left: none;
      }
      &::after {
        content: '';
        @include mix.size(100%, 1px);
        @include mix.position-style($p: absolute, $t: -1px, $r: 0);
      }
    }
  }
}
.tag-list {
  width: 100%;
  &-header__options {
    @extend %flex-center;
    @include mix.gap(sm);
    &-btn {
      @include anim.transition($p: transform);
      @include hov.move-y;
    }
    &-icon {
      @include mix.margin-d(r, xs);
    }
  }
  &__container {
    @include mix.container-style($p: 0, $r: md, $b: 1px solid var(--el-border-color), $o: hidden);
  }
  &__body {
    @include mix.padding(lg);
  }
  &__options {
    height: 100%;
    @extend %flex-center;
    @include mix.gap(xxs);
  }
  &__icon {
    flex-shrink: 0;
    @include mix.size(25px);
    @include mix.container-style($p: 0, $bg: var(--interactive-base), $r: sm, $b: var(--el-table-border));
    @include anim.transition($p: bg transform);
    @include hov.move-y;
  }
  &__pagination {
    @extend %flex-center;
    @include mix.margin-d(t, lg);
  }
}
</style>