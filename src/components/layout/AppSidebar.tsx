import { useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Clock,
  LayoutDashboard,
  FileText,
  Calendar,
  Megaphone,
  MessageSquare,
  Users,
  CheckSquare,
  LogOut,
  ShieldCheck,
  UserCog,
  ShieldAlert,
} from 'lucide-react';
import { UserRole } from '@/types';

const staffNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Request Leave', url: '/leave/request', icon: FileText },
  { title: 'My Requests', url: '/leave/my-requests', icon: Clock },
  { title: 'Off-Day Schedule', url: '/schedule', icon: Calendar },
  { title: 'Announcements', url: '/announcements', icon: Megaphone },
  { title: 'Feedback', url: '/feedback', icon: MessageSquare },
];

const hrNavItems = [
  { title: 'Dashboard', url: '/hr/dashboard', icon: LayoutDashboard },
  { title: 'Leave Requests', url: '/hr/requests', icon: CheckSquare },
  { title: 'Staff Management', url: '/hr/staff', icon: Users },
  { title: 'Schedule Management', url: '/hr/schedule', icon: Calendar },
  { title: 'Announcements', url: '/hr/announcements', icon: Megaphone },
  { title: 'View Feedback', url: '/hr/feedback', icon: MessageSquare },
];

const superAdminNavItems = [
  { title: 'Dashboard', url: '/super-admin/dashboard', icon: ShieldCheck },
  { title: 'User Admin', url: '/super-admin/users', icon: UserCog },
  { title: 'System Control', url: '/super-admin/system-control', icon: ShieldAlert },
  { title: 'Leave Requests', url: '/hr/requests', icon: CheckSquare },
  { title: 'Staff Management', url: '/hr/staff', icon: Users },
  { title: 'Schedule Management', url: '/hr/schedule', icon: Calendar },
  { title: 'Announcements', url: '/hr/announcements', icon: Megaphone },
  { title: 'View Feedback', url: '/hr/feedback', icon: MessageSquare },
];

const normalizeRole = (role?: UserRole) => (role === 'hr' ? 'hr_admin' : role);

export function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  
  const role = normalizeRole(user?.role);
  const navItems =
    role === 'super_admin'
      ? superAdminNavItems
      : role === 'hr_admin'
        ? hrNavItems
        : staffNavItems;
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Clock className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg text-sidebar-foreground">LeaveEase</h1>
              <p className="text-xs text-sidebar-foreground/60">
                {role === 'super_admin'
                  ? 'Super Admin'
                  : role === 'hr_admin'
                    ? 'HR Admin'
                      : 'Staff Portal'}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {user ? getInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user?.department}
              </p>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
