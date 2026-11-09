import type { RouteRecordRaw } from 'vue-router'
import { platformExtras } from './platform-extras'
const Layout=()=>import('./layout/Layout.vue')
export const completePlatformRoutes: RouteRecordRaw[]=[
 { path:'/login', name:'Login', component:()=>import('./views/Login/Login.vue'), meta:{public:true,hidden:true,title:'登录'} },
 { path:'/social-login', name:'SocialLogin', component:()=>import('./views/Login/SocialLogin.vue'),meta:{public:true,hidden:true} },
 { path:'/redirect/:path(.*)', name:'Redirect', component:()=>import('./views/Redirect/Redirect.vue'),meta:{public:true,hidden:true} },
 { path:'/', name:'Home',component:Layout,redirect:'/index',children:[
  {path:'index',alias:['/home'],name:'HomeDashboard',component:()=>import('./views/Home/Index.vue'),meta:{title:'首页',icon:'ep:home-filled',affix:true}},
  {path:'/user/profile',alias:['/profile'],name:'Profile',component:()=>import('./views/Profile/Index.vue'),meta:{title:'个人中心',hidden:true}},
  ...platformExtras
 ]},
 {path:'/:pathMatch(.*)*',name:'NoFound',component:()=>import('./views/Error/404.vue'),meta:{hidden:true,title:'页面不存在'}}
]
export const platformViewComponents=import.meta.glob('./views/**/*.{vue,tsx}')
