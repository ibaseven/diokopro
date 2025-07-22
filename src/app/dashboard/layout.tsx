


// app/dashboard/layout.tsx (Server Component)
import { getAuthenticatedUser } from "@/lib/auth";
import SidebarDashboard from "./_components/sidebar";


export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getAuthenticatedUser();

  return (
    <SidebarDashboard currentUser={currentUser}>
      {children}
    </SidebarDashboard>
  );
}