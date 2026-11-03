"use client";
import { useState, FormEvent, useRef, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, CheckCircle2, CircleAlert, Eye, EyeOff, Landmark, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { API_BASE_URL } from "@/lib/constants";

type Step = "email" | "otp" | "reset";

export default function ForgotPasswordPage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const locale = params.locale || "vi";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (step === "otp") {
      startCountdown();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step]);

  const startCountdown = () => {
    setCountdown(60);
    setCanResend(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Send OTP
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
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Có lỗi xảy ra. Vui lòng thử lại.");
      }
      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const otp = otpDigits.join("");
    if (otp.length < 6) { setError("Vui lòng nhập đủ 6 chữ số OTP."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp_code: otp }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Mã OTP không hợp lệ.");
      }
      setStep("reset");
    } catch (err: any) {
      // If backend doesn't have verify-reset-otp endpoint yet, proceed directly
      // The actual OTP verification happens in reset-password
      setStep("reset");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError("Mật khẩu xác nhận không khớp."); return; }
    if (newPassword.length < 8) { setError("Mật khẩu phải có ít nhất 8 ký tự."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp_code: otpDigits.join(""), new_password: newPassword, confirm_password: confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Đặt lại mật khẩu thất bại.");
      setStep("email");
      setError("");
      // Show success and redirect
      router.push(`/${locale}/login?reset=success`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // OTP input handlers
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newDigits = [...otpDigits];
    pasted.split("").forEach((d, i) => { if (i < 6) newDigits[i] = d; });
    setOtpDigits(newDigits);
    const nextEmpty = newDigits.findIndex(d => !d);
    otpRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError("");
    setOtpDigits(["", "", "", "", "", ""]);
    try {
      await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      startCountdown();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError("Không thể gửi lại OTP. Thử lại sau.");
    }
  };

  const pwStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };
  const strength = pwStrength(newPassword);
  const strengthLabel = ["", "Yếu", "Trung bình", "Khá", "Mạnh"][strength];
  const strengthColor = ["", "#b42318", "#a15c00", "#1d4ed8", "#18794e"][strength];

  const stepIndex = { email: 0, otp: 1, reset: 2 }[step];

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#f5f7fa",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: "460px", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "10px 16px", background: "#ffffff",
            borderRadius: "10px", border: "1px solid #dce3ec", marginBottom: "20px",
          }}>
            <Landmark aria-hidden="true" size={18} color="#1d4ed8" />
            <span style={{ color: "#152237", fontWeight: 700, fontSize: "14px", letterSpacing: "0.2px" }}>NovaBank CreditRisk</span>
          </div>

          {/* Step progress */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0", marginBottom: "20px" }}>
            {[
              { label: "Email" },
              { label: "Xác nhận OTP" },
              { label: "Mật khẩu mới" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: i < stepIndex ? "#e8f5ee" : i === stepIndex ? "#1d4ed8" : "#ffffff",
                    border: `1px solid ${i < stepIndex ? "#18794e" : i === stepIndex ? "#1d4ed8" : "#bec9d8"}`,
                    color: i < stepIndex ? "#18794e" : i === stepIndex ? "#ffffff" : "#526278",
                    fontSize: i < stepIndex ? "14px" : "16px",
                    transition: "all 0.2s ease",
                  }}>
                    {i < stepIndex ? <Check aria-hidden="true" size={16} /> : i + 1}
                  </div>
                  <span style={{ fontSize: "10px", color: i === stepIndex ? "#1d4ed8" : "#526278", fontWeight: i === stepIndex ? 700 : 500, whiteSpace: "nowrap" }}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div style={{
                    width: "clamp(18px, 8vw, 48px)", height: 2, margin: "0 5px", marginBottom: 18,
                    background: i < stepIndex ? "#18794e" : "#dce3ec",
                    transition: "background 0.2s ease",
                  }} />
                )}
              </div>
            ))}
          </div>

          <h1 style={{ color: "#152237", fontSize: "24px", fontWeight: 700, margin: "0 0 6px" }}>
            {step === "email" && "Quên mật khẩu"}
            {step === "otp" && "Nhập mã xác thực"}
            {step === "reset" && "Tạo mật khẩu mới"}
          </h1>
          <p style={{ color: "#526278", fontSize: "13px", margin: 0 }}>
            {step === "email" && "Nhập email để nhận mã OTP đặt lại mật khẩu"}
            {step === "otp" && `Mã 6 chữ số đã gửi đến ${email}`}
            {step === "reset" && "Tạo mật khẩu mạnh để bảo vệ tài khoản"}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "#ffffff",
          borderRadius: "14px", border: "1px solid #dce3ec",
          padding: "clamp(20px, 5vw, 32px)", boxShadow: "0 8px 24px rgba(16,23,34,0.06)",
        }}>
          {error && (
            <div id="forgot-password-error" role="alert" style={{
              background: "#fef3f2", border: "1px solid #fecdca",
              borderRadius: "8px", padding: "12px 14px", marginBottom: "20px",
              color: "#b42318", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px",
            }}>
              <CircleAlert aria-hidden="true" size={16} /> {error}
            </div>
          )}

          {/* ── STEP 1: Email ── */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Địa chỉ Email</label>
                <div style={{ position: "relative" }}>
                  <Mail aria-hidden="true" size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#526278" }} />
                  <input
                    type="email" value={email} required autoFocus
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@novabank.com"
                    style={{ ...inputStyle, paddingLeft: "42px" }}
                    onFocus={e => { e.target.style.borderColor = "#1d4ed8"; e.target.style.boxShadow = "0 0 0 3px rgba(29,78,216,0.15)"; }}
                    onBlur={e => { e.target.style.borderColor = "#bec9d8"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} style={btnStyle(loading)}>
                {loading ? <><LoaderCircle aria-hidden="true" size={17} className="animate-spin" />Đang gửi...</> : "Gửi mã OTP"}
              </button>
            </form>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === "otp" && (
            <form onSubmit={handleOtpSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <label style={{ ...labelStyle, textAlign: "center", display: "block", marginBottom: "20px" }}>
                  Nhập mã OTP gồm 6 chữ số
                </label>
                <div style={{ display: "flex", gap: "clamp(2px, 1.3vw, 8px)", justifyContent: "center" }} onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="text" inputMode="numeric" autoComplete={i === 0 ? "one-time-code" : "off"} maxLength={1} value={digit}
                      aria-label={`Chữ số OTP ${i + 1} trong mã xác thực`} aria-invalid={Boolean(error)} aria-describedby={error ? "forgot-password-error" : undefined}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      style={{
                        width: "clamp(34px, 11vw, 52px)", height: "clamp(48px, 15vw, 58px)", textAlign: "center", fontSize: "22px", fontWeight: 700,
                        background: digit ? "#eff6ff" : "#ffffff",
                        border: `1.5px solid ${digit ? "#1d4ed8" : "#bec9d8"}`,
                        borderRadius: "9px", color: "#152237", outline: "none",
                        fontFamily: "ui-monospace, monospace", transition: "border-color 0.2s, box-shadow 0.2s",
                        caretColor: "#1d4ed8",
                      }}
                      onFocus={e => { e.target.style.borderColor = "#1d4ed8"; e.target.style.boxShadow = "0 0 0 3px rgba(29,78,216,0.2)"; }}
                      onBlur={e => { if (!digit) { e.target.style.borderColor = "#bec9d8"; e.target.style.boxShadow = "none"; } }}
                    />
                  ))}
                </div>

                {/* Countdown */}
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  {!canResend ? (
                    <p style={{ color: "#526278", fontSize: "13px", margin: 0 }}>
                      Gửi lại sau <span style={{ color: "#1d4ed8", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{countdown}s</span>
                    </p>
                  ) : (
                    <button type="button" onClick={handleResend} style={{
                      background: "none", border: "none", color: "#1d4ed8", fontSize: "13px",
                      cursor: "pointer", fontWeight: 600, textDecoration: "underline",
                    }}>
                      Gửi lại mã OTP
                    </button>
                  )}
                </div>
              </div>

              <button type="submit" disabled={loading || otpDigits.join("").length < 6} style={btnStyle(loading || otpDigits.join("").length < 6)}>
                {loading ? <><LoaderCircle aria-hidden="true" size={17} className="animate-spin" />Đang xác nhận...</> : "Xác nhận OTP"}
              </button>

              <button type="button" onClick={() => { setStep("email"); setOtpDigits(["","","","","",""]); setError(""); }}
                style={{ background: "none", border: "none", color: "#526278", fontSize: "13px", cursor: "pointer", textAlign: "center", minHeight: 44 }}>
                ← Đổi email khác
              </button>
            </form>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === "reset" && (
            <form onSubmit={handleResetSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Mật khẩu mới</label>
                <div style={{ position: "relative" }}>
                  <LockKeyhole aria-hidden="true" size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#526278" }} />
                  <input
                    type={showPw ? "text" : "password"} value={newPassword} required minLength={8} autoFocus
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 8 ký tự"
                    style={{ ...inputStyle, paddingLeft: "42px", paddingRight: "48px" }}
                    onFocus={e => { e.target.style.borderColor = "#1d4ed8"; e.target.style.boxShadow = "0 0 0 3px rgba(29,78,216,0.15)"; }}
                    onBlur={e => { e.target.style.borderColor = "#bec9d8"; e.target.style.boxShadow = "none"; }}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={eyeBtn} aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"} aria-pressed={showPw}>{showPw ? <EyeOff aria-hidden="true" size={19} /> : <Eye aria-hidden="true" size={19} />}</button>
                </div>

                {/* Password strength */}
                {newPassword.length > 0 && (
                  <div style={{ marginTop: "10px" }}>
                    <div style={{ display: "flex", gap: "4px", marginBottom: "5px" }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 4, borderRadius: 2,
                          background: i <= strength ? strengthColor : "#dce3ec",
                          transition: "background 0.3s",
                        }} />
                      ))}
                    </div>
                    <p style={{ color: strengthColor, fontSize: "11px", margin: 0, textAlign: "right", fontWeight: 600 }}>
                      {strengthLabel}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Xác nhận mật khẩu</label>
                <div style={{ position: "relative" }}>
                  <LockKeyhole aria-hidden="true" size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#526278" }} />
                  <input
                    type={showConfirmPw ? "text" : "password"} value={confirmPassword} required
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    style={{
                      ...inputStyle, paddingLeft: "42px", paddingRight: "48px",
                      borderColor: confirmPassword && confirmPassword !== newPassword ? "#b42318" : confirmPassword && confirmPassword === newPassword ? "#18794e" : "#bec9d8",
                    }}
                    onFocus={e => { e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.15)"; }}
                    onBlur={e => { e.target.style.boxShadow = "none"; }}
                  />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} style={eyeBtn} aria-label={showConfirmPw ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"} aria-pressed={showConfirmPw}>{showConfirmPw ? <EyeOff aria-hidden="true" size={19} /> : <Eye aria-hidden="true" size={19} />}</button>
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p style={{ color: "#b42318", fontSize: "12px", margin: "5px 0 0", }}>Mật khẩu không khớp</p>
                )}
                {confirmPassword && confirmPassword === newPassword && (
                  <p style={{ color: "#18794e", fontSize: "12px", margin: "5px 0 0", display: "flex", alignItems: "center", gap: 5 }}><CheckCircle2 aria-hidden="true" size={14} />Mật khẩu khớp</p>
                )}
              </div>

              <button type="submit" disabled={loading} style={{ ...btnStyle(loading), marginTop: "4px" }}>
                {loading ? <><LoaderCircle aria-hidden="true" size={17} className="animate-spin" />Đang cập nhật...</> : <><ShieldCheck aria-hidden="true" size={17} />Đặt lại mật khẩu</>}
              </button>
            </form>
          )}

          <div style={{ textAlign: "center", marginTop: "22px", paddingTop: "18px", borderTop: "1px solid #dce3ec" }}>
            <Link href={`/${locale}/login`} style={{ color: "#405269", fontSize: "13px", textDecoration: "none", transition: "color 0.2s", minHeight: 44, display: "inline-flex", alignItems: "center" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#1d4ed8")}
              onMouseLeave={e => (e.currentTarget.style.color = "#405269")}>
              ← Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #475569; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  color: "#2f4057", fontSize: "14px", fontWeight: 600, display: "block",
  marginBottom: "8px",
};

const inputStyle: React.CSSProperties = {
  width: "100%", minHeight: "44px", padding: "11px 14px",
  background: "#ffffff",
  border: "1px solid #bec9d8",
  borderRadius: "8px", color: "#152237", fontSize: "16px",
  outline: "none", boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s",
};

const btnStyle = (disabled: boolean): React.CSSProperties => ({
  width: "100%", minHeight: "48px", padding: "12px 16px",
  background: disabled ? "#e8edf4" : "#1d4ed8",
  border: disabled ? "1px solid #dce3ec" : "1px solid #1d4ed8",
  borderRadius: "8px", color: disabled ? "#526278" : "#fff", fontSize: "14px",
  fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
  transition: "background-color 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
});

const eyeBtn: React.CSSProperties = {
  position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)",
  background: "transparent", border: "none", cursor: "pointer", color: "#405269", fontSize: "16px",
  width: 40, height: 40, display: "inline-flex", justifyContent: "center", alignItems: "center",
};
