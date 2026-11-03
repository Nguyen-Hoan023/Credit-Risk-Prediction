"use client";

import { useEffect, useRef, useState } from "react";
import { getAccessToken } from "@/lib/auth";
import { Eye } from "lucide-react";
import { fetchCreditHistory } from "@/lib/api";
import HistoryDetailModal from "@/components/HistoryDetailModal";

export default function AdminPredictions() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      fetchCreditHistory()
        .then(data => setPredictions(data))
        .catch(err => console.error("Error fetching predictions:", err));
    }
  }, []);

  return (
    <div className="mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <p className="text-sm font-medium text-blue-800">NovaBank CreditRisk</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Tất cả hồ sơ dự đoán</h1>
        <p className="mt-2 text-sm text-slate-600">Danh sách các hồ sơ đã được đánh giá trong hệ thống.</p>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <th scope="col" className="px-4 py-3.5">Mã HS</th>
              <th scope="col" className="px-4 py-3.5">Người đánh giá</th>
              <th scope="col" className="px-4 py-3.5">Khoản vay</th>
              <th scope="col" className="px-4 py-3.5">Điểm TD</th>
              <th scope="col" className="px-4 py-3.5">Mức rủi ro</th>
              <th scope="col" className="px-4 py-3.5">Quyết định</th>
              <th scope="col" className="px-4 py-3.5">Ngày tạo</th>
              <th scope="col" className="px-4 py-3.5 text-center">Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {predictions.map(pred => (
              <tr key={pred.id} className="border-b border-slate-100 text-slate-800 transition-colors last:border-0 hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-950">#{pred.id}</td>
                <td className="px-4 py-3.5 text-slate-600">
                  {pred.user ? (
                    <div>
                      <div className="font-medium text-slate-900">{pred.user.full_name}</div>
                      <div className="mt-0.5 text-xs text-slate-600">{pred.user.email}</div>
                    </div>
                  ) : (
                    <span className="text-slate-600">Hệ thống (cũ)</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 font-medium tabular-nums">${pred.loan_amnt.toLocaleString()}</td>
                <td className="px-4 py-3.5 font-semibold tabular-nums text-blue-800">{pred.credit_score}</td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex min-h-7 items-center rounded-md px-2.5 py-1 text-xs font-semibold
                    ${pred.risk_level === 'low' ? 'bg-emerald-50 text-emerald-800' :
                      pred.risk_level === 'high' ? 'bg-red-50 text-red-800' :
                      'bg-amber-50 text-amber-800'}`}>
                    {pred.risk_level.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex min-h-7 items-center rounded-md px-2.5 py-1 text-xs font-semibold
                    ${pred.decision === 'APPROVE' ? 'bg-emerald-50 text-emerald-800' :
                      pred.decision === 'REJECT' ? 'bg-red-50 text-red-800' :
                      'bg-amber-50 text-amber-800'}`}>
                    {pred.decision}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-sm text-slate-600">
                  {new Date(pred.created_at).toLocaleString("vi-VN")}
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    type="button"
                    onClick={(event) => { returnFocusRef.current = event.currentTarget; setSelectedRecord(pred); }}
                    aria-label={`Xem chi tiết hồ sơ #${pred.id}`}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-blue-800 transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  >
                    <Eye aria-hidden="true" className="size-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {predictions.length === 0 && (
          <div className="border-t border-slate-200 px-4 py-10 text-center text-sm text-slate-600">
            Chưa có hồ sơ nào trong hệ thống.
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <HistoryDetailModal selectedRecord={selectedRecord} onClose={() => { setSelectedRecord(null); returnFocusRef.current?.focus(); }} />
      )}
    </div>
  );
}
