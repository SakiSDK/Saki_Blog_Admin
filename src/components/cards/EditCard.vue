<script lang="ts" setup>
import { type FormInstance, type FormRules } from 'element-plus';
import { ref, watch, onMounted, computed, reactive } from 'vue';
import { z } from 'zod';
import { useVModel } from '@vueuse/core';
import type { JSX } from 'vue/jsx-runtime';

// ------------- 类型定义 -------------
/** 表单字段配置项 */
export interface EditFormField {
  /** 字段标签 */
  label: string;
  /** 字段属性名 */
  prop: string;
  /** 组件类型 (如 'el-input' / ElInput / 自定义组件) */
  component: string | any;
  /** 组件属性 */
  componentProps?: Record<string, any>;
  /** 是否隐藏 */
  hidden?: boolean;
  /** 标签宽度 */
  labelWidth?: string | number;
  /** 子字段分隔符 (如时间范围的 '-') */
  connector?: string;
  /** 子字段配置 (用于分组字段如时间范围) */
  children?: EditFormField[];
  /** 自定义渲染函数 */
  render?: (formData: Record<string, any>) => JSX.Element | string;
}
/** Props 类型 */
interface EditCardProps {
  /** 弹窗是否可见 (v-model 绑定) */
  modelValue: boolean;
  /** 弹窗标题 */
  title?: string;
  /** 初始表单数据 (支持 v-model 双向绑定) */
  formData?: Record<string, any>;
  /** 表单字段配置 */
  formFields: EditFormField[];
  /** Zod 校验 Schema */
  formSchema?: z.ZodSchema;
  /** 自定义校验规则 (优先级高于 Schema) */
  customRules?: FormRules;
  /** 弹窗宽度 */
  width?: string | number;
  /** 标签宽度 */
  labelWidth?: string | number;
  /** 标签位置 */
  labelPosition?: 'left' | 'right' | 'top';
  /** 是否显示取消按钮 */
  showCancelBtn?: boolean;
  /** 是否显示确认按钮 */
  showConfirmBtn?: boolean;
  /** 取消按钮文字 */
  cancelText?: string;
  /** 确认按钮文字 */
  confirmText?: string;
  /** 确认按钮是否禁用 */
  confirmBtnDisabled?: boolean;
  /** 是否点击遮罩层关闭 */
  closeOnClickModal?: boolean;
  /** 是否按ESC关闭 */
  closeOnPressEscape?: boolean;
  /** 是否显示关闭按钮 */
  showCloseBtn?: boolean;
  /** 是否全屏显示 (移动端自动生效) */
  fullscreen?: boolean;
  /** 提交前钩子 (返回 false 阻止提交) */
  beforeSubmit?: (formData: Record<string, any>) => boolean | Promise<boolean>;
  /** 是否自动重置表单 (弹窗关闭时) */
  autoReset?: boolean;
}
/** Emits 类型 */
interface EditCardEmits {
  /** 弹窗显隐状态变更 */
  (e: 'update:modelValue', value: boolean): void;
  /** 表单数据变更 (v-model:formData) */
  (e: 'update:formData', value: Record<string, any>): void;
  /** 确认提交 */
  (e: 'confirm', formData: Record<string, any>): void;
  /** 取消操作 */
  (e: 'cancel'): void;
  /** 弹窗关闭 */
  (e: 'close'): void;
  /** 表单校验失败 */
  (e: 'validate-fail', error: any): void;
  /** 表单重置 */
  (e: 'reset'): void;
}
// ------------- Props & Emits -------------
const props = withDefaults(defineProps<EditCardProps>(), {
  title: '编辑表单',
  formData: () => ({}),
  formFields: () => [],
  width: '600px',
  labelWidth: '100px',
  labelPosition: 'left',
  showCancelBtn: true,
  showConfirmBtn: true,
  cancelText: '取消',
  confirmText: '确认',
  confirmBtnDisabled: false,
  closeOnClickModal: true,
  closeOnPressEscape: true,
  showCloseBtn: true,
  fullscreen: false,
  autoReset: true
});

const emit = defineEmits<EditCardEmits>();

// ------------- 响应式数据 (使用 useVModel) -------------
/** 弹窗显隐状态 (双向绑定) */
const dialogVisible = useVModel(props, 'modelValue', emit, {
  passive: false,
  deep: false
});

/** 表单数据 (双向绑定，支持外部同步更新) */
const formData = useVModel(props, 'formData', emit, {
  passive: false,
  deep: true
});

/** 表单实例 */
const formRef = ref<FormInstance>();
/** 移动端标识 */
const isMobile = ref(false);
/** 表单初始数据 (用于重置) */
const initialFormData = ref<Record<string, any>>({ ...props.formData });
const form = reactive<Record<string, any>>({ ...props.formData });
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

</script>

<template>
  <el-dialog 
    title="title" 
    @close="onClose"
  >
    <el-form 
      ref="formRef" 
      :model="form" 
      :rules="rules" 
      :label-width="labelWidth"
      :label-position="labelPosition"
    >

    </el-form>
  </el-dialog>
</template>

<style lang="scss" scoped>


</style>