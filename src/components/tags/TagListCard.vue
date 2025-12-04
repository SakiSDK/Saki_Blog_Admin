<script lang="ts" setup>
import CardHeader from '../bases/CardHeader.vue';

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

const tableColumnFields: tableColumnField[] = [
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
</script>

<template>
  <div class="tag-list">
    <div class="tag-list__container">
      <CardHeader icon="list" title="标签列表"/>
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
          >
          </el-table-column>

        </el-table>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-table) {
  @include mix.radius(md);
  tr {
    background: var(--surface-base);
    &:hover>td.el-table__cell {
      background-color: var(--bg-base);
      &:first-child {
        border-left: var(--el-table-border);
        @include mix.radius-d(bl, md);
        @include mix.radius-d(tl, md);
        &::before {
          background-color: var(--surface-base);
        }
      }
      &:last-child {
        border-right: var(--el-table-border);
        @include mix.radius-d(br, md);
        @include mix.radius-d(tr, md);
        &::after {
          background-color: var(--surface-base);
        }
      }
    }
  }
  .el-table__cell {
    @include anim.transition($p: bg border-color border-radius, $dr: 'slow');
    &:first-child {
      border-left: 1px solid transparent;
      &::before {
        content: '';
        width: 100%;
        height: 1px;
        @include mix.position-style($p: absolute, $t: -1px, $l: 0);
      }
    }
    &:last-child {
      border-right: 1px solid transparent;
      &::after {
        content: '';
        width: 100%;
        height: 1px;
        @include mix.position-style($p: absolute, $t: -1px, $r: 0);
      }
    }
  }
}
.tag-list {
  width: 100%;
  &__container {
    @include mix.container-style($p: 0, $r: md, $b: 1px solid var(--el-border-color), $o: hidden);
  }
  &__body {
    @include mix.padding(lg);
  }
}
</style>