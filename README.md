# NovaBank CreditRisk — Hệ Thống Đánh Giá Rủi Ro Tín Dụng

NovaBank CreditRisk là hệ thống hỗ trợ chuyên viên ngân hàng đánh giá và phê duyệt hồ sơ vay vốn theo thời gian thực. Hệ thống tích hợp mô hình học máy **LightGBM** (được huấn luyện và tối ưu hóa siêu tham số trên dữ liệu thực tế) để dự báo xác suất vỡ nợ (Probability of Default — PD), quy đổi sang thang điểm tín dụng chuẩn hóa theo công thức Log-Odds (tương tự FICO Score 300–850), áp dụng các quy tắc nghiệp vụ ngân hàng và đưa ra quyết định phê duyệt tự động kèm khuyến nghị chi tiết.

---

## Mục Lục

- [Tổng Quan Kiến Trúc](#tổng-quan-kiến-trúc)
- [Cấu Trúc Thư Mục](#cấu-trúc-thư-mục)
- [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
- [Tính Năng Chính](#tính-năng-chính)
- [Mô Hình Học Máy](#mô-hình-học-máy)
- [API Endpoints](#api-endpoints)
- [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
- [Hướng Dẫn Khởi Chạy](#hướng-dẫn-khởi-chạy)
- [Cơ Sở Dữ Liệu](#cơ-sở-dữ-liệu)
- [Phân Tích Dữ Liệu & Power BI](#phân-tích-dữ-liệu--power-bi)

---

## Tổng Quan Kiến Trúc

Dự án được thiết kế theo kiến trúc **client-server** phân tách hoàn toàn:

```
NovaBank_CreditRisk/
│
├── App/
│   ├── BE/          FastAPI (Python) — AI Engine + REST API + PostgreSQL
│   └── FE/          Next.js (TypeScript) — Giao diện người dùng
│
├── notebooks/       Jupyter Notebooks — EDA, Training, Evaluation
├── raw_data/        Dữ liệu gốc (CSV)
├── sql/             Scripts DDL + Query phân tích
└── Power BI/        Dashboard báo cáo rủi ro (file .pbix)
```

Luồng xử lý một yêu cầu đánh giá:

```
[Người dùng nhập 16 tham số]
        |
        v
[Frontend Next.js] -- HTTP POST /api/predict -->  [Backend FastAPI]
                                                        |
                                             [Tiền xử lý & Feature Engineering]
                                                        |
                                             [LightGBM Pipeline predict_proba]
                                                        |
                                             [Log-Odds -> Credit Score 300-850]
                                                        |
                                             [Áp dụng Business Rules]
                                                        |
                                             [Sinh khuyến nghị hành động]
                                                        |
                                             [Lưu lịch sử -> PostgreSQL]
                                                        |
        [Hiển thị kết quả + Dashboard] <-- JSON Response --
```

---

## Cấu Trúc Thư Mục

```
NovaBank_CreditRisk/
│
├── App/
│   ├── BE/                               Backend — FastAPI Server
│   │   ├── main.py                       Entry point, định nghĩa toàn bộ API routes
│   │   ├── model.py                      Load và quản lý LightGBM pipeline artifact
│   │   ├── preprocess.py                 Feature engineering (tạo 22 features từ 16 đầu vào)
│   │   ├── preprocessors.py              Các hàm biến đổi dữ liệu bổ sung
│   │   ├── scoring.py                    Chuyển đổi PD -> Credit Score -> Risk Tier -> Decision
│   │   ├── schema.py                     Pydantic models: Request/Response validation
│   │   ├── diagnose_startup.py           Script kiểm tra và chẩn đoán lỗi khi khởi động
│   │   ├── requirements.txt              Thư viện Python cần thiết cho Backend
│   │   ├── render.yaml                   Cấu hình deploy lên Render.com
│   │   ├── .env.example                  Mẫu biến môi trường
│   │   ├── artifacts/
│   │   │   ├── lgbm_pipeline.pkl         Model LightGBM đã huấn luyện (pipeline)
│   │   │   └── metadata.json             Cấu hình thang điểm, ngưỡng, danh sách features
│   │   └── database/
│   │       ├── __init__.py
│   │       ├── connection.py             Kết nối SQLAlchemy tới PostgreSQL
│   │       ├── models.py                 ORM Models (bảng predictions, model_metadata)
│   │       └── crud.py                   Các hàm thao tác CRUD với database
│   │
│   └── FE/                               Frontend — Next.js Application
│       ├── src/
│       │   ├── middleware.ts              Middleware xử lý i18n routing (next-intl)
│       │   ├── app/                      Next.js App Router
│       │   │   ├── globals.css           CSS toàn cục
│       │   │   ├── layout.tsx            Root layout
│       │   │   ├── page.tsx              Trang gốc (redirect về locale mặc định)
│       │   │   └── [locale]/             Nhóm route theo ngôn ngữ
│       │   │       ├── layout.tsx        Layout có locale (Navbar, Footer)
│       │   │       ├── page.tsx          Trang chủ — hiển thị kết quả đánh giá
│       │   │       ├── apply/
│       │   │       │   └── page.tsx      Trang nhập hồ sơ vay
│       │   │       └── history/
│       │   │           └── page.tsx      Trang xem lịch sử đánh giá
│       │   ├── components/
│       │   │   ├── LoanForm.tsx          Form nhập 16 tham số tín dụng
│       │   │   ├── ResultCard.tsx        Thẻ hiển thị kết quả đánh giá
│       │   │   ├── CreditScoreGauge.tsx  Đồng hồ hiển thị điểm tín dụng
│       │   │   ├── RecommendationBox.tsx Hộp khuyến nghị hành động
│       │   │   ├── Navbar.tsx            Thanh điều hướng (hỗ trợ chuyển ngôn ngữ)
│       │   │   └── Footer.tsx            Chân trang
│       │   ├── hooks/
│       │   │   └── useCreditScore.ts     Custom hook xử lý logic gọi API chấm điểm
│       │   ├── lib/
│       │   │   ├── api.ts                Hàm gọi API Backend (predict, history)
│       │   │   ├── constants.ts          Hằng số dùng chung (URL, enum values...)
│       │   │   └── types.ts              Định nghĩa TypeScript types/interfaces
│       │   ├── i18n/
│       │   │   ├── routing.ts            Cấu hình locales và defaultLocale
│       │   │   ├── request.ts            Cấu hình next-intl server-side
│       │   │   └── navigation.ts         Các hàm navigation có locale
│       │   └── messages/
│       │       ├── vi.json               Bản dịch Tiếng Việt
│       │       └── en.json               Bản dịch Tiếng Anh
│       ├── package.json                  Khai báo dependencies
│       └── tsconfig.json                 Cấu hình TypeScript
│
├── notebooks/
│   ├── data_understanding.ipynb          Khám phá và hiểu cấu trúc dữ liệu ban đầu
│   ├── EDA.ipynb                         Phân tích dữ liệu khám phá chuyên sâu (EDA)
│   ├── powerBi.ipynb                     Chuẩn bị và xuất dữ liệu cho Power BI
│   ├── model.ipynb                       Xây dựng, huấn luyện và đánh giá mô hình LightGBM
│   └── preprocessors.py                  Module tiền xử lý dùng chung trong notebooks
│
├── raw_data/
│   ├── Credit Risk Data.csv              Dữ liệu tín dụng gốc (~45,000 bản ghi)
│   └── Data Dictionary.csv               Từ điển mô tả các trường dữ liệu
│
├── Power BI/
│   └── risk.pbix                         Dashboard phân tích rủi ro tín dụng
│
├── requirements.txt                      Tổng hợp toàn bộ thư viện Python cần cài đặt
└── README.md                             Tài liệu dự án (file này)
```

---

## Công Nghệ Sử Dụng

### Backend (Python)

| Thành phần | Công nghệ | Phiên bản | Mục đích |
|---|---|---|---|
| Web Framework | FastAPI | >= 0.111.0 | REST API server, tài liệu Swagger tự động |
| ASGI Server | Uvicorn | >= 0.30.0 | Chạy ứng dụng FastAPI bất đồng bộ |
| Data Validation | Pydantic | >= 2.7.0 | Kiểm tra và định nghĩa schema request/response |
| ORM | SQLAlchemy | >= 2.0.0 | Truy vấn cơ sở dữ liệu theo ORM |
| DB Driver | psycopg2-binary | >= 2.9.0 | Kết nối tới PostgreSQL |
| Machine Learning | LightGBM | >= 4.3.0 | Mô hình dự báo xác suất vỡ nợ |
| ML Utilities | scikit-learn | >= 1.4.0 | Pipeline, preprocessing, metrics |
| Data Processing | pandas | >= 2.2.0 | Xử lý DataFrame đầu vào |
| Numerical | numpy | >= 1.26.0 | Tính toán Log-Odds, clipping |
| Serialization | joblib | >= 1.4.0 | Load/save model pipeline (.pkl) |
| Environment | python-dotenv | >= 1.0.0 | Quản lý biến môi trường từ file .env |

### Frontend (TypeScript / Node.js)

| Thành phần | Công nghệ | Phiên bản | Mục đích |
|---|---|---|---|
| Framework | Next.js | ^14.2.15 | React framework với App Router, SSR |
| UI Library | React | ^18.3.1 | Xây dựng giao diện component-based |
| Ngôn ngữ | TypeScript | ^5.6.3 | Kiểm tra kiểu tĩnh, an toàn hơn JS thuần |
| Styling | Tailwind CSS | ^4.0.0 | Utility-first CSS framework |
| Internationalization | next-intl | ^3.26.5 | Đa ngôn ngữ (Tiếng Việt / English) |
| PostCSS | postcss | ^8.4.47 | Xử lý CSS (tích hợp với Tailwind) |
| Linting | ESLint | ^8.57.1 | Kiểm tra chất lượng code |

### Phân Tích & Dữ Liệu

| Công nghệ | Mục đích |
|---|---|
| Jupyter Notebook | Môi trường EDA, huấn luyện và đánh giá mô hình |
| pandas, numpy | Xử lý và phân tích dữ liệu |
| matplotlib, seaborn | Trực quan hóa dữ liệu |
| scikit-learn | Preprocessing, pipeline, metrics đánh giá mô hình |
| LightGBM | Thuật toán Gradient Boosting chính |
| imbalanced-learn | Xử lý mất cân bằng lớp bằng SMOTE |
| PostgreSQL | Cơ sở dữ liệu lưu trữ lịch sử đánh giá |
| Microsoft Power BI | Dashboard báo cáo và phân tích rủi ro |

---

## Tính Năng Chính

### 1. Form Đánh Giá Hồ Sơ (16 tham số đầu vào)

Người dùng nhập đầy đủ thông tin theo 3 nhóm:

**Thông tin cá nhân:**
- Tuổi (`person_age`)
- Thu nhập hàng năm (`person_income`)
- Hình thức cư trú (`person_home_ownership`): RENT / MORTGAGE / OWN / OTHER
- Số năm đi làm (`person_emp_length`)
- Loại hình việc làm (`employment_type`): Full-time / Part-time / Self-employed / Unemployed
- Trình độ học vấn (`education_level`): High School / Bachelor / Master / PhD

**Thông tin khoản vay:**
- Số tiền vay (`loan_amnt`)
- Mục đích vay (`loan_intent`): EDUCATION / MEDICAL / PERSONAL / VENTURE / HOMEIMPROVEMENT / DEBTCONSOLIDATION
- Kỳ hạn vay tính theo tháng (`loan_term_months`)
- Lãi suất khoản vay (`loan_int_rate`)
- Nợ khác hiện tại (`other_debt`)

**Lịch sử tín dụng:**
- Số năm lịch sử tín dụng (`cb_person_cred_hist_length`)
- Số tài khoản tín dụng đang mở (`open_accounts`)
- Số lần trễ hạn thanh toán trong quá khứ (`past_delinquencies`)
- Tỷ lệ sử dụng hạn mức tín dụng (`credit_utilization_ratio`)
- Từng vỡ nợ trong lịch sử (`cb_person_default_on_file`): Y / N

### 2. Quy Trình Chấm Điểm Tự Động (6 bước)

Sau khi nhận 16 tham số, backend thực hiện tuần tự:

1. **Feature Engineering**: Tạo 22 features từ 16 đầu vào (bao gồm `loan_percent_income`, `debt_to_income_ratio`, `loan_to_income_ratio`, log-transform các biến thu nhập, flag missing values)
2. **Dự báo PD**: LightGBM pipeline trả về xác suất vỡ nợ trong khoảng [0.0, 1.0]
3. **Quy đổi điểm**: PD chuyển sang Credit Score 300–850 theo công thức Log-Odds chuẩn
4. **Phân loại rủi ro**: Gán mức rủi ro dựa trên ngưỡng điểm từ `metadata.json`
5. **Áp dụng Business Rules**: Các luật cứng về vỡ nợ lịch sử, tỷ lệ nợ/thu nhập, tỷ lệ trễ hạn
6. **Sinh khuyến nghị**: Phân tích nguyên nhân rủi ro và đề xuất hành động cụ thể

### 3. Ba Mức Quyết Định

| Mức quyết định | Ngưỡng điểm | Ý nghĩa |
|---|---|---|
| PHE DUYET (Approved) | > 643 | Rủi ro thấp, hồ sơ đủ điều kiện phê duyệt |
| XEM XET (Review) | 617 — 643 | Rủi ro trung bình, cần thẩm định thêm |
| TU CHOI (Rejected) | <= 616 | Rủi ro cao, không đủ điều kiện |

### 4. Trang Lịch Sử Đánh Giá

- Lưu trữ bền vững toàn bộ lịch sử trên **PostgreSQL** với đầy đủ 16 trường đầu vào và kết quả chấm điểm
- Cơ chế **Fallback tự động** sang `localStorage` trình duyệt khi Backend hoặc Database offline
- Bộ lọc nâng cao theo mức rủi ro và trạng thái quyết định
- Nút "Chi tiết" mở Modal hiển thị toàn bộ dữ liệu hồ sơ gốc

### 5. Đa Ngôn Ngữ (i18n)

Giao diện hỗ trợ chuyển đổi linh hoạt giữa **Tiếng Việt** và **Tiếng Anh** thông qua `next-intl`. Backend trả về các mã chuẩn tiếng Anh (APPROVE / REVIEW / REJECT, reason codes), Frontend chịu trách nhiệm dịch sang ngôn ngữ hiển thị.

---

## Mô Hình Học Máy

### Dữ liệu huấn luyện

- Nguồn: Dataset tín dụng thực tế (~45,000 bản ghi)
- File gốc: `raw_data/Credit Risk Data.csv`
- Biến mục tiêu: `loan_status` (0 = Không vỡ nợ, 1 = Vỡ nợ)
- Tỷ lệ mất cân bằng lớp được xử lý bằng **SMOTE** (xem `notebooks/testsmote.ipynb`)

### Pipeline mô hình

```
Raw Input (16 features)
    -> Feature Engineering (preprocess.py)     22 features
    -> LightGBM Pipeline (lgbm_pipeline.pkl)   predict_proba -> PD
    -> Log-Odds Scoring (scoring.py)           Credit Score 300-850
    -> Business Rules Engine                   Final Decision
```

### Thang điểm tín dụng (Log-Odds)

Công thức chuẩn hóa tương tự FICO Score:

```
factor = PDO / ln(2)         [PDO = 20]
odds   = (1 - PD) / PD
score  = BASE_SCORE + factor x ln(odds)    [BASE_SCORE = 600]
score  = clip(score, 300, 850)
```

### Ngưỡng phân loại (từ `artifacts/metadata.json`)

| Mức rủi ro | Ngưỡng điểm |
|---|---|
| Cao (high) | <= 616 |
| Trung bình (medium) | 617 — 643 |
| Thấp (low) | > 643 |

### Thông tin artifact

- Model version: `lgbm_tuned`
- Pipeline file: `App/BE/artifacts/lgbm_pipeline.pkl`
- Metadata config: `App/BE/artifacts/metadata.json`
- 22 features đầu vào mô hình, trong đó có 4 biến categorical được mã hóa

---

## API Endpoints

Sau khi khởi chạy backend, tài liệu API đầy đủ có tại `http://127.0.0.1:8000/docs`

| Method | Endpoint | Mô tả | Xác thực |
|---|---|---|---|
| GET | `/health` | Kiểm tra trạng thái server và trạng thái model | Không yêu cầu |
| POST | `/api/predict` | Gửi hồ sơ tín dụng, nhận kết quả đánh giá | Không yêu cầu |
| GET | `/api/history` | Lấy danh sách lịch sử đánh giá (mặc định 100 bản ghi) | Không yêu cầu |
| DELETE | `/api/history` | Xóa toàn bộ lịch sử đánh giá | Yêu cầu `X-Admin-Key` header |

---

## Yêu Cầu Hệ Thống

Để chạy dự án cục bộ, cần cài đặt trước các công cụ sau:

| Công cụ | Phiên bản tối thiểu | Ghi chú |
|---|---|---|
| Python | 3.11+ | Dùng cho Backend và Notebooks |
| Node.js | 18+ | Dùng cho Frontend |
| npm | 9+ | Đi kèm Node.js |
| PostgreSQL | 14+ | Có thể dùng local hoặc cloud (Supabase, Render) |

Xem toàn bộ danh sách thư viện Python cần cài đặt trong file **[requirements.txt](./requirements.txt)** ở thư mục gốc.

```bash
# Cài đặt toàn bộ thư viện Python (Backend + ML + Notebooks)
pip install -r requirements.txt

# Cài đặt thư viện Frontend (Node.js)
cd App/FE && npm install
```

---

## Hướng Dẫn Khởi Chạy

### Bước 1 — Cấu hình và khởi chạy Backend (FastAPI)

**1. Di chuyển vào thư mục Backend:**
```bash
cd App/BE
```

**2. Tạo và kích hoạt môi trường ảo (Virtual Environment):**
```bash
# Tạo venv (chỉ cần làm lần đầu)
python -m venv venv

# Kích hoạt — PowerShell (Windows)
.\venv\Scripts\Activate.ps1

# Kích hoạt — Command Prompt (Windows)
.\venv\Scripts\activate.bat

# Kích hoạt — Linux / macOS
source venv/bin/activate
```

**3. Cài đặt thư viện Python:**
```bash
pip install -r requirements.txt
```

**4. Cấu hình biến môi trường:**

Tạo file `.env` trong thư mục `App/BE` (copy từ `.env.example` và điền giá trị phù hợp):
```env
PORT=8000
DATABASE_URL=postgresql://nova_user:your_password@localhost:5432/nova_bank
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
ADMIN_API_KEY=your_secret_admin_key
```

**5. Khởi chạy server:**
```bash
uvicorn main:app --reload
```

Sau khi khởi chạy thành công:
- API Backend: `http://127.0.0.1:8000`
- Swagger UI (tài liệu API tương tác): `http://127.0.0.1:8000/docs`
- ReDoc (tài liệu API thay thế): `http://127.0.0.1:8000/redoc`

---

### Bước 2 — Cấu hình và khởi chạy Frontend (Next.js)

**1. Mở Terminal mới, di chuyển vào thư mục Frontend:**
```bash
cd App/FE
```

**2. Cài đặt các gói Node.js:**
```bash
npm install
```

**3. Cấu hình biến môi trường:**

Tạo file `.env.local` trong thư mục `App/FE`:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

**4. Khởi chạy Frontend ở chế độ phát triển:**
```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:3000` (hoặc `3001` nếu cổng `3000` bị chiếm dụng).

---

### Bước 3 — Chạy Jupyter Notebooks (Tùy chọn)

Dành cho việc tái huấn luyện mô hình hoặc phân tích dữ liệu:

```bash
# Cài đặt các thư viện phân tích dữ liệu
pip install jupyter lightgbm scikit-learn pandas numpy matplotlib seaborn imbalanced-learn optuna

# Khởi chạy Jupyter Notebook
jupyter notebook
```

Thứ tự chạy notebook được đề xuất:
1. `notebooks/1data_understanding.ipynb` — Khám phá và hiểu cấu trúc dữ liệu
2. `notebooks/2EDA.ipynb` — Phân tích khám phá chuyên sâu
3. `notebooks/testsmote.ipynb` — Xử lý mất cân bằng lớp bằng SMOTE
4. `notebooks/model.ipynb` — Huấn luyện, tối ưu và đánh giá mô hình

---

## Cơ Sở Dữ Liệu

### Schema bảng `predictions`

Bảng chính lưu toàn bộ lịch sử đánh giá:

| Cột | Kiểu dữ liệu | Mô tả |
|---|---|---|
| id | INTEGER | Khóa chính, tự tăng |
| person_age | INTEGER | Tuổi người vay |
| person_income | FLOAT | Thu nhập hàng năm |
| loan_amnt | FLOAT | Số tiền vay đề xuất |
| loan_intent | VARCHAR(50) | Mục đích vay |
| loan_term_months | INTEGER | Kỳ hạn vay (tháng) |
| has_prior_default | INTEGER | Từng vỡ nợ (0 = Không, 1 = Có) |
| person_emp_length | FLOAT | Số năm kinh nghiệm làm việc |
| education_level | VARCHAR(50) | Trình độ học vấn |
| employment_type | VARCHAR(50) | Loại hình việc làm |
| person_home_ownership | VARCHAR(50) | Hình thức cư trú |
| loan_int_rate | FLOAT | Lãi suất khoản vay |
| cb_person_cred_hist_length | FLOAT | Số năm lịch sử tín dụng |
| open_accounts | INTEGER | Số tài khoản đang mở |
| past_delinquencies | INTEGER | Số lần trễ hạn |
| credit_utilization_ratio | FLOAT | Tỷ lệ sử dụng hạn mức tín dụng |
| other_debt | FLOAT | Nợ khác hiện tại |
| credit_score | INTEGER | Điểm tín dụng kết quả (300–850) |
| risk_tier | VARCHAR(20) | Mức rủi ro (high / medium / low) |
| decision | VARCHAR(20) | Quyết định (APPROVE / REVIEW / REJECT) |
| probability_of_default | FLOAT | Xác suất vỡ nợ (0.0–1.0) |
| top_reasons | JSON | Danh sách khuyến nghị và lý do rủi ro |
| created_at | TIMESTAMP | Thời điểm tạo bản ghi |

Database tự động khởi tạo bảng và thực hiện migration cột mới khi Backend khởi động (thông qua SQLAlchemy + `ALTER TABLE`).

### Scripts SQL

Xem các file trong thư mục `sql/` để thiết lập cơ sở dữ liệu:
- `schema star.sql` — Tạo Star Schema cho Data Warehouse (fact + dimension tables)
- `create base view.sql` — Tạo view tổng hợp cơ bản
- `VIEW POWERBI.sql` — Views chuyên dụng cho kết nối Power BI
- `check_data.sql` — Queries kiểm tra chất lượng và toàn vẹn dữ liệu
- `summary queries.sql` — Các truy vấn tổng hợp dùng trong báo cáo

---

## Phân Tích Dữ Liệu & Power BI

Dashboard Power BI (`Power BI/risk.pbix`) kết nối trực tiếp với PostgreSQL thông qua các views được định nghĩa trong `sql/VIEW POWERBI.sql`, cung cấp:

- Tổng quan phân phối điểm tín dụng theo thời gian
- Tỷ lệ phê duyệt / xem xét / từ chối theo nhóm khách hàng
- Phân tích rủi ro theo mục đích vay, trình độ học vấn, loại hình việc làm
- Biểu đồ xu hướng xác suất vỡ nợ trung bình theo tháng

Để chuẩn bị dữ liệu cho Power BI, chạy notebook `notebooks/3powerBi.ipynb`.

---

*NovaBank CreditRisk — Built with FastAPI, Next.js, LightGBM & PostgreSQL*
