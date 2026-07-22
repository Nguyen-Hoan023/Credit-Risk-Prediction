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

  const approvedIcon =
    result.decision === "APPROVE"
      ? "✅"
      : result.decision === "REVIEW"
        ? "🔍"
        : "❌";
  const title = t(`decision.${result.decision}` as any);

  return (
    <div
      className="mx-auto w-full max-w-2xl animate-fade-in rounded-2xl p-6 shadow-lg sm:p-8"
      style={{
        backgroundColor: colors.bg,
        border: `2px solid ${colors.border}`,
      }}
    >
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="flex items-center justify-center gap-2 text-xl font-extrabold text-slate-900 sm:text-2xl">
          <span>{approvedIcon}</span>
          {title}
        </h2>
        <span
          className="mt-3 inline-block rounded-full px-4 py-1 text-xs font-bold"
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
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white p-3 text-center shadow-sm">
          <p className="text-xs text-slate-500">{t("approvalScore")}</p>
          <p
            className="mt-1 text-lg font-bold"
            style={{ color: colors.primary }}
          >
            {result.approval_probability}%
          </p>
        </div>
        <div className="rounded-xl bg-white p-3 text-center shadow-sm">
          <p className="text-xs text-slate-500">{t("resultLabel")}</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-lg font-bold text-slate-900">
            <span>{approvedIcon}</span>
            {t(`decisionShort.${result.decision}` as any)}
          </p>
        </div>
        <div className="rounded-xl bg-white p-3 text-center shadow-sm">
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
          className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md"
        >
          <span>📋</span>
          {t("newApplication")}
        </button>
      </div>
    </div>
  );
}
