import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guest: true }
    },
    {
      path: '/admin',
      name: 'AdminLayout',
      component: () => import('@/views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        {
          path: '',
          name: 'AdminHome',
          component: () => import('@/views/admin/DashboardView.vue')
        },
        {
          path: 'products',
          name: 'AdminProducts',
          component: () => import('@/views/admin/ProductsView.vue')
        },
        {
          path: 'staff',
          name: 'AdminStaff',
          component: () => import('@/views/admin/StaffView.vue')
        },
        {
          path: 'invoices',
          name: 'AdminInvoices',
          component: () => import('@/views/admin/InvoicesView.vue')
        },
        {
          path: 'revenue',
          name: 'AdminRevenue',
          component: () => import('@/views/admin/RevenueView.vue')
        },
        {
          path: 'shift-reports',
          name: 'AdminShiftReports',
          component: () => import('@/views/admin/ShiftReportsView.vue')
        },
        {
          path: 'vouchers',
          name: 'AdminVouchers',
          component: () => import('@/views/admin/VouchersView.vue')
        }
      ]
    },
    {
      path: '/client',
      name: 'ClientLayout',
      component: () => import('@/views/client/ClientLayout.vue'),
      meta: { requiresAuth: true, role: 'staff' },
      children: [
        {
          path: '',
          name: 'ClientHome',
          component: () => import('@/views/client/SelectTableView.vue')
        },
        {
          path: 'order/:tableId',
          name: 'ClientOrder',
          component: () => import('@/views/client/OrderView.vue'),
          props: true
        },
        {
          path: 'summary',
          name: 'ClientSummary',
          component: () => import('@/views/client/SummaryView.vue')
        }
      ]
    }
  ]
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // Wait for auth initialization to complete
  if (!authStore.isInitialized) {
    // Poll until initialization is complete
    let attempts = 0
    const maxAttempts = 50 // 5 seconds max wait

    while (!authStore.isInitialized && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  // Check role permissions
  if (to.meta.requiresAuth && to.meta.role) {
    const requiredRole = to.meta.role as string
    if (authStore.userRole !== requiredRole) {
      if (authStore.userRole === 'admin') {
        next('/admin')
      } else {
        next('/client')
      }
      return
    }
  }

  // Redirect authenticated users from login
  if (to.meta.guest && authStore.isAuthenticated) {
    if (authStore.userRole === 'admin') {
      next('/admin')
    } else {
      next('/client')
    }
    return
  }

  next()
})

export default router
