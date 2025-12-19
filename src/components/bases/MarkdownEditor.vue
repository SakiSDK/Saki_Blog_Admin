<script lang="ts" setup>
import { useVModel } from '@vueuse/core';
import Vditor from 'vditor';
import 'vditor/dist/index.css'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useThemeStore } from '@/stores/theme.store';
import { storeToRefs } from 'pinia';

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
const showToolbar = ref<boolean>(true);
const showExport = ref<boolean>(false);


// 状态管理
const themeStore = useThemeStore();
const { theme } = storeToRefs(themeStore);

// 监听主题变化
watch(() => themeStore.theme, (val) => {
  if (vditor.value) {
    const currentValue = vditor.value.getValue();
    vditor.value.destroy();
    nextTick(() => {
      initEditor();
      vditor.value?.setValue(currentValue);
    });
  }
})


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
      'emoji', 'bold', 'italic', 'strikeThrough', '|',
      'link', 'image', 'code', '|',
      'heading', 'quote', 'list', 'check', '|',
      'fullscreen', 'preview', 'export'
    ],
    height: 600,
    placeholder: '输入 Markdown 内容...',
    upload: {

    },
    after: () => {
      
    }
  })
}
const togglePreview = () => {
  mode.value = mode.value === 'wysiwyg' ? 'ir' : 'sv';
  vditor.value?.setValue(editorContent.value);
}

const saveContent = () => {
  const content = vditor.value?.getValue() || '';
  editorContent.value = content;
  emit('save');
}

const exportToHTML = () => {
  const html = vditor.value?.getHTML() || '';
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `article_${Date.now()}.html`
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const exportToPDF = () => {
  const html = vditor.value?.getHTML() || '';
  const blob = new Blob([html], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `article_${Date.now()}.pdf`
  document.body.appendChild(a);
  a.click();
}

// 监听 editorContent 变化
watch(editorContent, (val) => {
  if(vditor.value && vditor.value.getValue() !== val){
    vditor.value.setValue(val);
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
    
    <div class="vditor-toolbar" v-if="showToolbar">
      <button @click="togglePreview" class="toolbar-btn" :class="{ active: mode === 'sv' }">
        <i class="fas fa-eye"></i>
        <span v-if="mode === 'sv'">预览</span>
        <span v-else>编辑</span>
      </button>
      
      <button @click="saveContent" class="toolbar-btn primary">
        <i class="fas fa-save"></i> 保存
      </button>
      
      <button @click="showExport = true" class="toolbar-btn">
        <i class="fas fa-download"></i> 导出
      </button>
      
      <div v-if="showExport" class="export-options">
        <div class="export-option" @click="exportToHTML">
          <i class="fas fa-file-alt"></i> HTML
        </div>
        <div class="export-option" @click="exportToPDF">
          <i class="fas fa-file-pdf"></i> PDF
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vditor {
  &-container {

  }
  &-editor {

  }
  &-toolbar { 
  
  }
  &-btn {
    &:hover {

    }
    &.active {

    }
    &.primary {

    }
  }
}
.export-options {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: var(--space-sm);
  z-index: 10;
}
.export-option {
  padding: var(--space-sm);
  cursor: pointer;
  transition: background 0.2s;
}
.export-option:hover {
  background-color: var(--gray);
}
</style>