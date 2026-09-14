# Phân tích rủi ro tín dụng -- Credit Risk Analysis & Intelligent Loan Decisioning System
> Phân tích rủi ro tín dụng danh mục & Hệ thống chấm điểm, phê duyệt khoản vay tự động theo thời gian thực  
> 🌐 **DEMO thực tế**: [https://credit-risk-prediction-pi.vercel.app/en/apply](https://credit-risk-prediction-pi.vercel.app/en/apply)   
> 🛠️ **Tech Stack**: FastAPI · LightGBM · Next.js 16 · PostgreSQL · Power BI · Scikit-Learn · Optuna

Dự án này mình xây dựng nhằm giải quyết bài toán cốt lõi trong mảng cho vay tiêu dùng tín chấp (Retail Consumer Lending): **Làm sao để tự động hóa quy trình thẩm định tín dụng, kiểm soát chặt chẽ tỷ lệ nợ xấu nhưng không bóp nghẹt doanh số tăng trưởng của ngân hàng.**

Thay vì chỉ dựng một mô hình Machine Learning lý thuyết như chiếc "hộp đen", dự án giải quyết trọn vẹn vòng đời một giải pháp tài chính thực tế: đào sâu phân tích hành vi nợ từ **32,581 hồ sơ tín dụng thực tế** (Mỹ, Anh, Canada), thiết kế bộ quy tắc chính sách tín dụng (Credit Policy), xây dựng mô hình LightGBM tối ưu chuẩn hóa theo thang điểm FICO (300–850), phát triển Dashboard điều hành rủi ro (Power BI), và đóng gói thành hệ thống Web xét duyệt tự động theo thời gian thực.

---

## Mục Lục / Table of Contents

- [1. Bối Cảnh Nghiệp Vụ & Giá Trị Thực Tế](#1-bối-cảnh-nghiệp-vụ--giá-trị-thực-tế)
  - [1.1 Thách thức trong thẩm định tín dụng truyền thống](#11-thách-thức-trong-thẩm-định-tín-dụng-truyền-thống)
  - [1.2 Giải pháp & Giá trị mang lại cho các bộ phận](#12-giải-pháp--giá-trị-mang-lại-cho-các-bộ-phận)
  - [1.3 Bức tranh tổng thể từ bộ dữ liệu 32,581 hồ sơ](#13-bức-tranh-tổng-thể-từ-bộ-dữ-liệu-32581-hồ-sơ)
- [2. Bóc Tách Dữ Liệu & Khám Phá Rủi Ro Danh Mục (Portfolio Insights)](#2-bóc-tách-dữ-liệu--khám-phá-rủi-ro-danh-mục-portfolio-insights)
  - [2.1 Những phát hiện cốt lõi từ dữ liệu thực tế](#21-những-phát-hiện-cốt-lõi-từ-dữ-liệu-thực-tế)
  - [2.2 Những góc khuất kỹ thuật phát hiện thêm trong quá trình làm](#22-những-góc-khuất-kỹ-thuật-phát-hiện-thêm-trong-quá-trình-làm)
  - [2.3 Chu trình 4 bước: Từ dữ liệu phân tích đến quyết định giải ngân](#23-chu-trình-4-bước-từ-dữ-liệu-phân-tích-đến-quyết-định-giải-ngân)
  - [2.4 Bài toán cân bằng giữa tăng trưởng doanh số và an toàn vốn](#24-bài-toán-cân-bằng-giữa-tăng-trưởng-doanh-số-và-an-toàn-vốn)
- [3. Chính Sách Tín Dụng & Khung Thẩm Định Theo Từng Nhóm Chỉ Số](#3-chính-sách-tín-dụng--khung-thẩm-định-theo-từng-nhóm-chỉ-số)
  - [3.1 Nhóm Khả năng tài chính & Đòn bẩy nợ](#31-nhóm-khả-năng-tài-chính--đòn-bẩy-nợ)
  - [3.2 Nhóm Lịch sử tín dụng & Kỷ luật thanh toán](#32-nhóm-lịch-sử-tín-dụng--kỷ-luật-thanh-toán)
  - [3.3 Nhóm Nơi ở & Tài sản bảo đảm](#33-nhóm-nơi-ở--tài-sản-bảo-đảm)
  - [3.4 Nhóm Mục đích sử dụng vốn](#34-nhóm-mục-đích-sử-dụng-vốn)
  - [3.5 Nhóm Đặc điểm khách hàng (Độ tuổi, Việc làm, Quốc gia)](#35-nhóm-đặc-điểm-khách-hàng-độ-tuổi-việc-làm-quốc-gia)
  - [3.6 Ma trận quy tắc phân luồng hồ sơ (Knock-out, Soft Review, Outlier Flags)](#36-ma-trận-quy-tắc-phân-luồng-hồ-sơ-knock-out-soft-review-outlier-flags)
  - [3.7 Lộ trình triển khai chính sách vào vận hành](#37-lộ-trình-triển-khai-chính-sách-vào-vận-hành)
- [4. Mô Hình Học Máy & Hệ Thống Chấm Điểm FICO](#4-mô-hình-học-máy--hệ-thống-chấm-điểm-fico)
  - [4.1 Quy trình xử lý đặc trưng & Chấm điểm đầu-cuối](#41-quy-trình-xử-lý-đặc-trưng--chấm-điểm-đầu-cuối)
  - [4.2 Chuẩn hóa xác suất sang thang điểm FICO (300–850)](#42-chuẩn-hóa-xác-suất-sang-thang-điểm-fico-300850)
  - [4.3 Khung phân luồng quyết định 3 cấp (Approve / Review / Reject)](#43-khung-phân-luồng-quyết-định-3-cấp-approve--review--reject)
  - [4.4 Minh bạch hóa quyết định với hệ thống mã lý do (Reason Codes)](#44-minh-bạch-hóa-quyết-định-với-hệ-thống-mã-lý-do-reason-codes)
- [5. Đánh Giá Hiệu Năng & Độ Tin Cậy Mô Hình](#5-đánh-giá-hiệu-năng--độ-tin-cậy-mô-hình)
  - [5.1 So sánh mô hình LightGBM với Logistic Regression cơ sở](#51-so-sánh-mô-hình-lightgbm-với-logistic-regression-cơ-sở)
  - [5.2 Ý nghĩa thực tế của các chỉ số thẩm định (PR-AUC, KS, Gini)](#52-ý-nghĩa-thực-tế-của-các-chỉ-số-thẩm-định-pr-auc-ks-gini)
  - [5.3 Quy trình kiểm thử và chống rò rỉ dữ liệu](#53-quy-trình-kiểm-thử-và-chống-rò-rỉ-dữ-liệu)
- [6. Báo Cáo Quản Trị Trực Quan (Power BI Dashboard)](#6-báo-cáo-quản-trị-trực-quan-power-bi-dashboard)
- [7. Kiến Trúc Kỹ Thuật & Công Nghệ](#7-kiến-trúc-kỹ-thuật--công-nghệ)
- [8. Hướng Dẫn Cài Đặt & Chạy Thử](#8-hướng-dẫn-cài-đặt--chạy-thử)
- [9. Cấu Trúc Thư Mục Dự Án](#9-cấu-trúc-thư-mục-dự-án)
- [10. Hạn Chế & Định Hướng Phát Triển Tiếp Theo](#10-hạn-chế--định-hướng-phát-triển-tiếp-theo)

---

## 1. Bối Cảnh Nghiệp Vụ & Giá Trị Thực Tế

### 1.1 Thách thức trong thẩm định tín dụng truyền thống

Trong mảng cho vay tiêu dùng, các ngân hàng luôn phải đối mặt với một bài toán cân não: **Làm sao để cho vay được nhiều khách hàng nhưng vẫn giữ được tiền an toàn, không bị nợ xấu?**

Quy trình thẩm định tín dụng truyền thống thường vấp phải 3 trở ngại lớn:
1. **Xét duyệt thủ công, mất thời gian**: Hồ sơ giấy tờ chuyển qua nhiều khâu, chuyên viên tín dụng mất từ vài ngày đến cả tuần để ra quyết định. Chi phí vận hành cao mà khách hàng thì phải chờ đợi lâu, dễ bỏ sang ngân hàng khác.
2. **Quyết định mang nặng tính chủ quan**: Cùng một bộ hồ sơ tài chính, chuyên viên khó tính có thể từ chối nhưng chuyên viên dễ tính lại duyệt. Tiêu chuẩn thẩm định thiếu tính nhất quán trên toàn hệ thống chi nhánh.
3. **Quy tắc cứng nhắc (Đạt / Trượt)**: Các bộ tiêu chí cố định thường bỏ sót những khách hàng tiềm năng chỉ vì thiếu một điều kiện phụ, hoặc ngược lại, phê duyệt nhầm những hồ sơ trông đẹp trên giấy tờ nhưng thực chất đang đứng trước nguy cơ đứt gãy dòng tiền.

---

### 1.2 Giải pháp & Giá trị mang lại cho các bộ phận

Hệ thống được thiết kế xuất phát từ nhu cầu thực tế của từng bộ phận trong ngân hàng:

| Bộ phận | Vấn đề quan tâm nhất | Giá trị giải pháp mang lại |
|---|---|---|
| **Quản trị Rủi ro** *(Risk Team)* | Kiểm soát trần nợ xấu toàn danh mục, phát hiện sớm các nguy cơ tiềm ẩn. | Báo cáo chi tiết phân bổ rủi ro, xác định chính xác các điểm nóng vỡ nợ để thiết lập ngưỡng chặn an toàn. |
| **Vận hành Cho vay** *(Operations Team)* | Giảm tải việc thẩm định thủ công, rút ngắn thời gian xử lý hồ sơ. | Tự động chấm điểm và phân luồng tức thì: *Hồ sơ duyệt ngay*, *Hồ sơ cần thẩm định lại*, *Hồ sơ từ chối thẳng*. |
| **Ban Giám Đốc** *(Leadership)* | Tối ưu hóa lợi nhuận danh mục, cân bằng giữa tăng trưởng và an toàn vốn. | Dashboard Power BI theo dõi sức khỏe danh mục theo thời gian thực, hỗ trợ định giá lãi suất theo mức độ rủi ro. |
| **Phát triển Sản phẩm** *(Product Team)* | Hiểu sâu hành vi khách hàng để thiết kế các gói vay phù hợp. | Đề xuất hạn mức và kỳ hạn theo nhóm tuổi, điều chỉnh biên độ lãi suất linh hoạt theo từng mục đích vay. |

---

### 1.3 Bức tranh tổng thể từ bộ dữ liệu 32,581 hồ sơ

Bộ dữ liệu gồm **32,581 hồ sơ vay tiêu dùng** tại 3 thị trường phát triển (Mỹ, Anh, Canada), phản ánh bức tranh thực tế của danh mục:

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

> **Nhận định danh mục**: Tỷ lệ nợ xấu 21.82% là mức phổ biến trong phân khúc vay tín chấp không có tài sản thế chấp (chuẩn ngành thường nằm trong khoảng 18% – 25%). Đáng chú ý, nhóm khách hàng vỡ nợ có **thu nhập thấp hơn 30%** nhưng lại **vay nhiều hơn 18%** so với nhóm trả nợ tốt, khiến họ phải gánh mức lãi suất cao hơn và nhanh chóng kiệt quệ dòng tiền trả nợ.

---

## 2. Bóc Tách Dữ Liệu & Khám Phá Rủi Ro Danh Mục (Portfolio Insights)

### 2.1 Những phát hiện cốt lõi từ dữ liệu thực tế

Khi bắt tay vào đào sâu 32,581 bộ hồ sơ, mục tiêu đầu tiên của mình không phải là lao vào chạy mô hình ngay, mà là tìm câu trả lời cho những băn khoăn thiết thực nhất của người làm tín dụng: **Nợ xấu thực sự phát sinh từ đâu, nhóm khách hàng nào dễ tổn thương nhất, và đâu là những tín hiệu cảnh báo sớm mà ngân hàng có thể chặn trước?**

Qua quá trình phân tích đối chiếu, dữ liệu đã bộc lộ những câu chuyện rất rõ ràng:

#### 1. Nhóm khách hàng có nguy cơ nợ quá hạn cao nhất
Nợ xấu trong dữ liệu không rơi rải rác mà tụ lại thành những "túi rủi ro" rất rõ rệt:
- **Khách hàng đi thuê nhà (`RENT`)**: Chiếm tỷ trọng nộp hồ sơ đông nhất nhưng tỷ lệ nợ xấu lên đến **31.57%**, cao gấp **4.2 lần** so với nhóm đã sở hữu nhà riêng (`OWN` - chỉ 7.47%). Khoản tiền thuê nhà cố định hàng tháng khiến người đi thuê gần như không còn khoảng đệm tài chính nếu chẳng may bị giảm thu nhập hay mất việc.
- **Khách hàng vay vượt quá khả năng trả nợ (Đòn bẩy quá đà)**: Những người vay khoản tiền lớn hơn 70% thu nhập một năm (LTI > 0.70) có tỷ lệ vỡ nợ lên tới **87.50%**. Đặc biệt, nếu tổng các khoản nợ phải trả hàng tháng chiếm trên 80% thu nhập (DTI > 0.80), tỷ lệ vỡ nợ gần như tuyệt đối: **93.33%**.
- **Khách hàng từng có vết nợ xấu trong quá khứ**: Khách hàng từng có lịch sử nợ xấu (`default = Y`) ghi nhận tỷ lệ nợ xấu ở khoản vay hiện tại là **37.81%**, cao gấp **2.06 lần** so với người có lịch sử tín dụng trong sạch.
- **Khách hàng ở hai đầu độ tuổi**: Nhóm cao tuổi 61–70 tuổi có nợ xấu cao nhất toàn danh mục (**29.82%**), tiếp theo là nhóm người trẻ 20–30 tuổi (**22.21%**). Người trẻ thì công việc và thói quen tích lũy chưa vững, còn người lớn tuổi thì thu nhập sụt giảm sau hưu trí trong khi chi phí y tế lại phát sinh bất ngờ.
- **Khách hàng vay để đảo nợ hoặc trả viện phí**: Tỷ lệ nợ xấu lần lượt là **28.59%** và **26.70%**, phản ánh tình trạng dòng tiền đã rất căng thẳng từ trước khi nộp hồ sơ vay.
- **Khách hàng mở quá nhiều tài khoản nợ cùng lúc**: Những ai đang phải gánh từ 7–8 tài khoản nợ cùng lúc có tỷ lệ nợ xấu chạm đỉnh **24.13%**, do dòng tiền bị phân tán và rất dễ quên lịch thanh toán.

#### 2. Mục đích vay vốn — Dòng tiền đi về đâu quyết định rủi ro tới đó
Mục đích vay (`loan_intent`) phản ánh trực tiếp áp lực tài chính và động cơ sử dụng tiền của khách hàng:
- 🚨 **Nhóm rủi ro cao — Vay đảo nợ (28.59%) & Vay y tế (26.70%)**: Khách hàng tìm đến vay đảo nợ (hợp nhất nợ) thường là lúc họ đã nợ nhiều nơi và sắp đứt thanh khoản. Vay y tế là cú sốc ngoài dự kiến, vừa tốn kém vừa làm sụt giảm khả năng lao động.
- ⚠️ **Nhóm rủi ro trung bình — Vay sửa nhà (26.10%) & Vay tiêu dùng cá nhân (19.89%)**: Các khoản chi tiêu mang tính tùy hứng, rất dễ phát sinh chi phí vượt dự toán ban đầu.
- 🟢 **Nhóm an toàn nhất — Vay đi học (17.22%) & Vay kinh doanh (14.31%)**: Đây là hai mục đích vay lành mạnh nhất. Khi vay tiền để làm ăn sinh lời hoặc nâng cao chuyên môn để tăng thu nhập, người vay luôn có kế hoạch trả nợ bài bản và ý thức bảo vệ uy tín cao nhất.

#### 3. Tỷ lệ LTI và DTI — Khi nào gánh nặng nợ biến thành thảm họa?
Nếu phải chọn 2 thước đo quan trọng nhất quyết định số phận một khoản vay, đó chắc chắn là **LTI (Khoản vay / Thu nhập)** và **DTI (Tổng nghĩa vụ nợ / Thu nhập)**:
- Với những khoản vay nhỏ gọn (LTI < 0.10), nợ xấu chỉ vỏn vẹn **11.21%**. Ở mức trung bình ngân hàng hay duyệt (LTI 0.20 – 0.30), nợ xấu giữ ở mức cân bằng **22.09%**. Nhưng khi LTI vượt quá 0.70, tỷ lệ vỡ nợ lập tức vọt lên **87.50%**.
- Về dòng tiền hàng tháng: Khách hàng trả nợ tốt chỉ dành trung bình **14.9%** thu nhập để trả nợ. Ngược lại, nhóm vỡ nợ phải gánh trung bình tới **24.7%** thu nhập.
- **Ranh giới chịu đựng**: Một khi nghĩa vụ nợ ngốn từ **25% – 30% thu nhập hàng tháng**, người vay không còn tiền dự phòng. Bất kỳ một biến cố nhỏ nào (ốm đau, giảm giờ làm, lạm phát) cũng đủ biến họ thành nợ xấu. Nếu DTI vượt quá 0.80, tỷ lệ nợ xấu chạm mức **93.33%**.

#### 4. Hình thức nhà ở và hợp đồng việc làm — Đâu mới là điểm tựa an toàn thực sự?
- **Nơi ở tạo ra sự cách biệt rất lớn**: Người sở hữu nhà riêng (`OWN`) chỉ có **7.47%** nợ xấu, người đang trả góp nhà (`MORTGAGE`) có **12.57%**, còn người thuê nhà (`RENT`) lên tới **31.57%**. Căn nhà không chỉ là nơi ở, mà là một "tấm đệm tài sản" giúp người vay xoay xở khi gặp khó khăn mà không để bị kiện tụng hay mất uy tín.
- **Loại hợp đồng lao động hầu như không tạo ra sự phân hóa**: Toàn thời gian (21.57%), bán thời gian (21.63%), làm tự do (22.49%) hay đang tìm việc (22.67%) đều có tỷ lệ nợ xấu xấp xỉ nhau (~21% – 22%). Điều này mang lại một bài học kinh nghiệm rất đắt: **Dòng tiền thực tế đều đặn đổ vào tài khoản có giá trị thẩm định lớn hơn nhiều so với tên gọi của một bản hợp đồng lao động trên giấy tờ**.

#### 5. Lịch sử tín dụng — Vết nhơ quá khứ và sự thật về thâm niên
- **Thói quen thanh toán có tính lặp lại rất cao**: Người từng dính nợ xấu (`default = Y`) có nguy cơ vỡ nợ tiếp theo cao gấp **2.06 lần** (từ 18.39% vọt lên 37.81%). Người từng trễ hạn từ 3 đến 5 lần là dấu hiệu của việc thiếu kỷ luật tài chính nghiêm trọng.
- **Thâm niên tín dụng dài chưa hẳn đã an toàn**: Trái với cảm tính ban đầu rằng "thâm niên 25–30 năm chắc chắn uy tín", dữ liệu lại cho thấy nhóm này có tỷ lệ nợ xấu lên đến **28.71%**, cao hơn nhóm thâm niên ngắn 0–10 năm (20.65%). Lý do là nhóm này tập trung phần lớn khách hàng trên 60 tuổi — những người đã rời khỏi thị trường lao động, thu nhập sụt giảm và phải đối mặt với chi phí y tế lớn.

#### 6. So sánh 3 thị trường — Sự tương đồng giữa Mỹ, Anh và Canada
Khi chạy kiểm định trên 3 quốc gia, dữ liệu cho thấy kết quả đồng nhất đáng kinh ngạc:
- Mỹ: **21.86%**
- Vương Quốc Anh: **21.73%**
- Canada: **21.86%**
Mức chênh lệch tối đa giữa 3 quốc gia chỉ là **0.13 điểm phần trăm**. Điều này khẳng định hành vi tài chính tiêu dùng ở các nền kinh tế phát triển có chung quy luật, cho phép NovaBank tự tin triển khai chung một bộ khung chấm điểm và chính sách tín dụng cho cả 3 thị trường mà không cần tinh chỉnh cục bộ tốn kém.

#### 7. Xếp hạng Grade G và quyết định loại bỏ biến gây rò rỉ dữ liệu (Target Leakage)
- Bảng xếp hạng tín dụng cũ bộc lộ một lỗ hổng thẩm định chết người: Trong khi Grade A (9.96%) và Grade B (16.28%) rất an toàn, thì **Grade G ghi nhận tỷ lệ vỡ nợ lên tới 98.44%**! Cứ 100 hồ sơ Grade G thì ngân hàng mất trắng hơn 98 hồ sơ. Nhóm dự án áp dụng ngay quy tắc dừng cấp vốn lập tức cho nhóm này.
- **Vì sao loại bỏ `loan_grade` khỏi mô hình Machine Learning?**  
  `loan_grade` là nhãn phân loại nội bộ được chuyên viên gán sau quy trình xét duyệt cũ. Nếu đưa vào huấn luyện, mô hình sẽ gặp lỗi **rò rỉ mục tiêu (Target Data Leakage)** — hệ thống chỉ học vẹt lại quy tắc cũ mà không khám phá được các mối tương quan tài chính độc lập, làm mất đi giá trị gia tăng của AI.

#### 8. Đối sánh hai nhóm khách hàng: An toàn vs Rủi ro cao
Từ các phân tích trên, chân dung hai nhóm khách hàng hiện lên rất trực quan:
- **Khách hàng an toàn (Ưu tiên giải ngân tự động)**: Thu nhập ổn định trung bình $70,800/năm, khoản vay vừa tầm ($9,200), tỷ lệ vay LTI < 0.20, nợ DTI < 0.30. Có nhà riêng hoặc đang trả góp nhà, vay để làm ăn hoặc học tập, lịch sử tín dụng sạch, dùng thẻ tín dụng chừng mực (20%–30%), nằm trong độ tuổi chín muồi sự nghiệp 40–50 tuổi.
- **Khách hàng rủi ro cao (Cần chặn lọc hoặc thẩm định kỹ)**: Thu nhập thấp hơn ($49,100/năm) nhưng lại muốn vay nhiều hơn ($10,900), đòn bẩy LTI > 0.50, DTI > 0.40–0.60. Đang thuê nhà, vay để đảo nợ hoặc trả viện phí, từng có nợ xấu cũ, dùng cạn trên 80% hạn mức thẻ, thuộc nhóm quá trẻ (< 25) hoặc lớn tuổi (> 60).

---

### 2.2 Những góc khuất kỹ thuật phát hiện thêm trong quá trình làm

Bên cạnh các bài toán kinh doanh lớn, quá trình đào sâu dữ liệu giúp nhóm phát hiện ra 5 góc khuất kỹ thuật rất đắt giá:

1. **"Điểm ngọt" 20% – 30% của hạn mức thẻ tín dụng (Credit Utilization Sweet Spot)**:  
   Không phải cứ không quẹt thẻ là tốt (dùng dưới 10% nợ xấu vẫn ở mức 21.84% vì hồ sơ tín dụng quá mỏng). Điểm ngọt lý tưởng nhất là **20% – 30%** (nợ xấu thấp nhất: **21.11%**), chứng tỏ khách hàng có dòng tiền luân chuyển đều đặn và có thói quen trả nợ đúng hạn. Ngược lại, nếu khách hàng quẹt cạn trên 80% – 90% hạn mức thẻ, đó là tín hiệu báo động đỏ cho thấy họ đang cạn tiền mặt và phải sống dựa vào tín dụng quay vòng.
2. **Độ lệch do thiếu biến đệm tài sản ở nhóm thế chấp nhà (Mortgage Anomaly & Omitted Variable Bias)**:  
   Nhóm vay mua nhà (`MORTGAGE`) có tỷ lệ nợ xấu thực tế rất thấp (12.57%), nhưng các thuật toán phân loại sơ bộ hay đoán nhầm họ là rủi ro (tỷ lệ False Positive cao). Khi tìm hiểu kỹ, nhóm nhận ra dữ liệu lịch sử thiếu trường thông tin về giá trị căn nhà và tỷ lệ vay trên giá trị tài sản (LTV). Vì thiếu biến đệm tài sản này, thuật toán đánh giá họ khắt khe như người đi thuê. Nhận định này dẫn tới quyết định nghiệp vụ quan trọng: **Không bao giờ từ chối tự động nhóm MORTGAGE ở vùng ranh giới điểm**, mà chuyển sang chuyên viên thẩm định để đối soát giá trị tài sản thực tế.
3. **Hiện tượng phân tán tài khoản tín dụng (Account Fragmentation)**:  
   Người mở từ 7 đến 8 tài khoản tín dụng có tỷ lệ nợ xấu cao nhất (**24.13%**). Họ rơi vào cảnh "giật gấu vá vai", mở quá nhiều khoản vay nhỏ lẻ dẫn đến mất kiểm soát dòng tiền và hay quên lịch trả nợ.
4. **Chuẩn hóa FICO bằng Log-Odds Scaling (Base Score 600, PDO = 20)**:  
   Để hệ thống dễ hiểu và thân thiện với nhân viên tín dụng lẫn khách hàng, nhóm không để kết quả ở dạng xác suất khô khan 0.15 hay 0.72. Toàn bộ xác suất được quy đổi sang thang điểm FICO 300–850 chuẩn quốc tế qua tỷ lệ cược Log-Odds: Cứ mỗi 20 điểm tăng thêm, tỷ lệ khách hàng trả nợ tốt tăng gấp đôi.

---

### 2.3 Chu trình 4 bước: Từ dữ liệu phân tích đến quyết định giải ngân

Để những con số phân tích không chỉ nằm lại trên giấy, nhóm thiết kế một chu trình khép kín 4 bước đưa dữ liệu vào thẳng luồng xét duyệt thực tế:

```
[Bước 1: Khám phá Dữ liệu (EDA)] ──► [Bước 2: Bóc tách Căn nguyên] ──► [Bước 3: Dựng Hàng rào Chính sách] ──► [Bước 4: Tự động hóa bằng Máy]
    Đào sâu từng chỉ số và             Hiểu rõ áp lực dòng tiền          Thiết lập trần đòn bẩy và              Mô hình LightGBM chấm điểm
    tỷ lệ nợ xấu thực tế.              của từng nhóm khách hàng.         bộ quy tắc an toàn (Rules).            và phân luồng tự động trong 1 phút.
```

1. **Bước 1 — Khám phá dữ liệu thực tế (EDA)**: Tìm ra các biến số có tính phân hóa mạnh nhất giữa người trả nợ tốt và người nợ xấu.
2. **Bước 2 — Xác định nguyên nhân gốc rễ (Root Cause)**: Bóc tách bản chất kinh tế đằng sau các con số (chi phí nhà ở cố định, gánh nặng nợ, cú sốc y tế).
3. **Bước 3 — Thiết lập chính sách & ngưỡng an toàn (Credit Policy)**: Định hình các quy tắc nghiệp vụ rõ ràng (chặn cứng khi DTI $\ge$ 0.6 hoặc LTI $\ge$ 0.8; hạ bậc thẩm định khi trễ hạn $\ge$ 3 lần).
4. **Bước 4 — Tự động hóa qua Mô hình & Thang điểm (Scorecard)**: Đóng gói toàn bộ logic vào mô hình LightGBM và hệ thống quy đổi điểm FICO, đưa ra quyết định phê duyệt chỉ trong vài giây.

---

### 2.4 Bài toán cân bằng giữa tăng trưởng doanh số và an toàn vốn

Một hệ thống thẩm định tín dụng giỏi không phải là hệ thống từ chối thật nhiều để giữ nợ xấu bằng 0, vì làm như vậy ngân hàng sẽ tự bóp nghẹt doanh thu. Trọng tâm của bài toán là **tìm điểm cân bằng tối ưu giữa tăng trưởng và an toàn vốn**:

- **Khách hàng an toàn (Điểm FICO > 643)**: Tối ưu trải nghiệm, phê duyệt tự động 100% trong 1 phút, giảm lãi suất để giữ chân khách hàng tốt.
- **Khách hàng ở vùng ranh giới (Điểm FICO 617 – 643)**: Không từ chối vội. Hệ thống chuyển hồ sơ cho chuyên viên tín dụng để đàm phán lại: giảm số tiền vay, kéo dài kỳ hạn để giảm số tiền phải trả mỗi tháng, hoặc áp dụng mức lãi suất bù trừ rủi ro.
- **Khách hàng rủi ro cao (Điểm FICO $\le$ 616 hoặc vi phạm quy tắc chặn)**: Kiên quyết từ chối ngay từ đầu để bảo toàn nguồn vốn.

---

## 3. Chính Sách Tín Dụng & Khung Thẩm Định Theo Từng Nhóm Chỉ Số

Từ các phát hiện trên, toàn bộ thông tin thẩm định được chia thành **5 nhóm chỉ số trọng yếu** để thiết lập chính sách xử lý cụ thể:

---

### 3.1 Nhóm Khả năng tài chính & Đòn bẩy nợ

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

- **Thực tế danh mục**: Khoản vay nhỏ so với thu nhập (LTI < 0.10) chỉ có **11.21%** nợ xấu. Nhưng khi LTI vượt quá 0.70, nợ xấu vọt lên **87.50%**. Tương tự, nếu tổng nghĩa vụ trả nợ hàng tháng ngốn quá 60% – 80% thu nhập (DTI > 0.80), tỷ lệ nợ xấu chạm mức **93.33%**.
- **Chính sách áp dụng**:
  - *Chặn cứng (Knock-out)*: Tự động từ chối nếu LTI $\ge$ 0.8 hoặc DTI $\ge$ 0.6.
  - *Hạ bậc xem xét (Soft Review)*: Nếu LTI $\ge$ 0.3 hoặc DTI $\ge$ 0.4, chuyển chuyên viên đề xuất giảm số tiền vay hoặc kéo dài kỳ hạn.
  - *Cảnh báo hồ sơ ngoại lệ*: Hồ sơ có thu nhập > $150,000/năm hoặc khoản vay > $25,000 bắt buộc phải kiểm tra sao kê thuế/lương để tránh gian lận.

---

### 3.2 Nhóm Lịch sử tín dụng & Kỷ luật thanh toán

Nhóm chỉ số này đo lường uy tín và tính kỷ luật tài chính tích lũy qua thời gian:

| Chỉ số tín dụng | Quan sát từ dữ liệu | Đánh giá & Rủi ro |
|---|---|---|
| **Chưa từng có nợ xấu** | Nợ xấu hiện tại: **18.39%** | Đáng tin cậy, thói quen trả nợ tốt |
| **Đã từng dính nợ xấu** | Nợ xấu hiện tại: **37.81%** (Cao gấp **2.06 lần**) | **Rủi ro rất cao**, tính kỷ luật kém |
| **Dùng 20% – 30% hạn mức thẻ** | Nợ xấu thấp nhất: **21.11%** | Điểm tối ưu, dòng tiền chi tiêu lành mạnh |
| **Dùng > 80% – 90% hạn mức thẻ** | Nợ xấu tăng mạnh | Dấu hiệu cạn kiệt tiền mặt, phải quẹt thẻ để sống |
| **Mở 7 – 8 tài khoản nợ cùng lúc** | Nợ xấu đạt đỉnh: **24.13%** | Phải xoay xở trả nợ nhiều nơi, dễ mất kiểm soát |
| **Thâm niên tín dụng dài (25–30 năm)**| Nợ xấu tăng lên **28.71%** | Nhóm khách hàng lớn tuổi, thu nhập giảm sau nghỉ hưu |

- **Chính sách áp dụng**:
  - Khóa duyệt tự động nếu khách có tiền sử nợ xấu (`default = Y`) kèm theo chậm trả $\ge$ 5 lần.
  - Khách hàng chậm trả từ 3–4 lần bị hạ từ luồng "Duyệt" xuống "Cần xem xét lại".
  - Khách hàng duy trì tỷ lệ dùng thẻ 20%–30% được cộng điểm FICO và hưởng ưu đãi lãi suất.

---

### 3.3 Nhóm Nơi ở & Tài sản bảo đảm

Nơi ở (`person_home_ownership`) phản ánh nền tảng tài sản tích lũy và gánh nặng chi phí sinh hoạt cố định:

| Hình thức nơi ở | Tỷ lệ nợ xấu thực tế | So với mức bình quân (21.8%) | Đánh giá thực tế |
|---|---|---|---|
| **Có nhà riêng hoàn toàn (OWN)** | **7.47%** | Thấp hơn **14.35%** | **Khách hàng vàng (Rất an toàn)** |
| **Đang trả góp mua nhà (MORTGAGE)**| **12.57%** | Thấp hơn **9.25%** | An toàn, có ý thức giữ nhà |
| **Đang thuê nhà (RENT)** | **31.57%** | Cao hơn **9.75%** | **Nhóm rủi ro cao nhất (Gấp 4.2 lần có nhà)**|

- **Chính sách áp dụng**:
  - *Luồng ưu tiên cho người có nhà riêng (`OWN`)*: Cấp hạn mức cao hơn, giải ngân nhanh vì có điểm tựa tài sản.
  - *Siết điều kiện với người thuê nhà (`RENT`)*: Nếu nợ hàng tháng vượt 20% thu nhập, yêu cầu bổ sung sao kê 6 tháng và lịch sử thanh toán tiền thuê nhà đúng hạn.
  - *Thẩm định linh hoạt với nhóm thế chấp (`MORTGAGE`)*: Không tự động từ chối hồ sơ thế chấp ở vùng ranh giới điểm, mà chuyển chuyên viên kiểm tra giá trị thực của căn nhà để tránh bỏ lỡ khách hàng tốt.

---

### 3.4 Nhóm Mục đích sử dụng vốn

Mục đích vay (`loan_intent`) phản ánh động cơ vay và tính khả thi của nguồn tiền hoàn trả:

```
Tỷ lệ nợ xấu theo Mục đích vay:
1. Vay hợp nhất nợ (Đảo nợ) ──► 28.59%  [RỦI RO NHẤT: Kẹt nợ từ trước, mất thanh khoản]
2. Vay chi trả y tế           ──► 26.70%  [Sự cố sức khỏe ngoài ý muốn, giảm thu nhập]
3. Vay sửa chữa nhà           ──► 26.10%  [Dễ phát sinh chi phí vượt dự toán]
4. Vay tiêu dùng cá nhân      ──► 19.89%  [Mức rủi ro trung bình]
5. Vay học tập                ──► 17.22%  [Đầu tư nâng cao kiến thức, tăng thu nhập tương lai]
6. Vay kinh doanh             ──► 14.31%  [AN TOÀN NHẤT: Có phương án sinh lời cụ thể]
```

- **Chính sách áp dụng (Định giá lãi suất theo rủi ro mục đích)**:
  - *Cộng thêm lãi suất bù trừ rủi ro*: Vay hợp nhất nợ/đảo nợ cộng thêm **+1.5% đến +2.0%** vào lãi suất sàn; vay y tế yêu cầu thẩm định người đồng trả nợ.
  - *Ưu đãi lãi suất cho mục đích sinh lời*: Vay học tập và kinh doanh được **giảm 1.0% lãi suất** nếu có kế hoạch kinh doanh hoặc chứng chỉ đào tạo rõ ràng.

---

### 3.5 Nhóm Đặc điểm khách hàng (Độ tuổi, Việc làm, Quốc gia)

1. **Mối liên hệ độ tuổi (Đường cong chữ U)**:
   - Nhóm 20–30 tuổi (nợ xấu 22.21%): Thu nhập chưa ổn định, ít tích lũy.
   - Nhóm 41–50 tuổi (nợ xấu thấp nhất 20.40%): Thu nhập đạt đỉnh cao sự nghiệp, tài sản vững chắc nhất.
   - Nhóm 61–70 tuổi (nợ xấu cao nhất 29.82%): Đã nghỉ hưu, thu nhập giảm sút trong khi chi phí sức khỏe tăng.
   - *Chính sách*: Khách hàng trên 60 tuổi giới hạn kỳ hạn vay tối đa 36 tháng hoặc yêu cầu con cái cùng đứng tên bảo lãnh.
2. **Hình thức việc làm**: Dữ liệu cho thấy toàn thời gian (21.57%), bán thời gian (21.63%), tự do (22.49%) không khác biệt nhiều. Chính sách ngân hàng tập trung vào **dòng tiền thực đổ về tài khoản hàng tháng** thay vì cứng nhắc yêu cầu hợp đồng biên chế.
3. **Địa bàn sinh sống**: Mỹ (21.86%), Anh (21.73%), Canada (21.86%) tương đồng tuyệt đối. Chính sách tín dụng được áp dụng chuẩn hóa xuyên biên giới.

---

### 3.6 Ma trận quy tắc phân luồng hồ sơ (Knock-out, Soft Review, Outlier Flags)

Toàn bộ các phát hiện trên được cụ thể hóa thành 3 tầng quy tắc trong hệ thống xét duyệt tự động:

| Tầng quy tắc | Điều kiện kích hoạt | Hành động của hệ thống |
|---|---|---|
| 🚨 **Tầng 1: Loại trừ thẳng (Knock-out)** | • Có nợ xấu cũ **VÀ** quá hạn $\ge$ 5 lần<br>• Tỷ lệ Khoản vay / Thu nhập (LTI) $\ge$ 0.8<br>• Tỷ lệ Nợ / Thu nhập (DTI) $\ge$ 0.6 | **Ép điểm số $\le 500$, trả về `REJECT` ngay**.<br>Không duyệt cho vay dưới bất kỳ hình thức nào. |
| ⚠️ **Tầng 2: Hạ bậc xem xét (Soft Review)** | • Số lần quá hạn $\ge$ 3 lần<br>• Tỷ lệ Khoản vay / Thu nhập (LTI) $\ge$ 0.3<br>• Tỷ lệ Nợ / Thu nhập (DTI) $\ge$ 0.4 | **Hạ bậc từ "Duyệt" xuống `REVIEW`**.<br>Chuyển hồ sơ sang chuyên viên để yêu cầu giảm số tiền vay hoặc bổ sung người bảo lãnh. |
| 🔍 **Tầng 3: Cảnh báo ngoại lai (Outlier Flags)** | • Thu nhập cá nhân > $150,000/năm<br>• Khoản vay đăng ký > $25,000<br>• Nợ khác bên ngoài > $30,000 | **Bật cờ cảnh báo hồ sơ giá trị lớn**.<br>Yêu cầu chuyên viên kiểm tra chứng từ thuế để phòng ngừa khai khống thu nhập. |

---

### 3.7 Lộ trình triển khai chính sách vào vận hành

Kế hoạch đưa các chính sách trên vào vận hành thực tế được chia làm 3 giai đoạn:

```
[Ngay lập tức: 0–30 ngày]  ──► Kích hoạt bộ lọc chặn cứng rủi ro cao (DTI > 0.6, LTI > 0.8)
[Ngắn hạn: 1–6 tháng]      ──► Áp dụng quy trình thẩm định người thuê nhà & Lãi suất theo mục đích vay
[Dài hạn: 6–12+ tháng]     ──► Tự động hóa toàn diện qua Web/API & Mở rộng sang các thị trường mới
```

1. **Giai đoạn tức thì (0 – 30 ngày)**: Kích hoạt ngay bộ lọc chặn cứng DTI $\ge$ 0.6 và LTI $\ge$ 0.8 để ngăn chặn nguy cơ mất vốn ở các hồ sơ quá tải nợ.
2. **Giai đoạn ngắn hạn (1 – 6 tháng)**: Triển khai kiểm tra bổ sung với nhóm thuê nhà (`RENT`); áp dụng biểu lãi suất cộng thêm đối với các khoản vay đảo nợ (+2%) và ưu đãi cho vay học tập/kinh doanh (-1%).
3. **Giai đoạn dài hạn (6 – 12+ tháng)**: Tích hợp API mô hình Machine Learning vào toàn bộ hệ thống quầy giao dịch và kênh đăng ký trực tuyến; mở rộng mô hình sang các thị trường tương đồng như Úc, New Zealand.

---

## 4. Mô Hình Học Máy & Hệ Thống Chấm Điểm FICO

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
