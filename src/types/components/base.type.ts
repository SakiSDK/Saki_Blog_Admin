import type { FormRules } from 'element-plus';
import type { UnwrapRef } from 'vue';
import type { JSX } from 'vue/jsx-runtime';
import { z } from 'zod';

export interface Pagination {
  total?: number;         // 数据总数
  currentPage?: number;   // 当前页码
  pageSize?: number;      // 每页显示条数
  pageTotals?: number;    // 总页数
}

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

/** ---------- 通用组件CardHeader Props类型 ---------- */
export interface CardHeaderProps {
  title?: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right'; // 标题对齐
  bordered?: boolean; // 是否展示底部分割线
  padding?: string; // 自定义 padding
  background?: string;
  icon?: string;
}

/** ---------- 通用表单Config ---------- */
export type FormFieldConfig<T = any> = {
  label: string;
  labelWidth?: string;
  icon?: string;
  prop: keyof T & string;
  component: any; // 支持任意 Element Plus 表单组件
  componentProps?: Record<string, any>; // 组件透传属性
  hidden?: boolean; // 是否隐藏字段
  connector?: string;
  children?: Omit<FormFieldConfig<T>, 'children'>[];
  /** 分组 */
  group?: string;
  /** 行号：row */
  row?: number;
  /** 自定义渲染函数 */
  render?: (formData: Record<string, any>) => JSX.Element | string;
};

/** ---------- 通用组件CreateCard ---------- */
// 定义组件 Props 类型
export type CreateCardProps<T = any> = {
  /** 卡片标题 */
  title: string;
  /** 卡片图标 */
  icon: string;
  /** 提交按钮文本 */
  submitText: string;
  /** 重置按钮文本 */
  resetText: string;
  /** 表单初始数据 */
  initialForm: T;
  /** Zod 表单校验 Schema */
  formSchema: z.ZodObject<z.ZodRawShape>;
  /** 表单字段配置 */
  formFields: FormFieldConfig<T>[];
  /** 提交回调函数 */
  onSubmit: (formData: UnwrapRef<T>) => Promise<void> | void;
  /** 可选：自定义表单校验规则（优先级高于 Zod 自动生成） */
  customRules?: FormRules;
  /** 可选：标签宽度 */
  labelWidth?: string;
  /** 可选：标签位置（top/left） */
  labelPosition?: 'top' | 'left';
  showGroupLabel?: boolean;
};


/** ---------- 通用组件SearchCard ---------- */
export interface SearchCardProps<T = any> {
  title: string;
  icon: string;
  submitText: string;
  resetText: string;
  labelWidth: string;
  labelPosition: 'top' | 'left' | 'right';
  initialForm: T;
  formSchema: z.ZodObject<z.ZodRawShape>;
  formFields: FormFieldConfig[];
  onSubmit: (formData: UnwrapRef<T>) => Promise<void> | void;
  customRules?: FormRules;
}


/** ---------- 通用组件ListCard ---------- */
// 通用类型
export interface ListItem {
  id: number | string;
  [key: string]: any;
}
// 列表项类型
export interface TableColumnField {
  label: string;
  prop: string;
  width?: string | number;
  component?: string;
  componentProps?: Record<string, any>;
  render?: (item: ListItem) => string; // 自定义渲染函数
}
// 定义Props
export interface ListCardProps {
  loading: boolean;
  title: string; // 列表标题
  data: ListItem[]; // 列表数据
  columns: TableColumnField[];
  selectedRows: ListItem[];
  icon?: string; // 图标名称
  showSelection?: boolean; // 是否显示多选框
  showPagination?: boolean; // 是否显示分页器
  total?: number;
  pageSize?: number;
  currentPage?: number;
  pageTotals?: number;
  showActionColumn?: boolean; // 是否显示操作列
  actionColumnConfig?: {
    label?: string;
    width?: string | number;
    // 操作按钮配置
    actions?: Array<{
      name: string;
      icon: string;
      tooltip: string;
      confirm?: boolean; // 是否需要确认
      confirmText?: string;
      disabled?: (row: ListItem) => boolean;
      handler: (row: ListItem) => void;
    }>;
  };
  // 头部操作按钮
  headerActions?: Array<{
    name: string;
    icon: string;
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    size?: 'default' | 'small';
    disabled?: boolean;
    handler: () => void;
  }>;
}

// ------------- EditCard类型定义 -------------
/** Props 类型 */
export interface EditCardProps<T = any> {
  /** 弹窗是否可见 (v-model 绑定) */
  isShowEdit: boolean;
  /** 弹窗标题 */
  title?: string;
  headerIcon?: string;
  /** 初始表单数据 (支持 v-model 双向绑定) */
  initialForm: T;
  /** 表单字段配置 */
  formFields: FormFieldConfig[];
  /** Zod 校验 Schema */
  formSchema: z.ZodObject<z.ZodRawShape>;
  /** 自定义校验规则 (优先级高于 Schema) */
  customRules?: FormRules;
  /** 弹窗宽度 */
  width?: string | number;
  /** 标签宽度 */
  labelWidth?: string | number;
  /** 标签位置 */
  labelPosition?: 'left' | 'right' | 'top';
  /** 是否显示取消按钮 */
  showCancelBtn?: boolean;
  /** 是否显示确认按钮 */
  showConfirmBtn?: boolean;
  /** 取消按钮文字 */
  cancelText?: string;
  /** 确认按钮文字 */
  confirmText?: string;
  /** 确认按钮是否禁用 */
  confirmBtnDisabled?: boolean;
  /** 是否点击遮罩层关闭 */
  closeOnClickModal?: boolean;
  /** 是否按ESC关闭 */
  closeOnPressEscape?: boolean;
  /** 是否显示关闭按钮 */
  showCloseBtn?: boolean;
  /** 是否全屏显示 (移动端自动生效) */
  fullscreen?: boolean;
  /** 是否自动重置表单 (弹窗关闭时) */
  autoReset?: boolean;
}