import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './core/guards';
import { AdminLayout } from './layout/admin-layout';
import { CustomerLayout } from './layout/customer-layout';
import { PublicLayout } from './layout/public-layout';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', loadComponent: () => import('./features/home/home').then(m => m.HomePage) },
      { path: 'about', loadComponent: () => import('./features/about/about').then(m => m.AboutPage) },
      { path: 'services', loadComponent: () => import('./features/services/services-list').then(m => m.ServicesListPage) },
      { path: 'services/:slug', loadComponent: () => import('./features/services/service-detail').then(m => m.ServiceDetailPage) },
      { path: 'request-service', loadComponent: () => import('./features/services/request-service').then(m => m.RequestServicePage) },
      { path: 'projects', loadComponent: () => import('./features/projects/projects').then(m => m.ProjectsPage) },
      { path: 'training', loadComponent: () => import('./features/training/training').then(m => m.TrainingPage) },
      { path: 'careers', loadComponent: () => import('./features/careers/careers').then(m => m.CareersPage) },
      { path: 'blog', loadComponent: () => import('./features/blog/blog').then(m => m.BlogPage) },
      { path: 'blog/:slug', loadComponent: () => import('./features/blog/blog-post').then(m => m.BlogPostPage) },
      { path: 'contact', loadComponent: () => import('./features/contact/contact').then(m => m.ContactPage) },
      { path: 'verify-certificate/:no', loadComponent: () => import('./features/training/verify-certificate').then(m => m.VerifyCertificatePage) },
      { path: 'auth/login', canActivate: [guestGuard], loadComponent: () => import('./features/auth/login').then(m => m.LoginPage) },
      { path: 'auth/register', canActivate: [guestGuard], loadComponent: () => import('./features/auth/register').then(m => m.RegisterPage) }
    ]
  },
  {
    path: 'customer',
    component: CustomerLayout,
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./features/customer/dashboard').then(m => m.CustomerDashboardPage) },
      { path: 'requests', loadComponent: () => import('./features/customer/requests').then(m => m.CustomerRequestsPage) },
      { path: 'quotations', loadComponent: () => import('./features/customer/quotations').then(m => m.CustomerQuotationsPage) }
    ]
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: [
      { path: '', loadComponent: () => import('./features/admin/dashboard').then(m => m.AdminDashboardPage) },
      { path: 'service-requests', loadComponent: () => import('./features/admin/service-requests').then(m => m.AdminServiceRequestsPage) },
      { path: 'services', loadComponent: () => import('./features/admin/services').then(m => m.AdminServicesPage) },
      { path: 'customers', loadComponent: () => import('./features/admin/customers').then(m => m.AdminCustomersPage) },
      { path: 'machines', loadComponent: () => import('./features/admin/machines').then(m => m.AdminMachinesPage) },
      { path: 'quotations', loadComponent: () => import('./features/admin/quotations').then(m => m.AdminQuotationsPage) },
      { path: 'projects', loadComponent: () => import('./features/admin/projects').then(m => m.AdminProjectsPage) },
      { path: 'work-orders', loadComponent: () => import('./features/admin/work-orders').then(m => m.AdminWorkOrdersPage) },
      { path: 'inventory', loadComponent: () => import('./features/admin/inventory').then(m => m.AdminInventoryPage) },
      { path: 'finance', loadComponent: () => import('./features/admin/finance').then(m => m.AdminFinancePage) },
      { path: 'training', loadComponent: () => import('./features/admin/training').then(m => m.AdminTrainingPage) },
      { path: 'staffing', loadComponent: () => import('./features/admin/staffing').then(m => m.AdminStaffingPage) },
      { path: 'cms', loadComponent: () => import('./features/admin/cms').then(m => m.AdminCmsPage) },
      { path: 'reports', loadComponent: () => import('./features/admin/reports').then(m => m.AdminReportsPage) }
    ]
  },
  { path: '**', redirectTo: '' }
];
