// Form Data - Du lieu nguoi dung nhap
export interface LoanFormData {
  // Thong tin ca nhan
  person_age: number;
  person_income: number;
  person_emp_length: number | null; // Co the de trong
  education_level: string;
  employment_type: string;
  person_home_ownership: string;

  // Thong tin khoan vay
  loan_amnt: number;
  loan_int_rate: number | null; // Co the de trong
  loan_term_months: number;
  loan_intent: string;

  // Lich su tin dung
  cb_person_cred_hist_length: number;
  open_accounts: number;
  past_delinquencies: number;
  cb_person_default_on_file: string; // "Y" | "N"
  credit_utilization_ratio: number;

  // No khac
  other_debt: number;
}

// API Request - Gui len backend
export interface CreditScoreRequest {
  person_age: number;
  person_income: number;
  other_debt: number;
  person_emp_length: number | null;
  loan_amnt: number;
  loan_int_rate: number | null;
  loan_term_months: number;
  cb_person_cred_hist_length: number;
  open_accounts: number;
  past_delinquencies: number;
  cb_person_default_on_file: string;
  credit_utilization_ratio: number;
  person_home_ownership: string;
  loan_intent: string;
  employment_type: string;
  education_level: string;
}

// API Response - Ket qua tu backend
export interface CreditScoreResponse {
  credit_score: number;
  approval_probability: number;
  risk_level: RiskLevel;
  approved: boolean;
  decision: string;
  recommendations: string[];
  probability_of_default?: number;
}

// Risk Levels
export type RiskLevel = "low" | "medium" | "high";

// Lich su ho so
export interface HistoryRecord {
  id: string;
  created_at: string;
  person_age: number;
  person_income: number;
  loan_amnt: number;
  credit_score: number;
  risk_level: RiskLevel;
  approved: boolean;
  decision: string;
  
  // Cac truong bo sung de xem chi tiet (tuy chon de tuong thich voi du lieu cu)
  formData?: LoanFormData;
  recommendations?: string[];
  probability_of_default?: number;
  approval_probability?: number;
}
