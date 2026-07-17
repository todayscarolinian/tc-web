"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut, Settings as SettingsIcon, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { STAFF_NAV_ITEMS, CURRENT_STAFF_USER } from "@/src/lib/staff-data";

const ACTIVE_CLASS =
  "data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground data-active:hover:bg-sidebar-primary";

export function StaffSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader>
        <Link href="/staff" className="flex items-center gap-2.5 px-2 py-1.5">
          <Image
            src="/logos/tc-symbol-onblack.png"
            alt=""
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-sm"
          />
          <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-display truncate text-sm font-extrabold tracking-tight text-sidebar-foreground">
              Today&rsquo;s Carolinian
            </span>
            <span className="font-utility text-[10px] font-semibold tracking-wider text-sidebar-foreground/50 uppercase">
              Newsroom CMS
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="px-2">
          {STAFF_NAV_ITEMS.map((item) => {
            const active =
              item.href === "/staff" ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  isActive={active}
                  tooltip={item.label}
                  className={ACTIVE_CLASS}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<SidebarMenuButton size="lg" className="data-popup-open:bg-sidebar-accent" />}
              >
                <Avatar size="sm">
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                    {CURRENT_STAFF_USER.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate text-sm font-bold text-sidebar-foreground">
                    {CURRENT_STAFF_USER.name}
                  </span>
                  <span className="font-utility text-[11px] font-semibold tracking-wide text-sidebar-foreground/50 uppercase">
                    {CURRENT_STAFF_USER.role}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="w-56">
                <DropdownMenuItem render={<Link href="/staff/settings" />}>
                  <User /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/staff/settings" />}>
                  <SettingsIcon /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/" />}>
                  <LogOut /> Back to site
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
