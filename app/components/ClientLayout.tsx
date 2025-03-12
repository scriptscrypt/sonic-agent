"use client";

import { usePathname } from "next/navigation";
import SideNav from "@/components/layout/SideNav";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSharedRoute = pathname?.startsWith('/shared');
  
  return (
    <div className="fixed inset-0 bg-background flex">
      {!isSharedRoute && <SideNav />}
      <main className={`flex-1 relative overflow-y-auto scrollbar-none scroll-smooth ${isSharedRoute ? 'ml-0' : ''}`}>
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
} 