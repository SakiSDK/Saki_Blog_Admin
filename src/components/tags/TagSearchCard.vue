<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import CardHeader from '../bases/CardHeader.vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';

// 表单 Ref
const formRef = ref<FormInstance>()

// 定义搜索表单类型
interface TagSearchForm {
  keyword: string; // 关键词（名称/描述）
  category: string; // 分类
  status: string; // 状态（启用/禁用）
  dateRange: [string, string] | []; // 创建时间范围
}

// 搜索表单默认值
const searchForm = reactive<TagSearchForm>({
  keyword: '',
  category: '',
  status: '',
  dateRange: []
});

// 表单验证规则
const searchRules = reactive<FormRules>({
  // 可根据需求添加验证，比如关键词长度限制
  keyword: [
    { max: 50, message: '关键词长度不能超过50个字符', trigger: 'blur' }
  ]
});

// 分类选项（可从接口获取，这里模拟）
const categoryOptions = ref([
  { label: '全部分类', value: '' },
  { label: '技术', value: '技术' },
  { label: '设计', value: '设计' },
  { label: '营销', value: '营销' },
  { label: '业务', value: '业务' },
  { label: '生活', value: '生活' },
  { label: '其他', value: '其他' }
]);

// 状态选项
const statusOptions = ref([
  { label: '全部状态', value: '' },
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'inactive' }
]);

/**
 * 提交搜索
 */
const handleSearch = () => {
  if (!formRef.value) return;
  
  // 表单验证
  formRef.value.validate((valid) => {
    if (valid) {
      // 格式化搜索参数（可根据后端需求调整）
      const searchParams = {
        keyword: searchForm.keyword.trim(),
        category: searchForm.category,
        status: searchForm.status,
        startTime: searchForm.dateRange[0] || '',
        endTime: searchForm.dateRange[1] || ''
      };
      
      // 触发搜索逻辑（示例：可通过 emit 传递给父组件）
      console.log('搜索参数：', searchParams);
      ElMessage.success('搜索条件已提交');
      
      // 实际项目中可调用接口/触发父组件的搜索事件
      // emit('search', searchParams);
    } else {
      ElMessage.error('表单验证失败，请检查输入内容');
    }
  });
};

/**
 * 重置表单
 */
const handleReset = () => {
  if (!formRef.value) return;
  
  // 重置表单字段
  formRef.value.resetFields();
  
  // 清空时间范围（日期选择器需要单独重置）
  searchForm.dateRange = [];
  
  ElMessage.info('搜索条件已重置');
  
  // 触发重置后的搜索（可选）
  // handleSearch();
};

// 初始化：可加载分类等下拉选项数据
onMounted(() => {

});
</script>

<template>
  <div class="tag-search">
    <div class="tag-search__container">
      <!-- 头部标题 -->
      <CardHeader icon="search" title="标签搜索"/>
      <!-- 表单主体 -->
      <div class="tag-search__body">
        <el-form 
          ref="formRef"
          :model="searchForm"
          :rules="searchRules"
          label-width="80px"
          label-position="top"
          class="tag-search__form"
        >
          <!-- 关键词搜索 -->
          <el-form-item label="关键词" prop="keyword" class="tag-search__form-item">
            <el-input
              v-model="searchForm.keyword"
              placeholder="请输入标签名称/描述"
              clearable
              prefix-icon="Search"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          
          <!-- 分类筛选 -->
          <el-form-item label="分类" class="tag-search__form-item">
            <el-select
              v-model="searchForm.category"
              placeholder="请选择分类"
              clearable
            >
              <el-option
                v-for="item in categoryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          
          <!-- 状态筛选 -->
          <el-form-item label="状态" class="tag-search__form-item">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
            >
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          
          <!-- 创建时间范围 -->
          <el-form-item label="创建时间" class="tag-search__form-item">
            <div class="tag-search__date">
              <el-date-picker
                type="datetime"
                placeholder="开始日期"
                clearable
              />
              <el-date-picker
                type="datetime"
                placeholder="开始日期"
                clearable
              />
            </div>
          </el-form-item>
          
          <!-- 操作按钮 -->
          <el-form-item class="tag-search__actions tag-search__form-item">
            <el-button
              type="primary"
              @click="handleSearch"
              class="tag-search__btn tag-search__btn-submit" 
            >
              搜索
            </el-button>
            <el-button
              @click="handleReset"
              class="tag-search__btn tag-search__btn-reset" 
            >
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-date-editor.el-input) {
  width: 100%;
}
.tag-search {
  width: 100%;
  &__container {
    @include mix.container-style($p: 0, $b: var(--border-base), $r: md);
  }
  &__body {
    @include mix.padding(lg);
  }
  // 表单样式优化
  &__form {
    width: 100%;
    @include mix.grid-box($c: 2, $rg: sm, $cg: lg);
    @include mix.respond-down(md) {
      @include mix.flex-box($d: column);
    }
    &-item {
      width: 100%;
    }
    // 操作按钮区域
    &__actions {
      padding-left: 8px; // 对齐标签宽度
    }
  }
  &__date {
    width: 100%;
    @include mix.flex-box($j: flex-start, $g: md);
    &-picker {
      flex: 1;
    }
  }
  &__btn{
    @include anim.transition($p: transform bg border-color);
    @include hov.move-y;
    &-submit {
      background-color: var(--primary-base);
      border-color: var(--primary-base);
      @include hov.bg(var(--primary-strong));
      @include hov.border(var(--primary-strong));
    }
    &-reset {
      border-color: var(--border-base-color);
      @include hov.border(var(--primary-base));
      @include hov.color(var(--primary-base));
      @include hov.bg(var(--primary-transparent));
    }
  }
}
</style>