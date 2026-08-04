"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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
  const { result, isLoading, error, submit, reset } = useCreditScore();

  if (isAuth === null) return null;

  if (!isAuth) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center mt-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <span className="text-5xl">🔒</span>
          <h2 className="mt-4 text-xl font-bold text-slate-900">Yêu cầu đăng nhập</h2>
          <p className="mt-2 text-slate-600">Bạn vui lòng đăng nhập để xem và sử dụng tính năng này.</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {t("pageTitle")}
        </h1>
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex gap-2">
            <span>🚨</span>
            <div>
              <p className="font-semibold">{t("errorTitle")}</p>
              <p className="mt-1 opacity-90">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="mx-auto max-w-4xl">
        {result ? (
          <div className="animate-slide-up">
            <ResultCard result={result} onReset={reset} />
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:p-6 md:p-8">
            <LoanForm onSubmit={submit} isLoading={isLoading} />
          </div>
        )}
      </div>
    </div>
  );
}
