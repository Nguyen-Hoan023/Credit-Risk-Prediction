import { CreditScoreRequest, CreditScoreResponse, RecommendationItem } from "./types";
import { API_BASE_URL } from "./constants";

/**
 * Gửi hồ sơ vay lên backend để đánh giá credit score.
 * Kết quả 100% từ mô hình LightGBM thực tế trên server.
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
    let detail = `Server error (${response.status})`;
    try {
      const errBody = await response.json();
      if (errBody?.detail) detail = errBody.detail;
    } catch {
      // Giữ nguyên message mặc định
    }
    throw new Error(detail);
  }

  return await response.json();
}

/**
 * Known reason codes defined in i18n dictionary.
 */
const KNOWN_REASON_CODES = new Set([
  "GOOD_SCORE",
  "MEDIUM_SCORE",
  "HIGH_RISK_SCORE",
  "PRIOR_DEFAULT",
  "PAST_DELINQUENCIES",
  "VERY_HIGH_LTI",
  "HIGH_LTI",
  "CRITICAL_DTI",
  "HIGH_DTI",
  "RENTER_NO_COLLATERAL",
  "OWNER_HAS_COLLATERAL",
  "RISKY_LOAN_PURPOSE",
  "GOOD_LOAN_PURPOSE",
]);

/**
 * Normalize recommendations from DB — handles old strings, stringified objects, and new object formats.
 */
function normalizeRecommendations(raw: unknown): RecommendationItem[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item): RecommendationItem | null => {
      if (!item) return null;

      // Nếu item là chuỗi string
      if (typeof item === "string") {
        const trimmed = item.trim();

        // Thử parse JSON nếu chuỗi có dạng JSON string như "{\"code\":\"GOOD_SCORE\"}"
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
          try {
            const parsed = JSON.parse(trimmed);
            if (parsed && typeof parsed === "object" && parsed.code) {
              return {
                code: String(parsed.code),
                params: parsed.params && typeof parsed.params === "object" ? parsed.params : {},
              };
            }
          } catch {
            // Không parse được JSON thì tiếp tục xử lý bên dưới
          }
        }

        // Nếu chuỗi khớp với một trong các mã Reason Code chuẩn
        if (KNOWN_REASON_CODES.has(trimmed)) {
          return { code: trimmed, params: {} };
        }

        // Nếu là văn bản tiếng Việt cũ (Legacy text)
        return { code: "LEGACY_TEXT", params: { text: trimmed } };
      }

      // Nếu item là đối tượng (Object) { code, params }
      if (typeof item === "object") {
        const obj = item as Record<string, any>;
        const code = typeof obj.code === "string" && obj.code.trim() !== "" ? obj.code : "LEGACY_TEXT";
        const params = obj.params && typeof obj.params === "object" ? obj.params : {};

        if (code === "LEGACY_TEXT" && !params.text) {
          params.text = JSON.stringify(obj);
        }

        return { code, params };
      }

      return { code: "LEGACY_TEXT", params: { text: String(item) } };
    })
    .filter((item): item is RecommendationItem => item !== null);
}

/**
 * Normalize decision from DB — handles both old (Vietnamese) and new (English code) format.
 */
function normalizeDecision(decision: string | undefined, riskLevel: string, approved: boolean): string {
  if (!decision) {
    return riskLevel === "medium" ? "REVIEW" : (approved ? "APPROVE" : "REJECT");
  }
  switch (decision) {
    case "PHÊ DUYỆT": return "APPROVE";
    case "XEM XÉT": return "REVIEW";
    case "TỪ CHỐI": return "REJECT";
    default: return decision;
  }
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

    return data.map((item: any) => {
      const normalizedDecision = normalizeDecision(
        item.decision,
        (item.risk_tier || "high").toLowerCase(),
        false
      );
      return {
        id: String(item.id),
        created_at: item.created_at,
        person_age: item.person_age,
        person_income: item.person_income,
        loan_amnt: item.loan_amnt,
        credit_score: item.credit_score,
        risk_level: (item.risk_tier || "high").toLowerCase() as any,
        approved: normalizedDecision === "APPROVE",
        decision: normalizedDecision,
        recommendations: normalizeRecommendations(item.top_reasons),
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
      };
    });
  } catch (error) {
    console.error("Failed to fetch database history:", error);
    throw error;
  }
}

/**
 * Xóa toàn bộ lịch sử đánh giá từ backend database (PostgreSQL)
 */
export async function clearCreditHistory(adminKey?: string): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (adminKey) {
      headers["X-Admin-Key"] = adminKey;
    }

    const response = await fetch(`${API_BASE_URL}/api/history`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      let detail = `API Error: ${response.status}`;
      try {
        const errBody = await response.json();
        if (errBody?.detail) detail = errBody.detail;
      } catch {
        // Fallback
      }
      throw new Error(detail);
    }

    return true;
  } catch (error) {
    console.error("Failed to clear database history:", error);
    throw error;
  }
}
