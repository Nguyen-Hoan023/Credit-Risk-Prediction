# NovaBank — Hệ Thống Chấm Điểm Tín Dụng & Thẩm Định Khoản Vay Tự Động
> Credit Risk Analysis & Intelligent Scoring System

> 🌐 **Ứng dụng Web thẩm định trực tiếp**: [https://credit-risk-prediction-pi.vercel.app/en/apply](https://credit-risk-prediction-pi.vercel.app/en/apply)  
> 📖 **Tài liệu API tương tác (Swagger)**: [https://credit-risk-prediction-7nxt.onrender.com/docs](https://credit-risk-prediction-7nxt.onrender.com/docs)  
> 📊 **Báo cáo điều hành Power BI**: [`Power BI/risk.pbix`](Power%20BI/risk.pbix)  
> 🛠️ **Công nghệ sử dụng**: FastAPI · LightGBM · Next.js 16 · PostgreSQL · Power BI · Scikit-Learn · Optuna

Dự án phân tích rủi ro tín dụng tiêu dùng và xây dựng hệ thống xét duyệt khoản vay tự động dựa trên **32,581 hồ sơ tín dụng thực tế** (Mỹ, Anh, Canada). Dự án giải quyết trọn vẹn bài toán cho vay của ngân hàng bán lẻ: từ **phân tích dữ liệu thực tế (EDA)** để tìm ra nguyên nhân gây nợ xấu, **xây dựng chính sách tín dụng theo từng nhóm chỉ số**, **mô hình hóa bằng học máy (Machine Learning & Thang điểm FICO)**, cho đến **Dashboard điều hành (Power BI)** và **hệ thống Web phê duyệt tự động theo thời gian thực**.

---

## Mục Lục / Table of Contents

- [1. Bối Cảnh Nghiệp Vụ & Giá Trị Thực Tế](#1-bối-cảnh-nghiệp-vụ--giá-trị-thực-tế)
  - [1.1 Vấn Đề Của Quy Trình Cho Vay Truyền Thống](#11-vấn-đề-của-quy-trình-cho-vay-truyền-thống)
  - [1.2 Giá Trị Mang Lại Cho Các Bộ Phận Trong Ngân Hàng](#12-giá-trị-mang-lại-cho-các-bộ-phận-trong-ngân-hàng)
  - [1.3 Tổng Quan Dữ Liệu & Các Con Số Cốt Lõi](#13-tổng-quan-dữ-liệu--các-con-số-cốt-lõi)
- [2. Tổng Quan Phân Tích Dữ Liệu & Quy Trình Ra Quyết Định](#2-tổng-quan-phân-tích-dữ-liệu--quy-trình-ra-quyết-định)
  - [2.1 Mục Tiêu Trọng Tâm Của Phân Tích Dữ Liệu](#21-mục-tiêu-trọng-tâm-của-phân-tích-dữ-liệu)
  - [2.2 Quy Trình 4 Bước: Từ Dữ Liệu Thô Đến Quyết Định Phê Duyệt](#22-quy-trình-4-bước-từ-dữ-liệu-thô-đến-quyết-định-phê-duyệt)
  - [2.3 Nguyên Tắc Cân Bằng Giữa Tăng Trưởng Doanh Thu Và An Toàn Vốn](#23-nguyên-tắc-cân-bằng-giữa-tăng-trưởng-doanh-thu-và-an-toàn-vốn)
- [3. Phân Tích Thực Tế & Chính Sách Tín Dụng Theo Từng Nhóm Chỉ Số](#3-phân-tích-thực-tế--chính-sách-tín-dụng-theo-từng-nhóm-chỉ-số)
  - [3.1 Nhóm Khả Năng Tài Chính & Đòn Bẩy Nợ](#31-nhóm-khả-năng-tài-chính--đòn-bẩy-nợ)
  - [3.2 Nhóm Lịch Sử Tín Dụng & Hành Vi Trả Nợ](#32-nhóm-lịch-sử-tín-dụng--hành-vi-trả-nợ)
  - [3.3 Nhóm Nơi Ở & Tài Sản Bảo Đảm](#33-nhóm-nơi-ở--tài-sản-bảo-đảm)
  - [3.4 Nhóm Mục Đích Vay Vốn](#34-nhóm-mục-đích-vay-vốn)
  - [3.5 Nhóm Đặc Điểm Khách Hàng (Tuổi, Việc Làm, Địa Bàn)](#35-nhóm-đặc-điểm-khách-hàng-tuổi-việc-làm-địa-bàn)
  - [3.6 Bảng Quy Tắc Thẩm Định & Phân Luồng Hồ Sơ (Business Rules)](#36-bảng-quy-tắc-thẩm-định--phân-luồng-hồ-sơ-business-rules)
  - [3.7 Lộ Trình Triển Khai Thực Tế](#37-lộ-trình-triển-khai-thực-tế)
- [4. Mô Hình Học Máy & Hệ Thống Chấm Điểm Tự Động](#4-mô-hình-học-máy--hệ-thống-chấm-điểm-tự-động)
  - [4.1 Quy Trình Xử Lý Hồ Sơ & Chấm Điểm](#41-quy-trình-xử-lý-hồ-sơ--chấm-điểm)
  - [4.2 Chuẩn Hóa Sang Thang Điểm FICO (300–850)](#42-chuẩn-hóa-sang-thang-điểm-fico-300850)
  - [4.3 Khung Phân Luồng Quyết Định 3 Cấp](#43-khung-phân-luồng-quyết-định-3-cấp)
  - [4.4 Minh Bạch Hóa Quyết Định Với Hệ Thống Mã Lý Do (Reason Codes)](#44-minh-bạch-hóa-quyết-định-với-hệ-thống-mã-lý-do-reason-codes)
- [5. Đánh Giá Hiệu Năng & Độ Tin Cậy Của Mô Hình](#5-đánh-giá-hiệu-năng--độ-tin-cậy-của-mô-hình)
  - [5.1 Bảng So Sánh Hiệu Năng](#51-bảng-so-sánh-hiệu-năng)
  - [5.2 Ý Nghĩa Thực Tế Của Các Chỉ Số Đánh Giá](#52-ý-nghĩa-thực-tế-của-các-chỉ-số-đánh-giá)
  - [5.3 Các Bước Kiểm Định Đảm Bảo An Toàn](#53-các-bước-kiểm-định-đảm-bảo-an-toàn)
- [6. Báo Cáo Quản Trị Trực Quan (Power BI Dashboard)](#6-báo-cáo-quản-trị-trực-quan-power-bi-dashboard)
- [7. Kiến Trúc Kỹ Thuật & Công Nghệ](#7-kiến-trúc-kỹ-thuật--công-nghệ)
- [8. Hướng Dẫn Cài Đặt & Chạy Thử](#8-hướng-dẫn-cài-đặt--chạy-thử)
- [9. Cấu Trúc Thư Mục Dự Án](#9-cấu-trúc-thư-mục-dự-án)
- [10. Hạn Chế & Hướng Phát Triển Tiếp Theo](#10-hạn-chế--hướng-phát-triển-tiếp-theo)

---

## 1. Bối Cảnh Nghiệp Vụ & Giá Trị Thực Tế

### 1.1 Vấn Đề Của Quy Trình Cho Vay Truyền Thống

Trong hoạt động cho vay tiêu dùng, ngân hàng luôn phải giải bài toán: **Làm sao để cho vay được nhiều khách hàng nhưng vẫn giữ được tiền an toàn, không bị nợ xấu?**

Cách làm truyền thống tại các ngân hàng thường gặp 3 vấn đề lớn:
1. **Xét duyệt thủ công, chậm chạp**: Chuyên viên tín dụng phải xem từng hồ sơ giấy tờ, mất từ vài ngày đến cả tuần, chi phí vận hành cao mà khách hàng lại phải chờ đợi lâu.
2. **Quyết định mang tính cảm tính**: Cùng một bộ hồ sơ, chuyên viên khó tính có thể từ chối nhưng chuyên viên dễ tính lại duyệt, dẫn đến chất lượng thẩm định không đồng đều.
3. **Quy tắc cứng nhắc (Đạt / Không đạt)**: Thường bỏ lỡ những khách hàng tốt chỉ vì thiếu một tiêu chí phụ, hoặc ngược lại, duyệt nhầm những khách hàng có nguy cơ đứt gãy dòng tiền trong tương lai.

---

### 1.2 Giá Trị Mang Lại Cho Các Bộ Phận Trong Ngân Hàng

Hệ thống được thiết kế để giải quyết bài toán cụ thể của từng phòng ban:

| Bộ phận | Mong muốn chính | Giải pháp từ dự án |
|---|---|---|
| **Quản trị Rủi ro** *(Risk Team)* | Nắm bắt rủi ro toàn danh mục, kiểm soát tỷ lệ nợ xấu không vượt trần cho phép. | Báo cáo phân bổ rủi ro, xác định rõ các nhóm khách hàng dễ vỡ nợ để đặt ngưỡng chặn an toàn. |
| **Vận hành Cho vay** *(Operations Team)* | Duyệt hồ sơ nhanh, giảm việc thủ công, quyết định chuẩn xác và nhất quán. | Hệ thống chấm điểm tự động, phân loại rõ: *Hồ sơ duyệt ngay*, *Hồ sơ cần xem xét lại*, *Hồ sơ từ chối thẳng*. |
| **Ban Giám Đốc** *(Leadership)* | Tăng trưởng doanh thu cho vay nhưng danh mục vẫn an toàn, sinh lời bền vững. | Dashboard Power BI theo dõi sức khỏe danh mục theo thời gian thực, hỗ trợ định giá lãi suất theo rủi ro. |
| **Phát triển Sản phẩm** *(Product Team)* | Biết rõ đặc điểm từng nhóm khách hàng để thiết kế gói vay phù hợp. | Đề xuất gói vay chuyên biệt theo độ tuổi, điều chỉnh biên độ lãi suất linh hoạt theo mục đích vay. |

---

### 1.3 Tổng Quan Dữ Liệu & Các Con Số Cốt Lõi

Bộ dữ liệu gồm **32,581 khoản vay** trên 3 quốc gia (Mỹ, Anh, Canada) với các chỉ số nền tảng:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        TỔNG QUAN DANH MỤC CHO VAY (PORTFOLIO HEALTH)                   │
├───────────────────────┬────────────────────────┬───────────────────────────────────────┤
│ Tổng số khoản vay     │ Tỷ lệ nợ xấu tổng thể  │ Tỷ lệ khách Trả tốt / Nợ xấu          │
│ 32,581 hồ sơ          │ 21.82%                 │ 78.18% Trả tốt : 21.82% Nợ xấu (~3.6:1│
├───────────────────────┼────────────────────────┼───────────────────────────────────────┤
│ Số tiền vay trung bình│ Thu nhập trung bình    │ Tỷ lệ Khoản vay / Thu nhập (LTI)      │
│ $9,590                │ $66,070 / năm          │ 0.17 (Mức sử dụng đòn bẩy trung bình) │
├───────────────────────┼────────────────────────┼───────────────────────────────────────┤
│ Nhóm Trả tốt (Safe)   │ Thu nhập: $70,800/năm  │ Khoản vay: $9,200 │ Lãi suất vay: 6.1%│
│ Nhóm Nợ xấu (Risky)   │ Thu nhập: $49,100/năm  │ Khoản vay: $10,900│ Lãi suất vay: 8.1%│
└───────────────────────┴────────────────────────┴───────────────────────────────────────┘
```

> **Nhận xét nhanh**: Tỷ lệ nợ xấu 21.82% là mức phổ biến trong mảng cho vay tiêu dùng tín chấp (chuẩn ngành thường dao động từ 18% đến 25%). Đáng chú ý, nhóm khách hàng vỡ nợ có **thu nhập thấp hơn 30%** nhưng lại **vay nhiều hơn 18%** so với nhóm trả nợ tốt, khiến họ phải gánh mức lãi suất cao hơn và nhanh chóng kiệt quệ dòng tiền.

---

## 2. Tổng Quan Phân Tích Dữ Liệu & Quy Trình Ra Quyết Định

### 2.1 Mục Tiêu Trọng Tâm Của Phân Tích Dữ Liệu

Mục tiêu lớn nhất khi phân tích dữ liệu tín dụng là trả lời 3 câu hỏi thực tế:
1. **Ai là người có nguy cơ không trả được nợ?** (Đặc điểm nhận diện họ là gì?)
2. **Tại sao họ lại vỡ nợ?** (Do áp lực nợ quá lớn, do sự cố bất ngờ hay do thói quen chi tiêu?)
3. **Ngân hàng cần đưa ra hành động gì với từng hồ sơ?** (Cho vay ngay, yêu cầu thêm giấy tờ, tăng lãi suất hay từ chối thẳng?)

Dữ liệu đầu vào gồm 4 nhóm thông tin chính:
- **Thông tin cá nhân**: Độ tuổi, nơi ở, loại hợp đồng lao động, thâm niên làm việc.
- **Tình hình tài chính**: Thu nhập hàng năm, các khoản nợ hiện có tại ngân hàng khác.
- **Khoản vay đăng ký**: Số tiền vay, kỳ hạn, lãi suất, mục đích vay vốn.
- **Lịch sử tín dụng**: Đã từng dính nợ xấu chưa, số lần quá hạn, tỷ lệ dùng thẻ tín dụng, số tài khoản đang mở.

---

### 2.2 Quy Trình 4 Bước: Từ Dữ Liệu Thô Đến Quyết Định Phê Duyệt

Để đưa dữ liệu vào thực tế kinh doanh mà không bị cảm tính, dự án xây dựng quy trình khép kín gồm 4 bước:

```
[Bước 1: Quan sát Thực Tế] ──► [Bước 2: Tìm Nguyên Nhân] ──► [Bước 3: Đặt Quy Tắc] ──► [Bước 4: Tự Động Hóa]
   Phân tích từng chỉ số       Hiểu lý do khách hàng         Thiết lập trần rủi ro,       Dùng Machine Learning
   và tỷ lệ nợ xấu thực tế.    mất khả năng trả nợ.          ngưỡng an toàn & lãi suất.   chấm điểm & phân luồng.
```

1. **Bước 1 — Khám phá dữ liệu thực tế (EDA)**: So sánh tỷ lệ nợ xấu ở từng nhóm chỉ số (ví dụ: người thuê nhà vs người có nhà; vay để đi học vs vay để trả nợ cũ).
2. **Bước 2 — Xác định nguyên nhân gốc rễ (Root Cause)**: Tìm hiểu bản chất vì sao nhóm đó lại có rủi ro cao (ví dụ: gánh nặng tiền thuê nhà cố định hàng tháng khiến người đi thuê dễ hụt tiền khi ốm đau, mất việc).
3. **Bước 3 — Thiết lập chính sách & ngưỡng an toàn (Credit Policy)**: Quy định rõ ranh giới an toàn cho ngân hàng (ví dụ: nếu tiền trả nợ chiếm trên 25% thu nhập thì phải chuyển sang kiểm tra kỹ; nếu nợ chiếm trên 60% thu nhập thì từ chối ngay).
4. **Bước 4 — Tự động hóa qua Mô hình & Thang điểm (Scorecard)**: Đưa toàn bộ các quy luật này vào mô hình học máy LightGBM để tính xác suất vỡ nợ, quy đổi thành điểm tín dụng 300–850 và ra quyết định chỉ trong vài giây.

---

### 2.3 Nguyên Tắc Cân Bằng Giữa Tăng Trưởng Doanh Thu Và An Toàn Vốn

Trong ngân hàng, **không thể chỉ duyệt hồ sơ siêu an toàn** vì như vậy sẽ mất hết khách hàng và không có doanh thu. Ngược lại, nếu nới lỏng để tăng trưởng nóng thì nợ xấu sẽ ăn hết lợi nhuận.

Hệ thống áp dụng nguyên tắc điều hành cân bằng:
- **Khách hàng an toàn (Điểm cao)**: Đơn giản hóa thủ tục, duyệt ngay trong 1 phút, giảm lãi suất để giữ chân khách hàng.
- **Khách hàng rủi ro vừa phải (Điểm trung bình)**: Không từ chối vội, mà đưa sang luồng xem xét: chuyên viên có thể yêu cầu giảm số tiền vay, kéo dài kỳ hạn để giảm số tiền phải trả mỗi tháng, hoặc áp dụng mức lãi suất bù trừ rủi ro.
- **Khách hàng rủi ro quá cao (Điểm thấp hoặc vi phạm trần an toàn)**: Từ chối dứt khoát ngay từ đầu để bảo toàn vốn.

---

## 3. Phân Tích Thực Tế & Chính Sách Tín Dụng Theo Từng Nhóm Chỉ Số

Dưới đây là phân tích chi tiết cho 5 nhóm chỉ số đo lường rủi ro khách hàng. Mỗi nhóm được trình bày rõ ràng: **Dữ liệu thực tế cho thấy gì $\rightarrow$ Bản chất vì sao lại như vậy $\rightarrow$ Ngân hàng áp dụng chính sách gì**.

---

### 3.1 Nhóm Khả Năng Tài Chính & Đòn Bẩy Nợ

Nhóm chỉ số này đo lường sức khỏe tài chính và mức độ gánh nặng nợ của người vay:
- **Thu nhập hàng năm** (`person_income`) & **Khoản vay** (`loan_amnt`).
- **Tỷ lệ Khoản vay / Thu nhập (LTI)**: Phản ánh quy mô khoản vay so với mức thu nhập một năm.
- **Tỷ lệ Tổng nợ / Thu nhập (DTI)**: Phản ánh toàn bộ nghĩa vụ trả nợ (gồm cả nợ thẻ, nợ khác) so với thu nhập.

```
Tỷ lệ nợ xấu (%) theo Tỷ lệ Khoản vay / Thu nhập (LTI)
 100% │                                                * (LTI 0.7-0.8: 87.5% nợ xấu!)
  80% │                                               /
  60% │                                              /
  40% │
  20% │        * (LTI 0.2-0.3: 22.1%)
   0% │  * (LTI < 0.1: 11.2%)
      └────────────────────────────────────────────────► Mức độ đòn bẩy (LTI)
```

#### Dữ liệu thực tế cho thấy:
- **Khoản vay nhỏ so với thu nhập (LTI < 0.10)**: Tỷ lệ nợ xấu chỉ **11.21%** (rất an toàn).
- **Khoản vay ở mức trung bình (LTI 0.20 – 0.30)**: Tỷ lệ nợ xấu là **22.09%** (mức bình thường của danh mục).
- **Khoản vay quá lớn so với thu nhập (LTI > 0.70)**: Tỷ lệ nợ xấu vọt lên **87.50%**!
- **Tỷ lệ nghĩa vụ trả nợ hàng tháng trên thu nhập**: Khách hàng trả nợ tốt chỉ dùng trung bình **14.9%** thu nhập để trả nợ. Trong khi đó, nhóm vỡ nợ phải dùng tới **24.7%** thu nhập. Đặc biệt, nếu tổng nợ vượt quá **60% - 80% thu nhập (DTI > 0.8)**, tỷ lệ nợ xấu lên đến **93.33%**.

#### Bản chất thực tế:
Khi một người phải dành hơn 25% – 30% thu nhập hàng tháng chỉ để trả nợ, họ gần như không còn tiền dự phòng. Bất kỳ sự cố nào như ốm đau, xe hỏng, giảm lương hoặc vật giá tăng đều khiến họ đứt dòng tiền và buộc phải dừng trả nợ ngân hàng.

#### Chính sách tín dụng áp dụng:
1. **Từ chối thẳng (Quy tắc Knock-out)**:
   - Hồ sơ có **LTI $\ge$ 0.8** hoặc **DTI $\ge$ 0.6** bị từ chối tự động ngay lập tức, không cần xét các yếu tố khác.
2. **Chuyển sang thẩm định thủ công (Quy tắc Soft Downgrade)**:
   - Nếu **LTI $\ge$ 0.3** hoặc **DTI $\ge$ 0.4**, hồ sơ không được duyệt tự động mà chuyển sang chuyên viên để xem xét giảm số tiền vay.
3. **Cảnh báo hồ sơ ngoại lệ**:
   - Khách có thu nhập > $150,000/năm hoặc khoản vay > $25,000 cần xác minh chứng từ sao kê thuế/lương để tránh gian lận.

---

### 3.2 Nhóm Lịch Sử Tín Dụng & Hành Vi Trả Nợ

Nhóm chỉ số này đo lường mức độ uy tín và tính kỷ luật tài chính trong quá khứ:
- **Tiền sử nợ xấu** (`cb_person_default_on_file`): Đã từng bùng nợ hoặc bị ghi nhận nợ xấu chưa?
- **Số lần chậm trả nợ** (`past_delinquencies`): Số lần quá hạn thanh toán.
- **Tỷ lệ dùng hạn mức thẻ tín dụng** (`credit_utilization_ratio`).
- **Thâm niên tín dụng** (`cb_person_cred_hist_length`) & **Số tài khoản đang mở** (`open_accounts`).

| Chỉ số tín dụng | Quan sát từ dữ liệu | Đánh giá mức độ rủi ro |
|---|---|---|
| **Chưa từng có nợ xấu** | Nợ xấu hiện tại: **18.39%** | Đáng tin cậy, thói quen trả nợ tốt |
| **Đã từng dính nợ xấu** | Nợ xấu hiện tại: **37.81%** (Cao gấp **2.06 lần**) | **Rủi ro rất cao**, tính kỷ luật kém |
| **Dùng 20% – 30% hạn mức thẻ** | Nợ xấu thấp nhất: **21.11%** | Điểm tối ưu, dòng tiền chi tiêu lành mạnh |
| **Dùng > 80% – 90% hạn mức thẻ** | Nợ xấu tăng mạnh | Dấu hiệu cạn kiệt tiền mặt, phải quẹt thẻ để sống |
| **Mở 7 – 8 tài khoản nợ cùng lúc** | Nợ xấu đạt đỉnh: **24.13%** | Phải xoay xở trả nợ nhiều nơi, dễ mất kiểm soát |
| **Thâm niên tín dụng dài (25–30 năm)**| Nợ xấu tăng lên **28.71%** | Nhóm khách hàng lớn tuổi, thu nhập giảm sau nghỉ hưu |

#### Bản chất thực tế:
- Người từng để nợ xấu trong quá khứ thường có xu hướng tái phạm cao gấp đôi người khác.
- Dùng thẻ tín dụng ở mức 20-30% chứng tỏ khách hàng có tiền nhưng vẫn dùng thẻ để tiện lợi. Nhưng nếu quẹt đến 80-90% hạn mức thì đó là dấu hiệu báo động họ đang kẹt tiền mặt trầm trọng.
- Thâm niên tín dụng dài nghe có vẻ uy tín, nhưng dữ liệu lại cho thấy nhóm này trùng với khách hàng trên 60 tuổi — những người đã nghỉ hưu và có phát sinh chi phí y tế lớn.

#### Chính sách tín dụng áp dụng:
1. **Khóa duyệt tự động với khách có tiền sử nợ xấu**: Hồ sơ có tiền sử nợ xấu (`default = Y`) kết hợp với chậm trả $\ge$ 5 lần hoặc đòn bẩy cao sẽ bị từ chối ngay.
2. **Quy tắc trần quá hạn**: Chậm trả $\ge$ 3 lần sẽ bị hạ từ nhóm "Duyệt" xuống nhóm "Cần xem xét lại".
3. **Ưu đãi theo tỷ lệ dùng thẻ**: Khách hàng duy trì tỷ lệ dùng thẻ 20%–30% được cộng điểm tín dụng và hưởng lãi suất vay tốt hơn.

---

### 3.3 Nhóm Nơi Ở & Tài Sản Bảo Đảm

Nơi ở (`person_home_ownership`) phản ánh nền tảng tài sản tích lũy và gánh nặng chi phí sinh hoạt cố định:

| Hình thức nơi ở | Tỷ lệ nợ xấu thực tế | So với mức bình quân (21.8%) | Đánh giá thực tế |
|---|---|---|---|
| **Có nhà riêng hoàn toàn (OWN)** | **7.47%** | Thấp hơn **14.35%** | **Khách hàng vàng (Rất an toàn)** |
| **Đang trả góp mua nhà (MORTGAGE)**| **12.57%** | Thấp hơn **9.25%** | An toàn, có ý thức giữ nhà |
| **Đang thuê nhà (RENT)** | **31.57%** | Cao hơn **9.75%** | **Nhóm rủi ro cao nhất (Gấp 4.2 lần có nhà)**|

#### Bản chất thực tế:
- **Người có nhà riêng (`OWN`)**: Họ có tài sản tích lũy lớn. Nếu gặp khó khăn ngắn hạn, họ có nhiều cách xoay xở (bán bớt tài sản, vay thế chấp...) nên hiếm khi để vỡ nợ một khoản vay tiêu dùng nhỏ.
- **Người đi thuê nhà (`RENT`)**: Chiếm tỷ trọng đông nhất trong số người nộp hồ sơ, nhưng tỷ lệ nợ xấu lên đến **31.57%**. Tiền thuê nhà là khoản chi cố định không thể cắt giảm; khi bị ốm đau hay giảm thu nhập, họ lập tức không còn tiền trả nợ ngân hàng.
- **Người vay mua nhà (`MORTGAGE`)**: Tỷ lệ nợ xấu thực tế thấp (12.57%), nhưng mô hình phân tích hay báo nhầm là rủi ro vì bộ dữ liệu hiện tại thiếu thông tin về giá trị căn nhà và số vốn tự có của khách.

#### Chính sách tín dụng áp dụng:
1. **Luồng ưu tiên cho người có nhà riêng (`OWN`)**: Hạn mức phê duyệt cao hơn, quy trình cấp vốn nhanh vì có điểm tựa tài sản.
2. **Siết chặt điều kiện với người thuê nhà (`RENT`)**: Nếu người thuê nhà có khoản nợ hàng tháng tiệm cận 20% thu nhập, bắt buộc phải sao kê tài khoản 6 tháng và chứng minh lịch sử thanh toán tiền nhà đúng hạn.
3. **Thẩm định thủ công với nhóm thế chấp (`MORTGAGE`)**: Không tự động từ chối hồ sơ thế chấp ở vùng ranh giới điểm số, mà chuyển chuyên viên tín dụng kiểm tra giá trị căn nhà thực tế để tránh bỏ lỡ khách hàng tốt.

---

### 3.4 Nhóm Mục Đích Vay Vốn

Mục đích vay (`loan_intent`) thể hiện động cơ sử dụng tiền và khả năng hoàn trả:

```
Tỷ lệ nợ xấu theo Mục đích vay:
1. Vay hợp nhất nợ (Đảo nợ) ──► 28.59%  [RỦI RO NHẤT: Bội chi & kẹt nợ từ trước]
2. Vay chi trả y tế           ──► 26.70%  [Sự cố sức khỏe ngoài ý muốn, giảm thu nhập]
3. Vay sửa chữa nhà           ──► 26.10%  [Dễ phát sinh chi phí vượt dự toán]
4. Vay tiêu dùng cá nhân      ──► 19.89%  [Mức rủi ro trung bình]
5. Vay học tập                ──► 17.22%  [Đầu tư nâng cao kiến thức, việc làm tốt hơn]
6. Vay kinh doanh             ──► 14.31%  [AN TOÀN NHẤT: Có phương án sinh lời cụ thể]
```

#### Bản chất thực tế:
- **Vay đảo nợ / Hợp nhất nợ (28.59%)**: Khách hàng tìm đến gói này khi đã nợ nhiều nơi và không còn khả năng xoay xở. Đây là dấu hiệu của vòng luẩn quẩn nợ nần sắp đổ vỡ.
- **Vay y tế (26.70%)**: Khủng hoảng tài chính thụ động do bệnh tật bất ngờ, thường kéo theo việc người vay bị giảm khả năng lao động và mất nguồn thu nhập.
- **Vay kinh doanh (14.31%) & Vay học tập (17.22%)**: Khoản tiền vay được dùng để tạo ra dòng tiền mới hoặc nâng cao thu nhập tương lai, do đó khách hàng có kế hoạch chuẩn bị và ý thức trả nợ tốt nhất.

#### Chính sách tín dụng áp dụng (Định giá lãi suất theo mục đích vay):
1. **Cộng thêm lãi suất bù trừ rủi ro**:
   - Vay hợp nhất nợ / đảo nợ: **Cộng thêm +1.5% đến +2.0%** vào lãi suất sàn để bù đắp xác suất nợ xấu cao.
   - Vay y tế: Yêu cầu thẩm định nguồn thu nhập thứ hai hoặc người đồng trả nợ.
2. **Ưu đãi lãi suất cho mục đích sinh lời**:
   - Vay học tập & kinh doanh: **Giảm 1.0% lãi suất** nếu khách hàng có kế hoạch kinh doanh hoặc chứng chỉ đào tạo rõ ràng.

---

### 3.5 Nhóm Đặc Điểm Khách Hàng (Tuổi, Việc Làm, Địa Bàn)

#### 1. Mối liên hệ giữa Độ tuổi và Rủi ro (Đường cong chữ U):
- **Nhóm 20–30 tuổi (Nợ xấu 22.21%)**: Mới đi làm, thu nhập chưa ổn định, ít tích lũy và thói quen chi tiêu chưa chặt chẽ.
- **Nhóm 41–50 tuổi (Nợ xấu thấp nhất 20.40% — Điểm an toàn nhất)**: Giai đoạn thu nhập đạt đỉnh cao trong sự nghiệp, cuộc sống ổn định và tài sản tích lũy vững chắc.
- **Nhóm 61–70 tuổi (Nợ xấu cao nhất 29.82% — Vùng rủi ro cao)**: Đã nghỉ hưu, thu nhập cố định bị giảm sút, trong khi viện phí và chi phí chăm sóc sức khỏe gia tăng.
- **Chính sách**: Với khách hàng trên 60 tuổi, ngân hàng rút ngắn kỳ hạn vay tối đa (không quá 36 tháng) hoặc yêu cầu có con cái cùng đứng tên bảo lãnh.

#### 2. Loại hình hợp đồng lao động:
- Dữ liệu cho thấy: Nhân viên toàn thời gian (nợ xấu 21.57%), bán thời gian (21.63%), kinh doanh tự do (22.49%) và thất nghiệp (22.67%) **không có sự chênh lệch đáng kể**.
- **Chính sách**: Ngân hàng không phân biệt đối xử với người làm tự do (Freelancer/Self-employed), mà tập trung vào **dòng tiền thực tế đổ về tài khoản hàng tháng** thay vì đòi hỏi hợp đồng lao động dài hạn.

#### 3. Địa bàn sinh sống (Mỹ, Anh, Canada):
- Tỷ lệ nợ xấu tại 3 quốc gia gần như bằng nhau tuyệt đối: Mỹ (21.86%), Anh (21.73%), Canada (21.86%).
- **Chính sách**: Mô hình rủi ro của NovaBank mang tính chuẩn mực và có thể áp dụng đồng nhất xuyên biên giới mà không cần thay đổi tiêu chí theo từng quốc gia.

---

### 3.6 Bảng Quy Tắc Thẩm Định & Phân Luồng Hồ Sơ (Business Rules)

Toàn bộ các phát hiện trên được cụ thể hóa thành 2 tầng quy tắc cứng trong hệ thống xét duyệt tự động:

| Tầng quy tắc | Điều kiện kích hoạt | Hành động của hệ thống |
|---|---|---|
| 🚨 **Tầng 1: Loại trừ thẳng (Knock-out)** | • Có nợ xấu cũ **VÀ** quá hạn $\ge$ 5 lần<br>• Tỷ lệ Khoản vay / Thu nhập (LTI) $\ge$ 0.8<br>• Tỷ lệ Nợ / Thu nhập (DTI) $\ge$ 0.6 | **Ép điểm số $\le 500$, trả về `REJECT` ngay**.<br>Không duyệt cho vay dưới bất kỳ hình thức nào. |
| ⚠️ **Tầng 2: Hạ bậc xem xét (Soft Downgrade)** | • Số lần quá hạn $\ge$ 3 lần<br>• Tỷ lệ Khoản vay / Thu nhập (LTI) $\ge$ 0.3<br>• Tỷ lệ Nợ / Thu nhập (DTI) $\ge$ 0.4 | **Hạ bậc từ "Duyệt" xuống `REVIEW`**.<br>Chuyển hồ sơ sang chuyên viên để yêu cầu giảm số tiền vay hoặc bổ sung người bảo lãnh. |
| 🔍 **Tầng 3: Cảnh báo ngoại lai (Outlier Flags)** | • Thu nhập cá nhân > $150,000/năm<br>• Khoản vay đăng ký > $25,000<br>• Nợ khác bên ngoài > $30,000 | **Bật cờ cảnh báo hồ sơ giá trị lớn**.<br>Yêu cầu chuyên viên kiểm tra chứng từ thuế để phòng ngừa khai khống thu nhập. |

---

### 3.7 Lộ Trình Triển Khai Thực Tế

Kế hoạch đưa các chính sách trên vào vận hành được chia làm 3 mốc rõ ràng:

```
[Ngay lập tức: 0–30 ngày]  ──► Cắt bỏ các nhóm rủi ro cực đoan (DTI > 0.6, LTI > 0.8)
[Ngắn hạn: 1–6 tháng]      ──► Áp dụng quy trình kiểm tra người thuê nhà & Lãi suất theo mục đích vay
[Dài hạn: 6–12+ tháng]     ──► Tự động hóa toàn diện qua Web/API & Mở rộng sang các thị trường mới
```

1. **Ưu tiên tức thì (0 – 30 ngày)**: Kích hoạt ngay bộ lọc chặn cứng DTI $\ge$ 0.6 và LTI $\ge$ 0.8 để ngay lập tức ngăn chặn nguy cơ mất vốn ở các hồ sơ quá tải nợ.
2. **Tối ưu hóa ngắn hạn (1 – 6 tháng)**: Triển khai kiểm tra bổ sung với nhóm thuê nhà (`RENT`); áp dụng biểu lãi suất cộng thêm đối với các khoản vay đảo nợ (+2%) và ưu đãi cho vay học tập/kinh doanh (-1%).
3. **Chuyển đổi số dài hạn (6 – 12+ tháng)**: Tích hợp API mô hình Machine Learning vào toàn bộ hệ thống quầy giao dịch và kênh đăng ký trực tuyến; mở rộng mô hình sang các thị trường tương đồng như Úc, New Zealand.

---

## 4. Mô Hình Học Máy & Hệ Thống Chấm Điểm Tự Động

### 4.1 Quy Trình Xử Lý Hồ Sơ & Chấm Điểm

Hệ thống xử lý hồ sơ từ lúc khách hàng nhập thông tin cho đến khi trả về kết quả cuối cùng theo luồng sau:

```
[1. Khách hàng nộp hồ sơ vay (16 thông tin cá nhân & tài chính)]
                             │
                             ▼
[2. Xử lý & Tạo đặc trưng (Feature Engineering Pipeline)]
   • Chuẩn hóa dữ liệu thu nhập và nợ khác: person_income_log, other_debt_log
   • Tính các tỷ số đòn bẩy tài chính: loan_to_income_ratio, debt_to_income_ratio
   • Gán nhãn cờ rủi ro gánh nặng: high_loan_burden_flag
                             │
                             ▼
[3. Mô hình LightGBM] ──► Dự đoán Xác suất vỡ nợ (Probability of Default - PD)
                             │
                             ▼
[4. Quy đổi Thang điểm FICO] ─► Điểm tín dụng từ 300 đến 850 (Chuẩn Log-Odds)
                             │
                             ▼
[5. Áp dụng Quy tắc Ngân hàng & Bộ mã Lý do (Business Rules & Reason Codes)]
                             │
                             ▼
[6. Quyết định cuối cùng: APPROVE / REVIEW / REJECT] + [Giải thích lý do cụ thể]
```

---

### 4.2 Chuẩn Hóa Sang Thang Điểm FICO (300–850)

Thay vì trả về một con số phần trăm xác suất vỡ nợ khó hiểu với khách hàng và nhân viên tín dụng, hệ thống chuyển đổi trực tiếp sang **thang điểm tín dụng chuẩn hóa 300 – 850** (tương tự chuẩn FICO quốc tế):

- **Điểm chuẩn cơ sở (Base Score = 600)**: Tương ứng với mức rủi ro trung bình (xác suất vỡ nợ 50%).
- **Quy tắc PDO = 20 (Points to Double the Odds)**: Chuẩn mực ngành ngân hàng: **Cứ mỗi 20 điểm tăng thêm, tỷ lệ khách hàng trả nợ tốt sẽ tăng gấp đôi**.
- **Dải điểm chuẩn hóa (300 – 850)**:
  - **300 điểm**: Rủi ro cao nhất (xác suất vỡ nợ gần như 100%).
  - **850 điểm**: Uy tín tối đa (hồ sơ tài chính cực kỳ lành mạnh).

Cách chấm điểm này giúp cả khách hàng lẫn chuyên viên ngân hàng dễ dàng hiểu được mức độ tín nhiệm mà không cần phải hiểu sâu về thuật toán máy học bên dưới.

---

### 4.3 Khung Phân Luồng Quyết Định 3 Cấp

Dựa trên điểm số FICO và các quy tắc nghiệp vụ, hệ thống chia hồ sơ thành 3 luồng xử lý:

| Quyết định | Ngưỡng điểm FICO | Mức rủi ro | Cơ chế xử lý |
|---|---|---|---|
| 🟢 **APPROVE (Phê duyệt ngay)** | **> 643 điểm** | Rủi ro Thấp (Low Risk) | **Duyệt tự động 100% (Straight-Through Processing)**. Hồ sơ đủ điều kiện giải ngân ngay với hạn mức tối đa và lãi suất ưu đãi. |
| 🟡 **REVIEW (Cần xem xét lại)** | **617 – 643 điểm** | Rủi ro Vừa (Medium Risk) | **Chuyển chuyên viên tín dụng thẩm định thủ công**. Hệ thống gửi kèm các điểm nghi vấn để đàm phán giảm bớt tiền vay hoặc kéo dài kỳ hạn. |
| 🔴 **REJECT (Từ chối)** | **≤ 616 điểm** *(hoặc vi phạm Knock-out)* | Rủi ro Cao (High Risk) | **Từ chối cấp tín dụng tự động**. Hệ thống tự động tạo thông báo từ chối kèm các lý do cụ thể theo quy định minh bạch tín dụng. |

---

### 4.4 Minh Bạch Hóa Quyết Định Với Hệ Thống Mã Lý Do (Reason Codes)

Khắc phục hoàn toàn nhược điểm "hộp đen" (không rõ vì sao bị từ chối) của trí tuệ nhân tạo, hệ thống tự động xuất ra các **mã lý do cụ thể** cho từng hồ sơ:

- `REASON_HIGH_DTI`: Tỷ lệ tổng nợ trên thu nhập quá cao, nguy cơ mất khả năng trả nợ.
- `REASON_HIGH_PTI`: Số tiền phải trả hàng tháng chiếm quá 25% thu nhập sinh hoạt.
- `REASON_PRIOR_DEFAULT`: Khách hàng từng có lịch sử nợ xấu trong quá khứ.
- `REASON_PAST_DELINQUENCIES`: Khách hàng từng nhiều lần chậm thanh toán nợ.
- `REASON_HIGH_CREDIT_UTILIZATION`: Sử dụng trên 80% hạn mức thẻ tín dụng (dấu hiệu cạn tiền mặt).
- `RENTER_NO_COLLATERAL`: Người đi thuê nhà chưa có tài sản tích lũy bảo đảm.

Hệ thống hỗ trợ song ngữ (Tiếng Việt & Tiếng Anh), giúp ngân hàng dễ dàng giải thích cho khách hàng và giải trình với cơ quan kiểm toán.

---

## 5. Đánh Giá Hiệu Năng & Độ Tin Cậy Của Mô Hình

### 5.1 Bảng So Sánh Hiệu Năng

Kết quả kiểm thử độc lập trên tập dữ liệu kiểm tra (Test Set) giữa mô hình Logistic Regression truyền thống và mô hình LightGBM tối ưu:

| Chỉ số đánh giá | Mô hình Cơ sở (Logistic Regression) | Mô hình Đề xuất (LightGBM) | Ý nghĩa thực tế trong ngân hàng |
|---|---|---|---|
| **ROC-AUC** | 0.8607 | **0.9431** | Khả năng phân biệt chính xác giữa người trả tốt và người nợ xấu trên toàn dải điểm. |
| **PR-AUC** | 0.7214 | **0.8916** | **Chỉ số quan trọng nhất**: Bắt đúng các khoản nợ xấu trong bối cảnh người nợ xấu chiếm số ít (21.8%). |
| **Chỉ số KS (Kolmogorov-Smirnov)** | 58.40 | **73.08** | Độ tách bạch giữa 2 nhóm khách hàng (Chuẩn ngân hàng chỉ cần KS > 40 là đạt yêu cầu cao). |
| **Hệ số Gini** | 0.7214 | **0.8862** | Thước đo sức mạnh phân hóa trong bảng điểm tín dụng ($2 \times \text{AUC} - 1$). |
| **F1-Score** | 0.7021 | **0.8415** | Cân bằng tối ưu giữa việc không bỏ lọt nợ xấu và không từ chối nhầm khách hàng tốt. |

---

### 5.2 Ý Nghĩa Thực Tế Của Các Chỉ Số Đánh Giá

- **Vì sao PR-AUC (0.8916) lại là chỉ số quan trọng nhất?**  
  Trong ngân hàng, số người trả nợ tốt luôn nhiều hơn số người vỡ nợ (tỷ lệ 3.6 : 1). Nếu chỉ nhìn vào độ chính xác thông thường (Accuracy), mô hình có thể đoán bừa là "Tất cả đều tốt" mà vẫn đúng gần 80%. PR-AUC tập trung kiểm tra xem mô hình có thực sự phát hiện đúng các khoản nợ xấu hay không. Mức 0.8916 chứng minh mô hình phát hiện nợ xấu cực kỳ chuẩn xác.
- **Chỉ số KS đạt 73.08 có ý nghĩa gì?**  
  Chỉ số KS đo khoảng cách tách biệt lớn nhất giữa phân phối điểm của nhóm trả nợ tốt và nhóm nợ xấu. Trong ngành tài chính, mô hình có KS trên 40 đã được coi là tốt; mức **73.08** khẳng định hệ thống gần như tách bạch hoàn toàn hai nhóm này mà không bị chồng lấn rủi ro.

---

### 5.3 Các Bước Kiểm Định Đảm Bảo An Toàn

1. **Tối ưu siêu tham số tự động (Optuna)**: Sử dụng thuật toán Bayesian Search chạy qua 50 lần thử nghiệm với kỹ thuật kiểm định chéo 5 lớp (5-Fold Stratified Cross-Validation) để tìm ra bộ thông số tối ưu nhất, không bị học vẹt (Overfitting).
2. **Kiểm tra tính đơn điệu theo phân vị (Decile Analysis)**: Chia toàn bộ khách hàng thành 10 nhóm điểm từ thấp đến cao. Kết quả kiểm tra khẳng định: **Điểm FICO càng tăng thì tỷ lệ nợ xấu thực tế giảm liên tục 100%**, không xảy ra hiện tượng nghịch lý điểm cao mà nợ xấu lại tăng.
3. **Cân bằng dữ liệu tự nhiên (`scale_pos_weight`)**: Thực nghiệm cho thấy phương pháp sinh dữ liệu nhân tạo (SMOTE) làm mô hình bị sai lệch khi gặp dữ liệu thật. Thay vào đó, mô hình sử dụng trọng số điều chỉnh tự nhiên trong LightGBM giúp kết quả dự đoán ổn định và đáng tin cậy nhất.

---

## 6. Báo Cáo Quản Trị Trực Quan (Power BI Dashboard)

Báo cáo điều hành chuyên sâu nằm tại file [`Power BI/risk.pbix`](Power%20BI/risk.pbix), cung cấp 4 góc nhìn quản trị cho ban lãnh đạo ngân hàng:

- **Sức khỏe danh mục cho vay**: Theo dõi biến động tỷ lệ nợ xấu, phân bổ điểm tín dụng FICO và cơ cấu dư nợ theo thời gian thực.
- **Phễu phê duyệt hồ sơ**: Đo lường tỷ lệ hồ sơ được Duyệt tự động, Cần xem xét lại và Bị từ chối ở từng chi nhánh.
- **Phân tích rủi ro theo phân khúc**: Cắt lớp dữ liệu đa chiều theo nơi ở (Thuê nhà vs Có nhà riêng), độ tuổi (đường cong chữ U) và mục đích vay vốn.
- **Giám sát độ ổn định mô hình (Model Drift)**: Cảnh báo sớm khi điểm số trung bình của khách hàng nộp hồ sơ có dấu hiệu sụt giảm so với dữ liệu quá khứ.

---

## 7. Kiến Trúc Kỹ Thuật & Công Nghệ

```
┌─────────────────────────────────────────────────────────────┐
│                   GIAO DIỆN NGƯỜI DÙNG (Vercel)             │
│    Next.js 16 (React 19) • TypeScript • Tailwind CSS • i18n │
│  - Màn hình nộp hồ sơ & xem kết quả phê duyệt trong 1 phút  │
│  - Tra cứu lịch sử thẩm định, xem chi tiết các mã lý do     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ HTTPS / REST API (JWT Bearer)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   MÁY CHỦ XỬ LÝ (Render)                    │
│             FastAPI • Uvicorn • Pydantic v2                 │
│  ┌───────────────────────────┬───────────────────────────┐  │
│  │   Dịch vụ Xác thực        │   Dịch vụ Chấm điểm       │  │
│  │   (Tài khoản & Phân quyền)│   (Pipeline & Reason Code)│  │
│  └───────────────────────────┴─────────────┬─────────────┘  │
│                                            │                │
│                                            ▼                │
│                              ┌───────────────────────────┐  │
│                              │   Mô hình Máy học         │  │
│                              │   LightGBM + Preprocessor│  │
│                              │   File cấu hình: metadata │  │
│                              └───────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ SQLAlchemy 2.0 ORM
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   CƠ SỞ DỮ LIỆU (PostgreSQL)                │
│  - Bảng users: Quản lý thông tin đăng nhập và quyền hạn     │
│  - Bảng predictions: Lưu trữ kết quả chấm điểm & lịch sử vay│
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Hướng Dẫn Cài Đặt & Chạy Thử

### Yêu cầu môi trường:
- Python $\ge$ 3.10
- Node.js $\ge$ 18.0.0 & npm $\ge$ 9.0.0
- PostgreSQL (Cài đặt trên máy hoặc dùng Supabase Cloud miễn phí)

### Bước 1 — Khởi động Backend (FastAPI)

```bash
# 1. Di chuyển vào thư mục Backend
cd App/BE

# 2. Tạo và kích hoạt môi trường ảo Python
python -m venv venv
# Trên Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Trên Linux / macOS:
source venv/bin/activate

# 3. Cài đặt các thư viện cần thiết
pip install -r requirements.txt

# 4. Tạo file cấu hình môi trường
cp .env.example .env
# Mở file .env và điền chuỗi kết nối DATABASE_URL và JWT Secret phù hợp

# 5. Khởi chạy máy chủ API
uvicorn main:app --reload --port 8000
```
- Tài liệu API (Swagger UI): `http://localhost:8000/docs`
- Kiểm tra trạng thái máy chủ: `http://localhost:8000/health`

---

### Bước 2 — Khởi động Frontend (Next.js)

```bash
# 1. Mở một cửa sổ dòng lệnh mới, di chuyển vào thư mục Frontend
cd App/FE

# 2. Cài đặt các thư viện giao diện
npm install

# 3. Thiết lập địa chỉ kết nối API
echo 'NEXT_PUBLIC_API_URL=http://localhost:8000' > .env.local

# 4. Khởi chạy giao diện thử nghiệm
npm run dev
```
- Truy cập ứng dụng tại trình duyệt: `http://localhost:3000`

---

### Bước 3 — Khám phá các Notebook Phân Tích

```bash
# Khởi động Jupyter Notebook
pip install jupyter
jupyter notebook
```

**Thứ tự các file phân tích:**
1. [`notebooks/data_understanding.ipynb`](notebooks/data_understanding.ipynb): Tìm hiểu cấu trúc dữ liệu, kiểm tra dữ liệu thiếu và phân phối các biến.
2. [`notebooks/EDA.ipynb`](notebooks/EDA.ipynb): Phân tích chi tiết từng nhóm chỉ số, kiểm định giả thuyết và đúc kết nguyên nhân gây nợ xấu.
3. [`notebooks/model.ipynb`](notebooks/model.ipynb): Huấn luyện các mô hình, tinh chỉnh siêu tham số với Optuna và xuất file mô hình hoàn chỉnh.
4. [`notebooks/powerBi.ipynb`](notebooks/powerBi.ipynb): Chuẩn bị các bảng số liệu sạch để đưa lên báo cáo Power BI.

---

## 9. Cấu Trúc Thư Mục Dự Án

```
NovaBank_CreditRisk/
│
├── App/
│   ├── BE/                          # Máy chủ xử lý nghiệp vụ & Mô hình (FastAPI)
│   │   ├── api/                     # Các cổng API (đăng nhập, chấm điểm, xem lịch sử)
│   │   ├── artifacts/               # File mô hình đã huấn luyện (metadata.json, pipeline.joblib)
│   │   ├── database/                # Kết nối cơ sở dữ liệu PostgreSQL (SQLAlchemy)
│   │   ├── domain/                  # Định nghĩa định dạng dữ liệu đầu vào/ra (Pydantic)
│   │   ├── ml/                      # Module tải mô hình và biến đổi dữ liệu
│   │   ├── repository/              # Tương tác dữ liệu (truy vấn người dùng, lưu kết quả)
│   │   ├── service/                 # Xử lý logic nghiệp vụ và xác thực tài khoản
│   │   ├── main.py                  # Điểm khởi chạy ứng dụng FastAPI
│   │   ├── scoring.py               # Logic quy đổi điểm FICO & bộ quy tắc ngân hàng
│   │   └── requirements.txt         # Danh sách thư viện Python của Backend
│   │
│   └── FE/                          # Ứng dụng Web giao diện người dùng (Next.js 16)
│       ├── public/                  # Hình ảnh, biểu tượng tĩnh
│       ├── src/
│       │   ├── app/                 # Các trang giao diện (nộp hồ sơ, đăng nhập, lịch sử)
│       │   ├── components/          # Các thành phần tái sử dụng (thanh menu, đồng hồ điểm FICO)
│       │   ├── lib/                 # Các hàm gọi API và công cụ hỗ trợ
│       │   └── messages/            # Hỗ trợ đa ngôn ngữ (tiếng Việt vi.json, tiếng Anh en.json)
│       └── package.json             # Danh sách thư viện và tập lệnh Node.js
│
├── notebooks/                       # Toàn bộ quá trình phân tích dữ liệu & huấn luyện
│   ├── data_understanding.ipynb     # Khám phá cấu trúc dữ liệu ban đầu
│   ├── EDA.ipynb                    # Phân tích sâu hành vi khách hàng & nguyên nhân nợ xấu
│   ├── model.ipynb                  # Huấn luyện mô hình, tối ưu Optuna & đánh giá
│   ├── powerBi.ipynb                # Tạo bảng tổng hợp phục vụ Power BI
│   └── preprocessors.py             # Bộ biến đổi dữ liệu tùy biến (Custom Transformers)
│
├── Power BI/
│   └── risk.pbix                    # File báo cáo điều hành Power BI tương tác
│
├── raw_data/
│   └── Credit Risk Data.csv         # Bộ dữ liệu gốc 32,581 hồ sơ tín dụng
│
├── requirements.txt                 # Thư viện phân tích dữ liệu chung của dự án
├── README.md                        # Tài liệu hướng dẫn toàn diện của dự án
└── .gitignore                       # Danh sách các file bỏ qua không đưa lên Git
```

---

## 10. Hạn Chế & Hướng Phát Triển Tiếp Theo

1. **Bổ sung thông tin định giá tài sản (LTV)**: Thu thập thêm giá trị thực tế của căn nhà đối với nhóm khách hàng vay mua nhà (`MORTGAGE`) để hệ thống đánh giá chính xác hơn, tránh báo nhầm rủi ro.
2. **Giải thích chi tiết theo từng hồ sơ (SHAP Value)**: Tích hợp trực tiếp thuật toán TreeSHAP vào API để hiển thị cụ thể từng yếu tố làm tăng hoặc giảm bao nhiêu điểm FICO của riêng khách hàng đó.
3. **Tự động giám sát độ suy giảm mô hình (PSI / CSI Monitoring)**: Xây dựng hệ thống tự động đo lường mức độ thay đổi của dữ liệu theo tuần (Population Stability Index). Nếu dữ liệu khách hàng mới thay đổi quá nhiều so với trước, hệ thống sẽ cảnh báo để huấn luyện lại mô hình.
4. **Kiểm tra sức chịu đựng trong khủng hoảng (Stress Testing)**: Đưa các kịch bản suy thoái kinh tế (lạm phát tăng cao, lãi suất ngân hàng tăng, thất nghiệp gia tăng) vào mô hình để kiểm tra danh mục cho vay của ngân hàng có chịu được cú sốc hay không.

---

*NovaBank Credit Risk — Hệ Thống Chấm Điểm Tín Dụng & Quản Trị Rủi Ro Cho Vay Bán Lẻ*  
*Xây dựng với FastAPI, LightGBM, Next.js 16, PostgreSQL và Power BI*
