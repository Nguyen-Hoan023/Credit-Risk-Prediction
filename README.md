# NovaBank — Credit Risk Analysis & Intelligent Scoring System

> **Live Web Application**: [https://credit-risk-prediction-pi.vercel.app/en/apply](https://credit-risk-prediction-pi.vercel.app/en/apply)  
> **Interactive API Documentation (Swagger)**: [https://credit-risk-prediction-7nxt.onrender.com/docs](https://credit-risk-prediction-7nxt.onrender.com/docs)  
> **Tech Stack**: FastAPI · LightGBM · Next.js 16 · PostgreSQL · Power BI · Scikit-Learn

Hệ thống phân tích rủi ro tín dụng tiêu dùng toàn diện dựa trên dữ liệu lịch sử (**32,581 hồ sơ vay, 29 biến đặc trưng**, tỷ lệ vỡ nợ nền 21.8%). Dự án tích hợp đầy đủ chu trình phân tích dữ liệu thực tế tại các định chế tài chính: từ **khám phá dữ liệu (EDA)**, **đúc kết insight & thiết kế chính sách tín dụng (Business Policy)**, **mô hình hóa rủi ro & chấm điểm tín dụng (Machine Learning & Credit Scoring)** đến **xây dựng Dashboard quản trị danh mục (Power BI)** và **ứng dụng web phê duyệt hồ sơ theo thời gian thực**.

---

## Mục Lục / Table of Contents

- [1. Business Context & Problem Statement](#1-business-context--problem-statement)
- [2. Key Insights from Exploratory Data Analysis (EDA)](#2-key-insights-from-exploratory-data-analysis-eda)
  - [2.1 Portfolio Landscape & Geographic Neutrality](#21-portfolio-landscape--geographic-neutrality)
  - [2.2 Risk Concentration by Segment & Loan Purpose](#22-risk-concentration-by-segment--loan-purpose)
  - [2.3 Payment-to-Income (PTI) — Thước Đo Căng Thẳng Dòng Tiền](#23-payment-to-income-pti--thước-đo-căng-thẳng-dòng-tiền)
  - [2.4 Phân Hạng Tín Dụng Hiện Hữu & Bài Toán Data Leakage](#24-phân-hạng-tín-dụng-hiện-hữu--bài-toán-data-leakage)
  - [2.5 Điểm Nóng Bất Định (Uncertainty Hotspot) — Nhóm MORTGAGE](#25-điểm-nóng-bất-định-uncertainty-hotspot--nhóm-mortgage)
  - [2.6 Quản Trị Chất Lượng Dữ Liệu (Data Quality & Governance)](#26-quản-trị-chất-lượng-dữ-liệu-data-quality--governance)
- [3. Business Decisions & Credit Policy](#3-business-decisions--credit-policy)
- [4. Machine Learning: Credit Scoring & Risk Tiering](#4-machine-learning-credit-scoring--risk-tiering)
  - [4.1 Scoring Pipeline Architecture](#41-scoring-pipeline-architecture)
  - [4.2 FICO-Standard Log-Odds Scoring Formula](#42-fico-standard-log-odds-scoring-formula)
  - [4.3 Three-Tier Decision Framework](#43-three-tier-decision-framework)
  - [4.4 Khả Năng Giải Trình & Reason Codes](#44-khả-năng-giải-trình--reason-codes)
- [5. Model Evaluation & Reliability](#5-model-evaluation--reliability)
  - [5.1 Performance Benchmark](#51-performance-benchmark)
  - [5.2 Kỹ Thuật Thẩm Định & Đảm Bảo Độ Tin Cậy](#52-kỹ-thuật-thẩm-định--đảm-bảo-độ-tin-cậy)
- [6. Power BI Dashboard](#6-power-bi-dashboard)
- [7. System Architecture & Deployment](#7-system-architecture--deployment)
- [8. Quick Start & Local Development](#8-quick-start--local-development)
- [9. Project Structure](#9-project-structure)
- [10. Limitations & Future Roadmap](#10-limitations--future-roadmap)

---

## 1. Business Context & Problem Statement

Trong hoạt động cho vay tiêu dùng bán lẻ, các ngân hàng truyền thống đối mặt với tình thế tiến thoái lưỡng nan kinh điển: **tối đa hóa tăng trưởng tín dụng** đồng thời **kiểm soát tỷ lệ nợ xấu (NPL)** trong ngưỡng an toàn vốn.

Các phương pháp xét duyệt truyền thống dựa trên bộ quy tắc tĩnh (rule-based) hoặc thẩm định trực quan của chuyên viên tín dụng bộc lộ nhiều hạn chế:
- **Tốc độ xử lý chậm**: Hồ sơ mất nhiều ngày để đối soát và ra quyết định.
- **Tính chủ quan và thiếu nhất quán**: Các chuyên viên khác nhau đưa ra phán quyết khác nhau đối với cùng một mức độ rủi ro.
- **Không định lượng được rủi ro cận biên**: Quy tắc cứng 'đạt/không đạt' loại trừ các khách hàng tiềm năng ở vùng ranh giới hoặc chấp thuận khách hàng ẩn chứa rủi ro dòng tiền phức tạp.

**Mục tiêu của dự án:**
1. **Định lượng xác suất vỡ nợ (Probability of Default - PD)** của từng hồ sơ vay cá nhân bằng các thuật toán học máy tiên tiến.
2. **Khai phá các động lực rủi ro cốt lõi (Key Risk Drivers)** từ dữ liệu lịch sử để làm căn cứ tái thiết kế chính sách cấp tín dụng.
3. **Chuyển hóa PD thành thang điểm tín dụng chuẩn hóa 300–850** (FICO standard) kết hợp phân nhóm rủi ro 3 cấp (*Approve / Review / Reject*) kèm mã lý do giải trình minh bạch.
4. **Triển khai ứng dụng hoàn chỉnh (End-to-End)**: Cung cấp giao diện web cho chuyên viên tín dụng thao tác nhập liệu thời gian thực và Dashboard Power BI cho cấp quản lý giám sát sức khỏe danh mục.

**Nguồn dữ liệu**: `raw_data/Credit Risk Data.csv` gồm **32,581 bản ghi khoản vay** tại 3 thị trường phát triển (Mỹ, Anh, Canada). Biến mục tiêu là `loan_status` (0 = trả nợ đúng hạn, 1 = vỡ nợ / quá hạn nghiêm trọng).

---

## 2. Key Insights from Exploratory Data Analysis (EDA)

> Quá trình phân tích chuyên sâu được thực nghiệm chi tiết tại notebook [`notebooks/EDA.ipynb`](notebooks/EDA.ipynb).

### 2.1 Portfolio Landscape & Geographic Neutrality

- **Tỷ lệ nợ xấu nền (Baseline Default Rate)**: Đạt **21.8%** (7,108 / 32,581 khoản vay). Đây là bài toán mất cân bằng lớp (tỷ lệ xấp xỉ 4:1), do đó **PR-AUC (Precision-Recall AUC)** và **F1-Score** được lựa chọn làm thước đo chính thay cho Accuracy (vốn có thể gây ngộ nhận về hiệu năng).
- **Đặc trưng phân phối**: Các biến tài chính cốt lõi như thu nhập hàng năm (`person_income`) và số tiền xin vay (`loan_amnt`) có phân phối lệch phải mạnh (right-skewed), chứa các giá trị ngoại lai cực lớn → Cần xử lý bằng phép biến đổi logarit (`np.log1p`) trước khi đưa vào mô hình.
- **Tính trung lập về địa lý (Geographic Invariance)**: Tỷ lệ vỡ nợ gần như tương đồng tuyệt đối giữa 3 thị trường:
  - Hoa Kỳ (US): **21.8%**
  - Vương quốc Anh (UK): **21.9%**
  - Canada: **21.7%**
  
  *Insight nghiệp vụ*: Rủi ro tín dụng tiêu dùng **không xuất phát từ sự khác biệt quốc gia**, mà bị chi phối bởi các chỉ số tài chính cá nhân vi mô. Điều này cho phép tổ chức áp dụng một **khung chính sách tín dụng và mô hình chấm điểm thống nhất** trên toàn cầu mà không lo ngại thiên vị địa lý hay vi phạm quy định chống phân biệt đối xử (Fair Lending Compliance).

---

### 2.2 Risk Concentration by Segment & Loan Purpose

Phân tích tỷ lệ vỡ nợ theo từng phân khúc khách hàng so với tỷ lệ nền danh mục (21.8%):

| Phân khúc / Đặc điểm hồ sơ | Tỷ lệ vỡ nợ | Độ lệch so với nền | Đánh giá rủi ro |
|---|---|---|---|
| Có tiền sử nợ xấu (`cb_person_default_on_file = Y`) | **37.8%** | **+16.0 pp** | **Nguy cơ cao nhất** |
| Đang thuê nhà (`RENT`) | **31.6%** | **+9.8 pp** | Rủi ro rất cao |
| Vay hợp nhất nợ (`DEBTCONSOLIDATION`) | **28.6%** | **+6.8 pp** | Căng thẳng thanh khoản |
| Vay chi phí y tế khẩn cấp (`MEDICAL`) | **26.7%** | **+4.9 pp** | Chi tiêu ngoài dự kiến |
| Vay sửa chữa nhà cửa (`HOMEIMPROVEMENT`) | **26.1%** | **+4.3 pp** | Rủi ro trung bình cao |
| Vay học tập, giáo dục (`EDUCATION`) | **17.2%** | **-4.6 pp** | Rủi ro thấp |
| Vay đầu tư kinh doanh / mạo hiểm (`VENTURE`) | **14.8%** | **-7.0 pp** | Rủi ro thấp |
| Đang vay mua nhà thế chấp (`MORTGAGE`) | **12.6%** | **-9.2 pp** | Khá an toàn |
| Đã sở hữu nhà hoàn toàn (`OWN`) | **7.5%** | **-14.3 pp** | **An toàn nhất** |

**Bản chất kinh tế (Economic Mechanisms):**
1. **Đệm tài sản phòng ngừa (Home-Equity Buffer)**: Người sở hữu nhà (`OWN`, tỷ lệ vỡ nợ chỉ 7.5%) có nền tảng tích lũy tài sản vững chắc để vượt qua các biến cố tài chính ngắn hạn. Ngược lại, người đi thuê nhà (`RENT`, 31.6%) chịu áp lực kép từ chi phí sinh hoạt cố định và thiếu hụt tài sản dự phòng.
2. **Tín hiệu đảo nợ (Rollover Debt Signal)**: Khách hàng vay hợp nhất nợ (`DEBTCONSOLIDATION`) thường đã rơi vào tình trạng bội chi hoặc sử dụng đòn bẩy quá mức từ trước; khoản vay mới thường chỉ trì hoãn việc mất khả năng thanh toán thay vì giải quyết gốc rễ.
3. **Cú sốc thanh khoản thụ động**: Vay y tế (`MEDICAL`) là dạng chi tiêu bắt buộc phát sinh ngoài kế hoạch, thường đi kèm với việc gián đoạn thu nhập lao động do vấn đề sức khỏe.

---

### 2.3 Payment-to-Income (PTI) — Thước Đo Căng Thẳng Dòng Tiền

Phân tích định lượng khẳng định tỷ lệ nghĩa vụ nợ trên thu nhập (PTI / `loan_percent_income`) là biến số có sức mạnh phân loại rủi ro vượt trội:

| Trạng thái khoản vay | PTI Trung bình | Độ lệch |
|---|---|---|
| Người vay trả nợ tốt (Non-Default) | **14.9%** | Vùng an toàn dòng tiền |
| Người vay vỡ nợ (Default) | **24.7%** | **+9.8 pp** (Chênh lệch ~10 điểm %) |

*Insight đột phá*: Khách hàng vỡ nợ không nhất thiết là người có thu nhập thấp tuyệt đối, mà là người có **biên độ an toàn dòng tiền (Cashflow Buffer) bị triệt tiêu**. Khi nghĩa vụ nợ hàng tháng tiếp cận và vượt qua mốc **25% thu nhập**, người vay mất hoàn toàn khả năng co giãn chi tiêu trước các biến cố lạm phát, phát sinh chi phí y tế hoặc sụt giảm tiền thưởng. Ngưỡng **PTI 25%** chính là cơ sở định lượng để thiết lập chốt chặn chính sách (Policy Hard Cap).

---

### 2.4 Phân Hạng Tín Dụng Hiện Hữu & Bài Toán Data Leakage

Hệ thống phân hạng nội bộ truyền thống (`loan_grade`) ghi nhận sự gia tăng rủi ro đơn điệu:
$$\text{Grade A: } 9.9\% \longrightarrow \text{B: } 16.3\% \longrightarrow \text{C: } 20.7\% \longrightarrow \text{D: } 59.0\% \longrightarrow \text{E: } 64.4\% \longrightarrow \text{F: } 70.5\% \longrightarrow \text{G: } 98.4\%$$

*Quyết định kỹ thuật & kinh doanh*:
Mặc dù `loan_grade` có tương quan phân loại rất mạnh, biến số này **bị loại bỏ hoàn toàn khỏi mô hình học máy** nhằm ngăn chặn hiện tượng **rò rỉ dữ liệu (Target / Data Leakage)** — vì trên thực tế hạng tín dụng này được phê chuẩn dựa trên quy trình hậu kiểm hoặc thông tin sau khi khoản vay phát sinh. Mục tiêu của mô hình Machine Learning mới là tạo ra **Incremental Lift (Giá trị dự báo bổ sung)** độc lập hoàn toàn từ các biến hành vi và tài chính nguyên bản.

---

### 2.5 Điểm Nóng Bất Định (Uncertainty Hotspot) — Nhóm MORTGAGE

Kiểm định phân tích sai số (Chi-square, Odds Ratio, Standardized Residuals) phát hiện một nghịch lý:
- Nhóm khách hàng đang có khoản vay mua nhà thế chấp (`MORTGAGE`) có tỷ lệ vỡ nợ tổng thể thấp (**12.6%**).
- Tuy nhiên, mô hình lại ghi nhận **tỷ lệ Dương tính giả (False Positive Rate) cao bất thường** tại nhóm này (mô hình dự đoán rủi ro cao nhưng thực tế khách hàng vẫn thanh toán tốt).

*Kết luận phân tích*: Đây không phải lỗi thuật toán mà là hiện tượng **thiên lệch do thiếu biến quan sát (Omitted Variable Bias)**. Bộ dữ liệu hiện tại không chứa các trường thông tin về: giá trị thẩm định bất động sản, tỷ lệ dư nợ trên giá trị tài sản (LTV - Loan-to-Value) hay thâm niên chi trả mortgage. Điều này đưa ra khuyến nghị chiến lược: **Không phụ thuộc 100% vào điểm số tự động đối với nhóm MORTGAGE ở vùng ranh giới**, mà cần duy trì kênh thẩm định có sự can thiệp của chuyên viên.

---

### 2.6 Quản Trị Chất Lượng Dữ Liệu (Data Quality & Governance)

| Vấn đề phát hiện trong EDA | Tính chất dữ liệu | Phương án xử lý chuẩn mực |
|---|---|---|
| Thiếu dữ liệu thâm niên làm việc (`person_emp_length`) | Missing Not At Random (MNAR) — người thất nghiệp hoặc lao động tự do ngại khai báo | Không dùng Mean/Median Imputation đơn giản; gán cờ `emp_length_missing = 1` để mô hình học chính ý nghĩa của việc thiếu dữ liệu |
| Thiếu dữ liệu lãi suất (`loan_int_rate`) | Missing At Random (MAR) | Điền trung vị theo từng phân khúc và bổ sung cờ `loan_int_rate_missing` |
| Trùng lặp thông tin giữa `loan_to_income_ratio` và `loan_percent_income` | Đa cộng tuyến cao | Hợp nhất và chuẩn hóa tính toán trong pipeline tiền xử lý |

---

## 3. Business Decisions & Credit Policy

Chuyển hóa trực tiếp các phát hiện dữ liệu thành **chiến lược và quy tắc vận hành kinh doanh (Data-to-Policy Action Matrix)**:

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 BỘ DỮ LIỆU LỊCH SỬ                      │
                  └──────────────────────────┬──────────────────────────────┘
                                             │
                                             ▼
                 ┌───────────────────────────────────────────────────────────┐
                 │                INSIGHTS TỪ PHÂN TÍCH (EDA)                │
                 │  • RENT & Debt Consolidation rủi ro cao (31.6%, 28.6%)    │
                 │  • Điểm gãy rủi ro xuất hiện rõ rệt tại PTI >= 25%        │
                 │  • Rủi ro đồng nhất giữa các quốc gia US / UK / Canada    │
                 │  • MORTGAGE có tỷ lệ False Positive cao do thiếu LTV      │
                 │  • Khách hàng có nợ xấu cũ có tỷ lệ vỡ nợ gấp đôi (37.8%) │
                 └───────────────────────────┬───────────────────────────────┘
                                             │
                                             ▼
                 ┌───────────────────────────────────────────────────────────┐
                 │                QUYẾT ĐỊNH KINH DOANH CỤ THỂ               │
                 │  1. Khung phê duyệt 3 cấp độ (Approve / Review / Reject)  │
                 │  2. Áp trần cứng PTI 25% toàn hệ thống                    │
                 │  3. Áp dụng Policy Overlays theo từng phân khúc mục đích  │
                 │  4. Chính sách tín dụng xuyên biên giới nhất quán         │
                 │  5. Cơ chế thẩm định kép (Human-in-the-loop) cho MORTGAGE │
                 │  6. Bắt buộc cung cấp Reason Codes minh bạch cho từ chối  │
                 └───────────────────────────────────────────────────────────┘
```

| # | Phát hiện từ Dữ liệu | Quyết định Kinh doanh & Chính sách Tín dụng | Cơ chế Thực thi trên Hệ thống |
|---|---|---|---|
| **1** | Xác suất vỡ nợ (PD) phân phối liên tục, khó xác định một điểm cắt nhị phân duy nhất | **Xây dựng khung quyết định 3 tầng**: Tự động duyệt (STP), Chuyên viên thẩm định (Manual Underwriting) và Từ chối thẳng | Thiết lập 2 ngưỡng điểm cắt (`HIGH_RISK_MAX = 616`, `MEDIUM_RISK_MAX = 643`) |
| **2** | Tỷ lệ nghĩa vụ nợ (PTI) của nhóm vỡ nợ vượt 24.7% (+10 pp so với nhóm tốt) | **Thiết lập trần chính sách PTI 25%**: Không tự động phê duyệt khoản vay nếu nghĩa vụ nợ hàng tháng vượt 25% thu nhập; đề xuất giảm hạn mức hoặc tăng kỳ hạn vay | Kích hoạt cảnh báo `RULE_HIGH_PTI` và tự động điều chuyển hồ sơ sang trạng thái REVIEW |
| **3** | Phân khúc RENT (31.6%), Vay hợp nhất nợ (28.6%), Vay y tế (26.7%) có tỷ lệ nợ xấu cao | **Áp dụng Policy Overlays theo phân khúc**: Tăng cường kiểm soát rủi ro có mục tiêu thay vì siết hạn mức toàn danh mục (gây mất thị phần) | Nhóm RENT/Consolidation yêu cầu xác minh thu nhập 6 tháng gần nhất; nhóm vay sửa nhà/y tế yêu cầu hóa đơn |
| **4** | Tỷ lệ vỡ nợ không có sự khác biệt giữa US (21.8%), UK (21.9%) và Canada (21.7%) | **Chuẩn hóa chính sách chung (Cross-Border Harmonization)**: Không phân biệt đối xử theo vị trí địa lý của khách hàng | Sử dụng chung một bảng điểm tín dụng, loại bỏ hoàn toàn biến địa lý khỏi mô hình để tuân thủ pháp lý |
| **5** | Khách hàng MORTGAGE có tỷ lệ False Positive cao do thiếu biến thế chấp | **Bảo vệ nhóm khách hàng tiềm năng an toàn**: Không tự động từ chối hồ sơ MORTGAGE nằm ở vùng ranh giới điểm số | Chuyển hồ sơ sang thẩm định viên để bổ sung thông tin định giá tài sản và xác định tỷ lệ LTV thực tế |
| **6** | Lịch sử nợ xấu (`cb_person_default_on_file = Y`) đẩy xác suất vỡ nợ lên 37.8% | **Chốt chặn lịch sử tín dụng**: Khách hàng có nợ xấu cũ không được hưởng quy trình duyệt tự động dù thu nhập cao | Gán nhãn cảnh báo đỏ `RULE_PRIOR_DEFAULT`, trừ điểm phạt trong scorecard |

---

## 4. Machine Learning: Credit Scoring & Risk Tiering

### 4.1 Scoring Pipeline Architecture

Hệ thống chuyển đổi toàn diện từ dữ liệu thô sang điểm số và quyết định theo chu trình khép kín:

```
[Hồ sơ khách hàng (16 trường dữ liệu đầu vào)]
                    │
                    ▼
[Feature Engineering Pipeline (22 đặc trưng mô hình)]
  • Biến đổi Log-transform: person_income_log, other_debt_log
  • Tỷ số tài chính: debt_to_income_ratio, loan_to_income_ratio
  • Chỉ báo chất lượng: emp_length_missing, loan_int_rate_missing, high_loan_burden_flag
  • Mã hóa hạng mục (Categorical Encoding)
                    │
                    ▼
[Mô hình LightGBM Classifier (predict_proba)] ──► Xác suất vỡ nợ PD ∈ [0, 1]
                    │
                    ▼
[Log-Odds Scorecard Scaling] ──────────────────► Điểm tín dụng Credit Score ∈ [300, 850]
                    │
                    ▼
[Phân tầng Rủi ro (Risk Tier Engine)] ──────────► HIGH / MEDIUM / LOW
                    │
                    ▼
[Business Rules Engine & Reason Codes] ────────► Quyết định (APPROVE / REVIEW / REJECT)
                                                 + Khuyến nghị hành động cụ thể
```

---

### 4.2 FICO-Standard Log-Odds Scoring Formula

Thay vì trả về xác suất thô (Probability of Default - PD) khó giải thích cho người dùng cuối và chuyên viên, hệ thống áp dụng công thức chuyển đổi **Log-Odds chuẩn công nghiệp tín dụng (tương tự thang điểm FICO 300–850)**:

$$\text{Odds} = \frac{1 - \text{PD}}{\text{PD}}$$

$$\text{Factor} = \frac{\text{PDO}}{\ln(2)}$$

$$\text{Score} = \text{BaseScore} + \text{Factor} \times \ln(\text{Odds})$$

**Thông số cấu hình chuẩn (`App/BE/artifacts/metadata.json`):**
- $\text{BaseScore} = 600$ (tương ứng tại $\text{Odds} = 1:1$, tức $\text{PD} = 50\%$)
- $\text{PDO} = 20$ (Points to Double the Odds: Cứ mỗi 20 điểm tăng thêm, tỷ lệ trả nợ tốt tăng gấp đôi)
- $\text{ScoreMin} = 300$, $\text{ScoreMax} = 850$

---

### 4.3 Three-Tier Decision Framework

| Quyết định | Khoảng Điểm | Mức Rủi Ro | Hành Động & Cơ Chế Xử Lý Nghiệp Vụ |
|---|---|---|---|
| 🟢 **APPROVE** | **> 643** | Rủi ro Thấp (Low Risk) | **Phê duyệt thẳng (Straight-Through Processing)**. Khoản vay đủ điều kiện giải ngân tự động với lãi suất ưu đãi tiêu chuẩn. |
| 🟡 **REVIEW** | **617 – 643** | Rủi ro Trung Bình (Medium Risk) | **Chuyển chuyên viên tín dụng thẩm định bổ sung**. Hệ thống đính kèm danh sách cảnh báo (Risk Flags) để chuyên viên đàm phán giảm hạn mức hoặc tăng kỳ hạn vay. |
| 🔴 **REJECT** | **≤ 616** | Rủi ro Cao (High Risk) | **Từ chối cấp tín dụng tự động**. Hệ thống sinh văn bản thông báo từ chối kèm mã nguyên nhân chính (Adverse Action Notice). |

---

### 4.4 Khả Năng Giải Trình & Reason Codes

Hệ thống giải quyết triệt để bài toán "Hộp đen (Black-box)" trong AI bằng việc tích hợp **Bộ sinh mã nguyên nhân rủi ro (Reason Codes Engine)**:
- `REASON_HIGH_DTI`: Tỷ lệ tổng nợ trên thu nhập vượt ngưỡng an toàn.
- `REASON_HIGH_PTI`: Nghĩa vụ trả nợ hàng tháng chiếm tỷ trọng quá lớn trong thu nhập.
- `REASON_PRIOR_DEFAULT`: Khách hàng có lịch sử ghi nhận nợ xấu trong quá khứ.
- `REASON_PAST_DELINQUENCIES`: Từng có lịch sử chậm trả lãi/gốc.
- `REASON_HIGH_CREDIT_UTILIZATION`: Tỷ lệ sử dụng hạn mức thẻ tín dụng ở mức báo động (> 80%).

Mỗi mã lý do được hệ thống đa ngôn ngữ hóa (i18n) hiển thị trực tiếp trên giao diện người dùng bằng tiếng Việt và tiếng Anh, giúp khách hàng hiểu rõ nguyên nhân và chuyên viên có căn cứ giải trình trước kiểm toán độc lập.

---

## 5. Model Evaluation & Reliability

### 5.1 Performance Benchmark

Hiệu năng mô hình được kiểm định nghiêm ngặt trên tập kiểm thử độc lập (Test Set):

| Chỉ Số Đánh Giá | Logistic Regression (Baseline) | LightGBM (Champion) | Ý Nghĩa Nghiệp Vụ Trong Ngân Hàng |
|---|---|---|---|
| **ROC-AUC** | 0.8607 | **0.9431** | Năng lực phân biệt tổng thể giữa hồ sơ tốt và hồ sơ xấu trên toàn dải điểm |
| **PR-AUC** | 0.7214 | **0.8916** | **Thước đo cốt lõi**: Khả năng nhận diện chính xác nợ xấu trong điều kiện mẫu mất cân bằng |
| **KS Statistic** | 58.40 | **73.08** | Độ tách biệt phân phối tích lũy giữa 2 nhóm (tiêu chuẩn ngân hàng yêu cầu KS > 40) |
| **Gini Coefficient** | 0.7214 | **0.8862** | Sức mạnh phân hóa tiêu chuẩn trong xây dựng Credit Scorecard ($2 \times \text{AUC} - 1$) |
| **F1-Score** | 0.7021 | **0.8415** | Điểm hài hòa giữa khả năng bắt nợ xấu (Recall) và độ chuẩn xác (Precision) |

---

### 5.2 Kỹ Thuật Thẩm Định & Đảm Bảo Độ Tin Cậy

1. **Tối ưu siêu tham số Bayesian (Optuna)**: Sử dụng thuật toán `TPESampler` kết hợp cơ chế cắt tỉa nhánh kém hiệu quả `MedianPruner`, tối ưu hóa trực tiếp hàm mục tiêu **PR-AUC** qua 50 trials với 5-Fold Stratified Cross-Validation.
2. **Kiểm tra tính đơn điệu (Monotonicity Check)**: Phân tích 10 phân vị điểm số (Decile Analysis) xác nhận: Điểm tín dụng tăng thì tỷ lệ nợ xấu thực tế giảm liên tục 100%, không xảy ra hiện tượng đảo chiều rủi ro.
3. **Thực nghiệm mất cân bằng (SMOTE-NC vs `scale_pos_weight`)**: Thực nghiệm chỉ ra SMOTE-NC làm tăng khoảng cách sai lệch giữa tập huấn luyện và kiểm thử (Overfitting gap). Do đó, kỹ thuật gán trọng số lớp tự nhiên `scale_pos_weight` của LightGBM được lựa chọn làm giải pháp tối ưu.
4. **Hiệu chỉnh xác suất (Probability Calibration)**: Phân tích độ dốc hiệu chuẩn phát hiện việc sử dụng trọng số lớp làm dịch chuyển nhẹ giá trị kỳ vọng PD (~0.31 so với mức nền 0.22). Hệ thống khuyến nghị áp dụng `CalibratedClassifierCV` (Isotonic/Sigmoid) khi tổ chức muốn sử dụng xác suất này cho bài toán định giá khoản vay theo rủi ro (Risk-Based Pricing).

---

## 6. Power BI Dashboard

Tệp báo cáo quản trị chuyên sâu [`Power BI/risk.pbix`](Power%20BI/risk.pbix) cung cấp góc nhìn toàn cảnh phục vụ Hội đồng Quản trị rủi ro và Giám đốc Khối Tín dụng:

- **Portfolio Quality Tracking**: Theo dõi phân phối điểm tín dụng của toàn bộ danh mục theo thời gian thực.
- **Underwriting Conversion Funnel**: Đo lường tỷ lệ Phê duyệt / Xem xét / Từ chối theo từng nhóm khách hàng và chi nhánh.
- **Segment Risk Deep-Dive**: Cắt lớp rủi ro đa chiều theo mục đích vay, loại hình cư trú, hình thức việc làm và trình độ học vấn.
- **Model Drift & Early Warning**: Giám sát xu hướng dịch chuyển xác suất vỡ nợ bình quân theo từng tháng, phát hiện sớm dấu hiệu suy giảm chất lượng danh mục để kích hoạt tái huấn luyện mô hình.

---

## 7. System Architecture & Deployment

Hệ thống được thiết kế theo kiến trúc Microservices hiện đại, tách biệt hoàn toàn giữa tầng giao diện, dịch vụ xử lý nghiệp vụ và cơ sở dữ liệu:

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Vercel)                    │
│  Next.js 16 (React 19) • TypeScript • Tailwind CSS • i18n   │
│  - Giao diện thẩm định hồ sơ vay trực quan                  │
│  - Tra cứu lịch sử & giải trình điểm số                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ HTTPS / JSON API (JWT Auth)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND LAYER (Render)                    │
│             FastAPI • Uvicorn • Pydantic v2                 │
│  ┌───────────────────────────┬───────────────────────────┐  │
│  │   Authentication Service  │   Credit Scoring Service  │  │
│  │   (JWT, Bcrypt, Roles)    │   (Scoring Pipeline)      │  │
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
- PostgreSQL (Cài đặt cục bộ hoặc sử dụng Supabase / Neon Cloud)

### Bước 1 — Khởi chạy Backend (FastAPI)

```bash
# 1. Di chuyển vào thư mục Backend
cd App/BE

# 2. Khởi tạo môi trường ảo Python
python -m venv venv

# Kích hoạt môi trường ảo:
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (cmd):
.\venv\Scripts\activate.bat
# Linux / macOS:
source venv/bin/activate

# 3. Cài đặt các thư viện phụ thuộc
pip install -r requirements.txt

# 4. Cấu hình biến môi trường
# Tạo file .env từ file mẫu:
cp .env.example .env
# Chỉnh sửa thông tin DATABASE_URL và JWT Secret phù hợp trong .env

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
# Tạo file .env.local trong App/FE với nội dung:
echo 'NEXT_PUBLIC_API_URL=http://localhost:8000' > .env.local

# 4. Khởi chạy giao diện phát triển
npm run dev
```
- Truy cập giao diện ứng dụng tại: `http://localhost:3000`

---

### Bước 3 — Khám phá và Tái huấn luyện Mô hình (Jupyter Notebooks)

Để khám phá dữ liệu hoặc tinh chỉnh mô hình, khởi chạy môi trường phân tích:

```bash
# Cài đặt công cụ Jupyter
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

Mặc dù hệ thống đã đạt hiệu năng và độ ổn định cao, dự án vẫn ghi nhận các định hướng nâng cấp trong tương lai:

1. **Bổ sung dữ liệu tài sản thế chấp (LTV Integration)**: Thu thập thêm giá trị định giá tài sản và số tiền thế chấp ban đầu nhằm xóa bỏ điểm mù (Uncertainty Hotspot) đối với nhóm khách hàng vay mua nhà `MORTGAGE`.
2. **Giải thích cục bộ theo thời gian thực bằng SHAP**: Tích hợp thuật toán TreeSHAP vào trực tiếp API Backend để xuất giá trị đóng góp Shapley Value cho từng thuộc tính của riêng từng hồ sơ.
3. **Hệ thống giám sát trôi dữ liệu tự động (Automated PSI/CSI)**: Thiết lập pipeline tự động tính toán chỉ số ổn định dân số (Population Stability Index - PSI) và độ suy thoái đặc trưng (Characteristic Stability Index - CSI) theo tuần; tự động gửi thông báo khi PSI > 0.25 để tái huấn luyện mô hình.
4. **Tích hợp dữ liệu vĩ mô (Macroeconomic Scenarios)**: Đưa các chỉ số kinh tế vĩ mô (lãi suất cơ bản ngân hàng trung ương, CPI, tỷ lệ thất nghiệp theo quý) vào mô hình Stress Testing danh mục theo các kịch bản suy thoái.

---

*NovaBank CreditRisk — End-to-End Credit Risk Analytics & Machine Learning Decision Pipeline*  
*Developed with FastAPI, LightGBM, Next.js, PostgreSQL & Power BI*
