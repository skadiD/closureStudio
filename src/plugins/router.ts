import { createRouter, createWebHistory } from "vue-router";
declare module 'vue-router' {
    interface RouteMeta {
        noAuth?: boolean
        title?: string
    }
}
export const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: () => import("../components/layout/BaseLayout.vue"),
            children: [{
                path: '/',
                name: '首页',
                component: () => import('../views/Index.vue')
            }, {
                path: '/blog/Terms&Policies',
                name: '用户条款及隐私政策',
                component: () => import('../views/blog/TermsPolicies.vue')
            }, {
                path: '/blog/FAQ',
                name: '常见问题',
                component: () => import('../views/blog/FAQ.vue')
            }, {
                path: '/profile',
                name: '个人设置',
                component: () => import('../views/user/Profile.vue'),
                children: [{
                    path: '/profile/account',
                    name: '账号安全',
                    component: () => import('../views/user/ProfileAccount.vue')
                }, {
                    path: '/profile/smsVerify',
                    name: '账号认证',
                    component: () => import('../views/user/ProfileSMS.vue')
                }]
            }, {
                path: '/dashboard',
                name: '控制面板',
                component: () => import('../views/user/Dashboard.vue'),
            }]
        }
    ],
});
