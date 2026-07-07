"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HistoryRecord, RiskLevel } from "@/lib/types";
import { RISK_COLORS, getRiskLabel, getApprovalLabel } from "@/lib/constants";
import { fetchCreditHistory, clearCreditHistory } from "@/lib/api";

export default function HistoryPage() {
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

  // Load history on mount (database history first, fallback to localStorage)
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
        const decision = item.decision || (item.risk_level === "medium" ? "XEM XÉT" : (item.approved ? "PHÊ DUYỆT" : "TỪ CHỐI"));
        if (statusFilter === "approved") return decision === "PHÊ DUYỆT";
        if (statusFilter === "review") return decision === "XEM XÉT";
        if (statusFilter === "rejected") return decision === "TỪ CHỐI";
        return true;
      });
    }

    setFilteredHistory(filtered);
    setCurrentPage(1); // Reset to page 1 on filter
  }, [history, riskFilter, statusFilter]);

  // Clear history
  const handleClearHistory = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử đánh giá không?")) {
      try {
        try {
          await clearCreditHistory();
        } catch (dbError) {
          console.warn("Could not clear database history, falling back to local clear:", dbError);
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

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="mt-2 text-slate-500 text-sm">Đang tải lịch sử...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Lịch Sử Đánh Giá
          </h1>
          <p className="mt-1 text-slate-600 text-sm">
            Xem danh sách các hồ sơ tín dụng đã được đánh giá gần đây.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="self-start rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
          >
            Xóa lịch sử
          </button>
        )}
      </div>

      {history.length === 0 ? (
        /* Empty State */
        <div className="mt-12 rounded-2xl border-2 border-dashed border-slate-300 py-16 text-center">
          <span className="text-5xl"></span>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Không có lịch sử</h3>
          <p className="mt-2 text-slate-600 text-sm">
            Bạn chưa thực hiện bất kỳ đánh giá hồ sơ nào.
          </p>
          <div className="mt-6">
            <Link
              href="/apply"
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-500 transition-colors"
            >
              Bắt đầu đánh giá ngay
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
                Lọc theo rủi ro
              </label>
              <select
                id="riskFilter"
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">Tất cả rủi ro</option>
                <option value="low">Rủi ro Thấp</option>
                <option value="medium">Rủi ro Trung bình</option>
                <option value="high">Rủi ro Cao</option>
              </select>
            </div>

            <div>
              <label htmlFor="statusFilter" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Lọc theo trạng thái phê duyệt
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="approved">Đã phê duyệt</option>
                <option value="review">Đang xem xét</option>
                <option value="rejected">Bị từ chối</option>
              </select>
            </div>
          </div>

          {/* Table view */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-900">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-4 py-3.5">Thời gian</th>
                  <th className="px-4 py-3.5">Tuổi</th>
                  <th className="px-4 py-3.5">Thu nhập</th>
                  <th className="px-4 py-3.5">Khoản vay</th>
                  <th className="px-4 py-3.5">Điểm tín dụng</th>
                  <th className="px-4 py-3.5">Rủi ro</th>
                  <th className="px-4 py-3.5 text-center">Quyết định</th>
                  <th className="px-4 py-3.5 text-right">Chi tiết hồ sơ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      Không tìm thấy bản ghi nào khớp với bộ lọc.
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
                          {record.person_age} tuổi
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
                            {getRiskLabel(record.risk_level)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-center">
                          {(() => {
                            const decision = record.decision || (record.risk_level === "medium" ? "XEM XÉT" : (record.approved ? "PHÊ DUYỆT" : "TỪ CHỐI"));
                            if (decision === "PHÊ DUYỆT") {
                              return (
                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                  Đã duyệt
                                </span>
                              );
                            } else if (decision === "XEM XÉT") {
                              return (
                                <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                  Xem xét
                                </span>
                              );
                            } else {
                              return (
                                <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/20">
                                  Từ chối
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
                            Chi tiết
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
                Hiển thị <span className="font-semibold text-slate-900">{startIndex + 1}</span> đến{" "}
                <span className="font-semibold text-slate-900">
                  {Math.min(startIndex + itemsPerPage, filteredHistory.length)}
                </span>{" "}
                trong số <span className="font-semibold text-slate-900">{filteredHistory.length}</span> bản ghi
              </span>

              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  Trước
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
                  Sau
                </button>
              </div>
            </div>
          )}

          {totalPages <= 1 && filteredHistory.length > 0 && (
            <div className="mt-4 text-right text-xs text-slate-400">
              Hiển thị {filteredHistory.length} trên {history.length} bản ghi đánh giá
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
                <h3 className="text-xl font-bold text-slate-900">Chi Tiết Hồ Sơ Đánh Giá</h3>
                <p className="text-xs text-slate-500 mt-0.5">Mã hồ sơ: #{selectedRecord.id} • Đánh giá lúc: {formatDate(selectedRecord.created_at)}</p>
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
                    <span className="block text-xs font-semibold text-slate-500 uppercase">Điểm tín dụng</span>
                    <span className="text-3xl font-black text-slate-900">{selectedRecord.credit_score}</span>
                    <span className="block text-xs font-semibold text-slate-400">Thang điểm (300-850)</span>
                  </div>
                  <div className="text-center sm:border-r border-slate-200 py-2">
                    <span className="block text-xs font-semibold text-slate-500 uppercase">Khả năng phê duyệt</span>
                    <span className="text-3xl font-black text-indigo-600">
                      {selectedRecord.approval_probability !== undefined ? `${selectedRecord.approval_probability}%` : "N/A"}
                    </span>
                    <span className="block text-xs font-semibold text-slate-400">PD: {selectedRecord.probability_of_default !== undefined ? `${(selectedRecord.probability_of_default * 100).toFixed(2)}%` : "N/A"}</span>
                  </div>
                  <div className="text-center py-2">
                    <span className="block text-xs font-semibold text-slate-500 uppercase">Quyết định tín dụng</span>
                    <div className="mt-1">
                      {(() => {
                        const decision = selectedRecord.decision || (selectedRecord.risk_level === "medium" ? "XEM XÉT" : (selectedRecord.approved ? "PHÊ DUYỆT" : "TỪ CHỐI"));
                        if (decision === "PHÊ DUYỆT") {
                          return <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">PHÊ DUYỆT</span>;
                        } else if (decision === "XEM XÉT") {
                          return <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20">XEM XÉT</span>;
                        } else {
                          return <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-700 ring-1 ring-inset ring-red-600/20">TỪ CHỐI</span>;
                        }
                      })()}
                    </div>
                    <span className="block text-xs font-semibold text-slate-400 mt-1">Mức độ rủi ro: {getRiskLabel(selectedRecord.risk_level)}</span>
                  </div>
                </div>

                {/* 2. Các thông tin chi tiết */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  {/* Thông tin cá nhân */}
                  <div>
                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 border-b border-indigo-100 pb-1">👤 Thông tin cá nhân</h4>
                    <ul className="space-y-1.5 text-xs">
                      <li><span className="text-slate-500">Tuổi:</span> <span className="font-semibold text-slate-900">{selectedRecord.person_age} tuổi</span></li>
                      <li><span className="text-slate-500">Thu nhập hàng năm:</span> <span className="font-semibold text-slate-900">{formatCurrency(selectedRecord.person_income)}</span></li>
                      <li><span className="text-slate-500">Số năm làm việc:</span> <span className="font-semibold text-slate-900">{selectedRecord.formData.person_emp_length !== null ? `${selectedRecord.formData.person_emp_length} năm` : "Chưa có"}</span></li>
                      <li><span className="text-slate-500">Trình độ học vấn:</span> <span className="font-semibold text-slate-900">{getEducationLevelLabel(selectedRecord.formData.education_level)}</span></li>
                      <li><span className="text-slate-500">Loại hình công việc:</span> <span className="font-semibold text-slate-900">{getEmploymentTypeLabel(selectedRecord.formData.employment_type)}</span></li>
                      <li><span className="text-slate-500">Tình trạng nhà ở:</span> <span className="font-semibold text-slate-900">{getHomeOwnershipLabel(selectedRecord.formData.person_home_ownership)}</span></li>
                    </ul>
                  </div>

                  {/* Thông tin khoản vay */}
                  <div>
                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 border-b border-indigo-100 pb-1">Khoản vay đề xuất</h4>
                    <ul className="space-y-1.5 text-xs">
                      <li><span className="text-slate-500">Số tiền vay:</span> <span className="font-semibold text-slate-900">{formatCurrency(selectedRecord.loan_amnt)}</span></li>
                      <li><span className="text-slate-500">Lãi suất %:</span> <span className="font-semibold text-slate-900">{selectedRecord.formData.loan_int_rate !== null ? `${selectedRecord.formData.loan_int_rate}%` : "Chưa xác định"}</span></li>
                      <li><span className="text-slate-500">Thời hạn vay:</span> <span className="font-semibold text-slate-900">{selectedRecord.formData.loan_term_months} tháng</span></li>
                      <li><span className="text-slate-500">Mục đích vay:</span> <span className="font-semibold text-slate-900">{getLoanIntentLabel(selectedRecord.formData.loan_intent)}</span></li>
                    </ul>
                  </div>

                  {/* Lịch sử tín dụng và nợ */}
                  <div>
                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 border-b border-indigo-100 pb-1"> Lịch sử & Dư nợ</h4>
                    <ul className="space-y-1.5 text-xs">
                      <li><span className="text-slate-500">Lịch sử tín dụng:</span> <span className="font-semibold text-slate-900">{selectedRecord.formData.cb_person_cred_hist_length} năm</span></li>
                      <li><span className="text-slate-500">Số tài khoản tín dụng:</span> <span className="font-semibold text-slate-900">{selectedRecord.formData.open_accounts} tài khoản</span></li>
                      <li><span className="text-slate-500">Số lần trễ hạn:</span> <span className="font-semibold text-slate-900">{selectedRecord.formData.past_delinquencies} lần</span></li>
                      <li><span className="text-slate-500">Tiền sử vỡ nợ:</span> <span className="font-semibold text-slate-900">{selectedRecord.formData.cb_person_default_on_file === "Y" ? "Có" : "Không"}</span></li>
                      <li><span className="text-slate-500">Tỷ lệ sử dụng tín dụng:</span> <span className="font-semibold text-slate-900">{(selectedRecord.formData.credit_utilization_ratio * 100).toFixed(0)}%</span></li>
                      <li><span className="text-slate-500">Dư nợ khác:</span> <span className="font-semibold text-slate-900">{formatCurrency(selectedRecord.formData.other_debt)}</span></li>
                    </ul>
                  </div>
                </div>

                {/* 3. Khuyến nghị chi tiết */}
                {selectedRecord.recommendations && selectedRecord.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 border-b border-indigo-100 pb-1">Đánh giá & Khuyến nghị</h4>
                    <ul className="list-inside list-disc space-y-1 text-xs text-slate-700 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50">
                      {selectedRecord.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              /* Trường hợp dữ liệu cũ */
              <div className="mt-6 space-y-4">
                <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 border border-amber-200">
                  <strong>Thông tin:</strong> Bản ghi này được tạo trước khi nâng cấp hệ thống nên chỉ hiển thị các thông tin tóm tắt cơ bản.
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div><span className="text-slate-500">Tuổi:</span> <span className="font-semibold text-slate-900">{selectedRecord.person_age} tuổi</span></div>
                  <div><span className="text-slate-500">Thu nhập:</span> <span className="font-semibold text-slate-900">{formatCurrency(selectedRecord.person_income)}</span></div>
                  <div><span className="text-slate-500">Số tiền đề xuất vay:</span> <span className="font-semibold text-slate-900">{formatCurrency(selectedRecord.loan_amnt)}</span></div>
                  <div><span className="text-slate-500">Điểm tín dụng:</span> <span className="font-semibold text-slate-900">{selectedRecord.credit_score}</span></div>
                  <div><span className="text-slate-500">Mức độ rủi ro:</span> <span className="font-semibold text-slate-900">{getRiskLabel(selectedRecord.risk_level)}</span></div>
                  <div>
                    <span className="text-slate-500">Quyết định:</span>{" "}
                    <span className="font-semibold text-slate-900">
                      {selectedRecord.decision || (selectedRecord.approved ? "PHÊ DUYỆT" : "TỪ CHỐI")}
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
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper translation functions
const getEducationLevelLabel = (level: string) => {
  switch (level) {
    case "High School": return "Trung học";
    case "Bachelor": return "Đại học";
    case "Master": return "Thạc sĩ";
    case "PhD": return "Tiến sĩ";
    default: return level;
  }
};

const getEmploymentTypeLabel = (type: string) => {
  switch (type) {
    case "Full-time": return "Toàn thời gian";
    case "Part-time": return "Bán thời gian";
    case "Self-employed": return "Tự kinh doanh";
    case "Unemployed": return "Thất nghiệp";
    default: return type;
  }
};

const getHomeOwnershipLabel = (ownership: string) => {
  switch (ownership) {
    case "RENT": return "Thuê nhà";
    case "OWN": return "Sở hữu";
    case "MORTGAGE": return "Thế chấp";
    case "OTHER": return "Khác";
    default: return ownership;
  }
};

const getLoanIntentLabel = (intent: string) => {
  switch (intent) {
    case "PERSONAL": return "Cá nhân";
    case "MEDICAL": return "Y tế";
    case "EDUCATION": return "Giáo dục";
    case "VENTURE": return "Kinh doanh";
    case "HOMEIMPROVEMENT": return "Sửa nhà";
    case "DEBTCONSOLIDATION": return "Hợp nhất nợ";
    default: return intent;
  }
};
