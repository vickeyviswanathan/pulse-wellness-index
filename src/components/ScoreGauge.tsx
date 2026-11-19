import React from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import { getScoreTier } from '../lib/scoring';

interface ScoreGaugeProps {
  score: number;
  delta: number;
  holisticBonus: number;
  rankLabel?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  delta,
  holisticBonus,
  rankLabel = '#4 Engineering · #2 Delta League',
}) => {
  const outerR = 86;
  const innerR = 72;
  const outerCirc = 2 * Math.PI * outerR;
  const innerCirc = 2 * Math.PI * innerR;
  const scorePct = Math.max(0, Math.min(1, score / 1000));
  const holisticPct = Math.max(0, Math.min(1, holisticBonus / 100));
  const tier = getScoreTier(score);

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#062C23] via-[#0B1F2A] to-[#0F172A] p-6 text-white shadow-xl">
      {/* Subtle ambient glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-sky-400/15 blur-3xl" />

      <div className="relative flex flex-col items-center">
        <div className="relative flex h-52 w-52 items-center justify-center">
          <svg className="h-52 w-52 -rotate-90 transform" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="pulseMainArc" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="55%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
              <linearGradient id="pulseHolisticArc" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            {/* Outer Track: Total PULSE Score */}
            <circle cx="100" cy="100" r={outerR} stroke="rgba(255,255,255,0.08)" strokeWidth="11" fill="none" />
            <circle
              cx="100"
              cy="100"
              r={outerR}
              stroke="url(#pulseMainArc)"
              strokeWidth="11"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={outerCirc}
              strokeDashoffset={outerCirc * (1 - scorePct)}
              className="transition-all duration-700 ease-out"
            />

            {/* Inner Track: Holistic Bonus Halo */}
            <circle cx="100" cy="100" r={innerR} stroke="rgba(255,255,255,0.05)" strokeWidth="5" fill="none" />
            <circle
              cx="100"
              cy="100"
              r={innerR}
              stroke="url(#pulseHolisticArc)"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={innerCirc}
              strokeDashoffset={innerCirc * (1 - holisticPct)}
              className="transition-all duration-700 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300/80">
              PULSE Index
            </span>
            <span className="font-mono-num mt-0.5 text-5xl font-extrabold tracking-tight text-white">
              {score}
            </span>
            <span className="text-[11px] font-medium text-slate-400">of 1,000 pts</span>
            <span className="mt-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
              {tier.label}
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] font-bold text-emerald-300 ring-1 ring-emerald-400/25">
            <TrendingUp className="h-3.5 w-3.5" />
            {delta >= 0 ? `+${delta}` : delta} pts vs last quarter
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-3 py-1 text-[11px] font-bold text-amber-300 ring-1 ring-amber-400/25">
            <Sparkles className="h-3.5 w-3.5" />+{holisticBonus} Holistic Halo
          </span>
        </div>

        <p className="mt-2.5 text-[11px] font-medium text-slate-400">{rankLabel}</p>
      </div>
    </div>
  );
};
