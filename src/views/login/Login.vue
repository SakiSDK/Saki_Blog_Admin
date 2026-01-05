<script lang="ts" setup>
import { useAuthStore } from '@/stores/auth.store';
import { useThemeStore } from '@/stores/theme.store';
import type { FormFieldConfig } from '@/types/components/base.type';
import { ElInput, ElMessage } from 'element-plus';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';


/** ---------- 状态管理 ---------- */
useThemeStore();
const authStore = useAuthStore();
const router = useRouter();


/** ---------- 页面元素绑定 ---------- */
const formRef = ref<HTMLFormElement | null>(null);


/** ----------  数据定义 ---------- */
const rememberPassword = ref<boolean>(false);
const form = reactive({
  email: '',
  password: '',
});
const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度' }
  ]
}


/** ---------- 页面内容 ---------- */
/** 表单字段 */
const authFields = ref<FormFieldConfig[]>([
  {
    prop: 'email',
    label: '邮箱',
    icon: 'email',
    labelWidth: '80px',
    component: ElInput,
    componentProps: {
      placeholder: '请输入邮箱',
    }
  },
  {
    prop: 'password',
    label: '密码',
    icon: 'password',
    labelWidth: '80px',
    component: ElInput,
    componentProps: {
      placeholder: '请输入密码',
      type: 'password',
      showPassword: true,
    }
  }
])


/** ---------- 逻辑方法 ---------- */

/** 登录逻辑 */
const handleLogin = async () => {
  // 验证表单
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const success = await authStore.login({
          email: form.email,
          password: form.password
        });

        if (success) {
          ElMessage.success('登录成功');
          router.push('/dashboard');
        }
      } catch (error: any) {
        ElMessage.error(error.message || '登录失败，请稍后重试');
      }
    }
  });
}
</script>

<template>
  <div class="login">
    <div class="login__container">
      <div class="login__header">
        <h2 class="login-title">账户登录</h2>
        <div class="login-subtitle">请输入您的凭证以访问系统</div>
      </div>
      <div class="login__body">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" label-position ="top" hide-required-asterisk>
          <template v-for="field in authFields" :key="field.prop">
            <el-form-item :prop="field.prop" :label="field.label" :label-width="field.labelWidth">
              <template #label>
                <div class="login__label">
                  <el-icon class="login__label-icon">
                    <VIcon :name="field.icon"/>
                  </el-icon>
                  <span class="login__label-text">{{ field.label }}</span>
                </div>
              </template>
              <template #default>
                <component 
                  :is="field.component" 
                  v-model="form[field.prop as keyof typeof form]"
                  v-bind="field.componentProps" 
                />
              </template>
            </el-form-item>
          </template>
          <div class="login__options">
            <el-checkbox v-model="rememberPassword">记住密码</el-checkbox>
            <el-link type="primary" href="#">忘记密码?</el-link>
          </div>
          <el-form-item label-width="100%">
            <el-button class="login-submit" type="primary" :loading="authStore.loading" @click="handleLogin">登录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-link__inner) {
  &::after {
    @include anim.transition($p: 'width');
  }
}
.login {
  @extend %full-screen;
  @extend %flex-center;
  &__container {
    min-width: 400px;
    @include mix.container-style($b: var(--border-base), $p: xxl lg, $r: md);
    @include mix.padding-d(b, sm);
  }
  &__header {
    @extend %flex-column-center;
    @include mix.gap(sm);
    @include mix.margin-d(b, lg);
  }
  &-title {
    @include mix.font-style($s: xxl, $c: var(--primary-base));
  }
  &-subtitle {
    @include mix.font-style($s: xs, $c: var(--text-subtle));
  }
  &-submit {
    width: 100%;
    @include mix.margin-d(t, md);
  }
  &__options {
    @extend %flex-center;
    justify-content: space-between;
    @include mix.margin-d(t, xxl);
  }
  &__label {
    @extend %flex-center;
    @include mix.gap(xs);
  }
}

</style>