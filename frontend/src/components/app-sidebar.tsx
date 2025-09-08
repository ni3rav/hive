"use client";

import * as React from "react";
import {
  Bot,
  BookOpen,
  SquareTerminal,
  Settings2,
  Hexagon,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// Updated and simplified data for navigation
const data = {
  user: {
    name: "Hive User",
    email: "",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard", // Updated URL
      icon: SquareTerminal,
    },
    {
      title: "Profile",
      url: "/dashboard/profile", // Updated URL
      icon: Bot,
    },
    {
      title: "Documentation",
      url: "/dashboard/docs", // Updated URL
      icon: BookOpen,
    },
    {
      title: "Settings",
      url: "/dashboard/settings", // Updated URL
      icon: Settings2,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex h-10 items-center gap-2 rounded-lg px-3 text-lg font-medium">
            <Hexagon className="size-8 text-primary fill-background flex items-center justify-center"/>
          <span>Hive</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
