import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.has("auth_token");

  if (!isAuthenticated) {
    redirect('/login');
  }

  return (
    <div style={{ display: "flex", height: "100svh", overflow: "hidden" }}>
      <Sidebar />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100svh", overflow: "hidden" }}>
        <Topbar />
        <div style={{ flex: 1, padding: "24px", overflowX: "hidden", overflowY: "auto", background: "var(--bg)" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
