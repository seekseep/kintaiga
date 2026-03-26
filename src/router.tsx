import { createBrowserRouter } from 'react-router'
import { AuthLayout } from '@/components/layouts/auth-layout'
import { AppLayout } from '@/components/layouts/app-layout'
import { AdminGuard } from '@/components/layouts/admin-guard'
import { NotFound } from '@/components/not-found'
import { LoginPage } from '@/pages/auth/login'
import { SignupPage } from '@/pages/auth/signup'
import { ResetPasswordPage } from '@/pages/auth/reset-password'
import { ConfirmEmailPage } from '@/pages/auth/confirm-email'
import { DashboardPage } from '@/pages/dashboard'
import { ActivityNewPage } from '@/pages/activities/new'
import { ActivityDetailPage } from '@/pages/activities/detail'
import { ProfilePage } from '@/pages/me/profile'
import { InitializePage } from '@/pages/me/initialize'
import { EditNamePage } from '@/pages/me/edit-name'
import { EditIconPage } from '@/pages/me/edit-icon'
import { UserListPage } from '@/pages/users/list'
import { UserNewPage } from '@/pages/users/new'
import { UserDetailPage } from '@/pages/users/detail'
import { ProjectListPage } from '@/pages/projects/list'
import { ProjectNewPage } from '@/pages/projects/new'
import { ProjectDetailPage } from '@/pages/projects/detail'
import { ProjectUserActivitiesPage } from '@/pages/projects/user-activities'

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '/confirm-email', element: <ConfirmEmailPage /> },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'activities/new', element: <ActivityNewPage /> },
      { path: 'activities/:id', element: <ActivityDetailPage /> },
      { path: 'me', element: <ProfilePage /> },
      { path: 'me/initialize', element: <InitializePage /> },
      { path: 'me/name', element: <EditNamePage /> },
      { path: 'me/icon', element: <EditIconPage /> },
      {
        element: <AdminGuard />,
        children: [
          { path: 'users', element: <UserListPage /> },
          { path: 'users/new', element: <UserNewPage /> },
          { path: 'users/:id', element: <UserDetailPage /> },
          { path: 'projects', element: <ProjectListPage /> },
          { path: 'projects/new', element: <ProjectNewPage /> },
          { path: 'projects/:id', element: <ProjectDetailPage /> },
          { path: 'projects/:projectId/user/:userId', element: <ProjectUserActivitiesPage /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])
