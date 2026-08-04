"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      {/* Background particles */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${["#3b82f620", "#7c3aed20", "#1d4ed820"][i % 3]} 0%, transparent 70%)`,
            width: `${[600, 400, 500, 350, 450, 300][i]}px`,
            height: `${[600, 400, 500, 350, 450, 300][i]}px`,
            top: `${[-10, 60, 30, 80, 10, 50][i]}%`,
            left: `${[-10, 70, 40, -5, 80, 20][i]}%`,
            transform: "translate(-50%, -50%)",
            animation: `float ${[8, 12, 10, 9, 11, 7][i]}s ease-in-out infinite alternate`,
          }} />
        ))}
      </div>

      <div style={{
        width: "100%",
        maxWidth: "440px",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: 800, margin: "0 0 8px" }}>
            Đăng nhập
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            Hệ thống đánh giá rủi ro tín dụng nội bộ
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(30, 41, 59, 0.8)",
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.1)",
          padding: "36px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
        }}>
          {error && (
            <div style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "10px",
              padding: "12px 16px",
              marginBottom: "20px",
              color: "#fca5a5",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Email */}
            <div>
              <label style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                Địa chỉ Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="email@novabank.com"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  color: "#e2e8f0",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "#3b82f6"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                Mật khẩu
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Nhập mật khẩu"
                  style={{
                    width: "100%",
                    padding: "12px 48px 12px 16px",
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    color: "#e2e8f0",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#3b82f6"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: "16px",
                  }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <div style={{ textAlign: "right", marginTop: "8px" }}>
                <Link href={`/${locale}/forgot-password`} style={{ color: "#60a5fa", fontSize: "12px", textDecoration: "none" }}>
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                background: loading ? "#334155" : "linear-gradient(135deg, #1d4ed8, #7c3aed)",
                border: "none",
                borderRadius: "10px",
                color: "#fff",
                fontSize: "15px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                letterSpacing: "0.5px",
                boxShadow: loading ? "none" : "0 4px 20px rgba(59, 130, 246, 0.3)",
              }}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "24px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
              Chưa có tài khoản?{" "}
              <Link href={`/${locale}/register`} style={{ color: "#60a5fa", fontWeight: 600, textDecoration: "none" }}>
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        <p style={{ textAlign: "center", color: "#334155", fontSize: "11px", marginTop: "20px" }}>
          © 2026 NovaBank CreditRisk · Hệ thống nội bộ
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes float {
          from { transform: translate(-50%, -50%) scale(1); }
          to { transform: translate(-50%, -50%) scale(1.1); }
        }
        input::placeholder { color: #475569; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
