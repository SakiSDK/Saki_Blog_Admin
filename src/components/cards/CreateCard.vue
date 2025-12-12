<script lang="ts" setup>
import CardHeader from '../bases/CardHeader.vue';
import { computed, reactive, ref } from 'vue'
import { ElForm, ElFormItem, type FormInstance, type FormRules } from 'element-plus';
import { zodValidator } from '@/utils/validate.util';
import { z } from 'zod';
import type { CreateCardProps, FormFieldConfig } from '@/types/components/base.type';




// 定义 Props 并设置默认值
const props = withDefaults(defineProps<CreateCardProps>(), {
  title: '通用表单',
  icon: 'form',
  submitText: '提交',
  resetText: '重置',
  labelWidth: '80px',
  labelPosition: 'top',
  showGroupLabel: false,
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
const groupedFields = computed(() => {
  const groups: Record<string, FormFieldConfig[]> = {};
  props.formFields.forEach(field => {
    const groupKey = field.group || 'default';
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(field);
  });
  return groups;
});
const getRows = (fields: FormFieldConfig[]) => {
  const rows = Array.from(new Set(fields.map(f => f.row ?? 999)));
  return rows.sort((a, b) => a - b);
};

// 获取某行的字段
const getRowFields = (fields: FormFieldConfig[], row: number) => {
  return fields.filter(f => (f.row ?? 999) === row);
};

const getGridStyle = (fields: FormFieldConfig[], row: number) => {
  const colCount = fields.filter(f => (f.row ?? 999) === row).length;

  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${colCount}, 1fr)`,
    gap: '20px'
  };
};
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
          <!-- 分组渲染 -->
          <div 
            class="create-card__group" 
            v-for="(fields, groupName) in groupedFields" 
            :key="groupName"
          >
            <h3 
              class="create-card__group-title" 
              v-if="showGroupLabel"
            >
              {{ groupName }}
            </h3>
            <!-- 行渲染 -->
            <div 
              v-for="row in getRows(fields)" 
              class="create-card__row"
            >
              <!-- 找出属于该行的字段 -->
              <template v-if="getRowFields(fields, row).length > 1">
                <!-- 多字段：Grid 布局 -->
                <div
                  class="create-card__row-grid"
                  :style="getGridStyle(fields, row)"
                >
                  <template v-for="field in getRowFields(fields, row)">
                    <el-form-item :label="field.label" :prop="String(field.prop)">
                      <template #label>
                        <div class="create-card__label">
                          <el-icon class="create-card__label-icon">
                            <VIcon :name="field.icon"/>
                          </el-icon>
                          <span class="create-card__label-text">{{ field.label }}</span>
                        </div>
                      </template>

                      <component
                        :is="field.component"
                        v-bind="field.componentProps"
                        v-model="form[field.prop]"
                      />
                    </el-form-item>
                  </template>
                </div>
              </template>
              <template v-else>
                <!-- 单字段：不用 Grid -->
                <template v-for="field in getRowFields(fields, row)">
                  <el-form-item :label="field.label" :prop="String(field.prop)">
                    <template #label>
                      <div class="create-card__label">
                        <el-icon class="create-card__label-icon">
                          <VIcon :name="field.icon"/>
                        </el-icon>
                        <span class="create-card__label-text">{{ field.label }}</span>
                      </div>
                    </template>

                    <component
                      :is="field.component"
                      v-bind="field.componentProps"
                      v-model="form[field.prop]"
                    />
                  </el-form-item>
                </template>
              </template>
            </div>
          </div>
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
:deep(.el-input-number) {
  width: 100%;
}
.create-card { 
  width: 100%;
  &__container {
    @include mix.container-style($r: md, $p: 0, $b: 1px solid var(--el-border-color));
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
  &__label {
    @extend %flex-center;
    @include mix.gap(xs);
  }
}
</style>