import { NavLink, useLocation } from "react-router-dom";
import { Settings, Users, ClipboardList, Wrench, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "@/hooks/useAuth";

export function AdminSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { isAdmin, isEmployee, isTechnician, role } = useRole();
  const { signOut } = useAuth();

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  // Define menu items based on role
  const getMenuItems = () => {
    const items = [
      { 
        title: "Dashboard", 
        url: "/admin/dashboard", 
        icon: ClipboardList,
        roles: ['main_administrator', 'employee', 'service_technician']
      },
    ];

    if (isAdmin()) {
      items.push(
        { 
          title: "User Management", 
          url: "/admin/users", 
          icon: Users,
          roles: ['main_administrator']
        },
        { 
          title: "Settings", 
          url: "/admin/settings", 
          icon: Settings,
          roles: ['main_administrator']
        }
      );
    }

    if (isTechnician()) {
      items.push({
        title: "My Assignments",
        url: "/admin/assignments",
        icon: Wrench,
        roles: ['service_technician']
      });
    }

    return items.filter(item => item.roles.includes(role as string));
  };

  const menuItems = getMenuItems();
  const isExpanded = menuItems.some((item) => isActive(item.url));

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar>
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              {role?.replace('_', ' ')} Panel
            </span>
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}