"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getAccessToken } from "@/lib/auth";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      fetch("http://localhost:8000/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Error fetching stats:", err));
    }
  }, []);

  if (!stats) return <div className="p-8">Đang tải...</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Tổng quan hệ thống</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Tổng tài khoản</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.total_users}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Hồ sơ đã phê duyệt</h3>
          <p className="text-3xl font-bold text-green-600">{stats.decisions.approve}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Hồ sơ chờ xem xét</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.decisions.review}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Hồ sơ bị từ chối</h3>
          <p className="text-3xl font-bold text-red-600">{stats.decisions.reject}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-6">Biểu đồ dự đoán 30 ngày qua</h3>
        <div className="h-80 w-full">
          {stats.daily_predictions && stats.daily_predictions.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.daily_predictions}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Số hồ sơ" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Chưa có dữ liệu dự đoán trong 30 ngày qua.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
