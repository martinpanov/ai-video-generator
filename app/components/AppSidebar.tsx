import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar";
import { SidebarNav } from "./SidebarNav";
import { SidebarFooterContent } from "./SidebarFooterContent";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent className="flex justify-between">
        <SidebarGroup>
          <SidebarGroupLabel>AI Video Generator</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarNav />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarFooterContent />
      </SidebarContent>
    </Sidebar>
  );
}