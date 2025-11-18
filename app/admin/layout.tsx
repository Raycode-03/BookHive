import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import NavbarDashboard from "@/components/users/navbarDashboard";
import { AppSidebar } from "@/components/users/sidebar";
import { getUnifiedSession } from "@/lib/getUnifiedSession";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const NAVBAR_HEIGHT = 84; // Reduced for better spacing
  const session = await getUnifiedSession();
  if (!session) {
    return redirect("/login");
  }

  const user = session.user;

  return (
    <SidebarProvider>
      <AppSidebar userRole={user.isAdmin ? "admin": ""} />
      <SidebarInset>
        <NavbarDashboard user={user} pageTitle="Admin Dashboard"/>
        <div style={{ paddingTop: NAVBAR_HEIGHT }}>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
