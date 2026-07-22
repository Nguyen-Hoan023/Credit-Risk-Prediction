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

// I18N: Decision codes returned by backend (standardized English codes)
export type DecisionCode = "APPROVE" | "REVIEW" | "REJECT";

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

// Form Select Options — value-only (labels provided by i18n)
// Each option has: value (sent to API) + labelKey (used by t() for translation)
export const LOAN_TERM_OPTIONS = [
  { value: 12, labelKey: "options.loanTerm.12" },
  { value: 24, labelKey: "options.loanTerm.24" },
  { value: 36, labelKey: "options.loanTerm.36" },
  { value: 60, labelKey: "options.loanTerm.60" },
];

export const HOME_OWNERSHIP_OPTIONS = [
  { value: "RENT", labelKey: "options.homeOwnership.RENT" },
  { value: "OWN", labelKey: "options.homeOwnership.OWN" },
  { value: "MORTGAGE", labelKey: "options.homeOwnership.MORTGAGE" },
  { value: "OTHER", labelKey: "options.homeOwnership.OTHER" },
];

export const LOAN_INTENT_OPTIONS = [
  { value: "PERSONAL", labelKey: "options.loanIntent.PERSONAL" },
  { value: "MEDICAL", labelKey: "options.loanIntent.MEDICAL" },
  { value: "EDUCATION", labelKey: "options.loanIntent.EDUCATION" },
  { value: "VENTURE", labelKey: "options.loanIntent.VENTURE" },
  { value: "HOMEIMPROVEMENT", labelKey: "options.loanIntent.HOMEIMPROVEMENT" },
  { value: "DEBTCONSOLIDATION", labelKey: "options.loanIntent.DEBTCONSOLIDATION" },
];

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "Full-time", labelKey: "options.employmentType.fullTime" },
  { value: "Part-time", labelKey: "options.employmentType.partTime" },
  { value: "Self-employed", labelKey: "options.employmentType.selfEmployed" },
  { value: "Unemployed", labelKey: "options.employmentType.unemployed" },
];

export const EDUCATION_LEVEL_OPTIONS = [
  { value: "High School", labelKey: "options.educationLevel.highSchool" },
  { value: "Bachelor", labelKey: "options.educationLevel.bachelor" },
  { value: "Master", labelKey: "options.educationLevel.master" },
  { value: "PhD", labelKey: "options.educationLevel.phd" },
];

export const DEFAULT_ON_FILE_OPTIONS = [
  { value: "N", labelKey: "options.defaultOnFile.no" },
  { value: "Y", labelKey: "options.defaultOnFile.yes" },
];

// API Config
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
