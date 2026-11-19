import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Award,
  CheckCircle2,
  Download,
  Droplets,
  Eye,
  EyeOff,
  FileText,
  Flame,
  HeartPulse,
  Home,
  Lock,
  Play,
  ShieldCheck,
  Sparkles,
  Trophy,
  Unlock,
  Wind,
  X,
} from 'lucide-react';
import type { EmployeeProfile, EmployeeTab, WorkshopReport } from '../types/pulse';
import { computeHolisticTotal, computePulseScore } from '../lib/scoring';
import {
  DEMO_EMPLOYEE_PRESETS,
  DEPARTMENT_STANDINGS,
  INTER_COMPANY_STANDINGS,
  PEER_STANDINGS,
} from '../data/seedData';
import { ScoreGauge } from './ScoreGauge';

interface EmployeeSurfaceProps {
  profile: EmployeeProfile;
  selectedPresetId: string;
  onSelectPreset: (id: string) => void;
  onUpdateProfile: (next: EmployeeProfile) => void;
  isOffline: boolean;
}

export const EmployeeSurface: React.FC<EmployeeSurfaceProps> = ({
  profile,
  selectedPresetId,
  onSelectPreset,
  onUpdateProfile,
  isOffline,
}) => {
  const [tab, setTab] = useState<EmployeeTab>('home');
  const [vaultUnlocked, setVaultUnlocked] = useState(true);
  const [regimenView, setRegimenView] = useState<'holistic' | 'medications'>('holistic');
  const [competeScope, setCompeteScope] = useState<'team' | 'company' | 'league'>('team');
  const [rankingMode, setRankingMode] = useState<'delta' | 'absolute'>('delta');
  const [trendMetric, setTrendMetric] = useState<'rhr' | 'hba1c' | 'vitd'>('rhr');
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [rxSafetyModalMed, setRxSafetyModalMed] = useState<string | null>(null);

  // Full-focus Breathing Orb Anti-Cheat Timer
  const [activeTimerActionId, setActiveTimerActionId] = useState<string | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(0);

  const totalScore = computePulseScore(profile.pillars, profile.holistic);
  const holisticTotal = computeHolisticTotal(profile.holistic);
  const delta = totalScore - profile.previousScore;

  useEffect(() => {
    if (!activeTimerActionId || timerSecondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          completeActionById(activeTimerActionId, true);
          setActiveTimerActionId(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [activeTimerActionId, timerSecondsLeft]);

  const completeActionById = (actionId: string, verifiedTimer = false) => {
    const target = profile.nextBestActions.find((a) => a.id === actionId);
    if (!target || target.completed) return;

    const updatedActions = profile.nextBestActions.map((a) =>
      a.id === actionId ? { ...a, completed: true } : a
    );

    const nextPillars = { ...profile.pillars };
    let nextWater = profile.waterLiters;
    let nextStreak = profile.streakDays;
    const nextLogs = [...profile.holisticLogs];

    if (target.category === 'hydration') {
      nextPillars.nutrition = Math.min(200, nextPillars.nutrition + target.points);
      nextWater = Math.min(profile.waterTargetLiters, +(profile.waterLiters + 0.4).toFixed(1));
    } else if (target.category === 'physio') {
      nextPillars.physio = Math.min(200, nextPillars.physio + target.points);
    } else if (target.category === 'holistic') {
      nextPillars.mentalSleep = Math.min(150, nextPillars.mentalSleep + target.points);
      nextStreak = Math.min(7, profile.streakDays + 1);
      nextLogs.unshift({
        id: `hlog-${Date.now()}`,
        modality: target.title,
        durationMin: 15,
        timestamp: 'Just now · Verified',
        verifiedBy: verifiedTimer ? 'Guided Timer' : 'Wearable HRV',
        impactNote: 'Anti-cheat verified session · Streak maintained',
      });
    }

    onUpdateProfile({
      ...profile,
      pillars: nextPillars,
      waterLiters: nextWater,
      streakDays: nextStreak,
      nextBestActions: updatedActions,
      holisticLogs: nextLogs,
    });
  };

  const handleActionClick = (actionId: string) => {
    const action = profile.nextBestActions.find((a) => a.id === actionId);
    if (!action || action.completed) return;
    if (action.requiresVerificationTimer) {
      setActiveTimerActionId(action.id);
      setTimerSecondsLeft(action.durationSec ?? 10);
    } else {
      completeActionById(action.id, false);
    }
  };

  const downloadClinicalReport = (report: WorkshopReport) => {
    const html = `<!doctype html><html><head><meta charset="utf-8" /><title>PULSE Report - ${report.quarter}</title>
    <style>body{font-family:system-ui,sans-serif;color:#0f172a;padding:32px;max-width:760px;margin:0 auto}
    .hdr{border-bottom:2px solid #059669;padding-bottom:14px;margin-bottom:22px;display:flex;justify-content:space-between}
    table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #cbd5e1;padding:10px;text-align:left;font-size:14px}th{background:#f8fafc}</style></head>
    <body><div class="hdr"><div><h1 style="margin:0;font-size:20px">PULSE Clinical Summary</h1><p style="margin:4px 0 0;color:#475569">${report.quarter} · ${report.date}</p></div>
    <div style="text-align:right"><strong>SCORE: ${report.score}/1,000</strong><br/><small>ABHA: ${profile.abhaId}</small></div></div>
    <p><strong>Employee:</strong> ${profile.name} (${profile.empCode}) · ${profile.company}</p>
    <table><thead><tr><th>Biomarker</th><th>Result</th><th>Status</th></tr></thead><tbody>
    ${report.highlights.map((h) => `<tr><td>${h.label}</td><td>${h.value}</td><td>${h.status}</td></tr>`).join('')}
    </tbody></table><p><strong>Holistic Protocol:</strong> ${report.holisticProtocol}</p>
    <p><strong>Medications:</strong> ${report.medicationsSummary}</p></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PULSE_${report.id}_${profile.empCode}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sortedPeers = [...PEER_STANDINGS]
    .map((p) => (p.isCurrentUser ? { ...p, score: totalScore, delta } : p))
    .sort((a, b) => (rankingMode === 'delta' ? b.delta - a.delta : b.score - a.score));

  const trendData =
    trendMetric === 'rhr'
      ? { label: 'Resting Heart Rate', unit: 'bpm', delta: '-14 bpm', points: [82, 76, 68], labels: ['Q4 25', 'Q2 26', 'Q4 26'] }
      : trendMetric === 'hba1c'
        ? { label: 'HbA1c (Glycemic)', unit: '%', delta: '-0.6%', points: [6.1, 5.9, 5.5], labels: ['Q4 25', 'Q2 26', 'Q4 26'] }
        : { label: 'Vitamin D (25-OH)', unit: 'ng/mL', delta: '+9 ng/mL', points: [15, 19, 24], labels: ['Q4 25', 'Q2 26', 'Q4 26'] };

  const breathPhase = timerSecondsLeft % 6 >= 3 ? 'Inhale deeply...' : 'Exhale slowly...';

  return (
    <div className="mx-auto grid max-w-6xl items-start gap-8 pb-16 lg:grid-cols-12">
      {/* Left Desktop Companion Panel: Persona Switcher & Value Story (Hidden on small mobile so phones get pure full-screen PWA!) */}
      <div className="hidden space-y-5 lg:col-span-5 lg:block lg:pt-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
            <Sparkles className="h-3.5 w-3.5" />
            Consumer-Grade Employee PWA
          </span>
          <h1 className="font-editorial mt-3 text-4xl leading-tight text-slate-900">
            Health intelligence employees <span className="italic text-emerald-700">actually love</span> opening.
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
            Designed like Oura &amp; Apple Health, engineered for Indian enterprises. Switch personas
            below to see how PULSE adapts to chronic patients, holistic athletes, and high-risk
            remote staff.
          </p>
        </div>

        {/* Interactive Persona Cards */}
        <div className="space-y-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Switch Live Employee Persona
          </p>
          {DEMO_EMPLOYEE_PRESETS.map((p) => {
            const active = p.id === selectedPresetId;
            const sc = computePulseScore(p.pillars, p.holistic);
            return (
              <button
                key={p.id}
                onClick={() => onSelectPreset(p.id)}
                className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                  active
                    ? 'border-emerald-600 bg-white shadow-md ring-2 ring-emerald-500/15'
                    : 'border-slate-200/80 bg-white/70 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{p.name}</span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      {p.department}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{p.archetypeNote}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono-num text-lg font-extrabold text-emerald-700">{sc}</span>
                  <p className="text-[10px] text-slate-400">/ 1,000</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Highlight Callout */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 card-elevated">
          <p className="text-xs font-bold text-slate-900">Try these 3 interactions in the phone →</p>
          <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
            <li>• Tap <strong>Evening Pranayama</strong> to launch the animated Anti-Cheat Breathing Orb.</li>
            <li>• Open <strong>Regimen → Medications</strong> &amp; tap discontinue to see the Clinical Safety Guardrail.</li>
            <li>• Open <strong>Compete</strong> to toggle <strong>Delta League</strong> &amp; <strong>Alias Privacy Mode</strong>.</li>
          </ul>
        </div>
      </div>

      {/* Right Column: Realistic Mobile PWA Shell */}
      <div className="mx-auto w-full max-w-[410px] lg:col-span-7">
        <div className="relative overflow-hidden rounded-[40px] border border-slate-200/80 bg-[#F8FAFC] lg:phone-bezel">
          {/* Simulated Phone Status Bar (Desktop showcase only) */}
          <div className="hidden items-center justify-between bg-[#F8FAFC] px-7 pb-1 pt-3 text-[11px] font-bold text-slate-800 lg:flex">
            <span>9:41</span>
            <div className="h-5 w-24 rounded-full bg-slate-900" />
            <span className="text-emerald-700">5G · PWA</span>
          </div>

          {/* Scrollable Mobile Viewport */}
          <div className="relative max-h-[760px] overflow-y-auto px-4 pb-24 pt-3">
            {/* Employee Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-sm font-extrabold text-white shadow-sm">
                  {profile.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900">
                    Hi, {profile.name.split(' ')[0]}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500">
                    {profile.department} · {profile.city}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConsentModal(true)}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                DPDP
              </button>
            </div>

            {isOffline && (
              <div className="mb-3 flex items-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-900">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                Offline PWA Mode — saved locally in IndexedDB.
              </div>
            )}

            {/* TAB 1: HOME */}
            {tab === 'home' && (
              <div className="space-y-4">
                <ScoreGauge score={totalScore} delta={delta} holisticBonus={holisticTotal} />

                {/* 4-Pillar Bento Grid */}
                <div>
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Biometric Pillars
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700">
                      Clinical Fairness Active
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      {
                        name: 'Medical',
                        val: profile.pillars.medical,
                        max: 250,
                        sub: 'HbA1c 5.5% · Optimal',
                        bar: 'bg-emerald-500',
                        bg: 'bg-emerald-50',
                        text: 'text-emerald-700',
                      },
                      {
                        name: 'Physio',
                        val: profile.pillars.physio,
                        max: 200,
                        sub: 'Posture & Core',
                        bar: 'bg-sky-500',
                        bg: 'bg-sky-50',
                        text: 'text-sky-700',
                      },
                      {
                        name: 'Nutrition',
                        val: profile.pillars.nutrition,
                        max: 200,
                        sub: `${profile.waterLiters}L / ${profile.waterTargetLiters}L`,
                        bar: 'bg-amber-500',
                        bg: 'bg-amber-50',
                        text: 'text-amber-700',
                      },
                      {
                        name: 'Lifestyle',
                        val: profile.pillars.mentalSleep + profile.pillars.activity,
                        max: 350,
                        sub: `${profile.sleepHours}h Sleep · ${profile.restingHr} bpm`,
                        bar: 'bg-violet-500',
                        bg: 'bg-violet-50',
                        text: 'text-violet-700',
                      },
                    ].map((p) => (
                      <div
                        key={p.name}
                        className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">{p.name}</span>
                          <span className={`font-mono-num rounded-md px-1.5 py-0.5 text-[11px] font-bold ${p.bg} ${p.text}`}>
                            {p.val}/{p.max}
                          </span>
                        </div>
                        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${p.bar} transition-all duration-500`}
                            style={{ width: `${Math.min(100, (p.val / p.max) * 100)}%` }}
                          />
                        </div>
                        <p className="mt-2 text-[11px] font-medium text-slate-500">{p.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Best Actions */}
                <div>
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Today’s Next Best Actions
                    </span>
                    <span className="text-[11px] font-semibold text-sky-700">Tap to complete</span>
                  </div>
                  <div className="space-y-2">
                    {profile.nextBestActions.map((nba) => (
                      <button
                        key={nba.id}
                        onClick={() => handleActionClick(nba.id)}
                        disabled={nba.completed}
                        className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-left transition ${
                          nba.completed
                            ? 'border-emerald-200 bg-emerald-50/70'
                            : 'border-slate-200 bg-white hover:border-emerald-400 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                              nba.completed
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-emerald-700'
                            }`}
                          >
                            {nba.completed ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : nba.category === 'holistic' ? (
                              <Wind className="h-4 w-4" />
                            ) : nba.category === 'hydration' ? (
                              <Droplets className="h-4 w-4" />
                            ) : (
                              <Activity className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{nba.title}</p>
                            <p className="text-[11px] text-slate-500">{nba.subtitle}</p>
                          </div>
                        </div>
                        <span
                          className={`font-mono-num ml-2 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                            nba.completed
                              ? 'bg-emerald-200/70 text-emerald-800'
                              : 'bg-slate-900 text-emerald-300'
                          }`}
                        >
                          {nba.completed ? '✓' : `+${nba.points}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: REGIMEN & HOLISTIC VAULT */}
            {tab === 'regimen' && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    {vaultUnlocked ? (
                      <Unlock className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Lock className="h-4 w-4 text-amber-600" />
                    )}
                    <span className="text-xs font-bold text-slate-800">
                      AES-256 PHI Vault · {vaultUnlocked ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                  <button
                    onClick={() => setVaultUnlocked(!vaultUnlocked)}
                    className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
                  >
                    {vaultUnlocked ? 'Lock' : 'Unlock'}
                  </button>
                </div>

                {!vaultUnlocked ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs">
                    <Lock className="mx-auto h-9 w-9 text-amber-500" />
                    <h4 className="mt-3 text-sm font-extrabold text-slate-900">Biometric Vault Locked</h4>
                    <p className="mt-1 text-xs text-slate-500">
                      Zero HR visibility. Encrypted strictly to your employee key.
                    </p>
                    <button
                      onClick={() => setVaultUnlocked(true)}
                      className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white"
                    >
                      Unlock with Biometrics
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 rounded-2xl bg-slate-200/70 p-1">
                      <button
                        onClick={() => setRegimenView('holistic')}
                        className={`rounded-xl py-2 text-xs font-bold transition ${
                          regimenView === 'holistic'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600'
                        }`}
                      >
                        Holistic (+{holisticTotal})
                      </button>
                      <button
                        onClick={() => setRegimenView('medications')}
                        className={`rounded-xl py-2 text-xs font-bold transition ${
                          regimenView === 'medications'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600'
                        }`}
                      >
                        Medications ({profile.medications.length})
                      </button>
                    </div>

                    {regimenView === 'holistic' ? (
                      <div className="space-y-3">
                        <div className="rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-950 p-4 text-white">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                              Holistic Bonus Halo
                            </span>
                            <span className="font-mono-num text-sm font-extrabold text-amber-300">
                              +{holisticTotal} / +100
                            </span>
                          </div>
                          <div className="mt-3 space-y-2 text-xs">
                            <div className="flex justify-between rounded-xl bg-white/10 px-3 py-2">
                              <span>Mind-Body Streak ({profile.streakDays}/4 days)</span>
                              <strong className="text-emerald-300">+{profile.holistic.consistentPractice}</strong>
                            </div>
                            <div className="flex justify-between rounded-xl bg-white/10 px-3 py-2">
                              <span>Drug-Free Symptom Protocol</span>
                              <strong className="text-emerald-300">+{profile.holistic.drugFreeSymptom}</strong>
                            </div>
                            <div className="flex justify-between rounded-xl bg-white/10 px-3 py-2">
                              <span>MD Deprescribing Milestone</span>
                              <strong className="text-amber-300">
                                {profile.holistic.physicianDeprescribing > 0
                                  ? `+${profile.holistic.physicianDeprescribing}`
                                  : 'Locked (MD)'}
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5">
                          <div>
                            <p className="text-xs font-bold text-slate-900">Guided Breathwork Orb</p>
                            <p className="text-[11px] text-slate-500">Anti-cheat verified session</p>
                          </div>
                          <button
                            onClick={() => handleActionClick('nba-1')}
                            disabled={profile.nextBestActions.find((a) => a.id === 'nba-1')?.completed}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-40"
                          >
                            <Play className="h-3.5 w-3.5" /> Start
                          </button>
                        </div>

                        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3.5 text-xs text-sky-950">
                          <p className="flex items-center gap-1.5 font-bold text-sky-800">
                            <Sparkles className="h-3.5 w-3.5" /> Clinical Correlation
                          </p>
                          <p className="mt-1 leading-relaxed">
                            Sleep quality rose <strong>14%</strong> and resting HR dropped{' '}
                            <strong>4 bpm</strong> on days with 15+ mins of verified pranayama.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {profile.medications.map((med) => (
                          <div
                            key={med.id}
                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-extrabold text-slate-900">{med.name}</span>
                                  <span
                                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                      med.type === 'Rx'
                                        ? 'bg-rose-100 text-rose-700'
                                        : 'bg-sky-100 text-sky-700'
                                    }`}
                                  >
                                    {med.type}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-slate-600">
                                  {med.dosage} · {med.schedule}
                                </p>
                                <p className="mt-0.5 text-[11px] text-slate-400">{med.condition}</p>
                              </div>
                            </div>
                            {med.type === 'Rx' && (
                              <button
                                onClick={() => setRxSafetyModalMed(med.name)}
                                className="mt-3 w-full rounded-xl border border-rose-200 bg-rose-50 py-2 text-[11px] font-bold text-rose-700 hover:bg-rose-100"
                              >
                                Request Discontinuation / Deprescribing Review
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* TAB 3: REPORTS VAULT & SPARKLINE */}
            {tab === 'reports' && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5">
                  <div>
                    <p className="text-xs font-extrabold text-emerald-900">ABHA Health Locker Linked</p>
                    <p className="font-mono-num text-[11px] text-emerald-700">{profile.abhaId}</p>
                  </div>
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>

                {/* Interactive Biomarker SVG Area Chart */}
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">{trendData.label}</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                      {trendData.delta}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-1">
                    {[
                      { id: 'rhr', label: 'Resting HR' },
                      { id: 'hba1c', label: 'HbA1c' },
                      { id: 'vitd', label: 'Vitamin D' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setTrendMetric(m.id as 'rhr' | 'hba1c' | 'vitd')}
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${
                          trendMetric === m.id
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {/* Clean SVG Area Trend */}
                  <div className="mt-3">
                    <svg viewBox="0 0 260 90" className="h-24 w-full overflow-visible">
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {(() => {
                        const min = Math.min(...trendData.points) * 0.92;
                        const max = Math.max(...trendData.points) * 1.05;
                        const coords = trendData.points.map((v, i) => {
                          const x = 25 + i * 105;
                          const y = 70 - ((v - min) / Math.max(0.01, max - min)) * 50;
                          return { x, y, v };
                        });
                        const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
                        const areaPath = `${linePath} L ${coords[2].x} 76 L ${coords[0].x} 76 Z`;
                        return (
                          <>
                            <path d={areaPath} fill="url(#areaGrad)" />
                            <path d={linePath} fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
                            {coords.map((c, i) => (
                              <g key={i}>
                                <circle cx={c.x} cy={c.y} r="5" fill="#ffffff" stroke="#059669" strokeWidth="2.5" />
                                <text x={c.x} y={c.y - 10} textAnchor="middle" className="fill-slate-800 text-[10px] font-bold">
                                  {c.v} {trendData.unit}
                                </text>
                                <text x={c.x} y="88" textAnchor="middle" className="fill-slate-400 text-[9px] font-semibold">
                                  {trendData.labels[i]}
                                </text>
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>

                {/* Workshop Cards */}
                {profile.reports.map((rep) => (
                  <div key={rep.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">{rep.quarter}</h4>
                        <p className="text-[11px] text-slate-500">
                          {rep.date} · Score <strong className="text-emerald-700">{rep.score}</strong>
                        </p>
                      </div>
                      <button
                        onClick={() => downloadClinicalReport(rep)}
                        className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700"
                      >
                        <Download className="h-3 w-3" /> PDF
                      </button>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      {rep.highlights.map((h) => (
                        <div key={h.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px]">
                          <span className="text-slate-600">{h.label}</span>
                          <span className="font-bold text-slate-900">{h.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: COMPETE */}
            {tab === 'compete' && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-2.5">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setRankingMode('delta')}
                      className={`rounded-xl px-2.5 py-1.5 text-[11px] font-bold ${
                        rankingMode === 'delta' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                      }`}
                    >
                      Delta League
                    </button>
                    <button
                      onClick={() => setRankingMode('absolute')}
                      className={`rounded-xl px-2.5 py-1.5 text-[11px] font-bold ${
                        rankingMode === 'absolute' ? 'bg-slate-900 text-white' : 'text-slate-600'
                      }`}
                    >
                      Absolute
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      onUpdateProfile({
                        ...profile,
                        consents: {
                          ...profile.consents,
                          aliasModeOnLeaderboard: !profile.consents.aliasModeOnLeaderboard,
                        },
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-700"
                  >
                    {profile.consents.aliasModeOnLeaderboard ? (
                      <EyeOff className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Eye className="h-3.5 w-3.5 text-slate-400" />
                    )}
                    Alias
                  </button>
                </div>

                <div className="grid grid-cols-3 rounded-2xl bg-slate-200/70 p-1 text-[11px] font-bold">
                  {[
                    { id: 'team', label: 'My Team' },
                    { id: 'company', label: 'Company' },
                    { id: 'league', label: 'India League' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setCompeteScope(s.id as 'team' | 'company' | 'league')}
                      className={`rounded-xl py-1.5 ${
                        competeScope === s.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {competeScope === 'team' && (
                  <div className="space-y-2">
                    {sortedPeers.map((peer, idx) => (
                      <div
                        key={peer.id}
                        className={`flex items-center justify-between rounded-2xl border p-3 ${
                          peer.isCurrentUser
                            ? 'border-emerald-500 bg-emerald-50/70'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono-num flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-extrabold text-slate-900">
                              {peer.isCurrentUser && profile.consents.aliasModeOnLeaderboard
                                ? `${peer.alias} (You)`
                                : peer.isCurrentUser
                                  ? `${peer.name} (You)`
                                  : peer.name}
                            </p>
                            {peer.holisticBadge && (
                              <span className="text-[10px] font-bold text-emerald-700">
                                ★ {peer.holisticBadge}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono-num text-xs font-extrabold text-slate-900">
                            {rankingMode === 'delta' ? `+${peer.delta} pts` : `${peer.score}`}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {rankingMode === 'delta' ? `Score ${peer.score}` : `+${peer.delta} delta`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {competeScope === 'company' && (
                  <div className="space-y-2">
                    {DEPARTMENT_STANDINGS.filter((d) => d.activeCount >= 10).map((d, i) => (
                      <div key={d.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5">
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">#{i + 1} {d.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {d.participationPct}% Active {d.participationPct >= 80 && <strong className="text-emerald-700">· 1.1×</strong>}
                          </p>
                        </div>
                        <span className="font-mono-num text-sm font-extrabold text-slate-900">{d.avgScore}</span>
                      </div>
                    ))}
                  </div>
                )}

                {competeScope === 'league' && (
                  <div className="space-y-2">
                    {INTER_COMPANY_STANDINGS.map((c) => (
                      <div
                        key={c.company}
                        className={`flex items-center justify-between rounded-2xl border p-3.5 ${
                          c.isCurrentCompany ? 'border-emerald-500 bg-emerald-50/70' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">#{c.rank} {c.company}</p>
                          <p className="text-[11px] text-slate-500">{c.city} · {c.certifiedTier} Certified</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Award className="h-4 w-4 text-amber-500" />
                          <span className="font-mono-num text-sm font-extrabold text-slate-900">{c.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Floating Glass Pill Bottom Nav */}
          <div className="absolute bottom-3 left-3 right-3 z-20 rounded-full border border-slate-200/80 bg-white/95 px-2 py-1.5 shadow-lg backdrop-blur-md">
            <div className="grid grid-cols-4">
              {[
                { id: 'home', label: 'Home', icon: Home },
                { id: 'regimen', label: 'Regimen', icon: Flame },
                { id: 'reports', label: 'Reports', icon: FileText },
                { id: 'compete', label: 'Compete', icon: Trophy },
              ].map((item) => {
                const Icon = item.icon;
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id as EmployeeTab)}
                    className={`flex flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] font-bold transition ${
                      active ? 'bg-slate-900 text-emerald-400' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* FULL-FOCUS ANIMATED BREATHING ORB MODAL (Anti-Cheat Verification) */}
      {activeTimerActionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
          <div className="relative flex w-full max-w-sm flex-col items-center rounded-[36px] border border-emerald-500/30 bg-gradient-to-b from-[#062C23] to-[#0B1120] p-8 text-center text-white shadow-2xl">
            <button
              onClick={() => {
                setActiveTimerActionId(null);
                setTimerSecondsLeft(0);
              }}
              className="absolute right-5 top-5 rounded-full bg-white/10 p-1.5 text-slate-300 hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
              Anti-Cheat Verified Pranayama
            </span>
            <h3 className="font-editorial mt-3 text-3xl text-white">{breathPhase}</h3>

            <div className="my-10 flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-sky-400 animate-breathe">
              <span className="font-mono-num text-4xl font-extrabold text-slate-950">
                {timerSecondsLeft}s
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Stay present until the orb completes to earn <strong className="text-emerald-300">+10 Verified Holistic pts</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Clinical Safety Guardrail Modal */}
      {rxSafetyModalMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-w-sm rounded-3xl border border-rose-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-600">
              <HeartPulse className="h-5 w-5" />
              <h4 className="text-sm font-extrabold">Clinical Safety Guardrail</h4>
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
              Never stop or reduce prescription medication <strong className="text-slate-900">{rxSafetyModalMed}</strong> without physician approval.
            </p>
            <p className="mt-2 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-900">
              Deprescribing Bonus Points (+30 pts) unlock automatically once your Workshop MD signs off at Station 5.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setRxSafetyModalMed(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white"
              >
                Understood — Keep Active
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DPDP Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h4 className="text-sm font-extrabold text-slate-900">DPDP Act 2023 Consent Ledger</h4>
              </div>
              <button onClick={() => setShowConsentModal(false)} className="text-xs font-bold text-slate-400">
                Close
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Corporate HR only receives anonymized aggregates (k ≥ 10). Your medical records remain strictly private.
            </p>
            <div className="mt-3 space-y-2 text-xs">
              {[
                { key: 'workshopClinicalCapture', label: 'Workshop Clinical Data Capture' },
                { key: 'anonymizedDepartmentBenchmark', label: 'Anonymized Dept Benchmarking (k≥10)' },
                { key: 'wearableSync', label: 'HealthKit / Health Connect Sync' },
                { key: 'abhaHealthLockerLink', label: 'ABHA Portable Health Locker' },
                { key: 'aliasModeOnLeaderboard', label: 'Privacy Alias on Leaderboards' },
              ].map((c) => {
                const k = c.key as keyof typeof profile.consents;
                return (
                  <label key={c.key} className="flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                    <span className="font-medium text-slate-800">{c.label}</span>
                    <input
                      type="checkbox"
                      checked={profile.consents[k]}
                      onChange={() =>
                        onUpdateProfile({
                          ...profile,
                          consents: { ...profile.consents, [k]: !profile.consents[k] },
                        })
                      }
                      className="h-4 w-4 accent-emerald-600"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
