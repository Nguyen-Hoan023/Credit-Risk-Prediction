# KẾ HOẠCH TRIỂN KHAI CHỨC NĂNG ĐA NGÔN NGỮ

## 1. Mục tiêu triển khai

Chức năng đa ngôn ngữ được xây dựng nhằm hỗ trợ người dùng sử dụng hệ thống đánh giá rủi ro tín dụng bằng hai ngôn ngữ:

- Tiếng Việt
- Tiếng Anh

Việc triển khai tập trung vào nội dung hiển thị trên giao diện, bao gồm biểu mẫu nhập hồ sơ, kết quả đánh giá, lịch sử chấm điểm, thông báo lỗi và các trạng thái phê duyệt.

Hệ thống phải bảo đảm rằng việc thay đổi ngôn ngữ không làm thay đổi dữ liệu đầu vào, kết quả dự đoán hoặc cơ chế hoạt động của mô hình LightGBM.

---

## 2. Phạm vi triển khai

### 2.1. Nội dung được hỗ trợ đa ngôn ngữ

Các nội dung cần chuyển đổi giữa tiếng Việt và tiếng Anh gồm:

- Thanh điều hướng
- Tên các trang chức năng
- Tiêu đề và mô tả của hệ thống
- Nhãn các trường nhập hồ sơ
- Danh sách lựa chọn trong biểu mẫu
- Nút thao tác
- Nội dung hướng dẫn nhập dữ liệu
- Thông báo kiểm tra dữ liệu
- Thông báo lỗi
- Kết quả xác suất vỡ nợ
- Điểm tín dụng
- Mức độ rủi ro
- Trạng thái phê duyệt
- Lý do đánh giá rủi ro
- Nội dung tại trang lịch sử đánh giá
- Tiêu đề bảng, bộ lọc và phân trang
- Định dạng số, ngày tháng và tiền tệ

### 2.2. Nội dung không thay đổi theo ngôn ngữ

Các thành phần kỹ thuật sau phải được giữ nguyên:

- Tên biến truyền vào API
- Tên cột trong cơ sở dữ liệu
- Giá trị đầu vào chuẩn của mô hình
- Mã mức độ rủi ro
- Mã quyết định phê duyệt
- Mã nguyên nhân rủi ro
- Xác suất vỡ nợ
- Điểm tín dụng
- Cấu trúc request và response của API

Ví dụ:

```json
{
  "person_home_ownership": "RENT",
  "loan_intent": "MEDICAL"
}
```

Giao diện tiếng Việt:

```text
Hình thức nhà ở: Thuê nhà
Mục đích vay: Chi phí y tế
```

Giao diện tiếng Anh:

```text
Home ownership: Rent
Loan purpose: Medical
```

Giá trị gửi tới backend vẫn là `RENT` và `MEDICAL`.

---

## 3. Nguyên tắc thiết kế

### 3.1. Tách nội dung hiển thị khỏi logic xử lý

Không viết trực tiếp nội dung trong component.

```tsx
<button>{t("form.submit")}</button>
```

### 3.2. Backend chỉ trả về mã chuẩn

```json
{
  "risk_level": "high",
  "decision": "reject"
}
```

### 3.3. Cơ sở dữ liệu không phụ thuộc ngôn ngữ

```text
high
medium
low
approve
review
reject
```

### 3.4. Đồng bộ khóa dịch

```json
{
  "decision": {
    "approve": "Approve"
  }
}
```

---

## 4. Kiến trúc triển khai

```text
Người dùng
    │
    ▼
Frontend Next.js
    │
    ├── Chọn ngôn ngữ vi/en
    ├── Hiển thị nội dung đã dịch
    ├── Gửi dữ liệu chuẩn tới API
    └── Dịch mã kết quả từ API
    │
    ▼
Backend FastAPI
    │
    ├── Kiểm tra dữ liệu
    ├── Gọi mô hình LightGBM
    ├── Tính PD
    ├── Quy đổi điểm tín dụng
    ├── Áp dụng rule engine
    └── Trả về mã kết quả chuẩn
    │
    ▼
PostgreSQL
    │
    └── Lưu mã dữ liệu
```

---

## 5. Cấu trúc thư mục

```text
src/
├── app/
│   ├── [locale]/
│   └── api/
├── components/
├── messages/
├── config/
├── middleware.ts
└── types/
```

---

## 6. Kế hoạch triển khai

### Giai đoạn 1: Khảo sát

- Liệt kê toàn bộ nội dung cần dịch
- Phân nhóm khóa

Ví dụ:

```text
form.age
risk.high
decision.reject
```

---

### Giai đoạn 2: Tạo từ điển

```json
{
  "form": {
    "age": "Tuổi khách hàng"
  }
}
```

---

### Giai đoạn 3: Routing

```text
/vi
/en
```

```typescript
export const locales = ["vi", "en"];
```

---

### Giai đoạn 4: Language Switcher

```typescript
localStorage.setItem("preferredLanguage", locale);
```

---

### Giai đoạn 5: Dịch giao diện

```tsx
<Link href={`/${locale}/evaluate`}>
  {t("navigation.evaluate")}
</Link>
```

---

### Giai đoạn 6: Chuẩn hóa option

```typescript
{
  value: "RENT",
  labelKey: "options.homeOwnership.rent"
}
```

---

### Giai đoạn 7: Chuẩn hóa API

```json
{
  "risk_level": "high",
  "decision": "reject"
}
```

---

### Giai đoạn 8: Reason codes

```text
HIGH_DEBT_TO_INCOME
PAST_DELINQUENCIES
```

---

### Giai đoạn 9: Error codes

```json
{
  "error_code": "INVALID_AGE"
}
```

---

### Giai đoạn 10: Format dữ liệu

```typescript
new Intl.NumberFormat(locale);
```

---

### Giai đoạn 11: Database

```text
risk_level = high
decision = reject
```

---

### Giai đoạn 12: Testing

- Test chuyển ngôn ngữ
- Test form
- Test kết quả
- Test lịch sử

---

## 13. Timeline

- Ngày 1: Khảo sát
- Ngày 2: Setup i18n
- Ngày 3: Navbar
- Ngày 4–5: Form
- Ngày 6: Result
- Ngày 7: Backend
- Ngày 8: History
- Ngày 9: Test
- Ngày 10: Hoàn thiện

---

## 14. Tiêu chí nghiệm thu

1. Chuyển đổi ngôn ngữ hoạt động
2. Không ảnh hưởng dữ liệu
3. Backend trả mã chuẩn
4. UI hiển thị đúng
5. Không hardcode text

---

## 15. Kết quả

Hệ thống hỗ trợ đa ngôn ngữ mà không ảnh hưởng đến:

- Mô hình LightGBM
- API
- Database

Giúp mở rộng dễ dàng trong tương lai.
