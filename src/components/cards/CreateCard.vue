<script lang="ts" setup>
import CardHeader from '../bases/CardHeader.vue';
import { reactive, ref, type UnwrapRef } from 'vue'
import { ElForm, ElFormItem, type FormInstance, type FormRules } from 'element-plus';
import { zodValidator } from '@/utils/validate.util';
import { z } from 'zod';


export type FormFieldConfig<T = any> = {
  label: string;
  prop: keyof T & string;
  component: any; // 支持任意 Element Plus 表单组件
  componentProps?: Record<string, any>; // 组件透传属性
  hidden?: boolean; // 是否隐藏字段
};
// 定义组件 Props 类型
type CreateCardProps<T = any> = {
  /** 卡片标题 */
  title: string;
  /** 卡片图标 */
  icon: string;
  /** 提交按钮文本 */
  submitText: string;
  /** 重置按钮文本 */
  resetText: string;
  /** 表单初始数据 */
  initialForm: T;
  /** Zod 表单校验 Schema */
  formSchema: z.ZodObject<z.ZodRawShape>;
  /** 表单字段配置 */
  formFields: FormFieldConfig<T>[];
  /** 提交回调函数 */
  onSubmit: (formData: UnwrapRef<T>) => Promise<void> | void;
  /** 可选：自定义表单校验规则（优先级高于 Zod 自动生成） */
  customRules?: FormRules;
  /** 可选：标签宽度 */
  labelWidth?: string;
  /** 可选：标签位置（top/left） */
  labelPosition?: 'top' | 'left';
};
// 定义 Props 并设置默认值
const props = withDefaults(defineProps<CreateCardProps>(), {
  title: '通用表单',
  icon: 'form',
  submitText: '提交',
  resetText: '重置',
  labelWidth: '80px',
  labelPosition: 'top'
});


/** ---------- 表单核心逻辑 ---------- */
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
  <div class="create-card">
    <div class="create-card__container">
      <CardHeader :icon="icon" :title="title"/>
      <div class="create-card__body">
        <el-form 
          ref="formRef" 
          :model="form" 
          :rules="rules" 
          :label-width="labelWidth"
          :label-position="labelPosition"
          class="create-card__form"
        >
          <template v-for="field in formFields">
            <el-form-item
              :label="field.label"
              :prop="String(field.prop)"
            >
              <component 
                :is="field.component"
                v-bind="field.componentProps"
                v-model="form[field.prop]"
              />
            </el-form-item>
          </template>
          <!-- 操作按钮 -->
          <el-form-item class="form-actions" label-width="0">
            <el-button 
              class="create-card__btn create-card__btn-submit" 
              type="primary" 
              @click="handleSubmit"
            >
              {{ submitText }}
            </el-button>
            <el-button 
              class="create-card__btn create-card__btn-reset" 
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
.create-card { 
  width: 100%;
  &__container {
    @include mix.container-style($r: md, $p: 0);
  }
  &__body {
    @include mix.padding(lg);
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