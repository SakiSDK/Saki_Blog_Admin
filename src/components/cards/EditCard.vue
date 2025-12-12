<script lang="ts" setup>
import { type FormInstance, type FormRules } from 'element-plus';
import { ref, reactive, computed} from 'vue';
import { z } from 'zod';
import { useVModel } from '@vueuse/core';
import { zodValidator } from '@/utils/validate.util';
import CardHeader from '@/components/bases/CardHeader.vue'
import VIcon from '../global/VIcon.vue';
import type { EditCardProps } from '@/types/components/base.type';


/** Emits 类型 */
interface EditCardEmits {
  /** 弹窗显隐状态变更 */
  (e: 'update:modelValue', value: boolean): void;
  /** 展示状态 */
  (e: 'update:isShowEdit', value: boolean): void;
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

const emits = defineEmits<EditCardEmits>();

// ------------- 响应式数据 (使用 useVModel) -------------
/** 弹窗显隐状态 (双向绑定) */
const dialogVisible = useVModel(props, 'isShowEdit', emits, {
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

/** ---------- 逻辑方法 ---------- */
const handleConfirm = async () => {
  if (!formRef.value || props.confirmBtnDisabled) return;
  try {
    // 先执行 Element Plus 表单校验
    await formRef.value.validate();
    // 执行外部提交回调
    emits('confirm', form);
    // 关闭弹窗
    dialogVisible.value = false;
  } catch (error) {
    console.error('表单校验失败：', error);
    // 可扩展：全局错误提示（如 ElMessage）
  }
}
const onClose = () => {
  dialogVisible.value = false;
}
// 重置表单
const resetForm = () => {
  formRef.value?.resetFields();
  // 重置为初始数据
  Object.assign(form, { ...props.initialForm });
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
    :show-close="showCloseBtn"
    :fullscreen="dialogFullscreen"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    @close="onClose"
    class="edit-card"
  >
    <template #header>
      <CardHeader title="表单标题" :icon="headerIcon">
        <template #actions>
          <el-icon 
            class="edit-card__close"
            @click.prevent="onClose"
          > 
            <VIcon name="close"/> 
          </el-icon>
        </template>
      </CardHeader>
    </template>
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
          <template #label>
            <div class="edit-card__label">
              <el-icon class="edit-card__label-icon"> 
                <VIcon :name="field.icon ?? ''"/>
              </el-icon>
              <span class="edit-card__label-text">{{ field.label }}</span>
            </div>
          </template>
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
      </template>
      <!-- 操作按钮 -->
      <el-form-item class="form-actions" label-width="0">
        <el-button 
          class="edit-card__btn edit-card__btn-submit" 
          type="primary" 
          @click="handleConfirm"
        >
          {{ confirmText }}
        </el-button>
        <el-button 
          class="edit-card__btn edit-card__btn-reset" 
          @click="resetForm"
        >
          {{ cancelText }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style lang="scss" scoped>
.edit-card {
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
  &__label {
    @extend %flex-center;
    @include mix.gap(xs);
  }
  &__close {
    @include anim.transition($p: color transform);
    @include hov.color(var(--primary-base));
    &:hover {
      transform: rotate(90deg) scale(1.3);
    }
    &:active {
      transform: rotate(90deg) scale(1.1);
    }
  }
}

</style>