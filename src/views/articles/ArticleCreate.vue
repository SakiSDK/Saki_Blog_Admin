<script lang="ts" setup>
import CardHeader from '@/components/bases/CardHeader.vue';
import type { FormFieldConfig } from '@/types/components/base.type';
import { ElInput, ElInputNumber, ElSelect } from 'element-plus';
import { reactive } from 'vue';

/** ---------- 类型定义 ---------- */
interface ArticleForm {
  title: string;
  author: string;
  order: number;
}



const form = reactive<ArticleForm>({
  title: '',
  author: 'SakiSDK',
  order: 0,
})
const formConfig = {
  labelWidth: '80px',
  labelPosition: 'top',
}
const baseFields: FormFieldConfig[] = [
  {
    label: '标题',
    labelWidth: '80px',
    prop: 'title',
    icon: 'title',
    component: ElInput,
    componentProps: {
      placeholder: '请输入标题',
    },
  },
  {
    label: '作者',
    labelWidth: '80px',
    prop: 'author',
    icon: 'user',
    component: ElInput,
    componentProps: {
      placeholder: '请输入作者'
    }
  },
  {
    label: '分类',
    labelWidth: '80px',
    prop: 'category',
    icon: 'category',
    component: ElSelect,
    componentProps: {
      placeholder: '请选择分类'
    }
  },
  {
    label: '文章权重',
    labelWidth: '80px',
    prop: 'order',
    icon: 'sort',
    component: ElInputNumber,
    componentProps: {
      placeholder: '请输入文章权重',
      min: 0,
      step: 1,
    }
  }
]
const articleTagField: FormFieldConfig = {
  label: '标签',
  labelWidth: '80px',
  prop: 'tags',
  icon: 'tag',
  component: ElSelect,
}
</script>

<template>
  <div class="article-create">
    <div class="article-create__container">
      <CardHeader title="新增文章" icon="article"/>
      <div class="article-create__body">
        <el-form 
          ref="formRef"
          :model="form"
          :label-width="formConfig.labelWidth"
          :label-position="formConfig.labelPosition"
          class="article-create__form"
        >
          <div class="article-create__form">
            <h3 class="article-create-subtitle">
              基础信息
            </h3>
            <div class="article-create__wrapper">
              <template v-for="field in baseFields" :key="field.prop">
                <el-form-item :label="field.label" :prop="field.prop">
                  <template #label>
                    <div class="article-create__label">
                      <el-icon class="article-create__label-icon">
                        <VIcon :name="field.icon"/>
                      </el-icon>
                      <span class="article-create__label-text">{{ field.label }}</span>
                    </div>
                  </template>
                  <component 
                    :is="field.component" 
                    v-model="form[field.prop as keyof ArticleForm]" 
                    v-bind="field.componentProps"
                  />
                </el-form-item>
              </template>
            </div>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-form-item) {
  @include mix.margin-d(b, 0);
}
:deep(.el-input-number) {
  width: 100%;
}
.article-create { 
  @include mix.padding(sm);
  &__container {
    @include mix.container-style($p: 0, $b: var(--border-base));
  }
  &__body {
    @include mix.padding(lg);
  }
  &-subtitle {
    @include mix.font-style($f: title, $s: lg);
    @include mix.margin-d(b, sm)
  }
  &__wrapper {
    @include mix.grid-box($c: 2, $g: lg);
    @include mix.respond-down(sm) {
      @include mix.grid-box($c: 1, $g: sm);
    }
  }
  &__label {
    @extend %flex-center;
    @include mix.gap(xs);
  }
}
</style>