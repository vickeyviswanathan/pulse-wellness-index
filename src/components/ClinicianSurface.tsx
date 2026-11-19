import React, { useState } from 'react';
import {
  CheckCircle2,
  CloudOff,
  CloudUpload,
  Database,
  FileSpreadsheet,
  QrCode,
  ShieldCheck,
  Stethoscope,
  Timer,
  Wifi,
  WifiOff,
} from 'lucide-react';
import type { OfflineAssessmentRecord } from '../types/pulse';
import { computeScoreFromWorkshop } from '../lib/scoring';
import { SAMPLE_LAB_IMPORTS } from '../data/seedData';

interface ClinicianSurfaceProps {
  isOffline: boolean;
  onToggleSimulatedOffline: () => void;
  offlineQueue: OfflineAssessmentRecord[];
  onSaveAssessment: (record: OfflineAssessmentRecord, syncImmediately: boolean) => void;
  onSyncQueueNow: () => void;
}

export const ClinicianSurface: React.FC<ClinicianSurfaceProps> = ({
  isOffline,
  onToggleSimulatedOffline,
  offlineQueue,
  onSaveAssessment,
  onSyncQueueNow,
}) => {
  const [empCode, setEmpCode] = useState('ACME-BLR-1042');
  const [employeeName, setEmployeeName] = useState('Aarav Mehta');
  const [department, setDepartment] = useState('Engineering');

  const [bpSys, setBpSys] = useState(118);
  const [bpDia, setBpDia] = useState(76);
  const [hba1c, setHbA1c] = useState(5.4);
  const [restingHr, setRestingHr] = useState(66);
  const [lipidRisk, setLipidRisk] = useState<'Optimal' | 'Borderline' | 'High'>('Optimal');
  const [controlledOnMeds, setControlledOnMeds] = useState(true);

  const [postureScore, setPostureScore] = useState(82);
  const [coreFlexibility, setCoreFlexibility] = useState(78);
  const [ergoRisk, setErgoRisk] = useState<'Low' | 'Moderate' | 'High'>('Low');

  const [visceralFat, setVisceralFat] = useState(8);
  const [muscleMassPct] = useState(41);
  const [hydrationScore] = useState(85);
  const [vitDDeficient, setVitDDeficient] = useState(false);

  const [pssStress, setPssStress] = useState(13);
  const [sleepQuality, setSleepQuality] = useState(84);
  const [burnoutRisk, setBurnoutRisk] = useState<'Low' | 'Moderate' | 'High'>('Low');

  const [activeRxCount, setActiveRxCount] = useState(1);
  const [holisticVerified, setHolisticVerified] = useState(true);
  const [drugFreeSymptomVerified, setDrugFreeSymptomVerified] = useState(true);
  const [physicianDeprescribingSigned, setPhysicianDeprescribingSigned] = useState(true);
  const [clinicianNotes, setClinicianNotes] = useState(
    'BP consistently <120/78 for 6 months with pranayama + walking. Safe for Telmisartan 20mg deprescribing milestone (+30 pts).'
  );
  const [clinicianName] = useState('Dr. Meera Krishnan, MD (Internal Medicine)');
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  const preview = computeScoreFromWorkshop({
    empCode,
    employeeName,
    department,
    station1: { bpSys, bpDia, hba1c, restingHr, lipidRisk, controlledOnMeds },
    station2: { postureScore, coreFlexibility, ergoRisk },
    station3: { visceralFat, muscleMassPct, hydrationScore, vitDDeficient },
    station4: { pssStress, sleepQuality, burnoutRisk },
    station5: {
      activeRxCount,
      holisticVerified,
      drugFreeSymptomVerified,
      physicianDeprescribingSigned,
      clinicianNotes,
      clinicianName,
    },
  });

  const handleLoadLabSample = (idx: number) => {
    const s = SAMPLE_LAB_IMPORTS[idx];
    setEmpCode(s.empCode);
    setEmployeeName(s.employeeName);
    setDepartment(s.department);
    setBpSys(s.bpSys);
    setBpDia(s.bpDia);
    setHbA1c(s.hba1c);
    setRestingHr(s.restingHr);
    setLipidRisk(s.lipidRisk);
    setControlledOnMeds(s.controlledOnMeds);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: OfflineAssessmentRecord = {
      id: `ASSESS-${Date.now()}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      synced: !isOffline,
      empCode,
      employeeName,
      department,
      station1: { bpSys, bpDia, hba1c, restingHr, lipidRisk, controlledOnMeds },
      station2: { postureScore, coreFlexibility, ergoRisk },
      station3: { visceralFat, muscleMassPct, hydrationScore, vitDDeficient },
      station4: { pssStress, sleepQuality, burnoutRisk },
      station5: {
        activeRxCount,
        holisticVerified,
        drugFreeSymptomVerified,
        physicianDeprescribingSigned,
        clinicianNotes,
        clinicianName,
      },
      computedScore: preview.total,
    };
    onSaveAssessment(record, !isOffline);
    setSavedBanner(
      isOffline
        ? `Saved locally to IndexedDB offline queue for ${employeeName} (${preview.total}/1,000). Reconnect to sync.`
        : `Synced live! ${employeeName}'s PULSE Index updated to ${preview.total}/1,000.`
    );
    window.setTimeout(() => setSavedBanner(null), 5000);
  };

  const pendingCount = offlineQueue.filter((r) => !r.synced).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      {/* Crisp Medical Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 card-elevated">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900">
                Clinician Workshop Tablet PWA
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                <Timer className="h-3 w-3" /> &lt;90s / Station SLA
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {clinicianName} · Offline-First IndexedDB Queue Active
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onToggleSimulatedOffline}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              isOffline
                ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-300'
                : 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
            }`}
          >
            {isOffline ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
            {isOffline ? 'Offline Mode (Zero Wi-Fi)' : 'Online · Live Sync'}
          </button>

          <button
            onClick={onSyncQueueNow}
            disabled={isOffline || pendingCount === 0}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CloudUpload className="h-4 w-4" />
            Sync Queue ({pendingCount})
          </button>
        </div>
      </div>

      {/* 5-Station Progress Stepper */}
      <div className="grid grid-cols-5 gap-2">
        {[
          '1. Blood & Vitals',
          '2. Physio & Ergo',
          '3. Nutrition & BCA',
          '4. Stress & Sleep',
          '5. MD Holistic Sign-Off',
        ].map((step) => (
          <div
            key={step}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 py-2 text-center text-[11px] font-bold text-emerald-900"
          >
            <CheckCircle2 className="hidden h-3.5 w-3.5 text-emerald-600 sm:inline" />
            {step}
          </div>
        ))}
      </div>

      {savedBanner && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-900">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          {savedBanner}
        </div>
      )}

      {/* Lab Auto-Ingestion + Live Score Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 card-elevated md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-700">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              1-Click Lab LIMS Auto-Import (Zero Manual Typing)
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              <QrCode className="h-3.5 w-3.5" /> QR Check-In Verified
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {SAMPLE_LAB_IMPORTS.map((item, idx) => (
              <button
                key={item.empCode}
                type="button"
                onClick={() => handleLoadLabSample(idx)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-900"
              >
                Import: {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-[#062C23] to-[#0F172A] p-5 text-white shadow-lg">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
            Live Preview PULSE Score
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono-num text-4xl font-extrabold">{preview.total}</span>
            <span className="text-xs text-slate-400">/ 1,000</span>
          </div>
          <p className="mt-1 text-xs text-slate-300">
            Holistic Bonus:{' '}
            <strong className="text-amber-300">
              +{preview.holistic.consistentPractice + preview.holistic.drugFreeSymptom + preview.holistic.physicianDeprescribing} pts
            </strong>
          </p>
        </div>
      </div>

      {/* 5-Station Clinical Form */}
      <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 card-elevated">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
            Station 1 · Vitals &amp; Bloodwork (Max 250 pts)
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <label className="block">
              <span className="font-semibold text-slate-500">Employee</span>
              <input
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-900"
              />
            </label>
            <label className="block">
              <span className="font-semibold text-slate-500">Emp Code</span>
              <input
                value={empCode}
                onChange={(e) => setEmpCode(e.target.value)}
                className="font-mono-num mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-900"
              />
            </label>
            <label className="block">
              <span className="font-semibold text-slate-500">Systolic BP (mmHg)</span>
              <input
                type="number"
                value={bpSys}
                onChange={(e) => setBpSys(Number(e.target.value))}
                className="font-mono-num mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-900"
              />
            </label>
            <label className="block">
              <span className="font-semibold text-slate-500">HbA1c (%)</span>
              <input
                type="number"
                step="0.1"
                value={hba1c}
                onChange={(e) => setHbA1c(Number(e.target.value))}
                className="font-mono-num mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-900"
              />
            </label>
            <label className="block">
              <span className="font-semibold text-slate-500">Resting HR (bpm)</span>
              <input
                type="number"
                value={restingHr}
                onChange={(e) => setRestingHr(Number(e.target.value))}
                className="font-mono-num mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-900"
              />
            </label>
            <label className="block">
              <span className="font-semibold text-slate-500">Lipid Profile</span>
              <select
                value={lipidRisk}
                onChange={(e) => setLipidRisk(e.target.value as 'Optimal' | 'Borderline' | 'High')}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-900"
              >
                <option value="Optimal">Optimal</option>
                <option value="Borderline">Borderline</option>
                <option value="High">High Risk</option>
              </select>
            </label>
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-50/80 px-3 py-2.5 text-xs font-semibold text-emerald-900">
            <input
              type="checkbox"
              checked={controlledOnMeds}
              onChange={(e) => setControlledOnMeds(e.target.checked)}
              className="h-4 w-4 accent-emerald-600"
            />
            Apply Clinical Fairness Rule (biomarkers well-controlled on Rx)
          </label>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 card-elevated">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-sky-700">
              Station 2 · Physio &amp; Ergonomics (Max 200 pts)
            </h3>
            <div className="mt-3 space-y-3 text-xs">
              <label className="block">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-600">Postural Alignment</span>
                  <span className="font-mono-num font-extrabold text-slate-900">{postureScore}/100</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={100}
                  value={postureScore}
                  onChange={(e) => setPostureScore(Number(e.target.value))}
                  className="mt-1 w-full accent-sky-600"
                />
              </label>
              <label className="block">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-600">Core Strength &amp; Mobility</span>
                  <span className="font-mono-num font-extrabold text-slate-900">{coreFlexibility}/100</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={100}
                  value={coreFlexibility}
                  onChange={(e) => setCoreFlexibility(Number(e.target.value))}
                  className="mt-1 w-full accent-sky-600"
                />
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 card-elevated">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-700">
              Station 3 &amp; 4 · Nutrition, Stress &amp; Sleep
            </h3>
            <div className="mt-3 grid grid-cols-3 gap-2.5 text-xs">
              <label className="block">
                <span className="font-semibold text-slate-500">Visceral Fat</span>
                <input
                  type="number"
                  value={visceralFat}
                  onChange={(e) => setVisceralFat(Number(e.target.value))}
                  className="font-mono-num mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 font-bold text-slate-900"
                />
              </label>
              <label className="block">
                <span className="font-semibold text-slate-500">PSS Stress</span>
                <input
                  type="number"
                  value={pssStress}
                  onChange={(e) => setPssStress(Number(e.target.value))}
                  className="font-mono-num mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 font-bold text-slate-900"
                />
              </label>
              <label className="block">
                <span className="font-semibold text-slate-500">Sleep Score</span>
                <input
                  type="number"
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(Number(e.target.value))}
                  className="font-mono-num mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 font-bold text-slate-900"
                />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-xs">
              <label className="flex items-center gap-1.5 font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={vitDDeficient}
                  onChange={(e) => setVitDDeficient(e.target.checked)}
                  className="accent-amber-600"
                />
                Vit D / B12 Flag
              </label>
              <select
                value={ergoRisk}
                onChange={(e) => setErgoRisk(e.target.value as 'Low' | 'Moderate' | 'High')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-800"
              >
                <option value="Low">Ergo: Low</option>
                <option value="Moderate">Ergo: Moderate</option>
                <option value="High">Ergo: High</option>
              </select>
              <select
                value={burnoutRisk}
                onChange={(e) => setBurnoutRisk(e.target.value as 'Low' | 'Moderate' | 'High')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-800"
              >
                <option value="Low">Burnout: Low</option>
                <option value="Moderate">Burnout: Moderate</option>
                <option value="High">Burnout: High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Station 5 */}
        <div className="rounded-3xl border border-emerald-200 bg-white p-5 card-elevated md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
              Station 5 · Medication Intake &amp; Physician Holistic Sign-Off (Up to +100 Bonus)
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" /> Signed Clinician Token
            </span>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-3 text-xs">
            <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={holisticVerified}
                onChange={(e) => setHolisticVerified(e.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
              Verified 4x/wk Holistic Practice (+40)
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={drugFreeSymptomVerified}
                onChange={(e) => setDrugFreeSymptomVerified(e.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
              Drug-Free Symptom Protocol (+30)
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 p-3.5 font-bold text-emerald-900">
              <input
                type="checkbox"
                checked={physicianDeprescribingSigned}
                onChange={(e) => setPhysicianDeprescribingSigned(e.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
              MD Deprescribing Sign-Off (+30)
            </label>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-4 text-xs">
            <label className="block">
              <span className="font-semibold text-slate-500">Active Rx Count</span>
              <input
                type="number"
                min={0}
                value={activeRxCount}
                onChange={(e) => setActiveRxCount(Number(e.target.value))}
                className="font-mono-num mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-900"
              />
            </label>
            <label className="block md:col-span-3">
              <span className="font-semibold text-slate-500">Clinician Verification Note</span>
              <input
                value={clinicianNotes}
                onChange={(e) => setClinicianNotes(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">
              {isOffline
                ? 'Offline detected — encrypted record will queue in local IndexedDB.'
                : 'Online — updates employee PULSE Index immediately.'}
            </p>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-emerald-700"
            >
              {isOffline ? <CloudOff className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              {isOffline ? 'Save to Offline Queue (IndexedDB)' : 'Sign & Sync Workshop Assessment'}
            </button>
          </div>
        </div>
      </form>

      {/* IndexedDB Queue Inspector */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 card-elevated">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-800">
            <Database className="h-4 w-4 text-emerald-600" />
            IndexedDB Offline Workshop Queue ({offlineQueue.length} records)
          </div>
          <span className="text-[11px] font-medium text-slate-500">
            Survives Wi-Fi drops &amp; tablet restarts
          </span>
        </div>
        <div className="mt-3 space-y-2">
          {offlineQueue.map((rec) => (
            <div
              key={rec.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs"
            >
              <div>
                <span className="font-extrabold text-slate-900">{rec.employeeName}</span>{' '}
                <span className="font-mono-num text-slate-500">({rec.empCode})</span>
                <p className="text-[11px] text-slate-500">
                  {rec.department} · Captured {rec.createdAt} · Score{' '}
                  <strong className="text-emerald-700">{rec.computedScore}/1,000</strong>
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${
                  rec.synced
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {rec.synced ? 'Synced to Cloud' : 'Queued Offline'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
