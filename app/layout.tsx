import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sufra Farms — Farm Management",
  description: "Manage egg production and sales for Sufra Farms.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.has("auth_token");

  return (
    <html lang="en">
      <body className={dmSans.className} style={{ background: "var(--bg)", minHeight: "100svh" }}>
        {isAuthenticated ? (
          <div style={{ display: "flex", height: "100svh", overflow: "hidden" }}>
            <Sidebar />
            <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100svh", overflow: "hidden" }}>
              <Topbar />
              <div style={{ flex: 1, padding: "24px", overflowX: "hidden", overflowY: "auto" }}>
                {children}
              </div>
            </main>
          </div>
        ) : (
          <main style={{ minHeight: '100svh', background: 'var(--grey-bg)' }}>
            {children}
          </main>
        )}
      </body>
    </html>
  );
}
