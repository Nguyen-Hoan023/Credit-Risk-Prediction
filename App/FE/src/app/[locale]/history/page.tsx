"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { HistoryRecord, RiskLevel, RecommendationItem } from "@/lib/types";
import { RISK_COLORS } from "@/lib/constants";
import { fetchCreditHistory } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import HistoryDetailModal from "@/components/HistoryDetailModal";

export default function HistoryPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

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
    const authStatus = isAuthenticated();
    setIsAuth(authStatus);
    if (!authStatus) return;

    async function loadHistory() {
      try {
        const dbHistory = await fetchCreditHistory();
        setHistory(dbHistory);
      } catch (dbError) {
        console.warn("Could not load history from PostgreSQL:", dbError);
        setHistory([]);
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
        <HistoryDetailModal selectedRecord={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}
    </div>
  );
}
