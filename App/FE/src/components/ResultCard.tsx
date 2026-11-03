"use client";

import { useTranslations } from "next-intl";
import { CreditScoreResponse, RecommendationItem } from "@/lib/types";
import { RISK_COLORS } from "@/lib/constants";
import CreditScoreGauge from "./CreditScoreGauge";
import RecommendationBox from "./RecommendationBox";

interface ResultCardProps {
  result: CreditScoreResponse;
  onReset: () => void;
}

export default function ResultCard({ result, onReset }: ResultCardProps) {
  const t = useTranslations("result");
  const colors = RISK_COLORS[result.risk_level] ?? RISK_COLORS.high;

  const title = t(`decision.${result.decision}` as any);

  return (
    <div
      className="mx-auto w-full max-w-3xl animate-fade-in rounded-2xl border bg-white p-5 sm:p-8"
      style={{
        borderColor: colors.border,
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
          {title}
        </h2>
        <span
          className="mt-3 inline-flex min-h-8 items-center rounded-md px-3 py-1 text-xs font-semibold"
          style={{
            backgroundColor: colors.badge_bg,
            color: colors.badge_text,
          }}
        >
          {t(`riskLevel.${result.risk_level}` as any)}
        </span>
      </div>

      {/* Score Gauge */}
      <CreditScoreGauge
        score={result.credit_score}
        riskLevel={result.risk_level}
      />

      {/* Info Cards */}
      <div className="mt-6 grid grid-cols-1 divide-y divide-slate-200 border-y border-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="py-4 text-center sm:px-3 sm:py-3">
          <p className="text-xs text-slate-500">{t("approvalScore")}</p>
          <p
            className="mt-1 text-lg font-bold"
            style={{ color: colors.primary }}
          >
            {result.approval_probability}%
          </p>
        </div>
        <div className="py-4 text-center sm:px-3 sm:py-3">
          <p className="text-xs text-slate-500">{t("resultLabel")}</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {t(`decisionShort.${result.decision}` as any)}
          </p>
        </div>
        <div className="py-4 text-center sm:px-3 sm:py-3">
          <p className="text-xs text-slate-500">{t("riskLevelLabel")}</p>
          <p
            className="mt-1 text-lg font-bold"
            style={{ color: colors.primary }}
          >
            {t(`riskLevelShort.${result.risk_level}` as any)}
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-6">
        <RecommendationBox
          recommendations={result.recommendations}
          riskLevel={result.risk_level}
        />
      </div>

      {/* Reset Button */}
      <div className="mt-6 text-center">
        <button
          onClick={onReset}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-50"
        >
          {t("newApplication")}
        </button>
      </div>
    </div>
  );
}
