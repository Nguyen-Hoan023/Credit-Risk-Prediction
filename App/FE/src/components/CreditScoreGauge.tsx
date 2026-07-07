"use client";

import { useEffect, useState } from "react";
import { RiskLevel } from "@/lib/types";
import { SCORE_MIN, SCORE_MAX, RISK_COLORS } from "@/lib/constants";

interface CreditScoreGaugeProps {
  score: number;
  riskLevel: RiskLevel;
}

export default function CreditScoreGauge({
  score,
  riskLevel,
}: CreditScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(SCORE_MIN);
  const [dashOffset, setDashOffset] = useState(283);

  const colors = RISK_COLORS[riskLevel];

  // Tính phần trăm score trong khoảng 300–850
  const percentage = ((score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * 100;
  const targetDashOffset = 283 - (283 * percentage) / 100;

  useEffect(() => {
    // Animate score number
    const duration = 1500;
    const startTime = Date.now();
    const startScore = SCORE_MIN;

    const animateNumber = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing: ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedScore(
        Math.round(startScore + (score - startScore) * eased)
      );

      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      }
    };

    requestAnimationFrame(animateNumber);

    // Animate circle — trigger after a brief delay for CSS transition
    const timer = setTimeout(() => {
      setDashOffset(targetDashOffset);
    }, 100);

    return () => clearTimeout(timer);
  }, [score, targetDashOffset]);

  return (
    <div className="relative mx-auto flex h-52 w-52 items-center justify-center">
      <svg
        className="-rotate-90"
        width="200"
        height="200"
        viewBox="0 0 100 100"
      >
        {/* Background circle (trail) */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={colors.gauge_trail}
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Animated progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={colors.gauge_stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="283"
          strokeDashoffset={dashOffset}
          style={{
            transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-5xl font-extrabold tabular-nums"
          style={{ color: colors.primary }}
        >
          {animatedScore}
        </span>
        <span className="mt-1 text-sm text-slate-400">/ {SCORE_MAX}</span>
      </div>
    </div>
  );
}
