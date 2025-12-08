<script lang="ts" setup>
import { type FormInstance, type FormRules } from 'element-plus';
import { ref, onMounted, reactive, computed } from 'vue';
import { z } from 'zod';
import { useVModel } from '@vueuse/core';
import type { JSX } from 'vue/jsx-runtime';
import { zodValidator } from '@/utils/validate.util';

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
interface EditCardProps<T = any> {
  /** 弹窗是否可见 (v-model 绑定) */
  isShowEdit: boolean;
  /** 弹窗标题 */
  title?: string;
  /** 初始表单数据 (支持 v-model 双向绑定) */
  initialForm: T;
  /** 表单字段配置 */
  formFields: EditFormField[];
  /** Zod 校验 Schema */
  formSchema: z.ZodObject<z.ZodRawShape>;
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
  /** 是否自动重置表单 (弹窗关闭时) */
  autoReset?: boolean;
}
/** Emits 类型 */
interface EditCardEmits {
  /** 弹窗显隐状态变更 */
  (e: 'update:modelValue', value: boolean): void;
  /** 确认提交 */
  (e: 'confirm', formData: Record<string, any>): void;
  /** 取消操作 */
  (e: 'cancel'): void;
  /** 弹窗关闭 */
  (e: 'close'): void;
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
const dialogVisible = useVModel(props, 'isShowEdit', emit, {
  passive: false,
  deep: false
});
/** 表单实例 */
const formRef = ref<FormInstance>();
/** 表单初始数据 (用于重置) */
const form = reactive<Record<string, any>>({ ...props.initialForm });
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


/** ---------- 生命周期&监听 ---------- */
onMounted(() => {
  
})


/** ---------- 逻辑方法 ---------- */
const handleConfirm = async () => {
  if (!formRef.value || props.confirmBtnDisabled) return;
  try {
    // 先执行 Element Plus 表单校验
    await formRef.value.validate();
    // 执行外部提交回调
    emit('confirm', form);
    // 关闭弹窗
    dialogVisible.value = false;
  } catch (error) {
    console.error('表单校验失败：', error);
    // 可扩展：全局错误提示（如 ElMessage）
  }
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields();
  // 重置为初始数据
  Object.assign(form, { ...props.initialForm });
};

/** 处理取消 */
const handleCancel = () => {
  emit('cancel');
  dialogVisible.value = false;
};

/** 处理弹窗关闭 */
const handleClose = () => {
  dialogVisible.value = false;
};

/** ---------- 计算属性 ---------- */
/** 是否全屏显示 */
const dialogFullscreen = computed(() => {
  return props.fullscreen;
});
</script>

<template>
  <el-dialog
    v-model="dialogVisible" 
    :title="title" 
    :width="width"
    :fullscreen="dialogFullscreen"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    @close="onClose"
    class="edit-card"
  >
    <el-form 
      ref="formRef" 
      :model="form" 
      :rules="rules" 
      :label-width="labelWidth"
      :label-position="labelPosition"
      class="edit-card__form"
      autocomplete="off"
    >
      <!-- 遍历表单字段 -->
      <template v-for="field in formFields" :key="field.prop">
        <el-form-item
          v-if="!field.hidden"
          :label="field.label"
          :prop="field.prop"
          :label-width="field.labelWidth || labelWidth"
          class="edit-card__form-item"
        >
          <!-- 自定义渲染 -->
          <template v-if="field.render">
            <component :is="field.render(form)" />
          </template>

          <!-- 嵌套子字段 (如时间范围) -->
          <div v-else-if="field.children" class="edit-card__field-group">
            <template v-for="(child, index) in field.children" :key="child.prop">
              <el-form-item
                v-if="!child.hidden"
                :prop="child.prop"
                :label="child.label"
                :label-width="child.labelWidth || '80px'"
                class="edit-card__field-group-item"
              >
                <component
                  :is="child.component"
                  v-bind="child.componentProps"
                  v-model="form[child.prop]"
                  class="edit-card__field-component"
                />
              </el-form-item>

              <!-- 分隔符 -->
              <span
                v-if="index < field.children.length - 1 && field.connector"
                class="edit-card__field-connector"
              >
                {{ field.connector }}
              </span>
            </template>
          </div>
          <!-- 普通字段 -->
          <component
            v-else
            :is="field.component"
            v-bind="field.componentProps"
            v-model="form[field.prop]"
            class="edit-card__field-component"
          />
        </el-form-item>
          <!-- 操作按钮 -->
          <el-form-item class="form-actions" label-width="0">
            <el-button 
              class="create-card__btn create-card__btn-submit" 
              type="primary" 
              @click="handleConfirm"
            >
              {{ confirmText }}
            </el-button>
            <el-button 
              class="create-card__btn create-card__btn-reset" 
              @click="resetForm"
            >
              {{ cancelText }}
            </el-button>
          </el-form-item>
      </template>
    </el-form>
  </el-dialog>
</template>

<style lang="scss" scoped>


</style>