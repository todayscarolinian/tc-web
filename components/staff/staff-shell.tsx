import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { StaffSidebar } from "@/components/staff/staff-sidebar";

export function StaffShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <StaffSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
