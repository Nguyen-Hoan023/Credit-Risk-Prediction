"use client";

import { CreditScoreResponse } from "@/lib/types";
import {
  RISK_COLORS,
  getRiskLabel,
  getApprovalLabel,
  getApprovalTitle,
} from "@/lib/constants";
import CreditScoreGauge from "./CreditScoreGauge";
import RecommendationBox from "./RecommendationBox";

interface ResultCardProps {
  result: CreditScoreResponse;
  onReset: () => void;
}

export default function ResultCard({ result, onReset }: ResultCardProps) {
  const colors = RISK_COLORS[result.risk_level] ?? RISK_COLORS.high;

  const approvedIcon =
    result.decision === "PHÊ DUYỆT"
      ? "✅"
      : result.decision === "XEM XÉT"
        ? "🔍"
        : "❌";
  const title = getApprovalTitle(result.decision);

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
          {getRiskLabel(result.risk_level)}
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
          <p className="text-xs text-slate-500">Approval Score</p>
          <p
            className="mt-1 text-lg font-bold"
            style={{ color: colors.primary }}
          >
            {result.approval_probability}%
          </p>
        </div>
        <div className="rounded-xl bg-white p-3 text-center shadow-sm">
          <p className="text-xs text-slate-500">Kết quả</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-lg font-bold text-slate-900">
            <span>{approvedIcon}</span>
            {getApprovalLabel(result.decision)}
          </p>
        </div>
        <div className="rounded-xl bg-white p-3 text-center shadow-sm">
          <p className="text-xs text-slate-500">Risk Level</p>
          <p
            className="mt-1 text-lg font-bold"
            style={{ color: colors.primary }}
          >
            {result.risk_level === "low"
              ? "Low"
              : result.risk_level === "medium"
                ? "Medium"
                : "High"}
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
          Nộp đơn mới
        </button>
      </div>
    </div>
  );
}
