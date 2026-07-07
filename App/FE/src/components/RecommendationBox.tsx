import { RiskLevel } from "@/lib/types";
import { RISK_COLORS } from "@/lib/constants";

interface RecommendationBoxProps {
  recommendations: string[];
  riskLevel: RiskLevel;
}

export default function RecommendationBox({
  recommendations,
  riskLevel,
}: RecommendationBoxProps) {
  const colors = RISK_COLORS[riskLevel];

  const icon =
    riskLevel === "low" ? "✅" : riskLevel === "medium" ? "⚠️" : "❌";

  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
      }}
    >
      <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
        <span>💡</span> Khuyến nghị
      </h4>
      <ul className="space-y-2">
        {recommendations.map((rec, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
            <span className="mt-0.5 shrink-0">{icon}</span>
            <span>{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
