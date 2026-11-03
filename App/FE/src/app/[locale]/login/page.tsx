"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircleAlert, Eye, EyeOff, Landmark, LockKeyhole } from "lucide-react";
import { saveTokens } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/constants";

export default function LoginPage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const locale = params.locale || "vi";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Đăng nhập thất bại");
      saveTokens(data.access_token, data.refresh_token);

      const userRes = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` }
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.role === "admin") {
          router.push(`/${locale}/admin/users`);
        } else {
          router.push(`/${locale}/apply`);
        }
      } else {
        router.push(`/${locale}/apply`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <header className="mb-6 text-center sm:mb-8">
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-blue-800 text-white">
            <Landmark aria-hidden="true" className="size-6" />
          </div>
          <p className="text-sm font-semibold tracking-wide text-blue-800">NovaBank CreditRisk</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Đăng nhập</h1>
          <p className="mt-2 text-sm text-slate-600">Hệ thống đánh giá rủi ro tín dụng nội bộ</p>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          {error && (
            <div id="login-error" role="alert" className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">
              <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" aria-busy={loading}>
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold text-slate-800">Địa chỉ email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@novabank.com"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "login-error" : undefined}
                className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-950 placeholder:text-slate-500 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-semibold text-slate-800">Mật khẩu</label>
              <div className="relative">
                <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Nhập mật khẩu"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "login-error" : undefined}
                  className="min-h-11 w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-12 text-base text-slate-950 placeholder:text-slate-500 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  aria-pressed={showPassword}
                  className="absolute right-1 top-1/2 inline-flex min-h-10 min-w-10 -translate-y-1/2 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-700"
                >
                  {showPassword ? <EyeOff aria-hidden="true" className="size-5" /> : <Eye aria-hidden="true" className="size-5" />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link href={`/${locale}/forgot-password`} className="text-sm font-medium text-blue-800 underline-offset-4 hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-blue-800 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-5 text-center">
            <p className="text-sm text-slate-600">
              Chưa có tài khoản?{" "}
              <Link href={`/${locale}/register`} className="font-semibold text-blue-800 underline-offset-4 hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </section>

        <p className="mt-5 text-center text-xs text-slate-600">© 2026 NovaBank CreditRisk · Hệ thống nội bộ</p>
      </div>
    </main>
  );
}
