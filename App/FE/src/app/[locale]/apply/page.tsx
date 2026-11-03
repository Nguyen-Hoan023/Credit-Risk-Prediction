"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CircleAlert, LockKeyhole } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { isAuthenticated } from "@/lib/auth";
import { useCreditScore } from "@/hooks/useCreditScore";
import LoanForm from "@/components/LoanForm";
import ResultCard from "@/components/ResultCard";

export default function ApplyPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, []);

  const t = useTranslations("apply");
  const tForm = useTranslations("form");
  const { result, isLoading, error, submit, reset } = useCreditScore();

  if (isAuth === null) return null;

  if (!isAuth) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 text-center sm:p-8">
          <LockKeyhole aria-hidden="true" className="mx-auto h-6 w-6 text-slate-600" />
          <h1 className="mt-4 text-xl font-semibold text-slate-900">{t("accessTitle")}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t("accessDescription")}</p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            {t("loginNow")}
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="mb-6 sm:mb-8">
        <p className="text-sm font-medium text-blue-800">NovaBank CreditRisk</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {t("pageTitle")}
        </h1>
      </header>

      {error && (
        <div role="alert" className="mb-5 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <CircleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">{t("errorTitle")}</p>
            <p className="mt-1">{error || t("errorDefault")}</p>
          </div>
        </div>
      )}

      {result ? (
        <div className="animate-slide-up" aria-live="polite">
          <ResultCard result={result} onReset={reset} />
        </div>
      ) : (
        <LoanForm onSubmit={submit} isLoading={isLoading} />
      )}
      <p className="mt-4 text-sm text-slate-600">{tForm("incomeHint")}; {tForm("creditUtilizationHint")}</p>
    </div>
  );
}
