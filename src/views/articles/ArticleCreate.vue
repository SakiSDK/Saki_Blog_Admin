<script lang="ts" setup>
import CardHeader from '@/components/bases/CardHeader.vue';
import { TagNameSchema, type TagBase } from '@/schemas/tag.schema';
import { useTagStore } from '@/stores/tag.store';
import type { FormFieldConfig } from '@/types/components/base.type';
import { ElForm, ElInput, ElInputNumber, ElMessage, ElRadio, ElSelect, ElUpload } from 'element-plus';
import { nextTick, onMounted, reactive, ref, toRaw, watch } from 'vue';
import { filter, debounce } from 'lodash'
import MarkdownEditor from '@/components/bases/MarkdownEditor.vue';
import { useCategoryStore } from '@/stores/category.store';
import { EditContextStorage } from '@/utils/sessionStorage.util';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useDraftSession } from '@/composables/useDraftSession';


/** ---------- 类型定义 ---------- */
interface ArticleForm {
  title: string;
  author: string;
  order: number;
  cover?: string;
  tags: {
    name: string;
    id?: number;
  }[]
  allowComment: boolean;
  category?: {
    id?: number;
    name: string;
  }
}


/** ---------- 状态管理 ---------- */
const tagStore = useTagStore();
const categoryStore = useCategoryStore();
const inputVisible = ref<boolean>(false);
const articleId = ref<string | null>(null); // 从路由或者props中获取
const authStore = useAuthStore();
const { user } = authStore;
const userId = user?.shortId || '';
// 从路由获取文章ID
const route = useRoute();
articleId.value = route.params.id as string;

/** ---------- 基础数据 ---------- */
const inputValue = ref('')
const content = ref<string>('')
const tagList = ref<(
  TagBase & {
    id?: number;
    isSelected: boolean
  }
)[]>([]);
const form = reactive<ArticleForm>({
  title: '',
  author: 'SakiSDK',
  order: 0,
  cover: undefined,
  tags: [],
  allowComment: true
})
const formRef = ref<typeof ElForm>();
const formConfig = {
  labelWidth: '80px',
  labelPosition: 'top' as const,
}
const baseFields = ref<FormFieldConfig[]>([
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
      placeholder: '请选择分类',
      options: []
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
])
const articleTagField = {
  label: '标签',
  labelWidth: '80px',
  prop: 'tags',
  icon: 'tag',
}
const articleCoverField: FormFieldConfig = {
  label: '封面',
  labelWidth: '80px',
  prop: 'cover',
  icon: 'picture',
  component: ElUpload,
  componentProps: {
    action: '/api/v1/upload/article/cover',
    listType: 'picture-card',
    showFileList: false,
    accept: 'image/*',
    'on-success': (res: any) => {
      if (res.success) {
        //? 假设后端返回 { success: true, data: { url: '...' } }
        form.cover = res.data.url 
      }
    },
    'on-error': () => {
      ElMessage.error('封面上传失败')
    },
    'before-upload': (file: File) => {
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        ElMessage.error('上传图片大小不能超过 2MB!')
      }
      const isValidType = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/tiff'].includes(file.type);
      return isLt2M && isValidType;
    }
  }
}
const commentField: FormFieldConfig = {
  label: '评论',
  labelWidth: '80px',
  prop: 'allowComment',
  icon: 'comment',
  component: ElRadio,
  componentProps: {
    options: [
      {
        label: '允许评论',
        value: true
      },
      {
        label: '不允许评论',
        value: false
      }
    ]
  }
}

/** ---------- 元素绑定 ---------- */
const inputRef = ref<typeof ElInput>();
const inputWidth = ref<number>(60) // 默认 60px
const measureRef = ref<HTMLElement | null>(null);

/** ---------- 初始化操作 ---------- */
const {
  sessionId,
  isSessionLoading,
  lastSavedAt,
  initializeSession,
  handleManualSave,
  clearSession,
  cleanupExpiredSessions,
} = useDraftSession(articleId.value, userId, (draft) => {
  // 回复草稿时的回调
  Object.assign(form, draft.form);
  content.value = draft.content;
});
/** 自动保存使用防抖 */
const autoSave = debounce(() => {
  if (sessionId.value) {
    const draftKey = `draft_${sessionId.value}`;
    const now = new Date();
    const draftData = {
      form: toRaw(form),
      content: content.value,
      updatedAt: now.toISOString(),
    };
    localStorage.setItem(draftKey, JSON.stringify(draftData));
    EditContextStorage.updateSession(articleId.value, userId, sessionId.value);
    lastSavedAt.value = now.toLocaleString();
  }
}, 1000);



/** ---------- 逻辑方法 ---------- */
// 手动保存按钮
const handleManualSaveClick = () => {
  handleManualSave(form, content.value);
}
// 标签选择
const handleTagSelect = (selectedTag: TagBase) => {
  const target = tagList.value.find((tag) => tag.id === selectedTag.id);
  if (!target) return;
  target.isSelected = !target.isSelected;
  if (target.isSelected) {
    form.tags.push(selectedTag)
  } else {
    form.tags = filter(form.tags, tag => tag.id !== selectedTag.id)
  }
}
// 标签删除
const handleTagClose = (closedTag: {
  id?: number;
  name: string;
}) => {
  const listTag = closedTag.id
    ? tagList.value.find(tag => tag.id === closedTag.id)
    : tagList.value.find(tag => tag.name === closedTag.name)

  if (listTag) {
    listTag.isSelected = false
  }

  if (closedTag.id) {
    form.tags = form.tags.filter(tag => tag.id !== closedTag.id)
  } else {
    form.tags = form.tags.filter(tag => tag.name !== closedTag.name)
  }
}
// 添加标签，校验标签名是否存在，假如不存在会自动添加
const showInput = async () => {
  inputVisible.value = true
  await nextTick()
  if (!inputRef.value) return;
  inputRef.value.focus()
}
// 确认添加标签
const handleInputConfirm = () => {
  const validateResult = TagNameSchema.safeParse(inputValue.value);
  if (!validateResult.success) {
    const errorMessage = validateResult.error.issues[0]?.message
    ElMessage.error(errorMessage);
    inputValue.value = '';
    inputVisible.value = false;
    return; // 校验失败，不执行后续逻辑
  }
  // 校验成功：获取清洗后的值（trim 后的）
  const validTagName = validateResult.data;

  const isExist = form.tags.some(tag => tag.name === validTagName);
  if (isExist) {
    ElMessage.error(`标签「${validTagName}」已存在！`);
    inputValue.value = '';
    inputVisible.value = false;
    return;
  }
  if (inputValue.value) {
    form.tags.push({
      name: validTagName,
    })
  }
  inputVisible.value = false
  inputValue.value = ''
}
// 提交表单（调用外部传入的回调）
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    // 先执行 Element Plus 表单校验
    await formRef.value.validate();
  } catch (error) {
    ElMessage.warning('请检查表单内容');
    return;
  }

  const payload = {
    ...form,
    content: content.value.trim(),
    userId: userId,
  }

  
};
// 重置表单
// const resetForm = () => {
//   formRef.value?.resetFields();
//   // 重置为初始数据

// };
// 获取分类并填充 options
const loadCategories = async () => {
  try {
    const categoryRes = await categoryStore.getAllCategories();
    if (categoryRes.success) {
      const categoryField = baseFields.value.find(field => field.prop === 'category');
      if (categoryField) {
        categoryField.componentProps!.options = categoryRes.data.list.map(category => ({
          label: category.name,
          value: category.id
        }));
      }
    }
  } catch (error) {
    console.error('获取分类列表失败：', error);
    ElMessage.error('获取分类列表失败！');
  }
}
// 获取标签并填充 options
const loadTags = async () => {
  try {
    const tagRes = await tagStore.getAllTags();
    if (tagRes.success) {
      tagList.value = tagRes.data.list.map(tag => ({
        ...tag,
        isSelected: false
      }));
    }
  } catch (error) {
    console.error('获取标签列表失败：', error);
    ElMessage.error('获取标签列表失败！');
  }
}


/** ---------- 数据监听 ---------- */
watch(inputValue, async () => { 
  await nextTick();
  if (!measureRef.value) return;
  const width = measureRef.value.offsetWidth;
  inputWidth.value = Math.max(60, width);
})
// 监听表单变化自动保存
watch([form, content], autoSave, { deep: true });

/** ---------- 生命周期钩子 ---------- */
// 组件挂载时初始化
onMounted(async () => {
  // 初始化会话
  initializeSession();
  // 清理过期会话
  cleanupExpiredSessions();
  // 清理过期会话
  EditContextStorage.cleanupExpiredSessions();

  // 加载分类，标签...
  await loadTags();
  await loadCategories();
});
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
            <div class="article-create__item">
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
            <div class="article-create__item">
              <el-form-item :label="articleTagField.label" :prop="articleTagField.prop">
                <template #label>
                  <div class="article-create__label">
                    <el-icon class="article-create__label-icon">
                      <VIcon :name="articleTagField.icon"/>
                    </el-icon>
                    <span class="article-create__label-text">{{ articleTagField.label }}</span>
                  </div>
                </template>
                <template #default>
                  <div class="article-create__sheet">
                    <div class="article-create__tag-selected">
                      <span class="article-create__label label">已选择标签</span>
                      <el-tag 
                        type="primary" 
                        v-for="tag,index in form.tags" 
                        :key="index"
                        closable
                        @close="handleTagClose(tag)"
                      >
                        {{ tag.name }}
                      </el-tag>
                      <el-input
                        v-if="inputVisible"
                        ref="inputRef"
                        v-model="inputValue"
                        class="article-create__tag-input"
                        size="small"
                        :style="{
                          '--input-with': inputWidth + 'px',
                        }"
                        @keyup.enter="handleInputConfirm"
                        @blur="handleInputConfirm"
                      />
                      <el-button v-else class="article-create__tag-button" size="small" @click="showInput">
                        + New Tag
                      </el-button>
                      <!-- 测量使用 -->
                      <span ref="measureRef" class="article-create__tag-measure">
                        {{ inputValue || '默认占位' }}
                      </span>
                    </div>
                    <div class="article-create__tag-list">
                      <span class="article-create__label label">标签列表</span>
                      <el-check-tag 
                        type="primary" 
                        v-for="tag in tagList" 
                        :key="tag.id" 
                        :checked="tag.isSelected"
                        @change="handleTagSelect(tag)"
                      >
                        {{ tag.name }}
                      </el-check-tag>
                    </div>
                  </div>
                </template>
              </el-form-item>
            </div>
            <div class="article-create__item">
              <el-form-item :label="articleCoverField.label" :prop="articleCoverField.prop"> 
                <template #label>
                  <div class="article-create__label">
                    <el-icon class="article-create__label-icon">
                      <VIcon :name="articleCoverField.icon"/>
                    </el-icon>
                    <span class="article-create__label-text">{{ articleCoverField.label }}</span>
                  </div>
                </template>
                <template #default>
                  <el-upload
                    class="article-create__upload"
                    v-bind="articleCoverField.componentProps"
                  >
                    <div class="article-create__upload-wrapper">
                      <el-icon class="article-create__upload-icon">
                        <VIcon name="upload"/>
                      </el-icon>
                      <p class="article-create__upload-text">点击或者拖拽图片上传</p>
                      <p class="article-create__upload-detail">支持 JPG, JPEG, PNG, GIF 格式，最大 2MB</p>
                    </div>
                  </el-upload>
                </template>
              </el-form-item>
            </div>
            <h3 class="article-create-subtitle" :style="{
              marginTop: '35px',
            }">
              文章内容
            </h3>
            <div class="article-create__item">
              <div class="article-create__label" :style="{
                marginBottom: '10px',
              }">
                <el-icon class="article-create__label-icon">
                  <VIcon name="article"/>
                </el-icon>
                <span class="article-create__label-text">编辑器</span>
              </div>
              <div class="article-create__edit-board">
                <MarkdownEditor v-model:content="content" />
              </div>
            </div>            
            <h3 class="article-create-subtitle" :style="{
              marginTop: '35px',
            }">
              发布设置
            </h3>
            <div class="article-create__item">
              <el-form-item :label="commentField.label" :prop="commentField.prop">
                <template #label>
                  <div class="article-create__label">
                    <el-icon class="article-create__label-icon">
                      <VIcon :name="commentField.icon"/>
                    </el-icon>
                    <span class="article-create__label-text">{{ commentField.label }}</span>
                  </div>
                </template>
                <el-radio-group
                  v-if="commentField.component === ElRadio && commentField.componentProps?.options"
                  v-model="form[commentField.prop as keyof ArticleForm]"
                >
                  <el-radio
                    v-for="opt in commentField.componentProps.options"
                    :key="String(opt.value)"
                    :label="opt.value"
                  >
                    {{ opt.label }}
                  </el-radio>
                </el-radio-group>
                <component
                  v-else
                  :is="commentField.component"
                  v-model="form[commentField.prop as keyof ArticleForm]"
                  v-bind="commentField.componentProps"
                />
              </el-form-item>
            </div>
          <!-- 操作按钮 -->
          <el-form-item class="article-create__actions" label-width="0">
            <span v-if="lastSavedAt" class="article-create__save-time">
              上次保存: {{ lastSavedAt }}
            </span>
            <el-button 
              class="article-create__btn article-create__btn-reset" 
              @click="handleManualSaveClick"
            >
              <VIcon name="draft"/>
              <span class="article-create__btn-text">保存草稿</span>
            </el-button>
            <el-button 
              class="article-create__btn article-create__btn-submit" 
              type="primary" 
              @click="handleSubmit"
            >
              <VIcon name="submit"/>
              <span class="article-create__btn-text">直接发布</span>
            </el-button>

          </el-form-item>
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
:deep(.el-upload) {
  width: 100%;
  height: 300px;
}
.label {
  gap: 0 !important;
  &::after {
    content: ':'
  }
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
  &__item {
    @include mix.margin-d(b, sm);
  }
  &__wrapper {
    @include mix.grid-box($c: 2, $g: lg);
    @include mix.respond-down(sm) {
      @include mix.grid-box($c: 1, $g: sm);
    }
  }
  &__sheet {
    @include mix.font-style($s: sm, $c: var(--text-subtle));
  }
  &__label {
    @extend %flex-center;
    justify-content: start;
    @include mix.gap(xs);
    text-wrap: nowrap;
    @include mix.margin-d(r, sm);
  }
  &__tag {
    &-list,
    &-selected { 
      @include mix.flex-box($j: flex-start, $g: xs, $w: wrap);
    }
    &-measure {
      position: absolute;
      visibility: hidden;
      padding: 1px 7px;
      @include mix.font-style($s: xs);
    }
    &-input { 
      width: var(--input-with);
    }
  }
  &__upload {
    width: 100%;
    &-wrapper {
      @extend %flex-column-center;
    }
    &-icon {
      @include mix.font-style($s: xl-title, $c: var(--text-weak));
    }
    &-text {
      @include mix.font-style($s: sm, $c: var(--text-subtle));
    }
    &-detail {
      @include mix.font-style($s: xs, $c: var(--text-subtler));
    }
  }
  &__btn{
    @extend %flex-center;
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
    &-text {
      @include mix.font-style($s: sm);
      @include mix.margin-d(l, xs);
    }
  }
  &__save-time {
    @include mix.font-style($s: xs, $c: var(--text-subtle));
    @include mix.margin-d(r, sm);
  }
  &__actions {
    :deep(.el-form-item__content) {
      justify-content: flex-end;
      align-items: center;
    }
  }
}
</style>
