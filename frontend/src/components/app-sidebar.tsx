"use client";

import * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  SquareTerminal,
  Settings2,
  Hexagon,
  User,
} from "lucide-react";

const navData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard", 
      icon: SquareTerminal,
    },
    {
      title: "Profile",
      url: "/dashboard/profile", 
      icon: User,
    },
    {
      title: "Documentation",
      url: "/dashboard/docs", 
      icon: BookOpen,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user, isLoading } = useAuth();

 return (
    <Sidebar collapsible="icon" {...props}>
      {/* --- LOGO FIX --- */}
      <SidebarHeader>
        <a href="/dashboard" className="flex h-14 items-center justify-center group-data-[state=expanded]:justify-start group-data-[state=expanded]:px-3">
            <Hexagon className="size-8 text-primary fill-background flex items-center justify-center"/>
          <span className="ml-2 text-lg font-semibold group-data-[state=collapsed]:hidden">
            Hive
          </span>
        </a>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        {isLoading ? (
          <Skeleton className="h-14 w-full" />
        ) : user ? (
          <NavUser user={user} />
        ) : null}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
