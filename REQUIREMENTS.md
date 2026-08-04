# REQUIREMENTS — Danh Sách Thư Viện Toàn Dự Án

Tài liệu này tổng hợp toàn bộ thư viện, gói phần mềm và công cụ cần cài đặt cho dự án **NovaBank CreditRisk**, bao gồm Backend (Python), Frontend (Node.js) và môi trường phân tích dữ liệu (Jupyter Notebooks).

---

## Mục Lục

- [1. Backend — Python (FastAPI)](#1-backend--python-fastapi)
- [2. Frontend — Node.js (Next.js)](#2-frontend--nodejs-nextjs)
- [3. Phân Tích Dữ Liệu — Jupyter Notebooks](#3-phân-tích-dữ-liệu--jupyter-notebooks)
- [4. Công Cụ Hệ Thống Cần Cài Đặt Trước](#4-công-cụ-hệ-thống-cần-cài-đặt-trước)
- [5. Tóm Tắt Lệnh Cài Đặt Nhanh](#5-tóm-tắt-lệnh-cài-đặt-nhanh)

---

## 1. Backend — Python (FastAPI)

File cấu hình: `App/BE/requirements.txt`

### Cài đặt

```bash
cd App/BE
pip install -r requirements.txt
```

### Danh sách thư viện

#### Web Framework & API Server

| Thư viện | Phiên bản | Mô tả |
|---|---|---|
| `fastapi` | >= 0.111.0 | Web framework hiệu năng cao cho REST API, tự động sinh Swagger UI |
| `uvicorn[standard]` | >= 0.30.0 | ASGI server chạy ứng dụng FastAPI bất đồng bộ |
| `pydantic` | >= 2.7.0 | Thư viện định nghĩa và kiểm tra schema dữ liệu request/response |

#### Cơ Sở Dữ Liệu

| Thư viện | Phiên bản | Mô tả |
|---|---|---|
| `sqlalchemy` | >= 2.0.0 | ORM (Object-Relational Mapper) để tương tác với PostgreSQL |
| `psycopg2-binary` | >= 2.9.0 | Database driver kết nối Python tới PostgreSQL |

#### Authentication & Security

| Thư viện | Phiên bản | Mô tả |
|---|---|---|
| `python-jose[cryptography]` | >= 3.3.0 | Tạo và xác thực JSON Web Tokens (JWT) |
| `passlib[bcrypt]` | >= 1.7.4 | Hashing mật khẩu an toàn |
| `bcrypt` | == 3.2.2 | Thư viện mã hóa mật khẩu lõi |
| `pydantic-settings` | >= 2.0.0 | Quản lý cấu hình, biến môi trường an toàn |
| `email-validator` | >= 2.0.0 | Xác thực định dạng email người dùng |

#### Machine Learning & Xử Lý Dữ Liệu

| Thư viện | Phiên bản | Mô tả |
|---|---|---|
| `lightgbm` | >= 4.3.0 | Thuật toán Gradient Boosting — mô hình chính dự báo xác suất vỡ nợ |
| `scikit-learn` | >= 1.4.0 | Pipeline ML, OrdinalEncoder, preprocessing, metrics đánh giá |
| `pandas` | >= 2.2.0 | Xử lý DataFrame đầu vào cho feature engineering |
| `numpy` | >= 1.26.0 | Tính toán số học (Log-Odds, clipping, xác suất) |
| `joblib` | >= 1.4.0 | Load và lưu model pipeline dạng file `.pkl` |

#### Môi Trường & Tiện Ích

| Thư viện | Phiên bản | Mô tả |
|---|---|---|
| `python-dotenv` | >= 1.0.0 | Đọc biến môi trường từ file `.env` |

### Nội dung file `App/BE/requirements.txt`

```
# Core framework
fastapi>=0.111.0
uvicorn[standard]>=0.30.0
pydantic>=2.7.0
pydantic-settings>=2.0.0
email-validator>=2.0.0

# Database
sqlalchemy>=2.0.0
psycopg2-binary>=2.9.0

# Authentication & Security
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
bcrypt==3.2.2

# Machine Learning
lightgbm>=4.3.0
scikit-learn>=1.4.0
pandas>=2.2.0
numpy>=1.26.0
joblib>=1.4.0

# Environment
python-dotenv>=1.0.0
```

---

## 2. Frontend — Node.js (Next.js)

File cấu hình: `App/FE/package.json`

### Cài đặt

```bash
cd App/FE
npm install
```

### Danh sách thư viện

#### Dependencies (Production)

| Gói | Phiên bản | Mô tả |
|---|---|---|
| `next` | ^14.2.15 | React framework với App Router, SSR, file-based routing |
| `react` | ^18.3.1 | Thư viện UI cốt lõi, xây dựng giao diện component-based |
| `react-dom` | ^18.3.1 | Render React components lên DOM trình duyệt |
| `next-intl` | ^3.26.5 | Đa ngôn ngữ (i18n) tích hợp với Next.js App Router |
| `lucide-react` | ^0.453.0 | Thư viện Icon SVG linh hoạt và tối ưu cho React |
| `recharts` | ^2.13.0 | Thư viện biểu đồ (charts) React dễ sử dụng và tùy biến |

#### DevDependencies (Phát Triển)

| Gói | Phiên bản | Mô tả |
|---|---|---|
| `typescript` | ^5.6.3 | Ngôn ngữ TypeScript (superset của JavaScript có kiểu tĩnh) |
| `@types/node` | ^20.17.0 | Định nghĩa kiểu TypeScript cho Node.js |
| `@types/react` | ^18.3.12 | Định nghĩa kiểu TypeScript cho React |
| `@types/react-dom` | ^18.3.1 | Định nghĩa kiểu TypeScript cho ReactDOM |
| `tailwindcss` | ^4.0.0 | Utility-first CSS framework cho styling giao diện |
| `@tailwindcss/postcss` | ^4.0.0 | Plugin PostCSS tích hợp Tailwind CSS v4 |
| `postcss` | ^8.4.47 | Công cụ xử lý và biến đổi CSS |
| `eslint` | ^8.57.1 | Công cụ kiểm tra và đảm bảo chất lượng code JavaScript/TypeScript |
| `eslint-config-next` | ^14.2.15 | Cấu hình ESLint chuyên dụng cho dự án Next.js |

### Nội dung file `App/FE/package.json`

```json
{
  "name": "novabank-credit-risk-fe",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "lucide-react": "^0.453.0",
    "next": "^14.2.15",
    "next-intl": "^3.26.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "recharts": "^2.13.0"
  },
  "devDependencies": {
    "@types/node": "^20.17.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "eslint": "^8.57.1",
    "eslint-config-next": "^14.2.15",
    "postcss": "^8.4.47",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "typescript": "^5.6.3"
  }
}
```

---

## 3. Phân Tích Dữ Liệu — Jupyter Notebooks

Thư mục: `notebooks/`

Các thư viện này **không** nằm trong `requirements.txt` của Backend vì chỉ dùng cho nghiên cứu và huấn luyện mô hình, không cần thiết khi chạy server production.

### Cài đặt

```bash
pip install jupyter lightgbm scikit-learn pandas numpy matplotlib seaborn imbalanced-learn optuna joblib
```

### Danh sách thư viện

#### Môi Trường Notebook

| Thư viện | Mô tả |
|---|---|
| `jupyter` | Môi trường Jupyter Notebook / JupyterLab để chạy file `.ipynb` |

#### Xử Lý & Phân Tích Dữ Liệu

| Thư viện | Mô tả |
|---|---|
| `pandas` | Đọc, làm sạch và biến đổi dữ liệu CSV |
| `numpy` | Tính toán số học và thống kê |
| `matplotlib` | Vẽ biểu đồ cơ bản (bar chart, histogram, scatter plot) |
| `seaborn` | Trực quan hóa thống kê nâng cao (heatmap, boxplot, distribution) |

#### Machine Learning & Tối Ưu Mô Hình

| Thư viện | Mô tả |
|---|---|
| `scikit-learn` | Preprocessing (OrdinalEncoder, StandardScaler), Pipeline, train-test split, metrics (AUC-ROC, classification report) |
| `lightgbm` | Thuật toán LightGBM — huấn luyện mô hình phân loại nhị phân dự báo xác suất vỡ nợ |
| `imbalanced-learn` | Xử lý mất cân bằng lớp bằng SMOTE (Synthetic Minority Over-sampling Technique) |
| `optuna` | Framework tối ưu siêu tham số tự động (hyperparameter tuning) |
| `joblib` | Lưu model pipeline đã huấn luyện ra file `.pkl` |

#### Ghi Chú Notebook

| File | Thư viện chính được dùng |
|---|---|
| `1data_understanding.ipynb` | pandas, numpy, matplotlib, seaborn |
| `2EDA.ipynb` | pandas, numpy, matplotlib, seaborn |
| `3powerBi.ipynb` | pandas, sqlalchemy, psycopg2-binary |
| `model.ipynb` | scikit-learn, lightgbm, optuna, imbalanced-learn, joblib |
| `testsmote.ipynb` | scikit-learn, imbalanced-learn, lightgbm, matplotlib |

---

## 4. Công Cụ Hệ Thống Cần Cài Đặt Trước

Các công cụ này cần được cài đặt trực tiếp vào hệ điều hành trước khi cài bất kỳ thư viện nào:

| Công cụ | Phiên bản tối thiểu | Link tải | Ghi chú |
|---|---|---|---|
| Python | 3.11+ | https://www.python.org/downloads/ | Tích hợp `pip` để quản lý thư viện |
| Node.js | 18+ | https://nodejs.org/ | Tích hợp `npm` để quản lý gói JS |
| PostgreSQL | 14+ | https://www.postgresql.org/download/ | Hoặc dùng dịch vụ cloud: Supabase, Render, Railway |
| Git | Bất kỳ | https://git-scm.com/ | Clone repository |

### Tùy chọn thêm

| Công cụ | Mô tả |
|---|---|
| Microsoft Power BI Desktop | Mở và chỉnh sửa file `Power BI/risk.pbix` (chỉ có trên Windows) |
| pgAdmin 4 hoặc DBeaver | Công cụ GUI quản lý PostgreSQL |
| Visual Studio Code | Editor khuyên dùng, hỗ trợ Python và TypeScript tốt |

---

## 5. Tóm Tắt Lệnh Cài Đặt Nhanh

### Backend (Python)

```bash
# Di chuyển vào thư mục Backend
cd App/BE

# Tạo môi trường ảo (lần đầu)
python -m venv venv

# Kích hoạt môi trường ảo
# PowerShell (Windows)
.\venv\Scripts\Activate.ps1

# Command Prompt (Windows)
.\venv\Scripts\activate.bat

# Linux / macOS
source venv/bin/activate

# Cài đặt tất cả thư viện Backend
pip install -r requirements.txt
```

### Frontend (Node.js)

```bash
# Di chuyển vào thư mục Frontend
cd App/FE

# Cài đặt tất cả gói Node.js
npm install
```

### Phân Tích Dữ Liệu (Notebooks)

```bash
# Cài đặt tất cả thư viện cần cho notebooks
pip install jupyter lightgbm scikit-learn pandas numpy matplotlib seaborn imbalanced-learn optuna joblib

# Khởi chạy Jupyter
jupyter notebook
```

---

*Tài liệu này phản ánh trạng thái thư viện tại thời điểm phát triển dự án. Khi nâng cấp phiên bản, hãy kiểm tra khả năng tương thích giữa các thư viện, đặc biệt là giữa `scikit-learn`, `lightgbm` và `imbalanced-learn`.*
