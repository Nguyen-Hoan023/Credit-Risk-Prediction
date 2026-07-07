# NovaBank CreditRisk — Hệ Thống Đánh Giá Rủi Ro Tín Dụng

NovaBank CreditRisk là ứng dụng hỗ trợ chuyên viên tín dụng đánh giá hồ sơ vay vốn của khách hàng. Hệ thống sử dụng mô hình học máy **LightGBM** (đã được huấn luyện và tối ưu hóa siêu tham số từ dữ liệu thực tế) để dự báo xác suất vỡ nợ (Probability of Default - PD), quy đổi sang điểm tín dụng chuẩn hóa và đưa ra quyết định phê duyệt tự động kèm theo các khuyến nghị chi tiết.

---

##  Cấu Trúc Dự Án

Dự án được thiết kế theo mô hình client-server tách biệt:
* **Backend (`App/BE`):** API viết bằng **FastAPI (Python)**, chịu trách nhiệm tiền xử lý dữ liệu đầu vào, chạy mô hình học máy LightGBM để chấm điểm, và lưu trữ nhật ký giao dịch vào cơ sở dữ liệu **PostgreSQL**.
* **Frontend (`App/FE`):** Giao diện Web được xây dựng bằng **Next.js (React, TypeScript, Tailwind CSS)**, cung cấp form nhập 16 thông số tín dụng trực quan, trang hiển thị kết quả và trang xem chi tiết lịch sử đánh giá.

---

## 📋 Yêu Cầu Hệ Thống (Requirements)

Để chạy dự án này trên máy cục bộ, bạn cần cài đặt trước các công cụ sau:
1. **Python 3.11+**
2. **Node.js v18+** & **npm**
3. **PostgreSQL** (Đang chạy local hoặc trên cloud như Supabase)

---

## ⚙️ Hướng Dẫn Khởi Chạy Chương Trình

### 1. Cấu Hình & Chạy Backend (FastAPI)

1. Mở Terminal mới và di chuyển vào thư mục Backend:
   ```bash
   cd App/BE
   ```

2. Kích hoạt môi trường ảo (Virtual Environment):
   * Trên **PowerShell**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   * Trên **Command Prompt (cmd)**:
     ```cmd
     .\venv\Scripts\activate.bat
     ```

3. Cài đặt các thư viện Python cần thiết:
   ```bash
   pip install -r requirements.txt
   ```

4. Cấu hình biến môi trường trong tệp `.env`:
   Tạo tệp `.env` trong thư mục `App/BE` (nếu chưa có) và điền cấu hình kết nối database:
   ```env
   PORT=8000
   DATABASE_URL=postgresql://nova_user:NGhoan_23122003@localhost:5432/nova_bank
   ```

5. Khởi chạy FastAPI Server:
   ```bash
   uvicorn main:app --reload

   ```
   * API Backend sẽ chạy tại: `http://127.0.0.1:8000`
   * Tài liệu API tương tác (Swagger UI): `http://127.0.0.1:8000/docs`

---

### 2. Cấu Hình & Chạy Frontend (Next.js)

1. Mở một cửa sổ Terminal khác song song và di chuyển vào thư mục Frontend:
   ```bash
   cd App/FE
   ```

2. Cài đặt các gói thư viện Node.js:
   ```bash
   npm install
   ```

3. Khởi chạy Frontend ở chế độ Phát triển (Development):
   ```bash
   npm run dev
   ```
   * Ứng dụng Frontend sẽ chạy tại: `http://localhost:3000` (hoặc cổng `3001` nếu cổng `3000` bị chiếm dụng).

---

##  Các Tính Năng Chính

1. **Đánh Giá Hồ Sơ (Form 16 tham số):** Nhập các dữ liệu về thông tin cá nhân (tuổi, thu nhập, tình trạng việc làm), khoản vay đề xuất (số tiền, kỳ hạn, mục đích, lãi suất) và lịch sử tín dụng để gửi yêu cầu đánh giá.
2. **Quyết Định Tín Dụng Tức Thì:** Mô hình phân loại hồ sơ thành 3 nhóm quyết định chính xác:
   * **PHÊ DUYỆT (Approved):** Rủi ro thấp (màu xanh lá).
   * **XEM XÉT (Review):** Rủi ro trung bình, cần thẩm định thêm (màu vàng).
   * **TỪ CHỐI (Rejected):** Rủi ro cao (màu đỏ).
3. **Giải Thích & Khuyến Nghị:** Liệt kê các lý do rủi ro then chốt (như trễ hạn thanh toán, tỷ lệ sử dụng hạn mức cao, vỡ nợ trong lịch sử...) và đưa ra khuyến nghị hành động.
4. **Trang Lịch Sử Chuyên Nghiệp:**
   * Lưu trữ lịch sử chấm điểm bền vững trên PostgreSQL.
   * Cơ chế tự động chuyển đổi dự phòng (Fallback) sang `localStorage` trình duyệt khi Database/Backend ngoại tuyến.
   * Bộ lọc nâng cao theo Mức rủi ro và Trạng thái quyết định (gồm cả lọc "Đang xem xét").
   * Nút **"👁️ Chi tiết"** hiển thị hộp thoại (Modal) chứa toàn bộ 16 trường dữ liệu đầu vào gốc của hồ sơ trong lịch sử.
