import { CreditScoreRequest, CreditScoreResponse } from "./types";
import { API_BASE_URL } from "./constants";

/**
 * Gửi hồ sơ vay lên backend để đánh giá credit score.
 * Kết quả 100% từ mô hình LightGBM thực tế trên server.
 * Nếu backend không phản hồi  ném lỗi rõ ràng, không dùng dữ liệu giả.
 */
export async function submitCreditScore(
  data: CreditScoreRequest
): Promise<CreditScoreResponse> {
  const response = await fetch(`${API_BASE_URL}/api/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    // Cố đọc message lỗi chi tiết từ FastAPI nếu có
    let detail = `Lỗi máy chủ (${response.status})`;
    try {
      const errBody = await response.json();
      if (errBody?.detail) detail = errBody.detail;
    } catch {
      // Giữ nguyên message mặc định nếu không đọc được body
    }
    throw new Error(detail);
  }

  return await response.json();
}

/**
 * Lấy lịch sử đánh giá từ backend database (PostgreSQL)
 */
export async function fetchCreditHistory(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/history`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    // Map dữ liệu từ database sang cấu trúc HistoryRecord ở Frontend
    return data.map((item: any) => ({
      id: String(item.id),
      created_at: item.created_at,
      person_age: item.person_age,
      person_income: item.person_income,
      loan_amnt: item.loan_amnt,
      credit_score: item.credit_score,
      risk_level: (item.risk_tier || "high").toLowerCase() as any,
      approved: item.decision === "PHÊ DUYỆT",
      decision: item.decision,
      recommendations: item.top_reasons || [],
      probability_of_default: item.proba,
      approval_probability: item.proba !== undefined ? Number(((1 - item.proba) * 100).toFixed(2)) : 0,
      formData: {
        person_age: item.person_age,
        person_income: item.person_income,
        person_emp_length: item.person_emp_length,
        education_level: item.education_level || "",
        employment_type: item.employment_type || "",
        person_home_ownership: item.person_home_ownership || "",
        loan_amnt: item.loan_amnt,
        loan_int_rate: item.loan_int_rate,
        loan_term_months: item.loan_term_months,
        loan_intent: item.loan_intent,
        cb_person_cred_hist_length: item.cb_person_cred_hist_length || 0,
        open_accounts: item.open_accounts || 0,
        past_delinquencies: item.past_delinquencies || 0,
        cb_person_default_on_file: item.has_prior_default === 1 ? "Y" : "N",
        credit_utilization_ratio: item.credit_utilization_ratio || 0,
        other_debt: item.other_debt || 0,
      }
    }));
  } catch (error) {
    console.error("Failed to fetch database history:", error);
    throw error;
  }
}

/**
 * Xóa toàn bộ lịch sử đánh giá từ backend database (PostgreSQL)
 */
export async function clearCreditHistory(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/history`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Failed to clear database history:", error);
    throw error;
  }
}

