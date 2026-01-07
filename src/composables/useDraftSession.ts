import { ref, toRaw } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus';
import { EditContextStorage } from '@/utils/sessionStorage.util';


/** ---------- 类型定义 ---------- */
/** 草稿会话数据结构 */
export interface DraftData {
  /** 表单数据 */
  form: Record<string, any>
  /** 内容 */
  content: string
  /** updatedAt */
  updatedAt: string
}


/** ---------- 相关逻辑函数定义 ---------- */

export const useDraftSession = (
  articleId: string | null, 
  userId: string,
  onRestore?: (draft: DraftData) => void
) => { 
  /** 草稿会话ID */
  const sessionId = ref<string | null>(null)
  /** 会话ID加载状态 */
  const isSessionLoading = ref<boolean>(true)
  /** 上次保存时间 */
  const lastSavedAt = ref<string | null>(null)

  // 初始化会话（含草稿检测和恢复）
  const initializeSession = async () => {
    if (!userId) {
      isSessionLoading.value = false
      return;
    }

    const sid = EditContextStorage.getOrCreateSessionId(articleId, userId)
    const draftKey = `draft_${sid}`
    const hasDraft = !!localStorage.getItem(draftKey)

    if (hasDraft) {
      try {
        await ElMessageBox.confirm(
          '检测到您有未完成的草稿，是否恢复编辑？',
          '发现草稿',
          {
            confirmButtonText: '恢复编辑',
            cancelButtonText: '创建新文章',
            type: 'info',
            distinguishCancelAndClose: true,
            closeOnClickModal: false,
            closeOnPressEscape: false,
            showClose: true,
          }
        )

        // 用户选择恢复
        sessionId.value = sid
        loadDraft()
      } catch (action) {
        // 用户点击“创建新文章”
        if (action === 'cancel') {
          localStorage.removeItem(draftKey);
          EditContextStorage.clearSession(articleId, userId);
          
          sessionId.value = EditContextStorage.getOrCreateSessionId(articleId, userId);
          lastSavedAt.value = '';
          ElMessage.success('已创建新文章草稿');
        }
      }
    } else {
      sessionId.value = sid;
    }
    isSessionLoading.value = false;
  }

  // 加载草稿
  const loadDraft = () => {
    if (!sessionId.value) return;
    const draftKey = `draft_${sessionId.value}`;
    const storedData = localStorage.getItem(draftKey);
    if (!storedData) return;
    
    try {
      const draftData = JSON.parse(storedData) as DraftData; 
      /** 恢复草稿数据，使用回调 */
      if (onRestore) {
        onRestore(draftData);
      }
      /** 显示上次保存时间 */
      if (draftData.updatedAt) {
        lastSavedAt.value = new Date(draftData.updatedAt).toLocaleString();
      }
    } catch (error) {
      const message = '草稿数据格式错误，请检查';
      ElMessage.error(message);
    }
  }

  // 保存草稿（有防抖）
  const saveDraft = async (form: any, content: string) => { 
    if (!sessionId.value || !userId) return; 
    
    const draftKey = `draft_${sessionId.value}`;
    const now = new Date();
    const draftData: DraftData = {
      form: toRaw(form),
      content: content,
      updatedAt: now.toISOString(),
    };

    localStorage.setItem(draftKey, JSON.stringify(draftData));
    EditContextStorage.updateSession(articleId, userId, sessionId.value);
    lastSavedAt.value = now.toLocaleString();
  };

  // 手动保存（立即执行）
  const handleManualSave = (form: any, content: string) => {
    saveDraft(form, content);
    ElMessage.success('草稿保存成功');
  }

  // 清除当前会话和草稿
  const clearSession = () => {
    if (!sessionId.value) return;
    localStorage.removeItem(`draft_${sessionId.value}`);
    EditContextStorage.clearSession(articleId, userId);
    sessionId.value = null;
    lastSavedAt.value = '';
  };

  // 清理所有过期会话（可选暴露）
  const cleanupExpiredSessions = () => {
    EditContextStorage.cleanupExpiredSessions();
  };
  return {
    sessionId,
    isSessionLoading,
    lastSavedAt,
    initializeSession,
    handleManualSave,
    clearSession,
    cleanupExpiredSessions,
    // 如果需要外部调用 saveDraft（比如配合 debounce），也可暴露
    saveDraftRaw: saveDraft,
  };
}