"use client";

import { useState, FormEvent, useEffect } from "react";
import { useTranslations } from "next-intl";
import { LoanFormData } from "@/lib/types";
import {
  LOAN_TERM_OPTIONS,
  HOME_OWNERSHIP_OPTIONS,
  LOAN_INTENT_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  DEFAULT_ON_FILE_OPTIONS,
} from "@/lib/constants";

interface LoanFormProps {
  onSubmit: (data: LoanFormData) => void;
  isLoading: boolean;
}

// Sub-components

function FormSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6">
      <legend className="flex items-center gap-2 text-base font-bold text-slate-800">
        <span>{icon}</span> {title}
      </legend>
      <div className="mt-4 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
        {children}
      </div>
    </fieldset>
  );
}

function InputField({
  id,
  label,
  icon,
  hint,
  type = "number",
  value,
  onChange,
  required = true,
  step,
  min,
  max,
  placeholder,
  error,
}: {
  id: string;
  label: string;
  icon: string;
  hint?: string;
  type?: string;
  value: string | number;
  onChange: (val: string) => void;
  required?: boolean;
  step?: string;
  min?: string;
  max?: string;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-slate-700"
      >
        <span className="text-base">{icon}</span> {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        step={step}
        min={min}
        max={max}
        placeholder={placeholder}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 bg-red-50/10 focus:border-red-500 focus:ring-red-500/20"
            : "border-slate-300 bg-white focus:border-blue-500 focus:ring-blue-500/20"
        }`}
      />
      {error ? (
        <p className="mt-1 text-xs font-semibold text-red-500">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>
      )}
    </div>
  );
}

function SelectField({
  id,
  label,
  icon,
  options,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  icon: string;
  options: { value: string | number; label: string }[];
  value: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-slate-700"
      >
        <span className="text-base">{icon}</span> {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <option value="" disabled hidden>{placeholder || "-- Select --"}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Main Form

export default function LoanForm({ onSubmit, isLoading }: LoanFormProps) {
  const t = useTranslations("form");
  const tOpt = useTranslations("options");

  // State cho tất cả các field
  const [personAge, setPersonAge] = useState("");
  const [personIncome, setPersonIncome] = useState("");
  const [personEmpLength, setPersonEmpLength] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [homeOwnership, setHomeOwnership] = useState("");

  const [loanAmnt, setLoanAmnt] = useState("");
  const [loanIntRate, setLoanIntRate] = useState("");
  const [loanTermMonths, setLoanTermMonths] = useState("");
  const [loanIntent, setLoanIntent] = useState("");

  const [credHistLength, setCredHistLength] = useState("");
  const [openAccounts, setOpenAccounts] = useState("");
  const [pastDelinquencies, setPastDelinquencies] = useState("");
  const [defaultOnFile, setDefaultOnFile] = useState("");
  const [creditUtilization, setCreditUtilization] = useState("");

  const [otherDebt, setOtherDebt] = useState("");

  // States cho lỗi cảnh báo sớm (Real-time Validation)
  const [empLengthError, setEmpLengthError] = useState("");
  const [credHistError, setCredHistError] = useState("");

  // Helper: translate labelKey to label using tOpt
  const translateOptions = (options: { value: string | number; labelKey: string }[]) => {
    return options.map((opt) => ({
      value: opt.value,
      label: tOpt(opt.labelKey.replace("options.", "") as any),
    }));
  };

  useEffect(() => {
    const age = Number(personAge);
    const emp = personEmpLength === "" ? null : Number(personEmpLength);
    const cred = credHistLength === "" ? null : Number(credHistLength);

    if (age && emp !== null) {
      const maxEmp = age - 14;
      if (emp > maxEmp) {
        setEmpLengthError(t("empLengthError"));
      } else {
        setEmpLengthError("");
      }
    } else {
      setEmpLengthError("");
    }

    if (age && cred !== null) {
      const maxCred = age - 18;
      if (cred > maxCred) {
        setCredHistError(t("credHistError"));
      } else {
        setCredHistError("");
      }
    } else {
      setCredHistError("");
    }
  }, [personAge, personEmpLength, credHistLength, t]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (empLengthError) {
      alert(t("empLengthError"));
      document.getElementById("person_emp_length")?.focus();
      return;
    }

    if (credHistError) {
      alert(t("credHistError"));
      document.getElementById("cb_person_cred_hist_length")?.focus();
      return;
    }

    const age = Number(personAge);
    const empLength = personEmpLength === "" ? null : Number(personEmpLength);
    const credHist = Number(credHistLength);

    const data: LoanFormData = {
      person_age: age,
      person_income: Number(personIncome),
      person_emp_length: empLength,
      education_level: educationLevel,
      employment_type: employmentType,
      person_home_ownership: homeOwnership,

      loan_amnt: Number(loanAmnt),
      loan_int_rate: loanIntRate === "" ? null : Number(loanIntRate),
      loan_term_months: Number(loanTermMonths),
      loan_intent: loanIntent,

      cb_person_cred_hist_length: credHist,
      open_accounts: Number(openAccounts),
      past_delinquencies: Number(pastDelinquencies),
      cb_person_default_on_file: defaultOnFile,
      credit_utilization_ratio: Number(creditUtilization),

      other_debt: Number(otherDebt),
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 1. Thông tin cá nhân */}
      <FormSection title={t("personalInfo")} icon="👤">
        <InputField
          id="person_age"
          label={t("age")}
          icon=""
          hint={t("ageHint")}
          value={personAge}
          onChange={setPersonAge}
          min="18"
          max="80"
          placeholder={t("agePlaceholder")}
        />
        <InputField
          id="person_income"
          label={t("income")}
          icon=""
          hint={t("incomeHint")}
          value={personIncome}
          onChange={setPersonIncome}
          min="0"
          placeholder={t("incomePlaceholder")}
        />
        <InputField
          id="person_emp_length"
          label={t("empLength")}
          icon=""
          hint={t("empLengthHint")}
          value={personEmpLength}
          onChange={setPersonEmpLength}
          required={false}
          min="0"
          max="60"
          placeholder={t("empLengthPlaceholder")}
          error={empLengthError}
        />
        <SelectField
          id="education_level"
          label={t("educationLevel")}
          icon=""
          options={translateOptions(EDUCATION_LEVEL_OPTIONS)}
          value={educationLevel}
          onChange={setEducationLevel}
          placeholder={t("selectPlaceholder")}
        />
        <SelectField
          id="employment_type"
          label={t("employmentType")}
          icon=""
          options={translateOptions(EMPLOYMENT_TYPE_OPTIONS)}
          value={employmentType}
          onChange={setEmploymentType}
          placeholder={t("selectPlaceholder")}
        />
        <SelectField
          id="person_home_ownership"
          label={t("homeOwnership")}
          icon=""
          options={translateOptions(HOME_OWNERSHIP_OPTIONS)}
          value={homeOwnership}
          onChange={setHomeOwnership}
          placeholder={t("selectPlaceholder")}
        />
      </FormSection>

      {/* 2. Thông tin khoản vay */}
      <FormSection title={t("loanInfo")} icon="💳">
        <InputField
          id="loan_amnt"
          label={t("loanAmount")}
          icon=""
          hint={t("loanAmountHint")}
          value={loanAmnt}
          onChange={setLoanAmnt}
          min="0"
          placeholder={t("loanAmountPlaceholder")}
        />
        <SelectField
          id="loan_term_months"
          label={t("loanTerm")}
          icon=""
          options={translateOptions(LOAN_TERM_OPTIONS)}
          value={loanTermMonths}
          onChange={setLoanTermMonths}
          placeholder={t("selectPlaceholder")}
        />
        <InputField
          id="loan_int_rate"
          label={t("loanIntRate")}
          icon=""
          hint={t("loanIntRateHint")}
          value={loanIntRate}
          onChange={setLoanIntRate}
          required={false}
          step="0.01"
          min="0"
          max="40"
          placeholder={t("loanIntRatePlaceholder")}
        />
        <SelectField
          id="loan_intent"
          label={t("loanIntent")}
          icon=""
          options={translateOptions(LOAN_INTENT_OPTIONS)}
          value={loanIntent}
          onChange={setLoanIntent}
          placeholder={t("selectPlaceholder")}
        />
      </FormSection>

      {/* 3. Lịch sử tín dụng */}
      <FormSection title={t("creditHistory")} icon="📋">
        <InputField
          id="cb_person_cred_hist_length"
          label={t("credHistLength")}
          icon=""
          hint={t("credHistLengthHint")}
          value={credHistLength}
          onChange={setCredHistLength}
          min="0"
          placeholder={t("credHistLengthPlaceholder")}
          error={credHistError}
        />
        <InputField
          id="open_accounts"
          label={t("openAccounts")}
          icon=""
          hint={t("openAccountsHint")}
          value={openAccounts}
          onChange={setOpenAccounts}
          min="0"
          placeholder={t("openAccountsPlaceholder")}
        />
        <InputField
          id="past_delinquencies"
          label={t("pastDelinquencies")}
          icon=""
          hint={t("pastDelinquenciesHint")}
          value={pastDelinquencies}
          onChange={setPastDelinquencies}
          min="0"
          placeholder={t("pastDelinquenciesPlaceholder")}
        />
        <SelectField
          id="cb_person_default_on_file"
          label={t("defaultOnFile")}
          icon=""
          options={translateOptions(DEFAULT_ON_FILE_OPTIONS)}
          value={defaultOnFile}
          onChange={setDefaultOnFile}
          placeholder={t("selectPlaceholder")}
        />
        <InputField
          id="credit_utilization_ratio"
          label={t("creditUtilization")}
          icon=""
          hint={t("creditUtilizationHint")}
          value={creditUtilization}
          onChange={setCreditUtilization}
          step="0.01"
          min="0"
          max="1"
          placeholder={t("creditUtilizationPlaceholder")}
        />
      </FormSection>

      {/* 4. Nợ khác */}
      <FormSection title={t("otherFinance")} icon="💰">
        <InputField
          id="other_debt"
          label={t("otherDebt")}
          icon=""
          hint={t("otherDebtHint")}
          value={otherDebt}
          onChange={setOtherDebt}
          min="0"
          placeholder={t("otherDebtPlaceholder")}
        />
      </FormSection>

      {/* Submit Button */}
      <div className="text-center">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-bold text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <svg
                className="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {t("submitting")}
            </>
          ) : (
            <>
              <span></span>
              {t("submit")}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
