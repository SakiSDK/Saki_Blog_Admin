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


/** ---------- 状态管理 ---------- */
const themeStore = useThemeStore();
const { theme } = storeToRefs(themeStore);


/** ---------- 方法定义 ---------- */
// 自动为删除图片按钮添加点击事件
const processExisitingImage = () => {
  // 绑定所有已存在的删除按钮
  document.querySelectorAll('.vditor-image-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      console.log("点击了删除按钮");
      e.stopPropagation();
      const wrapper = (e.target as HTMLElement).closest('.vditor-image-wrapper');
      const imageUrl = wrapper?.getAttribute('data-image-url');
      const filename = imageUrl?.split('/').pop();
      console.log("删除图片路径:", filename);
      if (wrapper && filename) {
        // 删除操作
        //? 保存图片的时候记得删除这个按钮
        try {
          const res = await UploadApi.deleteArticleImage(filename);
          if (res.success || true) {
            vditor.value?.tip('删除成功', 2000);
            // 删除编辑器中对应的文本内容
            // vditor.value?.deleteValue(wrapper.textContent);
            deleteImageFromEditor(imageUrl!);
          } else {
            vditor.value?.tip(res.message || '删除失败');
          }
        } catch (error) {
          console.error(error);
          vditor.value?.tip('删除过程中发生错误');
        }
      }
    })
  })
}
const deleteImageFromEditor = (imageUrl: string) => {
  if (!vditor.value || !imageUrl) return;
  const md = vditor.value.getValue();
  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedUrl = escapeRegExp(imageUrl);
  /**
   * 匹配完整 <figure>...</figure>，并允许前后有空行
   */
  const figureRegex = new RegExp(
    `<figure[^>]*data-image-url="${escapedUrl}"[\\s\\S]*?<\\/figure>\\s*`,
    'g'
  );

  const newMd = md.replace(figureRegex, '');

  vditor.value.setValue(newMd);
}

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
    preview: {
      markdown: {
        sanitize: false, // 允许 HTML 标签和属性
        
      }
    },
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
          const res = await UploadApi.uploadArticleImage(file);
          
          if (res.success && res.data?.url) {
            // 使用 img 标签插入，避免多行 HTML 和 div 导致 Vditor 解析失败
            // 同时处理文件名中的特殊字符
            const safeName = file.name.replace(/[\[\]\(\)]/g, '').replace(/\s/g, '_');
            const imgUrl = res.data.url;
            
            // Vditor 的安全机制可能会清洗 style 属性，尝试使用 width 属性替代
            const html = `
              <figure class="vditor-image-wrapper" data-image-url="${imgUrl}">
                <img
                  src="${imgUrl}" 
                  alt="${safeName}" 
                  class="vditor-image"
                  width="60%"
                />
                <button 
                  type="button" 
                  class="vditor-image-delete"
                >
                  删除图片
                </button>
              </figure>
            `;
            
            // 清除提示并显示成功
            vditor.value?.tip('上传成功', 2000);
            vditor.value?.insertValue(html);
            processExisitingImage();
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
  console.log(val)
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
  processExisitingImage();
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
:deep(.vditor-image-wrapper) {
  position: relative;
}
:deep(.vditor-image-delete) {
  @include mix.position-style($p: absolute, $t: sm, $l: sm);
  @include mix.padding(xs);
  @include mix.radius(sm);
  background-color: var(--bg-weak);
  color: var(--text-subtle);
  @include anim.transition;
  @include hov.bg(var(--primary-base));
  @include hov.color(var(--white-base));
}
</style>