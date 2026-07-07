"use client";

import { useState, FormEvent, useEffect } from "react";
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
}: {
  id: string;
  label: string;
  icon: string;
  options: { value: string | number; label: string }[];
  value: string | number;
  onChange: (val: string) => void;
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
        <option value="" disabled hidden>-- Chọn --</option>
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

  useEffect(() => {
    const age = Number(personAge);
    const emp = personEmpLength === "" ? null : Number(personEmpLength);
    const cred = credHistLength === "" ? null : Number(credHistLength);

    if (age && emp !== null) {
      const maxEmp = age - 14;
      if (emp > maxEmp) {
        setEmpLengthError("Số năm làm việc không hợp lệ");
      } else {
        setEmpLengthError("");
      }
    } else {
      setEmpLengthError("");
    }

    if (age && cred !== null) {
      const maxCred = age - 18;
      if (cred > maxCred) {
        setCredHistError("Số năm sử dụng tín dụng không hợp lệ");
      } else {
        setCredHistError("");
      }
    } else {
      setCredHistError("");
    }
  }, [personAge, personEmpLength, credHistLength]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (empLengthError) {
      alert("Số năm làm việc không hợp lệ");
      document.getElementById("person_emp_length")?.focus();
      return;
    }

    if (credHistError) {
      alert("Số năm sử dụng tín dụng không hợp lệ");
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
      <FormSection title="Thông tin cá nhân" icon="👤">
        <InputField
          id="person_age"
          label="Tuổi"
          icon=""
          hint="Từ 18 đến 80 tuổi"
          value={personAge}
          onChange={setPersonAge}
          min="18"
          max="80"
          placeholder="VD: 35"
        />
        <InputField
          id="person_income"
          label="Thu nhập hàng năm (USD)"
          icon=""
          hint="Thu nhập trước thuế"
          value={personIncome}
          onChange={setPersonIncome}
          min="0"
          placeholder="VD: 75000"
        />
        <InputField
          id="person_emp_length"
          label="Số năm làm việc"
          icon=""
          hint="Để trống nếu không có"
          value={personEmpLength}
          onChange={setPersonEmpLength}
          required={false}
          min="0"
          max="60"
          placeholder="VD: 8"
          error={empLengthError}
        />
        <SelectField
          id="education_level"
          label="Trình độ học vấn"
          icon=""
          options={EDUCATION_LEVEL_OPTIONS}
          value={educationLevel}
          onChange={setEducationLevel}
        />
        <SelectField
          id="employment_type"
          label="Loại hình công việc"
          icon=""
          options={EMPLOYMENT_TYPE_OPTIONS}
          value={employmentType}
          onChange={setEmploymentType}
        />
        <SelectField
          id="person_home_ownership"
          label="Tình trạng nhà ở"
          icon=""
          options={HOME_OWNERSHIP_OPTIONS}
          value={homeOwnership}
          onChange={setHomeOwnership}
        />
      </FormSection>

      {/* 2. Thông tin khoản vay */}
      <FormSection title="Thông tin khoản vay" icon="💳">
        <InputField
          id="loan_amnt"
          label="Số tiền muốn vay (USD)"
          icon=""
          hint="Số tiền cần vay"
          value={loanAmnt}
          onChange={setLoanAmnt}
          min="0"
          placeholder="VD: 25000"
        />
        <SelectField
          id="loan_term_months"
          label="Thời hạn vay"
          icon=""
          options={LOAN_TERM_OPTIONS}
          value={loanTermMonths}
          onChange={setLoanTermMonths}
        />
        <InputField
          id="loan_int_rate"
          label="Lãi suất (%)"
          icon=""
          hint="Để trống nếu chưa biết"
          value={loanIntRate}
          onChange={setLoanIntRate}
          required={false}
          step="0.01"
          min="0"
          max="40"
          placeholder="VD: 11.5"
        />
        <SelectField
          id="loan_intent"
          label="Mục đích vay"
          icon=""
          options={LOAN_INTENT_OPTIONS}
          value={loanIntent}
          onChange={setLoanIntent}
        />
      </FormSection>

      {/* 3. Lịch sử tín dụng */}
      <FormSection title="Lịch sử tín dụng" icon="📋">
        <InputField
          id="cb_person_cred_hist_length"
          label="Lịch sử tín dụng (năm)"
          icon=""
          hint="Số năm có lịch sử tín dụng"
          value={credHistLength}
          onChange={setCredHistLength}
          min="0"
          placeholder="VD: 12"
          error={credHistError}
        />
        <InputField
          id="open_accounts"
          label="Số tài khoản tín dụng"
          icon=""
          hint="Thẻ tín dụng, khoản vay đang có"
          value={openAccounts}
          onChange={setOpenAccounts}
          min="0"
          placeholder="VD: 4"
        />
        <InputField
          id="past_delinquencies"
          label="Số lần trễ hạn"
          icon=""
          hint="Số lần trễ hạn thanh toán"
          value={pastDelinquencies}
          onChange={setPastDelinquencies}
          min="0"
          placeholder="VD: 0"
        />
        <SelectField
          id="cb_person_default_on_file"
          label="Có tiền sử vỡ nợ?"
          icon=""
          options={DEFAULT_ON_FILE_OPTIONS}
          value={defaultOnFile}
          onChange={setDefaultOnFile}
        />
        <InputField
          id="credit_utilization_ratio"
          label="Tỷ lệ sử dụng tín dụng"
          icon=""
          hint="0.0 = không sử dụng, 1.0 = hết hạn mức"
          value={creditUtilization}
          onChange={setCreditUtilization}
          step="0.01"
          min="0"
          max="1"
          placeholder="VD: 0.28"
        />
      </FormSection>

      {/* 4. Nợ khác */}
      <FormSection title="Tài chính khác" icon="💰">
        <InputField
          id="other_debt"
          label="Nợ khác (USD)"
          icon=""
          hint="Các khoản nợ khác đang có"
          value={otherDebt}
          onChange={setOtherDebt}
          min="0"
          placeholder="VD: 5000"
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
              Đang đánh giá...
            </>
          ) : (
            <>
              <span></span>
              Gửi đánh giá
            </>
          )}
        </button>
      </div>
    </form>
  );
}
