<script lang="ts" setup>
import { ElForm, ElFormItem, type FormInstance, type FormRules } from 'element-plus';
import CardHeader from '../bases/CardHeader.vue';
import { reactive, ref } from 'vue';
import type z from 'zod';
import type { FormFieldConfig, SearchCardProps } from '@/types/components/base.type';
import { zodValidator } from '@/utils/validate.util';



/** ---------- props ---------- */
const props = withDefaults(defineProps<SearchCardProps>(), {
  title: '通用表单',
  icon: 'form',
  submitText: '提交',
  resetText: '重置',
  labelWidth: '80px',
  labelPosition: 'top',
})

/** ---------- 表单逻辑 ---------- */
// 初始化表单数据（深拷贝避免修改原数据）
const form = reactive({ ...props.initialForm });
// 表单引用
const formRef = ref<FormInstance>();
// 自动生成 Zod 校验规则（如果未传入自定义规则）
const generateRules = (): FormRules => {
  if (props.customRules) return props.customRules;

  const rules: FormRules = {};
  props.formFields.forEach(field => {
    if (field.hidden) return;
    // 从 Schema 中获取对应字段的校验规则
    const fieldSchema = props.formSchema.shape[field.prop  as string];
    if (fieldSchema) {
      rules[field.prop as string] = [
        {
          validator:
            zodValidator(fieldSchema as z.ZodType<any, unknown, z.core.$ZodTypeInternals<any, unknown>>),
          trigger: 'blur'
        }
      ];
    }
  });
  return rules;
};
const rules = generateRules() satisfies FormRules;
// 提交表单（调用外部传入的回调）
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    // 先执行 Element Plus 表单校验
    await formRef.value.validate();
    // 执行外部提交回调
    await props.onSubmit(form);
  } catch (error) {
    console.error('表单校验失败：', error);
    // 可扩展：全局错误提示（如 ElMessage）
  }
};

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields();
  // 重置为初始数据
  Object.assign(form, { ...props.initialForm });
};
</script>

<template>
  <div class="search-card">
    <div class="search-card__container">
      <CardHeader :icon="icon" :title="title" />
      <div class="search-card__body">
        <el-form 
          ref="formRef"
          class="search-card__form" 
          :model="form" 
          :rules="rules" 
          :label-position="labelPosition"
          :label-width="labelWidth"
        >
          <template v-for="field in formFields">
            <el-form-item
              :label="field.label"
              :prop="String(field.prop)"
              class="search-card__form-item"
            >
              <template #label>
                <div class="search-card__label">
                  <el-icon class="create-card__label-icon"> 
                    <VIcon :name="field.icon"/>
                  </el-icon>
                  <span class="search-card__label-text">{{ field.label }}</span>
                </div>
              </template>
              <div 
                v-if="field.children" 
                class="search-card__group" 
                :style="{
                  '--connector': `${field.connector || '-'}`
                }"
              >
                <template v-for="child,index in field.children" :key="child.prop">
                  <el-form-item
                    :prop="String(child.prop)"
                    class="search-card__form-group-item"
                  >
                    <!-- 子字段组件 -->
                    <component 
                      :is="child.component"
                      v-bind="child.componentProps"
                      v-model="form[child.prop]"
                      class="search-card__child-component"
                    />
                  </el-form-item>
                  <!-- 分隔符（如 -） -->
                  <span 
                    v-if="index < field.children.length - 1 && field.connector"
                    class="search-card__connector"
                  >
                    {{ field.connector }}
                  </span>
                </template>
              </div>
              <component 
                v-else
                :is="field.component"
                v-bind="field.componentProps"
                v-model="form[field.prop]"
              />
            </el-form-item>
          </template>
          <!-- 操作按钮 -->
          <el-form-item class="form-actions" label-width="0">
            <el-button 
              class="search-card__btn search-card__btn-submit" 
              type="primary" 
              @click="handleSubmit"
            >
              {{ submitText }}
            </el-button>
            <el-button 
              class="search-card__btn search-card__btn-reset" 
              @click="resetForm"
            >
              {{ resetText }}
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
.search-card {
  width: 100%;
  &__container {
    @include mix.container-style($p: 0);
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
  &__group {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
  }
  &__label {
    @extend %flex-center;
    @include mix.gap(xs);
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
  &__connector {
    @include mix.margin-x(sm);
  }
}
</style>