import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <Header
          userName="Local User"
          userEmail="offline@local.dev"
        />
        <main className="flex-1 p-3 sm:p-4 lg:p-6 main-content-mobile">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

