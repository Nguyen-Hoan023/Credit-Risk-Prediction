# NovaBank — Credit Risk Analysis & Intelligent Scoring System

> **Live Web Application**: [https://credit-risk-prediction-pi.vercel.app/en/apply](https://credit-risk-prediction-pi.vercel.app/en/apply)  
> **Interactive API Documentation (Swagger)**: [https://credit-risk-prediction-7nxt.onrender.com/docs](https://credit-risk-prediction-7nxt.onrender.com/docs)  
> **Executive Power BI Report**: `Power BI/risk.pbix`  
> **Tech Stack**: FastAPI · LightGBM · Next.js 16 · PostgreSQL · Power BI · Scikit-Learn · Optuna

Dự án phân tích rủi ro tín dụng tiêu dùng và xây dựng hệ thống thẩm định khoản vay tự động dựa trên danh mục **32,581 hồ sơ tín dụng** trên toàn cầu (Mỹ, Anh, Canada). Dự án tích hợp hoàn chỉnh chu trình phân tích dữ liệu định chế tài chính: từ **khám phá dữ liệu chuyên sâu (EDA)**, **đúc kết insight kinh doanh (Business Insights)**, **thiết kế chính sách tín dụng & phân tầng rủi ro (Credit Policy)**, **mô hình hóa học máy (Machine Learning & FICO Scorecard)** đến **xây dựng Dashboard điều hành (Power BI)** và **ứng dụng Web phê duyệt thời gian thực**.

---

## Mục Lục / Table of Contents

- [1. Business Context & Stakeholder Framework](#1-business-context--stakeholder-framework)
  - [1.1 Bối Cảnh & Thách Thức Nghiệp Vụ](#11-bối-cảnh--thách-thức-nghiệp-vụ)
  - [1.2 Ma Trận Chuyển Giao Cho Các Bên Liên Quan (Stakeholder Delivery)](#12-ma-trận-chuyển-giao-cho-các-bên-liên-quan-stakeholder-delivery)
  - [1.3 Tổng Quan Dữ Liệu & Chỉ Số Hoạt Động Cốt Lõi (Portfolio KPIs)](#13-tổng-quan-dữ-liệu--chỉ-số-hoạt-động-cốt-lõi-portfolio-kpis)
- [2. Key Insights from Exploratory Data Analysis (EDA)](#2-key-insights-from-exploratory-data-analysis-eda)
  - [2.1 Portfolio Landscape & Tính Trung Lập Địa Lý](#21-portfolio-landscape--tính-trung-lập-địa-lý)
  - [2.2 Phân Tích Đường Cong Tuổi & Vòng Đời Khách Hàng (U-Shaped Risk Curve)](#22-phân-tích-đường-cong-tuổi--vòng-đời-khách-hàng-u-shaped-risk-curve)
  - [2.3 Hình Thức Cư Trú & Cơ Chế Đệm Tài Sản (Housing Buffer)](#23-hình-thức-cư-trú--cơ-chế-đệm-tài-sản-housing-buffer)
  - [2.4 Nghịch Lý Loại Hình Việc Làm (Employment Paradox)](#24-nghịch-lý-loại-hình-việc-làm-employment-paradox)
  - [2.5 Phân Cấp Mục Đích Vay & Tín Hiệu Căng Thẳng Thanh Khoản](#25-phân-cấp-mục-đích-vay--tín-hiệu-căng-thẳng-thanh-khoản)
  - [2.6 Vùng Nguy Hiểm Của Đòn Bẩy (DTI & LTI Danger Zones)](#26-vùng-nguy-hiểm-của-đòn-bẩy-dti--lti-danger-zones)
  - [2.7 Hành Vi Tín Dụng & Nghịch Lý Thâm Niên (Credit History Paradox)](#27-hành-vi-tín-dụng--nghịch-lý-thâm-niên-credit-history-paradox)
  - [2.8 Khủng Hoảng Hạng Tín Dụng Grade G & Vấn Đề Data Leakage](#28-khủng-hoảng-hạng-tín-dụng-grade-g--vấn-đề-data-leakage)
  - [2.9 Điểm Nóng Bất Định (Uncertainty Hotspot) — Nhóm MORTGAGE](#29-điểm-nóng-bất-định-uncertainty-hotspot--nhóm-mortgage)
- [3. Business Decisions & Phased Strategic Roadmap](#3-business-decisions--phased-strategic-roadmap)
  - [3.1 Ma Trận Hành Động Từ Dữ Liệu (Data-to-Policy Matrix)](#31-ma-trận-hành-động-từ-dữ-liệu-data-to-policy-matrix)
  - [3.2 Lộ Trình Triển Khai Chiến Lược Theo Giai Đoạn](#32-lộ-trình-triển-khai-chiến-lược-theo-giai-đoạn)
- [4. Machine Learning: Credit Scoring & Risk Tiering](#4-machine-learning-credit-scoring--risk-tiering)
  - [4.1 Scoring Pipeline Architecture](#41-scoring-pipeline-architecture)
  - [4.2 Chuẩn Hóa Thang Điểm Tín Dụng FICO (300–850)](#42-chuẩn-hóa-thang-điểm-tín-dụng-fico-300850)
  - [4.3 Khung Ra Quyết Định 3 Tầng (Three-Tier Decision Framework)](#43-khung-ra-quyết-định-3-tầng-three-tier-decision-framework)
  - [4.4 Khả Năng Giải Trình Minh Bạch & Reason Codes](#44-khả-năng-giải-trình-minh-bạch--reason-codes)
- [5. Model Evaluation & Reliability](#5-model-evaluation--reliability)
  - [5.1 Performance Benchmark](#51-performance-benchmark)
  - [5.2 Kỹ Thuật Thẩm Định Mô Hình Tiêu Chuẩn Ngân Hàng](#52-kỹ-thuật-thẩm-định-mô-hình-tiêu-chuẩn-ngân-hàng)
- [6. Power BI Executive Dashboard](#6-power-bi-executive-dashboard)
- [7. System Architecture & Tech Stack](#7-system-architecture--tech-stack)
- [8. Quick Start & Local Development](#8-quick-start--local-development)
- [9. Project Structure](#9-project-structure)
- [10. Limitations & Future Roadmap](#10-limitations--future-roadmap)

---

## 1. Business Context & Stakeholder Framework

### 1.1 Bối Cảnh & Thách Thức Nghiệp Vụ

Trong hoạt động cho vay tiêu dùng bán lẻ, Nova Bank đối mặt với bài toán tối ưu hóa danh mục: **mở rộng khả năng tiếp cận tín dụng công bằng cho khách hàng** nhưng phải **ngăn chặn tối đa tổn thất tài chính do nợ xấu (NPL)**. 

Phương pháp xét duyệt truyền thống bộc lộ những rủi ro trọng yếu:
- **Xét duyệt thủ công & Rule-based**: Chậm chạp, chi phí vận hành cao, thiếu linh hoạt trước các hồ sơ phức tạp.
- **Tính chủ quan**: Khác biệt trong quyết định giữa các chuyên viên thẩm định với cùng một mức độ rủi ro.
- **Không định lượng rủi ro biên**: Quy tắc cứng nhị phân (Đạt / Không đạt) bỏ lỡ các khách hàng tốt ở biên điểm hoặc phê duyệt nhầm các hồ sơ có rủi ro dòng tiền tiềm ẩn.

---

### 1.2 Ma Trận Chuyển Giao Cho Các Bên Liên Quan (Stakeholder Delivery)

Phân tích được định hướng nhằm phục vụ trực tiếp 4 nhóm quyết định chiến lược trong ngân hàng:

| Nhóm Đối Tượng (Stakeholders) | Nhu Cầu & Mục Tiêu Trọng Tâm | Sản Phẩm Bàn Giao Từ Dự Án |
|---|---|---|
| **Hội Đồng Quản Trị Rủi Ro** *(Risk Management Committee)* | Giám sát mức độ tập trung rủi ro toàn danh mục, thiết lập khẩu vị rủi ro (Risk Appetite) và kiểm soát NPL. | Báo cáo phân bổ rủi ro theo phân khúc, ma trận tổn thất tiềm năng và cảnh báo các "điểm nóng" (Hotspots). |
| **Khối Vận Hành Cho Vay** *(Lending Operations Team)* | Tối ưu hóa quy trình phê duyệt, rút ngắn thời gian xử lý (Turnaround Time), giảm can thiệp thủ công. | Hệ thống chấm điểm tự động (Scorecard), ngưỡng cắt 3 tầng (*Approve/Review/Reject*) và mã lý do giải trình (*Reason Codes*). |
| **Ban Lãnh Đạo Điều Hành** *(Executive Leadership)* | Đo lường hiệu quả kinh doanh, cân đối tăng trưởng doanh thu với an toàn vốn. | KPI Dashboard tổng quan, phân tích tăng trưởng theo thị trường và mô hình định giá điều chỉnh theo rủi ro (*Risk-Adjusted Pricing*). |
| **Phòng Phát Triển Sản Phẩm** *(Product Development)* | Tinh chỉnh gói vay, lãi suất và điều kiện vay phù hợp từng chân dung khách hàng. | Đề xuất gói vay chuyên biệt theo độ tuổi (Senior Products), điều chỉnh lãi suất theo mục đích vay (+2% đảo nợ, -1% giáo dục). |

---

### 1.3 Tổng Quan Dữ Liệu & Chỉ Số Hoạt Động Cốt Lõi (Portfolio KPIs)

Bộ dữ liệu gồm **32,581 khoản vay** trên 3 quốc gia (USA, UK, Canada) với 29 thuộc tính đa chiều:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          NOVA BANK PORTFOLIO HEALTH CHECK                              │
├───────────────────────┬────────────────────────┬───────────────────────────────────────┤
│ Tổng Khoản Vay        │ Tỷ Lệ Nợ Xấu Tổng Thể  │ Tỷ Lệ An Toàn / Rủi Ro                │
│ 32,581 hồ sơ          │ 21.82%                 │ 78.18% An Toàn : 21.82% Rủi Ro (3.6:1)│
├───────────────────────┼────────────────────────┼───────────────────────────────────────┤
│ Giá Trị Vay Trung Bình│ Thu Nhập Trung Bình    │ Tỷ Số Vay / Thu Nhập (LTI Trung Bình) │
│ $9.59K                │ $66.07K / năm          │ 0.17 (Tối ưu trong ngân hàng)         │
├───────────────────────┼────────────────────────┼───────────────────────────────────────┤
│ Nhóm An Toàn (Safe)   │ Thu nhập: $70.8K       │ Khoản vay: $9.2K  │ Lãi suất: 6.10%   │
│ Nhóm Rủi Ro (Risky)   │ Thu nhập: $49.1K       │ Khoản vay: $10.9K │ Lãi suất: 8.13%   │
└───────────────────────┴────────────────────────┴───────────────────────────────────────┘
```

> **So sánh chuẩn ngành**: Tỷ lệ nợ xấu 21.82% nằm trong biên độ tiêu chuẩn ngành cho vay tín chấp bán lẻ (18% – 25%). Tỷ lệ phân bổ 3.6 khách hàng an toàn trên 1 khách hàng rủi ro (78.18% vs 21.82%) phản ánh nền tảng danh mục cân bằng nhưng cần siết chặt phân tầng rủi ro.

---

## 2. Key Insights from Exploratory Data Analysis (EDA)

> Mã nguồn phân tích chi tiết và kiểm định thống kê nằm tại [`notebooks/EDA.ipynb`](notebooks/EDA.ipynb).

### 2.1 Portfolio Landscape & Tính Trung Lập Địa Lý

Phân tích tỷ lệ nợ xấu theo từng thị trường quốc tế ghi nhận sự đồng nhất đáng kinh ngạc:
- **Hoa Kỳ (USA)**: **21.86%**
- **Vương Quốc Anh (UK)**: **21.73%**
- **Canada**: **21.86%**

Ở cấp độ thành phố lớn, độ biến thiên cũng rất thấp:
- Vancouver: 24.19% (cao nhất)
- Dallas: 23.59%
- Edinburgh: 23.46%
- Los Angeles: 22.85%
- Glasgow: 21.56% (thấp nhất)

```
[USA: 21.86%] ───┐
[UK:  21.73%] ───┼──► Độ lệch tối đa chỉ 0.13 pp! 
[CAN: 21.86%] ───┘    Rủi ro mang tính ĐỒNG NHẤT XUYÊN BIÊN GIỚI
```

*Insight Chiến Lược*: Rủi ro vỡ nợ **không phụ thuộc vào vị trí địa lý** mà chịu sự chi phối hoàn toàn của các chỉ số tài chính cá nhân vi mô. Điều này chứng minh mô hình quản trị rủi ro và thuật toán chấm điểm của Nova Bank có khả năng **chuyển giao và mở rộng trực tiếp sang các thị trường nói tiếng Anh tương đồng (như Úc, New Zealand, Ireland)** mà không cần thay đổi cấu trúc nền tảng.

---

### 2.2 Phân Tích Đường Cong Tuổi & Vòng Đời Khách Hàng (U-Shaped Risk Curve)

Tỷ lệ nợ xấu phân bổ theo độ tuổi tạo thành **đường cong chữ U (U-shaped curve)** rõ rệt:

```
Tỷ lệ vỡ nợ (%)
  30% │         * (61-70 tuổi: 29.82%) - Cực đại rủi ro!
      │        /
  25% │  *    /
      │ (20-30: 22.21%)
  20% │        \      * (41-50: 20.40%) - Điểm ngọt (Sweet Spot)
      └───────────────────────────────────► Độ tuổi
```

- **Độ tuổi 20–30 (Rủi ro trung bình cao - 22.21%)**: Giai đoạn đầu sự nghiệp, thu nhập chưa ổn định, thiếu tài sản tích lũy và thói quen quản lý chi tiêu chưa hoàn thiện.
- **Độ tuổi 41–50 (Vùng an toàn lý tưởng - 20.40%)**: Giai đoạn thu nhập đạt đỉnh (Peak Earning Years), ổn định sự nghiệp và tích lũy tài sản vững chắc nhất.
- **Độ tuổi 61–70 (Vùng rủi ro cao nhất - 29.82%)**: Thu nhập cố định sau nghỉ hưu giảm sút, trong khi chi phí y tế và chăm sóc sức khỏe gia tăng đột biến, gây áp lực thanh khoản nặng nề.

---

### 2.3 Hình Thức Cư Trú & Cơ Chế Đệm Tài Sản (Housing Buffer)

Hình thức cư trú là một trong những chỉ báo phân loại rủi ro mạnh nhất:

| Hình Thức Cư Trú | Tỷ Lệ Nợ Xấu | So Với Mức Nền (21.8%) | Đánh Giá Tín Dụng |
|---|---|---|---|
| **Sở hữu nhà hoàn toàn (OWN)** | **7.47%** | **-14.35 pp** | **Phân khúc vàng (Premium Segment)** |
| **Đang trả nợ thế chấp (MORTGAGE)** | **12.57%** | **-9.25 pp** | Rất an toàn, đáng tin cậy |
| **Đang thuê nhà (RENT)** | **31.57%** | **+9.75 pp** | **Phân khúc rủi ro cao nhất** |

*Cơ chế kinh tế (Home-Equity Buffer)*:
- Người sở hữu nhà (`OWN`) có tài sản ròng lớn, đóng vai trò là "đệm chống sốc" giúp họ vượt qua biến cố tài chính mà không phá vỡ nghĩa vụ nợ.
- Người thuê nhà (`RENT`) chiếm tỷ trọng hồ sơ lớn nhất nhưng tỷ lệ nợ xấu lên tới **31.57%** (gấp 4.2 lần nhóm sở hữu nhà). Áp lực tiền thuê cố định hàng tháng khiến họ dễ rơi vào cảnh mất khả năng trả nợ khi thu nhập bị gián đoạn ngắn hạn.

---

### 2.4 Nghịch Lý Loại Hình Việc Làm (Employment Paradox)

Trái ngược với giả định truyền thống, loại hình hợp đồng lao động **không tạo ra sự phân hóa rủi ro đáng kể**:

| Loại Hình Việc Làm | Tỷ Lệ Nợ Xấu | Đánh Giá So Sánh |
|---|---|---|
| **Thất nghiệp (Unemployed)** | 22.67% | Nhóm rủi ro cao theo kỳ vọng |
| **Kinh doanh tự do (Self-employed)** | 22.49% | Rủi ro tương đương nhóm toàn thời gian! |
| **Làm việc bán thời gian (Part-time)** | 21.63% | Tương đồng mức nền danh mục |
| **Làm việc toàn thời gian (Full-time)** | 21.57% | Mức chuẩn cơ sở |

*Insight Nghiệp Vụ Quan Trọng*: Phán đoán tín dụng chỉ dựa trên hình thức việc làm là **không đủ và dễ gây sai lệch**. Năng lực thanh toán nợ thực tế (Debt Service Capacity), tỷ lệ nợ trên thu nhập và độ co giãn dòng tiền mới là các yếu tố dự báo rủi ro mang tính quyết định.

---

### 2.5 Phân Cấp Mục Đích Vay & Tín Hiệu Căng Thẳng Thanh Khoản

Tỷ lệ nợ xấu có sự phân cấp rõ nét theo mục đích sử dụng vốn:

```
1. Vay Hợp Nhất Nợ (Debt Consolidation) ──► 28.59%  [RỦI RO CAO NHẤT: Bội chi & đảo nợ]
2. Vay Y Tế (Medical Expenses)           ──► 26.70%  [Sốc chi tiêu khẩn cấp, ngoài kế hoạch]
3. Sửa Chữa Nhà (Home Improvement)       ──► 26.10%  [Chi tiêu tùy ý, dễ phát sinh bội chi]
4. Vay Cá Nhân Tiêu Dùng (Personal)      ──► 19.89%  [Rủi ro mức độ vừa phải]
5. Vay Học Tập (Education)               ──► 17.22%  [Đầu tư tương lai, khả năng trả nợ tốt]
6. Vay Kinh Doanh Mạo Hiểm (Venture)     ──► 14.31%  [AN TOÀN NHẤT: Có kế hoạch sinh lời]
```

- **Hợp nhất nợ (28.59%)**: Khách hàng tìm đến gói vay này khi đã có nhiều khoản nợ từ trước. Đây thường là tín hiệu "đảo nợ" (Rollover Debt) của một chu kỳ tài chính đang trên bờ vực sụp đổ.
- **Chi phí y tế (26.70%)**: Khủng hoảng tài chính thụ động, thường đi kèm với việc người vay bị giảm sút khả năng lao động.
- **Kinh doanh mạo hiểm (14.31%) & Giáo dục (17.22%)**: Khoản vay có mục đích sinh lợi hoặc gia tăng giá trị vốn con người, khách hàng có sự chuẩn bị và ý thức trả nợ cao nhất.

---

### 2.6 Vùng Nguy Hiểm Của Đòn Bẩy (DTI & LTI Danger Zones)

Phân tích định lượng đã làm sáng tỏ các điểm gãy rủi ro (Risk Cliff) khi khách hàng sử dụng đòn bẩy quá mức:

#### Tỷ số Khoản Vay Trên Thu Nhập (Loan-to-Income - LTI):
- LTI từ `0.00 – 0.10`: Tỷ lệ vỡ nợ chỉ **11.21%** (Cho vay thận trọng).
- LTI từ `0.20 – 0.30`: Tỷ lệ vỡ nợ đạt **22.09%** (Mức rủi ro cân bằng).
- LTI từ `0.70 – 0.80`: Tỷ lệ vỡ nợ vọt lên **87.50%** (**Vùng nguy hiểm tuyệt đối**).

#### Tỷ số Nghĩa Vụ Trả Nợ Trên Thu Nhập (Payment-to-Income / DTI):
- Khách hàng trả nợ tốt có PTI trung bình là **14.9%**.
- Khách hàng vỡ nợ có PTI trung bình là **24.7%** (chênh lệch gần 10 điểm phần trăm).
- **Vùng thảm họa (Catastrophic Underwriting Failure)**: Với những hồ sơ có DTI > 0.8, tỷ lệ nợ xấu lên đến **93.33%**!

*Cơ chế dòng tiền*: Khi nghĩa vụ trả nợ chiếm trên **25% thu nhập hàng tháng**, biên độ dòng tiền dự phòng bị xóa bỏ hoàn toàn. Bất kỳ một cú sốc lạm phát hoặc sự cố phát sinh nhỏ cũng đẩy người vay vào tình trạng mất khả năng thanh toán.

---

### 2.7 Hành Vi Tín Dụng & Nghịch Lý Thâm Niên (Credit History Paradox)

#### Tác động của tiền sử nợ xấu:
- Khách hàng không có lịch sử nợ xấu: Tỷ lệ vỡ nợ hiện tại là **18.39%**.
- Khách hàng từng có nợ xấu (`has_prior_default = 1`): Tỷ lệ nợ xấu vọt lên **37.81%** (Cao gấp **2.06 lần**).

#### Nghịch lý thâm niên tín dụng (Length of Credit History):
- Thâm niên 0–10 năm: Tỷ lệ vỡ nợ là **20.65%**.
- Thâm niên 25–30 năm: Tỷ lệ vỡ nợ tăng lên **28.71%**!
- *Giải thích*: Thâm niên lịch sử tín dụng dài thường gắn liền với nhóm người vay lớn tuổi (60+), trùng khớp với nhóm thu nhập cố định bị ảnh hưởng bởi chi phí y tế và tích lũy nhiều nghĩa vụ nợ qua thời gian.

#### Điểm ngọt của tỷ lệ sử dụng hạn mức (Credit Utilization Sweet Spot):
- Tỷ lệ sử dụng 0%–10%: Nợ xấu 21.84% (hồ sơ tín dụng mỏng, ít hoạt động).
- **Tỷ lệ sử dụng 20%–30% (Tối ưu)**: Nợ xấu **21.11%** (sử dụng tín dụng lành mạnh, dòng tiền ổn định).
- Tỷ lệ sử dụng > 90%: Nợ xấu tăng cao (dấu hiệu cạn kiệt thanh khoản, phụ thuộc vào thẻ tín dụng).

#### Số lượng tài khoản tín dụng đang mở (Open Accounts):
- Nhóm mở 7–8 tài khoản ghi nhận tỷ lệ nợ xấu đỉnh điểm (**24.13%**) do phải xoay xở thanh toán nhiều hạn mức cùng lúc. Trong khi đó nhóm 1–2 tài khoản hoặc nhóm quản lý trên 14 tài khoản chuyên nghiệp lại duy trì tỷ lệ vỡ nợ thấp hơn (~21%).

---

### 2.8 Khủng Hoảng Hạng Tín Dụng Grade G & Vấn Đề Data Leakage

Thống kê phân hạng truyền thống ghi nhận sự phân cực rủi ro:
- **Grade A**: 9.96% vỡ nợ (Khách hàng cao cấp).
- **Grade B**: 16.28% vỡ nợ.
- **Grade C–F**: Tăng dần từ 20.73% đến 70.54%.
- **Grade G**: Tỷ lệ vỡ nợ lên đến **98.44%**!

> ⚠️ **Khủng hoảng Grade G**: Cứ 100 hồ sơ xếp hạng G thì có hơn 98 hồ sơ mất vốn. Việc tiếp tục cấp tín dụng cho nhóm này là sự thất bại trong chính sách thẩm định.

*Quyết định xử lý rò rỉ dữ liệu (Target Leakage)*:
Biến `loan_grade` bị **loại bỏ hoàn toàn khỏi mô hình Machine Learning** vì đây là nhãn phân loại nội bộ được gán sau quá trình duyệt. Mô hình ML mới đảm bảo tính độc lập khách quan và mang lại **Incremental Lift (Giá trị dự báo bổ sung)** thực sự cho ngân hàng.

---

### 2.9 Điểm Nóng Bất Định (Uncertainty Hotspot) — Nhóm MORTGAGE

Kiểm định sai số (Standardized Residuals, Chi-square test) phát hiện nhóm `MORTGAGE` có tỷ lệ nợ xấu thực tế thấp (12.57%), nhưng mô hình lại phát sinh **tỷ lệ Dương tính giả (False Positive) cao bất thường**.

*Nguyên nhân*: Do hiện tượng **Omitted Variable Bias (Thiếu biến giải thích quan trọng)** trong dữ liệu lịch sử (thiếu trường thông tin về: giá trị định giá nhà, tỷ lệ dư nợ trên tài sản LTV, vốn chủ sở hữu tích lũy). Nhận định này dẫn tới quyết định kinh doanh: **Không từ chối tự động nhóm MORTGAGE ở biên điểm**, mà thiết lập luồng thẩm định riêng có sự tham gia của con người.

---

## 3. Business Decisions & Phased Strategic Roadmap

### 3.1 Ma Trận Hành Động Từ Dữ Liệu (Data-to-Policy Matrix)

| # | Phát Hiện Từ Dữ Liệu (EDA Insight) | Quyết Định Kinh Doanh & Chính Sách Tín Dụng | Cơ Chế Thực Thi Trên Hệ Thống |
|---|---|---|---|
| **1** | Hạng G có tỷ lệ vỡ nợ 98.44%; DTI > 0.8 vỡ nợ 93.33% | **Đình chỉ khẩn cấp**: Cắt toàn bộ hồ sơ Grade G; áp trần cứng DTI $\le 0.6$ và PTI $\le 25\%$ | Kích hoạt bộ lọc loại trừ trực tiếp (*Hard-cut Filter*); trả về `REJECT` tức thì |
| **2** | Nhóm RENT có tỷ lệ vỡ nợ cao (31.57%), chiếm phần lớn danh mục | **Tăng cường quy trình xác minh người thuê nhà (Enhanced Renter Protocol)**: Yêu cầu chứng minh thu nhập 6 tháng và lịch sử thanh toán tiền thuê | Điều chuyển hồ sơ sang luồng `REVIEW` nếu PTI tiệm cận 20%; yêu cầu bổ sung chứng từ |
| **3** | Phân hóa theo mục đích vay (Hợp nhất nợ 28.59% vs Kinh doanh 14.31%) | **Định giá theo rủi ro mục đích vay (Purpose-based Pricing)**: Cộng biên độ lãi suất (+2.0% với đảo nợ; giảm 1.0% với học tập/kinh doanh) | Tự động tính toán lãi suất đề xuất dựa trên `loan_intent` trong phản hồi API |
| **4** | Đường cong tuổi chữ U: Nhóm 61–70 tuổi có nợ xấu cao nhất (29.82%) | **Thiết kế gói vay chuyên biệt cho người cao tuổi (Senior Lending Products)**: Giảm kỳ hạn vay tối đa, yêu cầu người bảo lãnh (Co-signer) | Cảnh báo rủi ro `RULE_SENIOR_RISK` đối với khách hàng trên 60 tuổi |
| **5** | Nhóm MORTGAGE có tỷ lệ False Positive cao do thiếu dữ liệu LTV | **Cơ chế thẩm định kép (Human-in-the-loop)**: Không tự động từ chối hồ sơ thế chấp ở vùng ranh giới | Điều chuyển sang chuyên viên thẩm định để đối soát giá trị tài sản thế chấp thực tế |
| **6** | Tiền sử nợ xấu làm tăng nguy cơ vỡ nợ gấp 2.06 lần (37.81%) | **Chốt chặn lịch sử tín dụng**: Khách hàng có nợ xấu cũ không được hưởng quy trình duyệt tự động | Gán nhãn cờ đỏ `RULE_PRIOR_DEFAULT`, trừ điểm phạt trong scorecard |
| **7** | Tỷ lệ nợ xấu đồng nhất giữa 3 quốc gia US, UK, Canada (~21.8%) | **Chính sách xuyên biên giới đồng nhất (Cross-border Harmonization)**: Giữ chung một scorecard và tiêu chí đánh giá | Không đưa biến quốc gia vào mô hình, đảm bảo tính công bằng và tuân thủ pháp lý |

---

### 3.2 Lộ Trình Triển Khai Chiến Lược Theo Giai Đoạn

```
Lộ Trình Triển Khai:
[Giai đoạn 1: 0–30 ngày]  ──► Ứng phó khẩn cấp: Cắt bỏ Grade G & Áp trần DTI/PTI
[Giai đoạn 2: 1–6 tháng]   ──► Tinh chỉnh sản phẩm: Định giá theo rủi ro & Xác minh nhóm RENT
[Giai đoạn 3: 6–12 tháng]  ──► Sáng kiến mở rộng: Tận dụng mô hình sang thị trường mới
[Giai đoạn 4: 12+ tháng]   ──► Chuyển đổi số toàn diện: Triển khai ML Serving & Cân bằng danh mục
```

#### 🚨 Giai Đoạn 1: Hành Động Khẩn Cấp (0 – 30 Ngày)
- **Đình chỉ phê duyệt toàn bộ hồ sơ Grade G**: Ngăn chặn dòng tiền chảy vào phân khúc nợ xấu 98.44%. *(Chủ trì: Hội đồng Quản trị Rủi ro)*.
- **Thiết lập trần cứng đòn bẩy DTI 0.6 và PTI 25%**: Ngay lập tức loại bỏ các trường hợp quá tải nợ. *(Chủ trì: Đội ngũ Thẩm định)*.

#### ⚖️ Giai Đoạn 2: Tối Ưu Hóa Ngắn Hạn (1 – 6 Tháng)
- **Quy trình thẩm định nâng cao cho người thuê nhà (RENT)**: Bổ sung yêu cầu sao kê dòng tiền và lịch sử trả tiền thuê. *(Chủ trì: Khối Vận hành Cho vay)*.
- **Định giá theo rủi ro mục đích vay**: Tăng biên độ lãi suất bù đắp rủi ro cho vay hợp nhất nợ (+2%), ưu đãi cho vay giáo dục/kinh doanh (-1%). *(Chủ trì: Phòng Phát triển Sản phẩm)*.
- **Gói tín dụng cá nhân hóa theo độ tuổi**: Thiết kế kỳ hạn ngắn hơn cho người cao tuổi hoặc yêu cầu đồng ký tên. *(Chủ trì: Phòng Phát triển Sản phẩm)*.

#### 🌐 Giai Đoạn 3: Sáng Kiến Chiến Lược (6 – 12 Tháng)
- **Chiến lược mở rộng quốc tế**: Triển khai khung thẩm định đã được chuẩn hóa sang các thị trường nói tiếng Anh tiềm năng (Úc, New Zealand, Ireland). *(Chủ trì: Khối Phát triển Kinh doanh)*.
- **Định giá dựa trên mức độ sử dụng hạn mức thẻ (Utilization-based Pricing)**: Tích hợp tỷ lệ sử dụng hạn mức vào thuật toán xác định lãi suất cá nhân hóa. *(Chủ trì: Phòng Phân tích Rủi ro)*.

#### 🚀 Giai Đoạn 4: Chuyển Đổi Dài Hạn (12+ Tháng)
- **Hệ thống cảnh báo sớm & Chấm điểm Machine Learning thời gian thực**: Triển khai mô hình LightGBM tích hợp API vào toàn bộ các chi nhánh và kênh số. *(Chủ trì: Đội ngũ Data Science)*.
- **Tái cân bằng cấu trúc danh mục**: Định hướng dịch chuyển tỷ trọng danh mục về mức tối ưu **25% Rủi ro (lãi suất cao) : 75% An toàn (nền tảng ổn định)** nhằm tối đa hóa lợi nhuận điều chỉnh theo rủi ro (Risk-Adjusted Return on Capital - RAROC). *(Chủ trì: Khối Quản lý Danh mục)*.

---

## 4. Machine Learning: Credit Scoring & Risk Tiering

### 4.1 Scoring Pipeline Architecture

Hệ thống xử lý dòng chảy dữ liệu khép kín từ lúc chuyên viên nhập hồ sơ tới khi đưa ra quyết định:

```
[Hồ sơ vay đầu vào (16 tham số tài chính & nhân khẩu học)]
                           │
                           ▼
[Feature Engineering Pipeline (22 đặc trưng mô hình)]
  • Log-transform chống lệch: person_income_log, other_debt_log
  • Tỷ số đòn bẩy: debt_to_income_ratio, loan_to_income_ratio
  • Cờ dữ liệu thiếu & gánh nặng: emp_length_missing, high_loan_burden_flag
  • Categorical Ordinal Encoding
                           │
                           ▼
[Mô hình LightGBM Tuned] ──► Xác suất vỡ nợ (Probability of Default - PD)
                           │
                           ▼
[Log-Odds Scorecard Scaling] ─► Điểm tín dụng Credit Score ∈ [300, 850]
                           │
                           ▼
[Risk Tier Engine] ──────────► LOW / MEDIUM / HIGH
                           │
                           ▼
[Business Rules Engine & Reason Codes] ──► Quyết định (APPROVE / REVIEW / REJECT)
                                           + Mã lý do rủi ro & Khuyến nghị hành động
```

---

### 4.2 Chuẩn Hóa Thang Điểm Tín Dụng FICO (300–850)

Thay vì chỉ trả về một xác suất phần trăm (PD) mang tính trừu tượng và khó truyền thông, hệ thống chuyển đổi trực tiếp xác suất vỡ nợ sang **thang điểm tín dụng chuẩn hóa 300–850** (tương tự chuẩn FICO quốc tế):

- **Cơ chế Log-Odds (Tỷ lệ cược)**: Phản ánh tương quan trực tiếp giữa khả năng trả nợ tốt và nguy cơ vỡ nợ.
- **Điểm neo cơ sở (Base Score = 600)**: Tương ứng với mức tỷ lệ cược cân bằng (tại xác suất vỡ nợ 50%).
- **Hệ số nhân đôi tỷ lệ cược (PDO = 20)**: *Points to Double the Odds* — quy ước tiêu chuẩn ngành tín dụng: Cứ mỗi 20 điểm tăng thêm, tỷ lệ khách hàng trả nợ tốt tăng gấp đôi.
- **Dải điểm chuẩn hóa (300–850)**: Giới hạn trong biên độ chuẩn ngặt từ **300 (rủi ro cao nhất)** đến **850 (uy tín tối đa)**, giúp cả người vay lẫn chuyên viên thẩm định dễ dàng hiểu và đối chiếu mức độ tín nhiệm mà không cần phải hiểu sâu về thuật toán xác suất bên dưới.

---

### 4.3 Khung Ra Quyết Định 3 Tầng (Three-Tier Decision Framework)

| Quyết Định Cuối Cùng | Ngưỡng Điểm | Mức Rủi Ro | Hành Động & Cơ Chế Vận Hành |
|---|---|---|---|
| 🟢 **APPROVE (Phê duyệt)** | **> 643** | Rủi ro Thấp (Low Risk) | **Phê duyệt tự động hoàn toàn (Straight-Through Processing - STP)**. Hồ sơ đủ điều kiện giải ngân ngay với lãi suất ưu đãi. |
| 🟡 **REVIEW (Xem xét)** | **617 – 643** | Rủi ro Trung Bình (Medium Risk) | **Điều chuyển chuyên viên tín dụng thẩm định thủ công**. Hệ thống tự động đính kèm danh sách cảnh báo để đàm phán giảm hạn mức hoặc tăng kỳ hạn vay. |
| 🔴 **REJECT (Từ chối)** | **≤ 616** | Rủi ro Cao (High Risk) | **Từ chối cấp tín dụng tự động**. Hệ thống sinh văn bản thông báo từ chối kèm mã nguyên nhân chính xác theo quy định minh bạch tín dụng. |

---

### 4.4 Khả Năng Giải Trình Minh Bạch & Reason Codes

Khắc phục hoàn toàn nhược điểm "Hộp đen" của AI bằng việc sinh mã lý do rủi ro hàng đầu (Top Risk Drivers):
- `REASON_HIGH_DTI`: Tỷ lệ tổng nợ trên thu nhập vượt ngưỡng an toàn.
- `REASON_HIGH_PTI`: Nghĩa vụ nợ hàng tháng chiếm dụng dòng tiền sinh hoạt quá mức (> 25%).
- `REASON_PRIOR_DEFAULT`: Khách hàng có lịch sử ghi nhận nợ xấu trong quá khứ.
- `REASON_PAST_DELINQUENCIES`: Từng có lịch sử chậm trả lãi/gốc.
- `REASON_HIGH_CREDIT_UTILIZATION`: Sử dụng trên 80% hạn mức thẻ tín dụng.

Hệ thống hỗ trợ song ngữ (Tiếng Việt và Tiếng Anh), giúp chuyên viên có cơ sở vững chắc khi giải trình với ban kiểm toán nội bộ.

---

## 5. Model Evaluation & Reliability

### 5.1 Performance Benchmark

Hiệu năng kiểm định trên tập dữ liệu kiểm thử độc lập (Test Set):

| Chỉ Số Đánh Giá | Logistic Regression (Baseline) | LightGBM (Champion) | Đánh Giá Hiệu Quả Nghiệp Vụ |
|---|---|---|---|
| **ROC-AUC** | 0.8607 | **0.9431** | Năng lực phân biệt xuất sắc giữa hồ sơ tốt và hồ sơ xấu trên toàn dải điểm |
| **PR-AUC** | 0.7214 | **0.8916** | **Chỉ số cốt lõi**: Khả năng nhận diện chính xác nợ xấu khi dữ liệu mất cân bằng |
| **KS Statistic** | 58.40 | **73.08** | Độ tách biệt phân phối điểm giữa 2 nhóm (tiêu chuẩn ngân hàng yêu cầu KS > 40) |
| **Gini Coefficient** | 0.7214 | **0.8862** | Sức mạnh phân hóa tiêu chuẩn trong scorecard tín dụng ($2 \times \text{AUC} - 1$) |
| **F1-Score** | 0.7021 | **0.8415** | Cân bằng tối ưu giữa khả năng bắt nợ xấu (Recall) và độ chuẩn xác (Precision) |

---

### 5.2 Kỹ Thuật Thẩm Định Mô Hình Tiêu Chuẩn Ngân Hàng

1. **Tối ưu siêu tham số Bayesian (Optuna)**: Áp dụng `TPESampler` kết hợp cắt tỉa `MedianPruner`, tối ưu hóa trực tiếp hàm mục tiêu **PR-AUC** qua 50 trials với 5-Fold Stratified Cross-Validation.
2. **Kiểm tra tính đơn điệu (Monotonicity Check qua Decile Analysis)**: Chia điểm số thành 10 phân vị và kiểm chứng: Điểm số tăng thì tỷ lệ nợ xấu thực tế giảm liên tục 100%, không bị nghịch đảo rủi ro.
3. **Thực nghiệm mất cân bằng (SMOTE-NC vs `scale_pos_weight`)**: Thực nghiệm chứng minh SMOTE-NC tạo khoảng cách sai lệch giữa tập huấn luyện và kiểm thử (Overfitting gap). Kỹ thuật điều chỉnh trọng số tự nhiên `scale_pos_weight` của LightGBM được lựa chọn để đảm bảo tính khái quát hóa cao nhất.
4. **Hiệu chuẩn xác suất (Probability Calibration)**: Sử dụng đường cong hiệu chuẩn phân tích độ lệch PD khi áp dụng trọng số lớp; đề xuất áp dụng `CalibratedClassifierCV` khi ngân hàng đưa vào định giá theo rủi ro.

---

## 6. Power BI Executive Dashboard

Báo cáo điều hành chuyên sâu [`Power BI/risk.pbix`](Power%20BI/risk.pbix) cung cấp góc nhìn trực quan toàn diện:

- **Portfolio Health Tracking**: Giám sát phân bổ điểm số FICO và biến động tỷ lệ an toàn/rủi ro (tỷ lệ 3.6:1) theo thời gian thực.
- **Approval Conversion Funnel**: Đo lường tỷ lệ Phê duyệt / Xem xét / Từ chối theo chi nhánh và phân khúc khách hàng.
- **Segment Risk Drill-Down**: Cắt lớp rủi ro đa chiều theo hình thức cư trú (Rent vs Own), độ tuổi (đường cong chữ U) và mục đích vay.
- **Model Drift Monitoring**: Cảnh báo sớm khi xác suất vỡ nợ bình quân tháng có dấu hiệu dịch chuyển lệch khỏi phân phối ban đầu.

---

## 7. System Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Vercel)                    │
│    Next.js 16 (React 19) • TypeScript • Tailwind CSS • i18n │
│  - Giao diện nộp hồ sơ vay & thẩm định trực quan            │
│  - Tra cứu lịch sử, phân tích rủi ro & xem mã giải trình   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ HTTPS / REST API (JWT Bearer)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND LAYER (Render)                    │
│             FastAPI • Uvicorn • Pydantic v2                 │
│  ┌───────────────────────────┬───────────────────────────┐  │
│  │   Authentication Service  │   Credit Scoring Service  │  │
│  │   (JWT, Bcrypt, Roles)    │   (Pipeline & Reason Code)│  │
│  └───────────────────────────┴─────────────┬─────────────┘  │
│                                            │                │
│                                            ▼                │
│                              ┌───────────────────────────┐  │
│                              │   ML Inference Engine     │  │
│                              │   LightGBM + Preprocessor│  │
│                              │   Artifacts: metadata.json│  │
│                              └───────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ SQLAlchemy 2.0 ORM
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE (PostgreSQL)                   │
│  - Bảng users: Quản lý người dùng và phân quyền RBAC        │
│  - Bảng predictions: Lưu trữ hồ sơ thẩm định & Audit Trail  │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Quick Start & Local Development

### Yêu cầu môi trường:
- Python >= 3.10
- Node.js >= 18.0.0 & npm >= 9.0.0
- PostgreSQL (Local hoặc Supabase Cloud)

### Bước 1 — Khởi chạy Backend (FastAPI)

```bash
# 1. Di chuyển vào thư mục Backend
cd App/BE

# 2. Khởi tạo và kích hoạt môi trường ảo Python
python -m venv venv
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

# 3. Cài đặt thư viện phụ thuộc
pip install -r requirements.txt

# 4. Cấu hình biến môi trường
cp .env.example .env
# Điền thông tin DATABASE_URL và JWT Secret phù hợp trong file .env

# 5. Khởi chạy máy chủ API
uvicorn main:app --reload --port 8000
```
- Swagger API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

---

### Bước 2 — Khởi chạy Frontend (Next.js)

```bash
# 1. Mở terminal mới, di chuyển vào thư mục Frontend
cd App/FE

# 2. Cài đặt các gói Node.js
npm install

# 3. Cấu hình biến môi trường
echo 'NEXT_PUBLIC_API_URL=http://localhost:8000' > .env.local

# 4. Khởi chạy giao diện phát triển
npm run dev
```
- Truy cập ứng dụng tại: `http://localhost:3000`

---

### Bước 3 — Khám phá Notebooks Phân Tích

```bash
# Cài đặt Jupyter
pip install jupyter

# Khởi động Jupyter Notebook
jupyter notebook
```

**Thứ tự các notebook phân tích:**
1. [`notebooks/data_understanding.ipynb`](notebooks/data_understanding.ipynb): Khám phá cấu trúc dữ liệu, phân phối và kiểm tra tính toàn vẹn.
2. [`notebooks/EDA.ipynb`](notebooks/EDA.ipynb): Phân tích khám phá chuyên sâu, kiểm định giả thuyết và trích xuất insights kinh doanh.
3. [`notebooks/model.ipynb`](notebooks/model.ipynb): Huấn luyện Baseline, xử lý mất cân bằng, tối ưu hóa siêu tham số bằng Optuna và xuất Artifacts.
4. [`notebooks/powerBi.ipynb`](notebooks/powerBi.ipynb): Tiền xử lý dữ liệu và tạo bảng tổng hợp phục vụ trực quan hóa Power BI.

---

## 9. Project Structure

```
NovaBank_CreditRisk/
│
├── App/
│   ├── BE/                          # FastAPI Backend Engine
│   │   ├── api/                     # REST API Route Endpoints (auth, predict, history...)
│   │   ├── artifacts/               # Model Pipeline & Metadata (metadata.json, pipeline.joblib)
│   │   ├── database/                # SQLAlchemy Models, Engine & Session Configuration
│   │   ├── domain/                  # Pydantic Schemas & DTOs
│   │   ├── ml/                      # Predictor & Feature Transformer Interfaces
│   │   ├── repository/              # Data Access Layer (Users, Predictions)
│   │   ├── service/                 # Business Logic & Authentication Services
│   │   ├── main.py                  # FastAPI Application Entrypoint
│   │   ├── scoring.py               # FICO Scorecard & Reason Codes Logic
│   │   └── requirements.txt         # Backend Python Dependencies
│   │
│   └── FE/                          # Next.js 16 Web Client
│       ├── public/                  # Static Assets & Icons
│       ├── src/
│       │   ├── app/                 # App Router Pages ([locale]/apply, login, history...)
│       │   ├── components/          # Reusable UI Components (Navbar, Forms, Gauge...)
│       │   ├── lib/                 # API Clients & Utility Functions
│       │   └── messages/            # Internationalization Translations (en.json, vi.json)
│       └── package.json             # Frontend Dependencies & Scripts
│
├── notebooks/                       # Data Science & Analytics Notebooks
│   ├── data_understanding.ipynb     # Phase 1: Data Understanding & Profiling
│   ├── EDA.ipynb                    # Phase 2: Exploratory Data Analysis & Business Insights
│   ├── model.ipynb                  # Phase 3: Model Training, Tuning & Evaluation
│   ├── powerBi.ipynb                # Phase 4: Data Preparation for BI
│   └── preprocessors.py             # Custom Sklearn Transformers
│
├── Power BI/
│   └── risk.pbix                    # Interactive Executive Power BI Report
│
├── raw_data/
│   └── Credit Risk Data.csv         # Core Dataset (32,581 loan records)
│
├── requirements.txt                 # Global Analytics Dependencies
├── README.md                        # Comprehensive Project Documentation
└── .gitignore                       # Git Ignore Rules
```

---

## 10. Limitations & Future Roadmap

1. **Bổ sung dữ liệu tài sản thế chấp (LTV Integration)**: Thu thập thêm giá trị định giá tài sản và số tiền thế chấp ban đầu nhằm xóa bỏ điểm mù (Uncertainty Hotspot) đối với nhóm khách hàng vay mua nhà `MORTGAGE`.
2. **Giải thích cục bộ theo thời gian thực bằng SHAP**: Tích hợp thuật toán TreeSHAP vào trực tiếp API Backend để xuất giá trị đóng góp Shapley Value cho từng thuộc tính của riêng từng hồ sơ.
3. **Hệ thống giám sát trôi dữ liệu tự động (Automated PSI/CSI)**: Thiết lập pipeline tự động tính toán chỉ số ổn định dân số (Population Stability Index - PSI) và độ suy thoái đặc trưng (Characteristic Stability Index - CSI) theo tuần; tự động gửi thông báo khi PSI > 0.25 để tái huấn luyện mô hình.
4. **Tích hợp dữ liệu vĩ mô (Macroeconomic Scenarios)**: Đưa các chỉ số kinh tế vĩ mô (lãi suất cơ bản ngân hàng trung ương, CPI, tỷ lệ thất nghiệp theo quý) vào mô hình Stress Testing danh mục theo các kịch bản suy thoái.

---

*NovaBank CreditRisk — End-to-End Credit Risk Analytics & Machine Learning Decision Pipeline*  
*Developed with FastAPI, LightGBM, Next.js, PostgreSQL & Power BI*
