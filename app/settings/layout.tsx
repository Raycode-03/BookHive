import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/users/sidebar";
import { getUnifiedSession } from "@/lib/getUnifiedSession";
import NavbarDashboard from "@/components/users/navbarDashboard";
import { redirect } from "next/navigation";
export default async function Layout({ children }: { children: React.ReactNode }) {
  const NAVBAR_HEIGHT = 80; // Reduced for better spacing
  const session = await getUnifiedSession();
  if (!session) {
    return redirect("/login");
  }

  const user = session.user;

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar userRole={user.isAdmin ? "admin" : "user"} />
      <SidebarInset>
        <NavbarDashboard user={user} pageTitle="Settings" />
        <div style={{ paddingTop: NAVBAR_HEIGHT }}>
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
