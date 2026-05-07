import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/login-success',
    name: 'LoginSuccess',
    component: {
      render: () => null,
      created() {
        const token = new URLSearchParams(window.location.search).get('token');
        if (token) {
          localStorage.setItem('token', token);
          this.$router.push('/');
        } else {
          this.$router.push('/login');
        }
      }
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token');
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;
