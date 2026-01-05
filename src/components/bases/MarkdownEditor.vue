<script lang="ts" setup>
import { useVModel } from '@vueuse/core';
import Vditor from 'vditor';
import 'vditor/dist/index.css'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useThemeStore } from '@/stores/theme.store';
import { storeToRefs } from 'pinia';
import { UploadApi } from '@/apis/upload.api';

/** ---------- 类型定义 ---------- */
// 定义 Props 类型
interface Props {
  content: string
}
// 定义 Emits 类型
interface Emits {
  (event: 'update:content', value: string): void
  (event: 'save'): void
}
type VditorMode = 'wysiwyg' | 'ir' | 'sv'

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 双向数据绑定
const editorContent = useVModel(props, 'content', emit);

// 编译器引用
const editorRef = ref<HTMLElement | null>(null);
const vditor = ref<Vditor | null>(null);
const mode = ref<VditorMode>('wysiwyg');


// 状态管理
const themeStore = useThemeStore();
const { theme } = storeToRefs(themeStore);


// 初始化编辑器
const initEditor = () => {
  if (!editorRef.value) return;
  vditor.value = new Vditor(editorRef.value, {
    mode: mode.value,
    theme: theme.value === 'dark' ? 'dark' : 'classic',
    cache: {
      id: 'markdown-editor', // 必须提供，可以是任意字符串
      enable: true
    },
    toolbar: [
      'emoji', 'bold', 'italic', 'strike', '|',
      'link', 'upload', 'table', 'code', '|',
      'headings', 'quote', 'list', 'check', '|',
      'fullscreen', 'preview', 'export'
    ],
    // 修复：使用正确的函数签名
    customWysiwygToolbar: () => {
      // 可在此处自定义工具栏逻辑，例如：
      // if (type === 'table') { element.style.backgroundColor = '#f5f5f5' }
    },
    // 修复：监听输入事件，实时更新 v-model
    input: (value: string) => {
      editorContent.value = value;
    },
    height: 900,
    placeholder: '输入 Markdown 内容...',
    upload: {
      accept: 'image/*',
      multiple: false,
      handler: async (files: File[]) => {
        const file = files[0];
        if (!file) return null;
        
        try {
          const formData = new FormData();
          formData.append('image', file);
          
          const res = await UploadApi.uploadPostImage(formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          if (res.success && res.data?.url) {
            vditor.value?.insertValue(`![${file.name}](${res.data.url})`);
          } else {
            vditor.value?.tip(res.message || '图片上传失败');
          }
        } catch (error) {
          console.error(error);
          vditor.value?.tip('上传过程中发生错误');
        }
        return null;
      }
    },
    after: () => {
      // 初始化后同步内容（避免闪白）
      if (props.content) { 
        vditor.value?.setValue(props.content);
      }
    }
  })
}


/** ---------- 数据监听 ---------- */
// 监听 editorContent 变化
watch(editorContent, (val) => {
  if(vditor.value && vditor.value.getValue() !== val){
    vditor.value.setValue(val);
  }
})

// 监听主题变化
watch(() => themeStore.theme, (val) => {
  if (vditor.value) {
    // 优化：使用 setTheme API 切换主题，避免销毁编辑器导致内容丢失
    vditor.value.setTheme(val === 'dark' ? 'dark' : 'classic');
  }
})


/** ---------- 生命周期钩子 ---------- */
onMounted(() => {
  initEditor()
})

onBeforeUnmount(() => {
  if (vditor.value) {
    vditor.value.destroy()
    vditor.value = null
  }
})
</script>

<template>
  <div class="vditor-container">
    <div ref="editorRef" class="vditor-editor"></div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.vditor) {
  border: var(--border-base);
  @include mix.radius(md);
  overflow: hidden;
}
:deep(.vditor-toolbar) {
  background-color: var(--bg-base);
  border-bottom: var(--border-base);
}
:deep(.vditor-reset) {
  @include mix.font-style($c: var(--text-subtle));
}
</style>