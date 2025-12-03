/** ---------- Icon组件Props类型 ---------- */
export interface IconProps {
  // 图标名称 (对应 symbol 的 id: #icon-xxx)
  name: string;
  // 图标颜色 (默认继承父元素颜色)
  color?: string;
  // 图标大小 (默认 1em)
  size?: string | number;
  // 额外类名
  className?: string;
  // 图标标题 (无障碍访问)
  title?: string;
}


/** ---------- AsideBar组件Item ---------- */
export interface MenuItem {
  index: string;
  icon: string;
  label: string;
  children?: MenuItem[];
  badge?: number;
}