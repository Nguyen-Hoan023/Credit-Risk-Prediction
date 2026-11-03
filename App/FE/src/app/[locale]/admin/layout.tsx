"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { LayoutDashboard, Users, FileText, LogOut, LoaderCircle } from "lucide-react";
import { logout, getCurrentUser } from "@/lib/auth";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (!user || user.role !== "admin") {
        router.push("/login");
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (loading) return (
    <div role="status" className="flex min-h-[50vh] items-center justify-center gap-3 text-sm text-slate-600">
      <LoaderCircle aria-hidden="true" className="size-5 animate-spin text-blue-700" />
      Đang kiểm tra quyền...
    </div>
  );

  const navItems = [
    { name: "Tổng quan", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Hồ sơ dự đoán", href: "/admin/predictions", icon: FileText },
    { name: "Nhân viên", href: "/admin/users", icon: Users },
  ];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-slate-50 md:flex-row">
      <aside className="flex shrink-0 flex-col bg-slate-950 text-white md:min-h-[100dvh] md:w-60">
        <div className="border-b border-white/10 px-5 py-4 md:px-6 md:py-6">
          <p className="text-lg font-bold tracking-tight">NovaBank</p>
          <p className="mt-0.5 text-[11px] font-semibold tracking-[0.16em] text-blue-200">CREDITRISK · QUẢN TRỊ</p>
        </div>
        <nav aria-label="Điều hướng quản trị" className="flex gap-1 overflow-x-auto px-3 py-2 md:flex-1 md:flex-col md:gap-1.5 md:overflow-visible md:px-3 md:py-5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-11 shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors md:gap-3 md:px-3.5 ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon aria-hidden="true" className="size-[18px] shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3 md:p-4">
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
          >
            <LogOut aria-hidden="true" className="size-[18px]" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
