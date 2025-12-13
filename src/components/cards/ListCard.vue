<script lang="ts" setup>
import { ElMessage, ElMessageBox } from 'element-plus';
import CardHeader from '@/components/bases/CardHeader.vue'
import VIcon from '../global/VIcon.vue';
import { onMounted, ref, unref, watch, type Ref } from 'vue';
import { useDomUtil } from '@/utils/dom.util';
import { useEventListener, useVModel } from '@vueuse/core';
import type { ListCardProps, ListItem, Pagination } from '@/types/components/base.type';
import DateUtil from '@/utils/date.util';


const props = withDefaults(defineProps<ListCardProps>(), {
  icon: 'list',
  showSelection: true,
  showPagination: true,
  currentPage: 1,
  pageSize: 10,
  total: 0,
  pageTotals: 0,
  showActionColumn: true,
  actionColumnConfig: () => ({
    label: '操作',
    width: 200,
    actions: []
  }),
  headerActions: () => []
})
const emit = defineEmits<{
  (e: 'update:selectedRows', val: ListItem[]): void;
  (e: 'update:currentPage', page: number): void;
  (e: 'update:size', size: number): void;
  (e: 'update:pagination', pagination: Pagination): void;
  (e: 'update:data', data: ListItem[]): void;
  (e: 'refresh'): void;
}>();

/** ---------- 响应式数据 ---------- */
const listData = useVModel(props, 'data', emit);
// 页面数据
const currentPage = useVModel(props, 'currentPage', emit) as Ref<number>;
const pageSize = useVModel(props, 'pageSize', emit) as Ref<number>;
// 其他数据
const headerBtnSize = ref<'default' | 'small'>('default');
const originalData = ref<ListItem[]>([...props.data]);
const filteredData = ref<ListItem[]>([...props.data]);
// 批量选择数据
const isAllSelected = ref<boolean>(false);
const isIndeterminate = ref<boolean>(false);
const selectedRows = useVModel(props, 'selectedRows', emit) as Ref<ListItem[]>;


/** ---------- 数据监听 ---------- */
// 监听原始数据变化
watch(() => props.data, (newDate) => {
  originalData.value = [...newDate];
  filteredData.value = [...newDate];
}, { deep: true })

/** ---------- 方法定义 ---------- */
// 更新选中行
const updateSelectedRows = () => {
  const allSelected = listData.value.filter(row => row.isSelected);
  selectedRows.value = allSelected;

  // 更新全选状态
  const totalItems = listData.value.length;
  const selectedCount = allSelected.length;
  isAllSelected.value = selectedCount === totalItems;
  isIndeterminate.value = selectedCount > 0 && selectedCount < totalItems;
}
// 处理全选
const handleHeaderCheckboxChange = (val: boolean) => {
  listData.value.forEach(row => {
    row.isSelected = val;
  });
  updateSelectedRows();
}
// 处理单个复选框变化
const handleCheckboxChange = () => {
  updateSelectedRows();
};
// 处理操作按钮点击
const handleActionClick = (action: any, row: ListItem) => {
  if (action.disabled && action.disabled(row)) return;
  // 需要确认的操作
  if (action.confirm) {
    ElMessageBox.confirm(
      action.confirmText || `确定要执行${action.name}操作吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: action.type || 'warning'
      }
    ).then(() => {
      action.handler(row);
    }).catch(() => {
      ElMessage.info('已取消操作');
    });
  } else {
    action.handler(row);
  }
}
// 处理头部按钮点击
const handleHeaderActionClick = (action: any) => {
  if (action.disabled) return;
  action.handler();
};
// 处理刷新逻辑
const handleRefresh = () => {
  // 触发刷新事件
  emit('refresh');
};
// 分页改变
const handlePageChange = (page: number) => {
  currentPage.value = page;
};
// 每条页数改变
const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
};
onMounted(() => {
  /** ---------- 监控屏幕大小 ---------- */
  // 响应式处理
  const domUtil = useDomUtil();
  // 初始检查
  const checkScreenSize = () => {
    if (domUtil?.respondDown('xs')) {
      headerBtnSize.value = 'small';
    } else {
      headerBtnSize.value = 'default';
    }
  };
  checkScreenSize();
  // 监听窗口大小变化
  if (domUtil) {
    useEventListener(window, 'resize', checkScreenSize);
  }
})
</script>

<template>
  <div class="list-card">
    <div class="list-card__container">
      <CardHeader :icon="icon" :title="title">
        <template #actions>
          <div class="list-card-header__options">
            <!-- 头部操作按钮 -->
            <div 
              class="list-card-header__options-btn" 
              v-for="action in headerActions" 
              :key="action.name"
            >
              <el-button 
                :type="action.type" 
                :size="action.size || headerBtnSize"
                @click="handleHeaderActionClick(action)"
                :disabled="unref(action.disabled)"
              >
                <span class="list-card-header__options-icon" v-if="action.icon">
                  <VIcon :name="action.icon"/>
                </span>
                {{ action.name }}
              </el-button>
            </div>
            
            <!-- 默认刷新按钮 -->
            <div class="list-card-header__options-btn">
              <el-button 
                type="info" 
                :size="headerBtnSize" 
                @click="handleRefresh"
              >
                <span class="list-card-header__options-icon">
                  <VIcon name="refresh"/>
                </span>
                刷新
              </el-button>
            </div>
          </div>
        </template>
      </CardHeader>
      <div class="list-card__body">
        <Transition name="loading-fade">
          <el-table 
            :data="data" 
            border 
            style="width: 100%"
            v-if="!loading"
          >
            <!-- 选择列 -->
            <el-table-column
              width="40"
            >
              <template #header>
                <el-checkbox 
                  v-model="isAllSelected"
                  @change="handleHeaderCheckboxChange"
                  :indeterminate="isIndeterminate"
                />
              </template>
              <template #default="scope">
                <el-checkbox 
                  v-model="scope.row.isSelected"
                  @change="handleCheckboxChange()"
                />
              </template>
            </el-table-column>
            <!-- 表格列 -->
            <el-table-column 
              v-for="column in columns" 
              :key="column.prop"
              :label="column.label"
              :prop="column.prop"
              :min-width="column.width"
              align="center"
            >
              <template #default="scope">
                <!-- 自定义渲染函数 -->
                <template v-if="column.render">
                  {{ column.render(scope.row) }}
                </template>
                <!-- 名称列特殊处理 -->
                <template v-else-if="column.prop === 'name'">
                  <el-tag type="primary" effect="light">{{ scope.row[column.prop] }}</el-tag>
                </template>
                <!-- 状态列特殊处理 -->
                <template v-else-if="column.prop === 'status'">
                  <el-tag 
                    :type="scope.row.status==='active' ? 'success' : 'danger'"
                    effect="light"
                  >
                    {{ scope.row.status==='active' ? '正常' : '禁用' }}
                  </el-tag>
                </template>
                <!-- 封面列特殊处理 -->
                <template v-else-if="column.prop==='cover'">
                  <el-image
                    :src="scope.row.cover"
                    style="width: 100px; height: 100px"
                    lazy
                  />
                </template>
                <template v-else-if="['createdAt', 'updatedAt'].includes(column.prop)">
                  {{ DateUtil.format(scope.row[column.prop]) }}
                </template>
                <!-- 默认渲染 -->
                <template v-else>
                  {{ scope.row[column.prop] }}
                </template>
              </template>
            </el-table-column>
            <!-- 操作列 -->
            <el-table-column 
              v-if="showActionColumn && actionColumnConfig?.actions?.length"
              :label="actionColumnConfig.label" 
              :width="actionColumnConfig.width"
              align="center"
              fixed="right"
            >
              <template #default="scope">
                <div class="list-card__options">
                  <template v-for="action in actionColumnConfig.actions" :key="action.name">
                    <el-tooltip 
                      :content="action.tooltip" 
                      placement="bottom"
                    >
                      <el-button
                        @click.stop="handleActionClick(action, scope.row)"
                        :disabled="action.disabled ? action.disabled(scope.row) : false"
                        class="list-card__options-btn"
                      >
                        <template v-if="action.name==='toggleStatus'">
                          <el-icon 
                            class="tag-list__icon tag-list__icon--edit" 
                          >
                            <VIcon :name="scope.row.status==='active' ? 'play' : 'stop'"/>
                          </el-icon>
                        </template>
                        <template v-else>
                          <el-icon 
                            class="tag-list__icon tag-list__icon--edit" 
                          >
                            <VIcon :name="action.icon"/>
                          </el-icon>
                        </template>
                      </el-button>
                    </el-tooltip>
                  </template>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div 
            class="list-card__holder" 
            v-else
          >
            <VLoading/>
          </div>
        </Transition>
        <!-- 分页 -->
        <div class="list-card__pagination" v-if="showPagination">
          <el-pagination 
            background 
            layout="total, prev, pager, next, jumper, ->, sizes" 
            :total="total"
            :current-page="currentPage"
            :page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            @size-change="handlePageSizeChange"
            @current-change="handlePageChange"
          />
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
  min-height: 630px;
  @include mix.radius(md);
  .cell {
    position: relative;
    @include mix.z-index(base);
  }
  tr {
    background: var(--surface-base);
    &:hover>td.el-table__cell {
      background-color: var(--bg-base);
    }
  }
  .el-table__cell {
    @include anim.transition($p: bg, $dr: 'slow');
  }
}
.list-card {
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
    position: relative;
    min-height: 720px;
    @include mix.padding(lg);
    @include mix.flex-box($d: column, $j: flex-end);
  }
  &__holder {
    @include mix.position-style($p: absolute);
    width: 100%;
    min-height: 630px;
    background-color: var(--surface-base);
    @extend %flex-column-center;
  }
  &__options {
    height: 40px;
    @extend %flex-center;
    @include mix.gap(xxs);
    &-btn {
      @include mix.margin(0);
      @include mix.size(30px);
      @include mix.padding(xxs);
      @include anim.transition($p: with height transform);
      @include hov.move-y;
      @include mix.respond-down(xs) {
        @include mix.size(25px);
      }
      &:hover {
        background-color: var(--primary-transparent);
        border-color: var(--primary-weak);
      }
    }
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