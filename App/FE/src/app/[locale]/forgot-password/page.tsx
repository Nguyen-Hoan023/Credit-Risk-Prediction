"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/constants";

type Step = "email" | "reset";

export default function ForgotPasswordPage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const locale = params.locale || "vi";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({ otp_code: "", new_password: "", confirm_password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      await res.json();
      // Always show step 2 (anti-enumeration)
      setStep("reset");
    } catch {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.new_password !== form.confirm_password) { setError("Mật khẩu xác nhận không khớp"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Đặt lại mật khẩu thất bại");
      setSuccess("Mật khẩu đã được đặt lại thành công!");
      setTimeout(() => router.push(`/${locale}/login`), 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(30, 41, 59, 0.85)", backdropFilter: "blur(20px)",
    borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)",
    padding: "36px", boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
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
          <h1 style={{ color: "#fff", fontSize: "26px", fontWeight: 800, margin: "0 0 6px" }}>Quên mật khẩu</h1>
          <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
            {step === "email" ? "Nhập email để nhận mã OTP đặt lại mật khẩu" : "Nhập mã OTP và mật khẩu mới"}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {["📧 Email", "🔑 Đặt lại"].map((label, i) => (
            <div key={i} style={{
              flex: 1, padding: "8px", textAlign: "center", borderRadius: "8px",
              background: i === (step === "email" ? 0 : 1) ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${i === (step === "email" ? 0 : 1) ? "#3b82f6" : "rgba(255,255,255,0.07)"}`,
              color: i === (step === "email" ? 0 : 1) ? "#60a5fa" : "#64748b",
              fontSize: "12px", fontWeight: 600, transition: "all 0.3s",
            }}>{label}</div>
          ))}
        </div>

        <div style={cardStyle}>
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

          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "7px" }}>✉️ Email</label>
                <input type="email" value={email} required onChange={e => setEmail(e.target.value)}
                  placeholder="email@novabank.com" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "#3b82f6"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </div>
              <button type="submit" disabled={loading} style={btnStyle(loading)}>
                {loading ? "⏳ Đang gửi..." : "📨 Gửi mã OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "7px" }}>
                  🔢 Mã OTP (gửi đến {email})
                </label>
                <input type="text" inputMode="numeric" maxLength={6} value={form.otp_code} required
                  onChange={e => setForm({ ...form, otp_code: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                  placeholder="000000"
                  style={{ ...inputStyle, textAlign: "center", fontSize: "24px", fontWeight: 700, letterSpacing: "8px", fontFamily: "monospace" }}
                  onFocus={e => e.target.style.borderColor = "#3b82f6"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "7px" }}>🔐 Mật khẩu mới</label>
                <div style={{ position: "relative" }}>
                  <input type={showPw ? "text" : "password"} value={form.new_password} required minLength={8}
                    onChange={e => setForm({ ...form, new_password: e.target.value })}
                    placeholder="Tối thiểu 8 ký tự"
                    style={{ ...inputStyle, paddingRight: "48px" }}
                    onFocus={e => e.target.style.borderColor = "#3b82f6"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "7px" }}>🔒 Xác nhận mật khẩu</label>
                <input type={showPw ? "text" : "password"} value={form.confirm_password} required
                  onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                  placeholder="Nhập lại mật khẩu mới"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "#3b82f6"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              </div>
              <button type="submit" disabled={loading} style={btnStyle(loading)}>
                {loading ? "⏳ Đang xử lý..." : "🔑 Đặt lại mật khẩu"}
              </button>
            </form>
          )}

          <div style={{ textAlign: "center", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <Link href={`/${locale}/login`} style={{ color: "#64748b", fontSize: "13px", textDecoration: "none" }}>
              ← Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        input::placeholder { color: #475569; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 16px",
  background: "rgba(15, 23, 42, 0.6)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px", color: "#e2e8f0", fontSize: "14px",
  outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
};

const btnStyle = (loading: boolean): React.CSSProperties => ({
  width: "100%", padding: "14px",
  background: loading ? "#334155" : "linear-gradient(135deg, #1d4ed8, #7c3aed)",
  border: "none", borderRadius: "10px", color: "#fff", fontSize: "15px",
  fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
  boxShadow: loading ? "none" : "0 4px 20px rgba(59,130,246,0.3)",
  transition: "all 0.2s",
});
