import { FilePlus2, History, ListChecks, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <section className="grid items-center gap-10 rounded-2xl bg-white px-6 py-10 ring-1 ring-slate-200 sm:px-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14 lg:px-14">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-wide text-blue-800">NovaBank CreditRisk</p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[42px]">
            {t("heroTitle1")}
            <span className="mt-1 block text-blue-800">{t("heroTitle2")}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            {t("heroDescription")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/apply"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <FilePlus2 aria-hidden="true" className="h-4 w-4" />
              {t("ctaApply")}
            </Link>
            <Link
              href="/history"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <History aria-hidden="true" className="h-4 w-4" />
              {t("ctaHistory")}
            </Link>
          </div>
        </div>

        <aside aria-label={t("featuresTitle")} className="border-t border-slate-200 pt-7 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <h2 className="text-base font-semibold text-slate-900">{t("featuresTitle")}</h2>
          <div className="mt-5 space-y-5">
            <div className="flex gap-3">
              <FilePlus2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
              <p className="text-sm leading-6 text-slate-600">{t("stat1")}</p>
            </div>
            <div className="flex gap-3">
              <ListChecks aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
              <p className="text-sm leading-6 text-slate-600">{t("stat2")}</p>
            </div>
            <div className="flex gap-3">
              <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
              <p className="text-sm leading-6 text-slate-600">{t("stat3")}</p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
