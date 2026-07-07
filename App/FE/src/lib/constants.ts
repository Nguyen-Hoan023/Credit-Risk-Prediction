import { RiskLevel } from "./types";

// Score Range (tu metadata.json)
export const SCORE_MIN = 300;
export const SCORE_MAX = 850;
export const SCORE_RANGE = SCORE_MAX - SCORE_MIN; // 550

// Risk Band Config (tu metadata.json)
export const RISK_BANDS = {
  high_risk_max: 616,
  medium_risk_max: 643,
} as const;

// Threshold
export const APPROVAL_THRESHOLD = 0.5;

// Risk Level Helpers
export function getRiskLevel(score: number): RiskLevel {
  if (score <= RISK_BANDS.high_risk_max) return "high";
  if (score <= RISK_BANDS.medium_risk_max) return "medium";
  return "low";
}

export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case "low":
      return "Rủi ro thấp";
    case "medium":
      return "Rủi ro trung bình";
    case "high":
      return "Rủi ro cao";
  }
}

export function getApprovalLabel(decision: string): string {
  switch (decision) {
    case "PHÊ DUYỆT":
      return "Approved";
    case "XEM XÉT":
      return "Review";
    case "TỪ CHỐI":
      return "Rejected";
    default:
      return decision;
  }
}

export function getApprovalTitle(decision: string): string {
  switch (decision) {
    case "PHÊ DUYỆT":
      return "Hồ sơ được PHÊ DUYỆT";
    case "XEM XÉT":
      return "Hồ sơ cần XEM XÉT";
    case "TỪ CHỐI":
      return "Hồ sơ bị TỪ CHỐI";
    default:
      return "Đánh giá hồ sơ";
  }
}

// Color Scheme
export const RISK_COLORS: Record<
  RiskLevel,
  {
    primary: string;
    bg: string;
    border: string;
    badge_bg: string;
    badge_text: string;
    gauge_stroke: string;
    gauge_trail: string;
  }
> = {
  low: {
    primary: "#16A34A",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    badge_bg: "#DCFCE7",
    badge_text: "#166534",
    gauge_stroke: "#16A34A",
    gauge_trail: "#E5E7EB",
  },
  medium: {
    primary: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    badge_bg: "#FEF3C7",
    badge_text: "#92400E",
    gauge_stroke: "#D97706",
    gauge_trail: "#E5E7EB",
  },
  high: {
    primary: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    badge_bg: "#FEE2E2",
    badge_text: "#991B1B",
    gauge_stroke: "#DC2626",
    gauge_trail: "#E5E7EB",
  },
};

// Form Select Options
export const LOAN_TERM_OPTIONS = [
  { value: 12, label: "12 tháng (1 năm)" },
  { value: 24, label: "24 tháng (2 năm)" },
  { value: 36, label: "36 tháng (3 năm)" },
  { value: 60, label: "60 tháng (5 năm)" },
];

export const HOME_OWNERSHIP_OPTIONS = [
  { value: "RENT", label: "Thuê (Rent)" },
  { value: "OWN", label: "Sở hữu (Own)" },
  { value: "MORTGAGE", label: "Thế chấp (Mortgage)" },
  { value: "OTHER", label: "Khác (Other)" },
];

export const LOAN_INTENT_OPTIONS = [
  { value: "PERSONAL", label: "Cá nhân (Personal)" },
  { value: "MEDICAL", label: "Y tế (Medical)" },
  { value: "EDUCATION", label: "Giáo dục (Education)" },
  { value: "VENTURE", label: "Kinh doanh (Venture)" },
  { value: "HOMEIMPROVEMENT", label: "Sửa nhà (Home Improvement)" },
  { value: "DEBTCONSOLIDATION", label: "Hợp nhất nợ (Debt Consolidation)" },
];

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "Full-time", label: "Toàn thời gian (Full-time)" },
  { value: "Part-time", label: "Bán thời gian (Part-time)" },
  { value: "Self-employed", label: "Tự kinh doanh (Self-employed)" },
  { value: "Unemployed", label: "Thất nghiệp (Unemployed)" },
];

export const EDUCATION_LEVEL_OPTIONS = [
  { value: "High School", label: "Trung học (High School)" },
  { value: "Bachelor", label: "Đại học (Bachelor)" },
  { value: "Master", label: "Thạc sĩ (Master)" },
  { value: "PhD", label: "Tiến sĩ (PhD)" },
];

export const DEFAULT_ON_FILE_OPTIONS = [
  { value: "N", label: "Không (No)" },
  { value: "Y", label: "Có (Yes)" },
];

// API Config
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
