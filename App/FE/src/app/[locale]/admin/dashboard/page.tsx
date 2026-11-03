"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CheckCircle2, CircleAlert, FileText, LoaderCircle, Users } from "lucide-react";
import { getAccessToken } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/constants";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch((err) => console.error("Error fetching stats:", err));
    }
  }, []);

  if (!stats) {
    return (
      <div role="status" className="flex min-h-64 items-center justify-center gap-3 p-6 text-sm text-slate-600">
        <LoaderCircle aria-hidden="true" className="size-5 animate-spin text-blue-700" />
        Đang tải tổng quan...
      </div>
    );
  }

  const cards = [
    { label: "Tổng tài khoản", value: stats.total_users, icon: Users, tone: "text-blue-800 bg-blue-50" },
    { label: "Hồ sơ đã phê duyệt", value: stats.decisions.approve, icon: CheckCircle2, tone: "text-emerald-800 bg-emerald-50" },
    { label: "Hồ sơ chờ xem xét", value: stats.decisions.review, icon: CircleAlert, tone: "text-amber-800 bg-amber-50" },
    { label: "Hồ sơ bị từ chối", value: stats.decisions.reject, icon: FileText, tone: "text-red-800 bg-red-50" },
  ];

  return (
    <div className="mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-8">
      <header className="mb-6 sm:mb-8">
        <p className="text-sm font-medium text-blue-800">NovaBank CreditRisk</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Tổng quan hệ thống</h1>
        <p className="mt-2 text-sm text-slate-600">Tình hình tài khoản và kết quả thẩm định tín dụng.</p>
      </header>

      <section aria-label="Chỉ số tổng quan" className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-medium text-slate-600">{label}</h2>
                <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-slate-950">{value}</p>
              </div>
              <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${tone}`}>
                <Icon aria-hidden="true" className="size-5" />
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-950 sm:text-lg">Biểu đồ dự đoán 30 ngày qua</h2>
          <p className="mt-1 text-sm text-slate-600">Số hồ sơ được đánh giá theo ngày.</p>
        </div>
        <div className="h-72 w-full sm:h-80" role="img" aria-label="Biểu đồ số hồ sơ dự đoán trong 30 ngày qua">
          {stats.daily_predictions && stats.daily_predictions.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.daily_predictions} margin={{ top: 8, right: 8, left: -20, bottom: 4 }}>
                <CartesianGrid stroke="#dce3ec" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#526278", fontSize: 12 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#526278", fontSize: 12 }} />
                <Tooltip cursor={{ fill: "#eff3f8" }} contentStyle={{ borderRadius: 8, borderColor: "#dce3ec" }} />
                <Bar dataKey="count" fill="#1d4ed8" radius={[4, 4, 0, 0]} name="Số hồ sơ" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg bg-slate-50 px-4 text-center text-sm text-slate-600">
              Chưa có dữ liệu dự đoán trong 30 ngày qua.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
