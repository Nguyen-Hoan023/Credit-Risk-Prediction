"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/auth";
import Link from "next/link";
import { Eye } from "lucide-react";
import { fetchCreditHistory } from "@/lib/api";
import HistoryDetailModal from "@/components/HistoryDetailModal";

export default function AdminPredictions() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      fetchCreditHistory()
        .then(data => setPredictions(data))
        .catch(err => console.error("Error fetching predictions:", err));
    }
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Tất cả hồ sơ dự đoán</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
              <th className="p-4 font-medium">Mã HS</th>
              <th className="p-4 font-medium">Người đánh giá</th>
              <th className="p-4 font-medium">Khoản vay</th>
              <th className="p-4 font-medium">Điểm TD</th>
              <th className="p-4 font-medium">Mức Rủi ro</th>
              <th className="p-4 font-medium">Quyết định</th>
              <th className="p-4 font-medium">Ngày tạo</th>
              <th className="p-4 font-medium text-center">Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {predictions.map(pred => (
              <tr key={pred.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">#{pred.id}</td>
                <td className="p-4 text-gray-600">
                  {pred.user ? (
                    <div>
                      <div className="font-medium text-gray-900">{pred.user.full_name}</div>
                      <div className="text-xs text-gray-500">{pred.user.email}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Hệ thống (cũ)</span>
                  )}
                </td>
                <td className="p-4 font-medium">${pred.loan_amnt.toLocaleString()}</td>
                <td className="p-4 font-bold text-blue-600">{pred.credit_score}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${pred.risk_level === 'low' ? 'bg-green-100 text-green-700' : 
                      pred.risk_level === 'high' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'}`}>
                    {pred.risk_level.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${pred.decision === 'APPROVE' ? 'bg-green-100 text-green-700' : 
                      pred.decision === 'REJECT' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'}`}>
                    {pred.decision}
                  </span>
                </td>
                <td className="p-4 text-gray-500 text-sm">
                  {new Date(pred.created_at).toLocaleString("vi-VN")}
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => setSelectedRecord(pred)} className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {predictions.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Chưa có hồ sơ nào trong hệ thống.
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <HistoryDetailModal selectedRecord={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}
    </div>
  );
}
