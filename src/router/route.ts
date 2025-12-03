import type { RouteRecordRaw } from 'vue-router';
import Login from '@/views/login/Login.vue';
import Dashboard from '@/views/dashboard/Dashboard.vue';
import ArticleCreate from '@/views/articles/ArticleCreate.vue';
import ArticleList from '@/views/articles/ArticleList.vue';
import ArticleEdit from '@/views/articles/ArticleEdit.vue';
import ArticleDraft from '@/views/articles/ArticleDraft.vue';
import Album from '@/views/albums/Album.vue';
import Category from '@/views/categories/Category.vue';
import Tag from '@/views/tags/Tag.vue';
import BasicSettings from '@/views/settings/BasicSettings.vue';
import UploadSettings from '@/views/settings/UploadSettings.vue';
import EmailSettings from '@/views/settings/EmailSettings.vue';
import SeoSettings from '@/views/settings/SeoSettings.vue';
import NotFound404 from '@/views/errors/NotFound404.vue';


/** ---------- 路由配置 ---------- */
const routes: RouteRecordRaw[] = [
  // 根路由重定向到控制台
  {
    path: '/',
    redirect: '/dashboard',
    meta: {
      // requiresAuth: true, // 需要登录后才能访问
      //? 开发环境测试用
      requiresAuth: false, // 需要登录后才能访问
    }
  },
  // 登录页
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresAuth: false, // 不需要登录后才能访问,
      title: '登录 - 博客后台博客管理'
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      // requiresAuth: true, // 需要登录
      //? 测试环境
      requiresAuth: false,
      title: '控制台', // 面包屑和页面标题使用
      roles: ['admin', 'editor'], // 允许访问的角色（admin/编辑）
    },
  },
  // 文章管理（嵌套路由）
  {
    path: '/article',
    name: 'Article',
    redirect: '/article/list', // 默认重定向到文章列表
    meta: {
      // requiresAuth: true,
      //? 测试环境
      requiresAuth: false,
      title: '文章管理',
      roles: ['admin', 'editor'],
    },
    children: [
      {
        path: 'list',
        name: 'ArticleList',
        component: ArticleList,
        meta: { title: '文章列表' },
      },
      {
        path: 'create',
        name: 'ArticleCreate',
        component: ArticleCreate,
        meta: { title: '新增文章' },
      },
      {
        path: 'edit/:id', // 动态路由（编辑文章，携带文章 ID）
        name: 'ArticleEdit',
        component: ArticleEdit,
        meta: { title: '编辑文章' },
      },
      {
        path: 'draft',
        name: 'ArticleDraft',
        component: ArticleDraft,
        meta: { title: '草稿箱' },
      },
      {
        path: 'category',
        name: 'Category',
        component: Category,
        meta: {title: '分类管理'},
      },
      {
        path: 'tag',
        name: 'Tag',
        component: Tag,
        meta: {title: '标签管理'},
      }
    ],
  },
  // 相册管理
  {
    path: '/album',
    name: 'Album',
    component: Album,
    meta: {
      // requiresAuth: true,
      //? 测试环境
      requiresAuth: false,
      title: '相册管理',
      roles: ['admin'], // 仅管理员可访问
    },
  },
  // 系统设置（嵌套路由）
  {
    path: '/setting',
    name: 'Setting',
    redirect: '/setting/basic',
    meta: {
      // requiresAuth: true,
      //? 测试环境
      requiresAuth: false,
      title: '系统设置',
      roles: ['admin'], // 仅管理员可访问
    },
    children: [
      {
        path: 'basic',
        name: 'SettingBasic',
        component: BasicSettings,
        meta: { title: '基础设置' },
      },
      {
        path: 'upload',
        name: 'SettingsUpload',
        component: UploadSettings,
        meta: { title: '上传设置' },
      },
      {
        path: 'email',
        name: 'SettingEmail',
        component: EmailSettings,
        meta: { title: '邮箱设置' },
      },
      {
        path: 'seo',
        name: 'SettingSeo',
        component: SeoSettings,
        meta: { title: 'SEO 设置' },
      },
    ]
  },
  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound404,
    meta: {
      title: '404 - 页面不存在',
    },
  },
]

export default routes;