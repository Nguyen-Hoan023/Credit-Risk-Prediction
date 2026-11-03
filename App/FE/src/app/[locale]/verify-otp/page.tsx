"use client";
import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircleAlert, CheckCircle2, Landmark, LoaderCircle, Timer } from "lucide-react";
import { API_BASE_URL } from "@/lib/constants";

const OTP_EXPIRE_SECONDS = 5 * 60; // 5 minutes

export default function VerifyOtpPage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const locale = params.locale || "vi";

  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState("verify_register");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRE_SECONDS);
  const [resendCount, setResendCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const e = sessionStorage.getItem("nb_pending_email") || "";
    const p = sessionStorage.getItem("nb_otp_purpose") || "verify_register";
    setEmail(e);
    setPurpose(p);
    if (!e) router.push(`/${locale}/login`);
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setError("Vui lòng nhập đủ 6 chữ số OTP"); return; }
    setError("");
    setLoading(true);
    try {
      const endpoint = purpose === "verify_register" ? "/auth/verify-otp" : "/auth/reset-password";
      const body = purpose === "verify_register"
        ? { email, otp_code: code }
        : { email, otp_code: code, new_password: sessionStorage.getItem("nb_new_password") || "", confirm_password: sessionStorage.getItem("nb_new_password") || "" };

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xác nhận OTP thất bại");

      if (purpose === "verify_register") {
        setSuccess("Đăng ký thành công! Đang chuyển hướng đến trang Đăng nhập...");
        sessionStorage.removeItem("nb_pending_email");
        sessionStorage.removeItem("nb_otp_purpose");
        setTimeout(() => router.push(`/${locale}/login`), 2000);
      } else {
        setSuccess("Mật khẩu đã được đặt lại thành công!");
        sessionStorage.clear();
        setTimeout(() => router.push(`/${locale}/login`), 2000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0 || resendCount >= 3) return;
    setResending(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Gửi lại OTP thất bại");
      setOtp(["", "", "", "", "", ""]);
      setTimeLeft(OTP_EXPIRE_SECONDS);
      setResendCount(c => c + 1);
      setSuccess("Mã OTP mới đã được gửi về email của bạn.");
      setTimeout(() => setSuccess(""), 3000);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4 py-8 sm:px-6 sm:py-10">
      <div className="w-full max-w-md">
        <header className="mb-6 text-center sm:mb-8">
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-blue-800 text-white">
            <Landmark aria-hidden="true" className="size-6" />
          </div>
          <p className="text-sm font-semibold tracking-wide text-blue-800">NovaBank CreditRisk</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            {purpose === "verify_register" ? "Xác thực email" : "Đặt lại mật khẩu"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Mã OTP 6 số đã được gửi đến <strong className="font-semibold text-slate-900">{email}</strong>
          </p>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          {error && (
            <div role="alert" className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">
              <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div role="status" className="mb-5 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="mb-6 flex justify-center">
            <div className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3.5 py-2 ${timeLeft > 0 ? "border-blue-200 bg-blue-50 text-blue-900" : "border-red-200 bg-red-50 text-red-800"}`}>
              <Timer aria-hidden="true" className="size-4" />
              <span className="font-mono text-base font-semibold tabular-nums">{minutes}:{seconds}</span>
              <span className="text-xs text-slate-600">{timeLeft > 0 ? "còn lại" : "đã hết hạn"}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div role="group" aria-label="Mã xác thực OTP" className="mb-6 flex justify-center gap-1.5 sm:gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={idx === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={digit}
                  aria-label={`Chữ số OTP ${idx + 1} trong mã xác thực`}
                  aria-invalid={Boolean(error)}
                  onChange={e => handleOtpChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                  style={{ width: "clamp(34px, 11vw, 52px)", height: "clamp(48px, 15vw, 58px)" }}
                  className={`rounded-lg border text-center font-mono text-xl font-semibold text-slate-950 outline-none transition-colors focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20 sm:text-2xl ${digit ? "border-blue-700 bg-blue-50" : "border-slate-300 bg-white"}`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join("").length < 6}
              className="mb-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-800 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600"
            >
              {loading ? <><LoaderCircle aria-hidden="true" className="size-4 animate-spin" />Đang xác nhận...</> : "Xác nhận OTP"}
            </button>
          </form>

          <div className="text-center">
            {resendCount < 3 ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={timeLeft > 0 || resending}
                className="inline-flex min-h-11 items-center justify-center px-3 text-sm font-semibold text-blue-800 underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-slate-500 disabled:no-underline"
              >
                {resending ? <><LoaderCircle aria-hidden="true" className="mr-2 size-4 animate-spin" />Đang gửi lại...</> : timeLeft > 0 ? `Gửi lại sau ${minutes}:${seconds}` : `Gửi lại mã OTP (còn ${3 - resendCount} lần)`}
              </button>
            ) : (
              <p className="text-sm text-slate-600">
                Đã gửi lại OTP tối đa 3 lần. Vui lòng{" "}
                <Link href={`/${locale}/login`} className="font-semibold text-blue-800 underline-offset-4 hover:underline">đăng nhập lại</Link>.
              </p>
            )}
          </div>

          <div className="mt-5 border-t border-slate-200 pt-4 text-center">
            <Link href={`/${locale}/login`} className="inline-flex min-h-11 items-center text-sm font-medium text-slate-600 underline-offset-4 hover:text-blue-800 hover:underline">
              Quay lại đăng nhập
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
