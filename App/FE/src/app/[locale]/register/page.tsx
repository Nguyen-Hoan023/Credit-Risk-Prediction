"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircleAlert, Eye, EyeOff, Landmark } from "lucide-react";
import { API_BASE_URL } from "@/lib/constants";

export default function RegisterPage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const locale = params.locale || "vi";

  const [form, setForm] = useState({ full_name: "", email: "", password: "", confirm_password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pwStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = pwStrength(form.password);
  const strengthLabel = ["", "Yếu", "Trung bình", "Tốt", "Mạnh"][strength];
  const strengthColor = ["", "#b42318", "#a15c00", "#18794e", "#1d4ed8"][strength];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm_password) { setError("Mật khẩu xác nhận không khớp"); return; }
    if (strength < 2) { setError("Mật khẩu quá yếu. Cần ít nhất 8 ký tự, chữ hoa và số."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Đăng ký thất bại");
      // Redirect to OTP page
      sessionStorage.setItem("nb_pending_email", form.email);
      sessionStorage.setItem("nb_otp_purpose", "verify_register");
      router.push(`/${locale}/verify-otp`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4 py-8 sm:px-6">
      <div className="w-full max-w-lg">
        <header className="mb-6 text-center">
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-blue-800 text-white">
            <Landmark aria-hidden="true" className="size-6" />
          </div>
          <p className="text-sm font-semibold tracking-wide text-blue-800">NovaBank CreditRisk</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Đăng ký tài khoản</h1>
          <p className="mt-2 text-sm text-slate-600">Tạo tài khoản nhân viên mới</p>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          {error && (
            <div id="register-error" role="alert" className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">
              <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" aria-busy={loading}>
            <div>
              <label htmlFor="register-name" className="mb-1.5 block text-sm font-semibold text-slate-800">Họ và tên</label>
              <input
                id="register-name" type="text" autoComplete="name" value={form.full_name} required minLength={2}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
                placeholder="Nguyễn Văn A" aria-invalid={Boolean(error)} aria-describedby={error ? "register-error" : undefined}
                className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-950 placeholder:text-slate-500 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="register-email" className="mb-1.5 block text-sm font-semibold text-slate-800">Email</label>
              <input
                id="register-email" type="email" autoComplete="email" value={form.email} required
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="email@novabank.com" aria-invalid={Boolean(error)} aria-describedby={error ? "register-error" : undefined}
                className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-950 placeholder:text-slate-500 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="register-password" className="mb-1.5 block text-sm font-semibold text-slate-800">Mật khẩu</label>
              <div className="relative">
                <input
                  id="register-password" type={showPw ? "text" : "password"} autoComplete="new-password" value={form.password} required minLength={8}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Tối thiểu 8 ký tự" aria-invalid={Boolean(error)} aria-describedby="password-strength"
                  className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-12 text-base text-slate-950 placeholder:text-slate-500 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20 sm:text-sm"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"} aria-pressed={showPw}
                  className="absolute right-1 top-1/2 inline-flex min-h-10 min-w-10 -translate-y-1/2 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-700">
                  {showPw ? <EyeOff aria-hidden="true" className="size-5" /> : <Eye aria-hidden="true" className="size-5" />}
                </button>
              </div>
              {form.password && (
                <div id="password-strength" className="mt-2" aria-label={`Độ mạnh mật khẩu: ${strengthLabel}`}>
                  <div className="flex gap-1" aria-hidden="true">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full" style={{ background: i <= strength ? strengthColor : "#dce3ec" }} />
                    ))}
                  </div>
                  <span className="mt-1 block text-xs font-semibold" style={{ color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="register-confirm-password" className="mb-1.5 block text-sm font-semibold text-slate-800">Xác nhận mật khẩu</label>
              <input
                id="register-confirm-password" type={showPw ? "text" : "password"} autoComplete="new-password" value={form.confirm_password} required
                onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                placeholder="Nhập lại mật khẩu" aria-invalid={Boolean(form.confirm_password && form.confirm_password !== form.password)}
                aria-describedby={form.confirm_password && form.confirm_password !== form.password ? "confirm-password-error" : undefined}
                className={`min-h-11 w-full rounded-lg border bg-white px-3.5 py-2.5 text-base text-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 sm:text-sm ${form.confirm_password && form.confirm_password !== form.password ? "border-red-500 focus:ring-red-500/20" : "border-slate-300 focus:border-blue-700 focus:ring-blue-700/20"}`}
              />
              {form.confirm_password && form.confirm_password !== form.password && (
                <p id="confirm-password-error" role="alert" className="mt-1 text-sm text-red-700">Mật khẩu không khớp</p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-blue-800 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 disabled:cursor-wait disabled:opacity-70">
              {loading ? "Đang đăng ký..." : "Đăng ký & nhận OTP"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-5 text-center">
            <p className="text-sm text-slate-600">
              Đã có tài khoản?{" "}
              <Link href={`/${locale}/login`} className="font-semibold text-blue-800 underline-offset-4 hover:underline">Đăng nhập</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
