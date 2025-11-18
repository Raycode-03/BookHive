"use client"

import { 
  Home, 
  LibraryBig, 
  Settings, 
  X,
  BookOpen,
  
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const userItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Resources", url: "/resources", icon: LibraryBig },
  { title: "My Library", url: "/dashboard", icon: BookOpen },
  { title: "Settings", url: "/settings", icon: Settings },
]

const adminItems = [
  { title: "Home", url: "/admin/dashboard", icon: Home },
  { title: "Library Management", url: "/admin/library", icon: LibraryBig },
  { title: "Settings", url: "/admin/settings", icon: Settings },
]


export function AppSidebar({ userRole }) {
  const { state, setOpen } = useSidebar()
  const isCollapsed = state === "collapsed"

  // Role-based menu
  const menuItems = userRole === "admin" ? adminItems : userItems

  return (
    <Sidebar
      collapsible="icon"
      className="h-screen shadow-xl transition-all duration-200 "
    >
      {/* Header Section */}
      <div className="flex items-center p-6 ">
        {!isCollapsed && (
          <Link href="/">
          <div className="flex items-center gap-3 flex-1">
            <Image src="/logos/book.png" alt="BookHive logo" width={30} height={30} />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              BookHive
            </span>
          </div>
          </Link>
        )}
      </div>

      {/* Navigation Content */}
      <SidebarContent className="flex-1 ">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
              Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent className="mt-2">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                        isCollapsed ? 'justify-center' : ''
                      }`}
                    >
                      <item.icon size={20} className="text-gray-700 dark:text-white" />
                      {!isCollapsed && (
                        <span className="font-medium text-gray-700 dark:text-white">
                          {item.title}
                        </span>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}