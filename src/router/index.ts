import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage.vue')
  },
  {
    path: '/student',
    name: 'StudentDashboard',
    component: () => import('../views/student/StudentDashboard.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/teacher',
    name: 'TeacherDashboard',
    component: () => import('../views/teacher/TeacherDashboard.vue'),
    meta: { requiresAuth: true, role: 'teacher' }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Firebase-aware guard (session persisted in localStorage by useAuth)
router.beforeEach((to, _from, next) => {
  const session = localStorage.getItem('user_auth');
  const userRole = localStorage.getItem('user_role');

  if (to.meta.requiresAuth && !session) {
    next('/login');
    return;
  }

  if (to.path === '/login' && session && userRole) {
    next(userRole === 'teacher' ? '/teacher' : '/student');
    return;
  }

  if (to.meta.role && userRole && to.meta.role !== userRole) {
    next(userRole === 'teacher' ? '/teacher' : '/student');
    return;
  }

  next();
});

export default router;
