import { v4 as uuidv4 } from 'uuid'


/** 编辑会话编辑器 */
export class EditSessionStorage {
  private static readonly SESSION_PREFIX = 'edit_session_';
  private static readonly SESSION_EXPIRE_DAYS = 7; // 会话有效期7天

  /**
   * 获取或创建编辑会话ID
   * @param articleId 文章ID（新文章为null）
   * @param userId 用户ID（用于区分不同用户）
   */
  static getOrCreateSessionId(articleId: string | null, userId: string): string {
    const storageKey = this.getStorageKey(articleId, userId);
    
    // 尝试从本地存储获取
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const sessionData = JSON.parse(stored);
      
      // 检查是否过期
      if (this.isSessionExpired(sessionData.createdAt)) {
        // 过期则创建新的
        return this.createNewSession(articleId, userId, storageKey);
      }
      
      return sessionData.sessionId;
    }
    
    // 没有存储或已过期，创建新的
    return this.createNewSession(articleId, userId, storageKey);
  }
  
  /**
   * 更新编辑会话
   */
  static updateSession(
    articleId: string | null, 
    userId: string, 
    sessionId?: string
  ): string {
    const finalSessionId = sessionId || uuidv4();
    const storageKey = this.getStorageKey(articleId, userId);
    
    const sessionData = {
      sessionId: finalSessionId,
      articleId,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(storageKey, JSON.stringify(sessionData));
    return finalSessionId;
  }
  
  /**
   * 清除编辑会话
   */
  static clearSession(articleId: string | null, userId: string): void {
    const storageKey = this.getStorageKey(articleId, userId);
    localStorage.removeItem(storageKey);
  }
  
  /**
   * 获取用户的所有编辑会话
   */
  static getUserSessions(userId: string): Array<{
    articleId: string | null;
    sessionId: string;
    createdAt: string;
  }> {
    const sessions = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${this.SESSION_PREFIX}${userId}_`)) {
        try {
          const data = JSON.parse(localStorage.getItem(key)!);
          sessions.push(data);
        } catch {
          // 忽略解析错误
        }
      }
    }
    
    return sessions;
  }
  
  /**
   * 清理过期的编辑会话
   */
  static cleanupExpiredSessions(): number {
    const now = new Date();
    let cleaned = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.SESSION_PREFIX)) {
        try {
          const data = JSON.parse(localStorage.getItem(key)!);
          if (this.isSessionExpired(data.createdAt)) {
            localStorage.removeItem(key);
            cleaned++;
          }
        } catch {
          localStorage.removeItem(key!);
          cleaned++;
        }
      }
    }
    
    return cleaned;
  }
  
  /** 私有方法 */
  private static getStorageKey(articleId: string | null, userId: string): string {
    const articlePart = articleId ? `_${articleId}` : '_new';
    return `${this.SESSION_PREFIX}${userId}${articlePart}`;
  }
  
  private static createNewSession(
    articleId: string | null, 
    userId: string, 
    storageKey: string
  ): string {
    const sessionId = uuidv4();
    const sessionData = {
      sessionId,
      articleId,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(storageKey, JSON.stringify(sessionData));
    return sessionId;
  }
  
  private static isSessionExpired(createdAt: string): boolean {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > this.SESSION_EXPIRE_DAYS;
  }
}