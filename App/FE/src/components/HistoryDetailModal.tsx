"use client";

import { useTranslations } from "next-intl";
import { HistoryRecord, RecommendationItem } from "@/lib/types";
import { RISK_COLORS } from "@/lib/constants";

interface Props {
  selectedRecord: HistoryRecord;
  onClose: () => void;
}

export default function HistoryDetailModal({ selectedRecord, onClose }: Props) {
  const t = useTranslations("history");
  const tResult = useTranslations("result");
  const tRec = useTranslations("recommendations");
  const tOptions = useTranslations("options");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    } catch {
      return isoString;
    }
  };

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

  const getEducationLevelLabel = (level: string) => {
    const keyMap: Record<string, string> = {
      "High School": "highSchool", "Bachelor": "bachelor",
      "Master": "master", "PhD": "phd",
    };
    try { return tOptions(`educationLevel.${keyMap[level] || level}` as any); }
    catch { return level; }
  };

  const getEmploymentTypeLabel = (type: string) => {
    const keyMap: Record<string, string> = {
      "Full-time": "fullTime", "Part-time": "partTime",
      "Self-employed": "selfEmployed", "Unemployed": "unemployed",
    };
    try { return tOptions(`employmentType.${keyMap[type] || type}` as any); }
    catch { return type; }
  };

  const getHomeOwnershipLabel = (ownership: string) => {
    try { return tOptions(`homeOwnership.${ownership}` as any); }
    catch { return ownership; }
  };

  const getLoanIntentLabel = (intent: string) => {
    try { return tOptions(`loanIntent.${intent}` as any); }
    catch { return intent; }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{t("modalTitle")}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t("modalId")}: #{selectedRecord.id} • {selectedRecord.user && `Người đánh giá: ${selectedRecord.user.full_name} • `}{t("modalTime")}: {formatDate(selectedRecord.created_at)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        {/* Modal Content */}
        {selectedRecord.formData ? (
          <div className="mt-6 space-y-6">
            {/* 1. Điểm tín dụng và Quyết định */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
              <div className="text-center sm:border-r border-slate-200 py-2">
                <span className="block text-xs font-semibold text-slate-500 uppercase">{t("creditScore")}</span>
                <span className="text-3xl font-black text-slate-900">{selectedRecord.credit_score}</span>
                <span className="block text-xs font-semibold text-slate-400">{t("scoreRange")}</span>
              </div>
              <div className="text-center sm:border-r border-slate-200 py-2">
                <span className="block text-xs font-semibold text-slate-500 uppercase">{t("approvalProbability")}</span>
                <span className="text-3xl font-black text-indigo-600">
                  {selectedRecord.approval_probability !== undefined ? `${selectedRecord.approval_probability}%` : "N/A"}
                </span>
              </div>
              <div className="text-center py-2">
                <span className="block text-xs font-semibold text-slate-500 uppercase">{t("creditDecision")}</span>
                <div className="mt-1">
                  {(() => {
                    const decision = selectedRecord.decision;
                    if (decision === "APPROVE") {
                      return <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">{tResult("decisionShort.APPROVE")}</span>;
                    } else if (decision === "REVIEW") {
                      return <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20">{tResult("decisionShort.REVIEW")}</span>;
                    } else {
                      return <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-700 ring-1 ring-inset ring-red-600/20">{tResult("decisionShort.REJECT")}</span>;
                    }
                  })()}
                </div>
                <span className="block text-xs font-semibold text-slate-400 mt-1">{t("riskDegree")}: {tResult(`riskLevel.${selectedRecord.risk_level}` as any)}</span>
              </div>
            </div>

            {/* 2. Các thông tin chi tiết */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {/* Thông tin cá nhân */}
              <div>
                <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 border-b border-indigo-100 pb-1">👤 {t("personalInfo")}</h4>
                <ul className="space-y-1.5 text-xs">
                  <li><span className="text-slate-500">{t("colAge")}:</span> <span className="font-semibold text-slate-900">{selectedRecord.person_age} {t("ageUnit")}</span></li>
                  <li><span className="text-slate-500">{t("yearlyIncome")}:</span> <span className="font-semibold text-slate-900">{formatCurrency(selectedRecord.person_income)}</span></li>
                  <li><span className="text-slate-500">{t("empYears")}:</span> <span className="font-semibold text-slate-900">{selectedRecord.formData.person_emp_length !== null ? `${selectedRecord.formData.person_emp_length} ${t("yearUnit")}` : t("notAvailable")}</span></li>
                  <li><span className="text-slate-500">{t("educationLevel")}:</span> <span className="font-semibold text-slate-900">{getEducationLevelLabel(selectedRecord.formData.education_level)}</span></li>
                  <li><span className="text-slate-500">{t("employmentType")}:</span> <span className="font-semibold text-slate-900">{getEmploymentTypeLabel(selectedRecord.formData.employment_type)}</span></li>
                  <li><span className="text-slate-500">{t("homeOwnership")}:</span> <span className="font-semibold text-slate-900">{getHomeOwnershipLabel(selectedRecord.formData.person_home_ownership)}</span></li>
                </ul>
              </div>

              {/* Thông tin khoản vay */}
              <div>
                <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 border-b border-indigo-100 pb-1">{t("loanProposal")}</h4>
                <ul className="space-y-1.5 text-xs">
                  <li><span className="text-slate-500">{t("loanAmount")}:</span> <span className="font-semibold text-slate-900">{formatCurrency(selectedRecord.loan_amnt)}</span></li>
                  <li><span className="text-slate-500">{t("interestRate")}:</span> <span className="font-semibold text-slate-900">{selectedRecord.formData.loan_int_rate !== null ? `${selectedRecord.formData.loan_int_rate}%` : t("notDetermined")}</span></li>
                  <li><span className="text-slate-500">{t("loanTerm")}:</span> <span className="font-semibold text-slate-900">{selectedRecord.formData.loan_term_months} {t("monthUnit")}</span></li>
                  <li><span className="text-slate-500">{t("loanPurpose")}:</span> <span className="font-semibold text-slate-900">{getLoanIntentLabel(selectedRecord.formData.loan_intent)}</span></li>
                </ul>
              </div>

              {/* Lịch sử tín dụng và nợ */}
              <div>
                <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 border-b border-indigo-100 pb-1"> {t("historyDebt")}</h4>
                <ul className="space-y-1.5 text-xs">
                  <li><span className="text-slate-500">{t("creditHistoryYears")}:</span> <span className="font-semibold text-slate-900">{selectedRecord.formData.cb_person_cred_hist_length} {t("yearUnit")}</span></li>
                  <li><span className="text-slate-500">{t("creditAccounts")}:</span> <span className="font-semibold text-slate-900">{selectedRecord.formData.open_accounts} {t("accountUnit")}</span></li>
                  <li><span className="text-slate-500">{t("latePayments")}:</span> <span className="font-semibold text-slate-900">{selectedRecord.formData.past_delinquencies} {t("timeUnit")}</span></li>
                  <li><span className="text-slate-500">{t("priorDefault")}:</span> <span className="font-semibold text-slate-900">{selectedRecord.formData.cb_person_default_on_file === "Y" ? t("yes") : t("no")}</span></li>
                  <li><span className="text-slate-500">{t("creditUtilization")}:</span> <span className="font-semibold text-slate-900">{(selectedRecord.formData.credit_utilization_ratio * 100).toFixed(0)}%</span></li>
                  <li><span className="text-slate-500">{t("otherDebt")}:</span> <span className="font-semibold text-slate-900">{formatCurrency(selectedRecord.formData.other_debt)}</span></li>
                </ul>
              </div>
            </div>

            {/* 3. Khuyến nghị chi tiết */}
            {selectedRecord.recommendations && selectedRecord.recommendations.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 border-b border-indigo-100 pb-1">{t("recommendationsTitle")}</h4>
                <ul className="list-inside list-disc space-y-1 text-xs text-slate-700 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50">
                  {selectedRecord.recommendations.map((rec, i) => (
                    <li key={i}>{translateRecommendation(rec)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          /* Trường hợp dữ liệu cũ */
          <div className="mt-6 space-y-4">
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 border border-amber-200">
              <strong>{t("legacyInfo")}:</strong> {t("legacyNotice")}
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div><span className="text-slate-500">{t("legacyAge")}:</span> <span className="font-semibold text-slate-900">{selectedRecord.person_age} {t("ageUnit")}</span></div>
              <div><span className="text-slate-500">{t("legacyIncome")}:</span> <span className="font-semibold text-slate-900">{formatCurrency(selectedRecord.person_income)}</span></div>
              <div><span className="text-slate-500">{t("legacyLoan")}:</span> <span className="font-semibold text-slate-900">{formatCurrency(selectedRecord.loan_amnt)}</span></div>
              <div><span className="text-slate-500">{t("legacyCreditScore")}:</span> <span className="font-semibold text-slate-900">{selectedRecord.credit_score}</span></div>
              <div><span className="text-slate-500">{t("legacyRisk")}:</span> <span className="font-semibold text-slate-900">{tResult(`riskLevel.${selectedRecord.risk_level}` as any)}</span></div>
              <div>
                <span className="text-slate-500">{t("legacyDecision")}:</span>{" "}
                <span className="font-semibold text-slate-900">
                  {tResult(`decisionShort.${selectedRecord.decision}` as any)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end border-t border-slate-200 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {t("modalClose")}
          </button>
        </div>
      </div>
    </div>
  );
}
