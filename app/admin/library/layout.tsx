import NavbarDashboard from "@/components/users/navbarDashboard";
import { getUnifiedSession } from "@/lib/getUnifiedSession";
import { redirect } from "next/navigation";
export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getUnifiedSession();
  if (!session) {
    return redirect("/login");
  }

  const user = session.user;

  return (
    <>
        <NavbarDashboard user={user} pageTitle="Admin Library" searchBooks={true}/>
        <div>
          {children}
        </div>
    </>
  );
}
