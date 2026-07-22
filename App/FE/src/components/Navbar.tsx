"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);

  // Refs for dynamic pill calculation
  const viBtnRef = useRef<HTMLButtonElement>(null);
  const enBtnRef = useRef<HTMLButtonElement>(null);
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  const NAV_ITEMS = [
    { href: "/" as const, labelKey: "home" as const, icon: "🏠" },
    { href: "/apply" as const, labelKey: "apply" as const, icon: "📝" },
    { href: "/history" as const, labelKey: "history" as const, icon: "📜" },
  ];

  // Recalculate sliding pill position dynamically whenever locale or screen size changes
  useEffect(() => {
    const updatePill = () => {
      const activeBtn = locale === "vi" ? viBtnRef.current : enBtnRef.current;
      if (activeBtn) {
        setPillStyle({
          left: activeBtn.offsetLeft,
          width: activeBtn.offsetWidth,
        });
      }
    };

    updatePill();
    window.addEventListener("resize", updatePill);
    return () => window.removeEventListener("resize", updatePill);
  }, [locale]);

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) return;

    // Globe spin effect
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 450);

    // Switch route keeping current pathname
    router.replace(pathname, { locale: newLocale });

    // Toast message
    const msg =
      newLocale === "vi" ? "Đã chuyển sang Tiếng Việt" : "Switched to English";
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-extrabold tracking-tight transition-colors hover:text-blue-600 shrink-0"
          >
            <span className="text-2xl">🏦</span>
            <span className="text-slate-900">
              Credit<span className="text-blue-600">Score</span>
            </span>
          </Link>

          {/* Nav Links + Morphing Segmented Pill Language Switcher */}
          <div className="flex items-center">
            {/* Nav Items */}
            <ul className="flex items-center gap-1 sm:gap-1.5">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-bold shadow-sm"
                          : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span className="hidden sm:inline">
                        {t(item.labelKey)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Vertical Divider & Spacing separator */}
            <div className="ml-4 sm:ml-7 pl-4 sm:pl-7 border-l border-slate-200/90 flex items-center h-8">
              {/* Morphing Segmented Pill Container */}
              <div
                className="relative inline-flex items-center rounded-xl bg-slate-100/90 p-1 border border-slate-200/80 shadow-inner overflow-hidden select-none"
                role="group"
                aria-label="Language selector"
              >
                {/* Globe Icon with smooth rotation */}
                <span
                  className={`pl-1.5 pr-1 text-slate-500 text-sm transition-transform duration-500 select-none ${
                    isRotating ? "rotate-[360deg] scale-110 text-blue-600" : ""
                  }`}
                  aria-hidden="true"
                >
                  🌐
                </span>

                {/* Dynamic Animated Background Pill */}
                <div
                  className="absolute top-1 bottom-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/25 transition-all duration-300 ease-out"
                  style={{
                    left: `${pillStyle.left}px`,
                    width: `${pillStyle.width}px`,
                  }}
                />

                {/* Vietnamese Button */}
                <button
                  ref={viBtnRef}
                  type="button"
                  onClick={() => switchLocale("vi")}
                  aria-label="Chuyển sang Tiếng Việt"
                  aria-pressed={locale === "vi"}
                  className={`relative z-10 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
                    locale === "vi"
                      ? "text-white font-bold tracking-wide scale-100 opacity-100"
                      : "text-slate-500 hover:text-slate-900 font-semibold scale-95 opacity-80 hover:opacity-100"
                  }`}
                >
                  {locale === "vi" ? (
                    <>
                      <span className="sm:hidden">VI</span>
                      <span className="hidden sm:inline">Tiếng Việt</span>
                    </>
                  ) : (
                    <span>VN</span>
                  )}
                </button>

                {/* English Button */}
                <button
                  ref={enBtnRef}
                  type="button"
                  onClick={() => switchLocale("en")}
                  aria-label="Switch to English"
                  aria-pressed={locale === "en"}
                  className={`relative z-10 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
                    locale === "en"
                      ? "text-white font-bold tracking-wide scale-100 opacity-100"
                      : "text-slate-500 hover:text-slate-900 font-semibold scale-95 opacity-80 hover:opacity-100"
                  }`}
                >
                  {locale === "en" ? (
                    <>
                      <span className="sm:hidden">EN</span>
                      <span className="hidden sm:inline">English</span>
                    </>
                  ) : (
                    <span>US</span>
                  )}
                </button>
              </div>
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
