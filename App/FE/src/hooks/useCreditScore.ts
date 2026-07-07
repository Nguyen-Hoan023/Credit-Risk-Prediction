"use client";

import { useState, useCallback } from "react";
import { LoanFormData, CreditScoreResponse } from "@/lib/types";
import { submitCreditScore } from "@/lib/api";

interface UseCreditScoreReturn {
  result: CreditScoreResponse | null;
  isLoading: boolean;
  error: string | null;
  submit: (data: LoanFormData) => Promise<void>;
  reset: () => void;
}

export function useCreditScore(): UseCreditScoreReturn {
  const [result, setResult] = useState<CreditScoreResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (formData: LoanFormData) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await submitCreditScore({
        person_age: formData.person_age,
        person_income: formData.person_income,
        other_debt: formData.other_debt,
        person_emp_length: formData.person_emp_length,
        loan_amnt: formData.loan_amnt,
        loan_int_rate: formData.loan_int_rate,
        loan_term_months: formData.loan_term_months,
        cb_person_cred_hist_length: formData.cb_person_cred_hist_length,
        open_accounts: formData.open_accounts,
        past_delinquencies: formData.past_delinquencies,
        cb_person_default_on_file: formData.cb_person_default_on_file,
        credit_utilization_ratio: formData.credit_utilization_ratio,
        person_home_ownership: formData.person_home_ownership,
        loan_intent: formData.loan_intent,
        employment_type: formData.employment_type,
        education_level: formData.education_level,
      });

      setResult(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi đánh giá"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { result, isLoading, error, submit, reset };
}
