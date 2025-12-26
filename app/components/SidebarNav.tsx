"use client";

import { Bot, ClipboardList, Video } from "lucide-react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    title: "Generate Clips",
    url: "/",
    icon: Bot,
  },
  {
    title: "Clips",
    url: "/clips",
    icon: Video,
  },
  {
    title: "Todos",
    url: "/todos",
    icon: ClipboardList
  }
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive = pathname === item.url;
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={isActive}>
              <Link href={item.url}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
