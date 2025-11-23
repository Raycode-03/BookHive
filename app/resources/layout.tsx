import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import NavbarDashboard from "@/components/users/navbarDashboard"
import { AppSidebar } from "@/components/users/sidebar"
import { getUnifiedSession } from "@/lib/getUnifiedSession";
import { redirect } from "next/navigation";
import { Providers } from "../provider";
export default async function Layout({ children }: { children: React.ReactNode }) {
  const NAVBAR_HEIGHT = 84 // Reduced for better spacing
  const session =await  getUnifiedSession()
  if(!session){
    return redirect('/login');
  }
  const user = session?.user;
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar userRole={user.isAdmin ? "admin" : "user"} />
      <SidebarInset>
        <NavbarDashboard user={user} pageTitle="Resources" searchBooks={true}/>
        <div style={{ paddingTop: NAVBAR_HEIGHT }}>
          <Providers>
            {children}
          </Providers>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}