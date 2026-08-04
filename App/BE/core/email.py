"""
core/email.py — Gmail SMTP email sender.
Single Responsibility: only email transport, no business logic.
"""
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from core.config import settings


def _build_otp_html(full_name: str, otp_code: str, purpose: str) -> str:
    """Build the HTML body for an OTP email."""
    if purpose == "verify_register":
        subject_action = "xác nhận đăng ký tài khoản"
        title_icon = "✅"
    else:
        subject_action = "đặt lại mật khẩu"
        title_icon = "🔐"

    return f"""<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <style>
    body{{margin:0;padding:20px;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif}}
    .wrap{{max-width:520px;margin:0 auto;background:#1e293b;border-radius:16px;
           border:1px solid #334155;overflow:hidden}}
    .hd{{background:linear-gradient(135deg,#1d4ed8 0%,#7c3aed 100%);
         padding:32px;text-align:center}}
    .hd h1{{color:#fff;margin:0 0 6px;font-size:20px}}
    .hd p{{color:#bfdbfe;margin:0;font-size:12px}}
    .bd{{padding:32px}}
    .hi{{color:#94a3b8;font-size:14px;margin-bottom:20px}}
    .hi strong{{color:#e2e8f0}}
    .otp-box{{background:#0f172a;border:2px solid #3b82f6;border-radius:12px;
              padding:24px;text-align:center;margin:20px 0}}
    .otp-lbl{{color:#64748b;font-size:11px;text-transform:uppercase;
              letter-spacing:2px;margin-bottom:10px}}
    .otp-num{{color:#60a5fa;font-size:42px;font-weight:900;
              letter-spacing:14px;font-family:monospace}}
    .exp{{color:#f59e0b;font-size:12px;margin-top:10px}}
    .note{{color:#64748b;font-size:12px;margin-top:20px;padding:12px 14px;
           background:#0f172a;border-radius:8px;border-left:3px solid #475569}}
    .ft{{padding:14px 32px;border-top:1px solid #334155;text-align:center}}
    .ft p{{color:#475569;font-size:11px;margin:0}}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hd">
      <h1>🏦 NovaBank CreditRisk</h1>
      <p>Hệ thống đánh giá rủi ro tín dụng nội bộ</p>
    </div>
    <div class="bd">
      <p class="hi">Xin chào <strong>{full_name}</strong>,</p>
      <p style="color:#94a3b8;font-size:14px">
        {title_icon} Đây là mã OTP để <strong style="color:#e2e8f0">{subject_action}</strong>:
      </p>
      <div class="otp-box">
        <p class="otp-lbl">Mã xác thực OTP</p>
        <div class="otp-num">{otp_code}</div>
        <p class="exp">⏱ Mã hết hạn sau <strong>5 phút</strong></p>
      </div>
      <div class="note">
        ⚠️ Không chia sẻ mã này với bất kỳ ai.<br>
        NovaBank <strong>không bao giờ</strong> yêu cầu OTP qua điện thoại hoặc tin nhắn.
      </div>
    </div>
    <div class="ft">
      <p>© 2026 NovaBank CreditRisk · Hệ thống nội bộ · Tự động gửi, vui lòng không reply</p>
    </div>
  </div>
</body>
</html>"""


def send_otp_email(to_email: str, otp_code: str, full_name: str, purpose: str = "verify_register") -> bool:
    """
    Send an OTP email via Gmail SMTP (TLS port 587).

    Args:
        to_email: Recipient email address.
        otp_code: 6-digit OTP string.
        full_name: Recipient full name for greeting.
        purpose: 'verify_register' | 'reset_password'

    Returns:
        True on success, False on failure (error is logged but not raised).
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print("[email.py] SMTP not configured — skipping email send.")
        return False

    subject = (
        "🏦 NovaBank — Xác nhận đăng ký tài khoản"
        if purpose == "verify_register"
        else "🔐 NovaBank — Đặt lại mật khẩu"
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"NovaBank CreditRisk <{settings.SMTP_USER}>"
    msg["To"] = to_email
    msg.attach(MIMEText(_build_otp_html(full_name, otp_code, purpose), "html", "utf-8"))

    ctx = ssl.create_default_context()
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.ehlo()
            server.starttls(context=ctx)
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, to_email, msg.as_string())
        print(f"[email.py] OTP email sent → {to_email} (purpose={purpose})")
        return True
    except Exception as exc:
        print(f"[email.py] Failed to send email to {to_email}: {exc}")
        return False
