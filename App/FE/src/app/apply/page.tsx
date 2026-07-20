"use client";

import { useCreditScore } from "@/hooks/useCreditScore";
import LoanForm from "@/components/LoanForm";
import ResultCard from "@/components/ResultCard";

export default function ApplyPage() {
  const { result, isLoading, error, submit, reset } = useCreditScore();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Đánh Giá Hồ Sơ Vay
        </h1>
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex gap-2">
            <span>🚨</span>
            <div>
              <p className="font-semibold">Đã xảy ra lỗi khi xử lý</p>
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
