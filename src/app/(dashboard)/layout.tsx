import { Sidebar } from "@/components/layout/Sidebar";
import { AdminActivityListener } from "@/components/ui/AdminActivityListener";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#030712] relative">
      <AdminActivityListener />
      {/* Global Ambient Effects */}
      <div className="fixed top-0 left-0 md:left-72 right-0 h-px bg-gradient-to-r from-indigo-500/20 via-cyan-500/10 to-transparent z-30 pointer-events-none"></div>
      <div className="fixed top-20 right-20 w-[500px] h-[500px] bg-indigo-500/[0.03] rounded-full filter blur-[100px] pointer-events-none z-0"></div>
      <div className="fixed bottom-20 left-1/2 w-[400px] h-[400px] bg-cyan-500/[0.02] rounded-full filter blur-[80px] pointer-events-none z-0"></div>
      
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative z-10 w-full">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
