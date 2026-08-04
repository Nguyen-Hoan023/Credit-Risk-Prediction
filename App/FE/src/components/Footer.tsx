"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export default function Footer() {
  const t = useTranslations("footer");
  const pathname = usePathname();

  if (pathname.includes("/admin")) return null;

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-slate-500">
            {t("copyright")}
          </p>
          <p className="text-xs text-slate-400">
            {t("subtitle")}
          </p>
        </div>
      </div>
    </footer>
  );
}
