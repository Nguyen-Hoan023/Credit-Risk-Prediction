"use client";
import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveTokens } from "@/lib/auth";
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
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: "440px", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "12px",
            padding: "10px 22px", background: "rgba(255,255,255,0.05)",
            borderRadius: "50px", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "14px",
          }}>
            <span style={{ fontSize: "22px" }}>🏦</span>
            <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "15px" }}>NovaBank CreditRisk</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: "26px", fontWeight: 800, margin: "0 0 6px" }}>
            {purpose === "verify_register" ? "Xác thực Email" : "Đặt lại mật khẩu"}
          </h1>
          <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
            Mã OTP 6 số đã được gửi đến <strong style={{ color: "#94a3b8" }}>{email}</strong>
          </p>
        </div>

        <div style={{
          background: "rgba(30, 41, 59, 0.85)", backdropFilter: "blur(20px)",
          borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)",
          padding: "36px", boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
        }}>
          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", color: "#fca5a5", fontSize: "14px" }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", color: "#86efac", fontSize: "14px" }}>
              ✅ {success}
            </div>
          )}

          {/* Countdown */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "10px 20px",
              background: timeLeft > 0 ? "rgba(59,130,246,0.1)" : "rgba(239,68,68,0.1)",
              border: `1px solid ${timeLeft > 0 ? "rgba(59,130,246,0.3)" : "rgba(239,68,68,0.3)"}`,
              borderRadius: "50px",
            }}>
              <span style={{ fontSize: "16px" }}>⏱</span>
              <span style={{
                color: timeLeft > 0 ? "#60a5fa" : "#f87171",
                fontWeight: 700, fontSize: "20px", fontFamily: "monospace",
              }}>
                {minutes}:{seconds}
              </span>
              <span style={{ color: "#64748b", fontSize: "12px" }}>
                {timeLeft > 0 ? "còn lại" : "đã hết hạn"}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* OTP Inputs */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "28px" }}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                  style={{
                    width: "52px", height: "60px",
                    textAlign: "center", fontSize: "24px", fontWeight: 800,
                    background: digit ? "rgba(59,130,246,0.15)" : "rgba(15,23,42,0.6)",
                    border: `2px solid ${digit ? "#3b82f6" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: "12px", color: digit ? "#60a5fa" : "#e2e8f0",
                    outline: "none", transition: "all 0.2s", cursor: "text",
                    fontFamily: "monospace",
                  }}
                />
              ))}
            </div>

            <button type="submit" disabled={loading || otp.join("").length < 6} style={{
              width: "100%", padding: "14px",
              background: (loading || otp.join("").length < 6) ? "#334155" : "linear-gradient(135deg, #1d4ed8, #7c3aed)",
              border: "none", borderRadius: "10px", color: "#fff", fontSize: "15px",
              fontWeight: 700, cursor: (loading || otp.join("").length < 6) ? "not-allowed" : "pointer",
              boxShadow: (loading || otp.join("").length < 6) ? "none" : "0 4px 20px rgba(59,130,246,0.3)",
              transition: "all 0.2s", marginBottom: "16px",
            }}>
              {loading ? "⏳ Đang xác nhận..." : "✅ Xác nhận OTP"}
            </button>
          </form>

          {/* Resend */}
          <div style={{ textAlign: "center" }}>
            {resendCount < 3 ? (
              <button onClick={handleResend} disabled={timeLeft > 0 || resending} style={{
                background: "none", border: "none", cursor: timeLeft > 0 ? "not-allowed" : "pointer",
                color: timeLeft > 0 ? "#475569" : "#60a5fa", fontSize: "13px", fontWeight: 600,
              }}>
                {resending ? "⏳ Đang gửi lại..." : timeLeft > 0 ? `Gửi lại sau ${minutes}:${seconds}` : `🔄 Gửi lại mã OTP (còn ${3 - resendCount} lần)`}
              </button>
            ) : (
              <p style={{ color: "#64748b", fontSize: "12px", margin: 0 }}>
                Đã gửi lại OTP tối đa 3 lần. Vui lòng{" "}
                <Link href={`/${locale}/login`} style={{ color: "#60a5fa" }}>đăng nhập lại</Link>.
              </p>
            )}
          </div>

          <div style={{ textAlign: "center", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <Link href={`/${locale}/login`} style={{ color: "#64748b", fontSize: "13px", textDecoration: "none" }}>
              ← Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
