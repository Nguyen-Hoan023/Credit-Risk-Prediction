"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { isAuthenticated, logout, getCurrentUser } from "@/lib/auth";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const authStatus = isAuthenticated();
    setIsAuth(authStatus);
    
    if (authStatus) {
      getCurrentUser().then(user => {
        if (user && user.full_name) {
          setUserName(user.full_name);
        }
      });
    } else {
      setUserName(null);
    }
  }, [pathname]);

  const NAV_ITEMS = [
    { href: "/" as const, labelKey: "home" as const, icon: "🏠" },
    { href: "/apply" as const, labelKey: "apply" as const, icon: "📝" },
    { href: "/history" as const, labelKey: "history" as const, icon: "📜" },
  ];

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) return;

    // Switch route keeping current pathname
    router.replace(pathname, { locale: newLocale });

    // Toast message
    const msg =
      newLocale === "vi" ? "Đã chuyển sang Tiếng Việt" : "Switched to English";
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  if (pathname.includes("/admin")) return null;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 gap-2 sm:gap-6">
          
          {/* 1. Logo (Left) */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-extrabold tracking-tight transition-colors hover:text-blue-600 shrink-0"
          >
            <span className="text-2xl">🏦</span>
            <span className="text-slate-900 hidden sm:inline-block whitespace-nowrap">
              Credit<span className="text-blue-600">Score</span>
            </span>
          </Link>

          {/* 2. Main Navigation & Auth (Center/Right) */}
          <div className="flex-1 flex items-center justify-end lg:justify-center gap-2 sm:gap-6">
            {/* Nav Items */}
            <ul className="flex items-center gap-1 sm:gap-2 shrink-0">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-bold shadow-sm"
                          : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span className="hidden md:inline">{t(item.labelKey)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="hidden lg:block w-px h-6 bg-slate-200 shrink-0" />

            {/* Login / Logout */}
            <div className="flex items-center shrink-0">
              {isAuth ? (
                <div className="flex items-center gap-3">
                  {userName && (
                    <span className="text-sm font-semibold text-slate-700 hidden xl:inline-block whitespace-nowrap">
                      👋 Chào, {userName}
                    </span>
                  )}
                  <button
                    onClick={async () => { await logout(); setIsAuth(false); setUserName(null); router.push("/"); }}
                    className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors whitespace-nowrap shrink-0"
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>

          {/* 3. Language Switcher (Right-most & Separated) */}
          <div className="flex items-center shrink-0 pl-2 sm:pl-4 border-l border-slate-200/90">
            <div className="relative inline-flex items-center rounded-full p-1 bg-slate-100/80 border border-slate-200/60 shadow-inner shrink-0">
              <button
                onClick={() => switchLocale("vi")}
                className={`relative flex items-center justify-center h-8 px-2 sm:px-3 rounded-full text-sm transition-all duration-200 ease-out ${
                  locale === "vi" 
                    ? "bg-white text-blue-600 font-bold shadow-sm scale-100" 
                    : "text-slate-500 font-medium hover:text-slate-800 scale-95"
                }`}
              >
                🇻🇳 <span className="ml-1.5 hidden xl:inline-block whitespace-nowrap">Tiếng Việt</span>
              </button>
              <button
                onClick={() => switchLocale("en")}
                className={`relative flex items-center justify-center h-8 px-2 sm:px-3 rounded-full text-sm transition-all duration-200 ease-out ${
                  locale === "en" 
                    ? "bg-white text-blue-600 font-bold shadow-sm scale-100" 
                    : "text-slate-500 font-medium hover:text-slate-800 scale-95"
                }`}
              >
                🇺🇸 <span className="ml-1.5 hidden xl:inline-block whitespace-nowrap">English</span>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900/90 px-4 py-2.5 text-xs font-semibold text-white shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="text-sm">🌐</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
