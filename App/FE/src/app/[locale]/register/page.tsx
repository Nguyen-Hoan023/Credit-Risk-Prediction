"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  const strengthColor = ["", "#ef4444", "#f59e0b", "#22c55e", "#3b82f6"][strength];

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
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: "460px", position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "12px",
            padding: "10px 22px", background: "rgba(255,255,255,0.05)",
            borderRadius: "50px", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "14px",
          }}>
            <span style={{ fontSize: "22px" }}>🏦</span>
            <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "15px" }}>NovaBank CreditRisk</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: "26px", fontWeight: 800, margin: "0 0 6px" }}>Đăng ký tài khoản</h1>
          <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>Tạo tài khoản nhân viên mới</p>
        </div>

        <div style={{
          background: "rgba(30, 41, 59, 0.85)", backdropFilter: "blur(20px)",
          borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)",
          padding: "36px", boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
        }}>
          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "10px", padding: "12px 16px", marginBottom: "20px",
              color: "#fca5a5", fontSize: "14px",
            }}>⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Full Name */}
            <div>
              <label style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "7px" }}>
                👤 Họ và tên
              </label>
              <input type="text" value={form.full_name} required minLength={2}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
                placeholder="Nguyễn Văn A"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#3b82f6"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "7px" }}>
                ✉️ Email
              </label>
              <input type="email" value={form.email} required
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="email@novabank.com"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#3b82f6"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "7px" }}>
                🔐 Mật khẩu
              </label>
              <div style={{ position: "relative" }}>
                <input type={showPw ? "text" : "password"} value={form.password} required minLength={8}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Tối thiểu 8 ký tự"
                  style={{ ...inputStyle, paddingRight: "48px" }}
                  onFocus={e => e.target.style.borderColor = "#3b82f6"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: "16px" }}>
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div style={{ marginTop: "8px" }}>
                  <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: "3px", borderRadius: "2px",
                        background: i <= strength ? strengthColor : "#1e293b",
                        transition: "background 0.3s",
                      }} />
                    ))}
                  </div>
                  <span style={{ color: strengthColor, fontSize: "11px", fontWeight: 600 }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "7px" }}>
                🔒 Xác nhận mật khẩu
              </label>
              <input type={showPw ? "text" : "password"} value={form.confirm_password} required
                onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                placeholder="Nhập lại mật khẩu"
                style={{
                  ...inputStyle,
                  borderColor: form.confirm_password && form.confirm_password !== form.password ? "#ef4444" : "rgba(255,255,255,0.1)",
                }}
                onFocus={e => e.target.style.borderColor = "#3b82f6"}
                onBlur={e => e.target.style.borderColor = form.confirm_password !== form.password ? "#ef4444" : "rgba(255,255,255,0.1)"}
              />
              {form.confirm_password && form.confirm_password !== form.password && (
                <p style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px" }}>Mật khẩu không khớp</p>
              )}
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "14px",
              background: loading ? "#334155" : "linear-gradient(135deg, #1d4ed8, #7c3aed)",
              border: "none", borderRadius: "10px", color: "#fff", fontSize: "15px",
              fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 4px 20px rgba(59,130,246,0.3)",
              transition: "all 0.2s",
            }}>
              {loading ? "⏳ Đang đăng ký..." : "📨 Đăng ký & nhận OTP"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "22px", paddingTop: "22px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
              Đã có tài khoản?{" "}
              <Link href={`/${locale}/login`} style={{ color: "#60a5fa", fontWeight: 600, textDecoration: "none" }}>
                Đăng nhập
              </Link>
            </p>
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
