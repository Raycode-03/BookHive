import React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import NavbarDashboard from "@/components/users/navbarDashboard"
import { AppSidebar } from "@/components/users/sidebar"
import { getUnifiedSession } from "@/lib/getUnifiedSession";
import { redirect } from "next/navigation";
import { Providers } from "../provider";
import { UserProvider } from "@/contexts/UserContext";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const NAVBAR_HEIGHT = 84 // Reduced for better spacing
  const session =await  getUnifiedSession()
  if(!session){
    return redirect('/login');
  }
  // Transform user to ensure it has the right structure
  const user = {
    id: session.user?.id || "",
    name: session.user?.name || "",
    email: session.user?.email || "",
    image: session.user?.image || "",
    isAdmin: session.user?.isAdmin || false,
    packageType: session.user?.packageType || "free" // if you have packageType
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar userRole={user.isAdmin ? "admin" : "user"} />
      <SidebarInset>
        <NavbarDashboard user={user} pageTitle="Resources" searchBooks={true}/>
        <div style={{ paddingTop: NAVBAR_HEIGHT }}>
          <Providers>
             <UserProvider user={user}>
            {children}
            </UserProvider>
          </Providers>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}