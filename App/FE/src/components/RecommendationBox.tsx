"use client";

import { useTranslations } from "next-intl";
import { RiskLevel, RecommendationItem } from "@/lib/types";
import { RISK_COLORS } from "@/lib/constants";

interface RecommendationBoxProps {
  recommendations: RecommendationItem[];
  riskLevel: RiskLevel;
}

export default function RecommendationBox({
  recommendations,
  riskLevel,
}: RecommendationBoxProps) {
  const t = useTranslations("result");
  const tRec = useTranslations("recommendations");
  const colors = RISK_COLORS[riskLevel];

  const icon =
    riskLevel === "low" ? "✅" : riskLevel === "medium" ? "⚠️" : "❌";

  // Translate a recommendation item using its code + params
  const translateRecommendation = (rec: RecommendationItem): string => {
    if (!rec || !rec.code) return "";

    if (rec.code === "LEGACY_TEXT") {
      return String(rec.params?.text || "");
    }

    try {
      const translated = tRec(rec.code as any, rec.params as any);
      if (translated.startsWith("recommendations")) {
        return rec.code;
      }
      return translated;
    } catch {
      return rec.code;
    }
  };

  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
      }}
    >
      <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
        <span>💡</span> {t("recommendationsTitle")}
      </h4>
      <ul className="space-y-2">
        {recommendations.map((rec, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
            <span className="mt-0.5 shrink-0">{icon}</span>
            <span>{translateRecommendation(rec)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
