import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { UserRole } from '@/types';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  requireRole?: UserRole;
  requireRoles?: UserRole[];
}

const normalizeRole = (role?: UserRole) => (role === 'hr' ? 'hr_admin' : role);

export function AppLayout({ children, title, requireRole, requireRoles }: AppLayoutProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const normalizedUserRole = normalizeRole(user?.role);
  const normalizedSingleRole = normalizeRole(requireRole);
  const normalizedRoleList = (requireRoles || []).map((role) => normalizeRole(role));

  if (normalizedSingleRole && normalizedUserRole !== normalizedSingleRole) {
    return <Navigate to={normalizedUserRole === 'super_admin' ? '/super-admin/dashboard' : normalizedUserRole === 'hr_admin' ? '/hr/dashboard' : '/dashboard'} replace />;
  }

  if (normalizedRoleList.length > 0 && (!normalizedUserRole || !normalizedRoleList.includes(normalizedUserRole))) {
    return <Navigate to={normalizedUserRole === 'super_admin' ? '/super-admin/dashboard' : normalizedUserRole === 'hr_admin' ? '/hr/dashboard' : '/dashboard'} replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium">{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
