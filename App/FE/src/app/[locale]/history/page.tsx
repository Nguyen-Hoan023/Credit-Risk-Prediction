"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HistoryRecord, RiskLevel, RecommendationItem } from "@/lib/types";
import { RISK_COLORS } from "@/lib/constants";
import { fetchCreditHistory, clearCreditHistory } from "@/lib/api";

export default function HistoryPage() {
  const t = useTranslations("history");
  const tResult = useTranslations("result");
  const tRec = useTranslations("recommendations");
  const tOptions = useTranslations("options");

  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Filters state
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  // Load history on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const dbHistory = await fetchCreditHistory();
        setHistory(dbHistory);
      } catch (dbError) {
        console.warn("Could not load history from PostgreSQL, falling back to localStorage:", dbError);
        try {
          const historyJson = localStorage.getItem("novabank_credit_history");
          if (historyJson) {
            setHistory(JSON.parse(historyJson));
          }
        } catch (localError) {
          console.error("Failed to load local history:", localError);
        }
      } finally {
        setIsLoaded(true);
      }
    }
    loadHistory();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...history];

    if (riskFilter !== "all") {
      filtered = filtered.filter((item) => item.risk_level === riskFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => {
        if (statusFilter === "approved") return item.decision === "APPROVE";
        if (statusFilter === "review") return item.decision === "REVIEW";
        if (statusFilter === "rejected") return item.decision === "REJECT";
        return true;
      });
    }

    setFilteredHistory(filtered);
    setCurrentPage(1);
  }, [history, riskFilter, statusFilter]);

  // Clear history
  const handleClearHistory = async () => {
    const key = window.prompt(
      t("clearConfirm") + "\n\n(Nhập Admin API Key nếu hệ thống có bật bảo mật, hoặc nhấn OK để tiếp tục):",
      ""
    );
    if (key !== null) {
      try {
        try {
          await clearCreditHistory(key);
        } catch (dbError: any) {
          alert(`Không thể xóa dữ liệu trên Server: ${dbError.message || dbError}`);
          return;
        }
        localStorage.removeItem("novabank_credit_history");
        setHistory([]);
      } catch (e) {
        console.error("Failed to clear history:", e);
      }
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = filteredHistory.slice(startIndex, startIndex + itemsPerPage);

  // Helper formatting functions
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

  // Translate a recommendation item safely
  const translateRecommendation = (rec: RecommendationItem): string => {
    if (!rec || !rec.code) return "";

    // Nếu là văn bản cũ
    if (rec.code === "LEGACY_TEXT") {
      return String(rec.params?.text || "");
    }

    try {
      const translated = tRec(rec.code as any, rec.params as any);
      // Nếu next-intl không tìm thấy key và trả về tên namespace "recommendations..."
      if (translated.startsWith("recommendations")) {
        return rec.code;
      }
      return translated;
    } catch {
      return rec.code;
    }
  };

  // Translate option values for display
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

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="mt-2 text-slate-500 text-sm">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t("pageTitle")}
          </h1>
          <p className="mt-1 text-slate-600 text-sm">
            {t("pageDescription")}
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="self-start rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
          >
            {t("clearHistory")}
          </button>
        )}
      </div>

      {history.length === 0 ? (
        /* Empty State */
        <div className="mt-12 rounded-2xl border-2 border-dashed border-slate-300 py-16 text-center">
          <span className="text-5xl"></span>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">{t("emptyTitle")}</h3>
          <p className="mt-2 text-slate-600 text-sm">
            {t("emptyDescription")}
          </p>
          <div className="mt-6">
            <Link
              href="/apply"
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-500 transition-colors"
            >
              {t("startNow")}
            </Link>
          </div>
        </div>
      ) : (
        /* Dashboard view */
        <div className="mt-8">
          {/* Filters Dashboard */}
          <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
            <div>
              <label htmlFor="riskFilter" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                {t("filterRisk")}
              </label>
              <select
                id="riskFilter"
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">{t("filterAllRisk")}</option>
                <option value="low">{t("filterLowRisk")}</option>
                <option value="medium">{t("filterMediumRisk")}</option>
                <option value="high">{t("filterHighRisk")}</option>
              </select>
            </div>

            <div>
              <label htmlFor="statusFilter" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                {t("filterStatus")}
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">{t("filterAllStatus")}</option>
                <option value="approved">{t("filterApproved")}</option>
                <option value="review">{t("filterReview")}</option>
                <option value="rejected">{t("filterRejected")}</option>
              </select>
            </div>
          </div>

          {/* Table view */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-900">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-4 py-3.5">{t("colTime")}</th>
                  <th className="px-4 py-3.5">{t("colAge")}</th>
                  <th className="px-4 py-3.5">{t("colIncome")}</th>
                  <th className="px-4 py-3.5">{t("colLoan")}</th>
                  <th className="px-4 py-3.5">{t("colCreditScore")}</th>
                  <th className="px-4 py-3.5">{t("colRisk")}</th>
                  <th className="px-4 py-3.5 text-center">{t("colDecision")}</th>
                  <th className="px-4 py-3.5 text-right">{t("colDetail")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      {t("noMatchFilter")}
                    </td>
                  </tr>
                ) : (
                  paginatedHistory.map((record) => {
                    const colors = RISK_COLORS[record.risk_level] ?? RISK_COLORS.high;
                    return (
                      <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                        <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500">
                          {formatDate(record.created_at)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-medium">
                          {record.person_age} {t("ageUnit")}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                          {formatCurrency(record.person_income)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-slate-600 font-semibold">
                          {formatCurrency(record.loan_amnt)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-bold text-slate-900">
                          {record.credit_score}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                            style={{
                              backgroundColor: colors.badge_bg,
                              color: colors.badge_text,
                            }}
                          >
                            {tResult(`riskLevel.${record.risk_level}` as any)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-center">
                          {(() => {
                            const decision = record.decision;
                            if (decision === "APPROVE") {
                              return (
                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                  {tResult("decisionShort.APPROVE")}
                                </span>
                              );
                            } else if (decision === "REVIEW") {
                              return (
                                <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                  {tResult("decisionShort.REVIEW")}
                                </span>
                              );
                            } else {
                              return (
                                <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/20">
                                  {tResult("decisionShort.REJECT")}
                                </span>
                              );
                            }
                          })()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-right">
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors"
                          >
                            <span className="relative flex h-2 w-2 mr-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            {t("detailButton")}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-4 sm:flex-row">
              <span className="text-sm text-slate-600">
                {t("showing")} <span className="font-semibold text-slate-900">{startIndex + 1}</span> {t("to")}{" "}
                <span className="font-semibold text-slate-900">
                  {Math.min(startIndex + itemsPerPage, filteredHistory.length)}
                </span>{" "}
                {t("of")} <span className="font-semibold text-slate-900">{filteredHistory.length}</span> {t("records")}
              </span>

              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  {t("prevPage")}
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  const isNear = Math.abs(page - currentPage) <= 1;
                  const isFirstOrLast = page === 1 || page === totalPages;

                  if (!isNear && !isFirstOrLast) {
                    if (page === 2 || page === totalPages - 1) {
                      return <span key={page} className="px-2 py-1.5 text-sm text-slate-400">...</span>;
                    }
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors ${currentPage === page
                        ? "bg-indigo-600 text-white"
                        : "text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  {t("nextPage")}
                </button>
              </div>
            </div>
          )}

          {totalPages <= 1 && filteredHistory.length > 0 && (
            <div className="mt-4 text-right text-xs text-slate-400">
              {t("showingTotal", { count: filteredHistory.length, total: history.length })}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{t("modalTitle")}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{t("modalId")}: #{selectedRecord.id} • {t("modalTime")}: {formatDate(selectedRecord.created_at)}</p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
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
                    <span className="block text-xs font-semibold text-slate-400">PD: {selectedRecord.probability_of_default !== undefined ? `${(selectedRecord.probability_of_default * 100).toFixed(2)}%` : "N/A"}</span>
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
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {t("modalClose")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
