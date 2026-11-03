"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRightFromLine, FilePlus2, History, House, Languages } from "lucide-react";
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
      getCurrentUser().then((user) => {
        setUserName(user?.full_name || null);
      });
    } else {
      setUserName(null);
    }
  }, [pathname]);

  const navItems = [
    { href: "/" as const, labelKey: "home" as const, icon: House },
    { href: "/apply" as const, labelKey: "apply" as const, icon: FilePlus2 },
    { href: "/history" as const, labelKey: "history" as const, icon: History },
  ];

  const switchLocale = (newLocale: "vi" | "en") => {
    if (newLocale === locale) return;

    router.replace(pathname, { locale: newLocale });
    setToastMessage(
      newLocale === "vi" ? "Đã chuyển sang Tiếng Việt" : "Switched to English",
    );
    setTimeout(() => setToastMessage(null), 2500);
  };

  const isAuthPage = ["/login", "/register", "/forgot-password", "/verify-otp"].some((path) => pathname.endsWith(path));
  if (pathname.includes("/admin") || isAuthPage) return null;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
        <nav
          aria-label={t("primaryNavigation")}
          className="mx-auto flex min-h-16 max-w-[1400px] flex-wrap items-center justify-between gap-x-5 gap-y-2 px-4 py-2 sm:px-6 lg:flex-nowrap"
        >
          <Link
            href="/"
            className="flex min-h-11 shrink-0 items-center gap-2.5 text-slate-900 transition-colors hover:text-blue-700"
            aria-label="NovaBank CreditRisk"
          >
            <span
              aria-hidden="true"
              className="grid h-9 w-9 place-items-center rounded-lg bg-navy text-sm font-bold tracking-tight text-white"
            >
              N
            </span>
            <span className="text-base font-semibold tracking-tight sm:text-lg">
              NovaBank <span className="font-normal text-slate-500">CreditRisk</span>
            </span>
          </Link>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-4 lg:justify-center">
            <ul className="flex shrink-0 items-center gap-1">
              {navItems.map(({ href, labelKey, icon: Icon }) => {
                const isActive = pathname === href;
                const label = t(labelKey);

                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-label={label}
                      aria-current={isActive ? "page" : undefined}
                      title={label}
                      className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-2.5 text-sm transition-colors sm:px-3 ${
                        isActive
                          ? "bg-blue-50 font-semibold text-blue-800"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
                      <span className="hidden sm:inline">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <span aria-hidden="true" className="hidden h-6 w-px bg-slate-200 sm:block" />

            <div className="flex shrink-0 items-center">
              {isAuth ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  {userName && (
                    <span className="hidden max-w-40 truncate text-sm font-medium text-slate-600 xl:inline">
                      {t("greeting", { name: userName })}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                      setIsAuth(false);
                      setUserName(null);
                      router.push("/");
                    }}
                    className="flex min-h-11 items-center gap-2 rounded-lg px-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 sm:px-3"
                  >
                    <ArrowRightFromLine aria-hidden="true" className="h-4 w-4" />
                    <span>{t("logout")}</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex min-h-11 items-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:px-4"
                >
                  {t("login")}
                </Link>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center border-l border-slate-200 pl-2 sm:pl-4">
            <Languages aria-hidden="true" className="mr-1.5 hidden h-4 w-4 text-slate-500 sm:block" />
            <div
              aria-label={t("languageLabel")}
              className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5"
            >
              {(["vi", "en"] as const).map((language) => {
                const active = locale === language;
                return (
                  <button
                    key={language}
                    type="button"
                    lang={language}
                    aria-pressed={active}
                    onClick={() => switchLocale(language)}
                    className={`min-h-9 min-w-10 rounded-full px-2 text-xs transition-colors sm:px-2.5 ${
                      active
                        ? "bg-white font-semibold text-blue-800 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span className="sm:hidden">{language.toUpperCase()}</span>
                    <span className="hidden sm:inline">{t(`languageSwitcher.${language}`)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </header>

      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-navy px-4 py-3 text-sm font-medium text-white shadow-lg"
        >
          <Languages aria-hidden="true" className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
