import type { HolisticBonus, OfflineAssessmentRecord, PillarScores } from '../types/pulse';

export function computeHolisticTotal(h: HolisticBonus): number {
  return Math.min(
    100,
    Math.min(40, h.consistentPractice) +
      Math.min(30, h.drugFreeSymptom) +
      Math.min(30, h.physicianDeprescribing)
  );
}

export function computePulseScore(pillars: PillarScores, holistic: HolisticBonus): number {
  const base =
    Math.min(250, pillars.medical) +
    Math.min(200, pillars.physio) +
    Math.min(200, pillars.nutrition) +
    Math.min(150, pillars.mentalSleep) +
    Math.min(200, pillars.activity);

  const bonus = computeHolisticTotal(holistic);
  return Math.min(1000, Math.round(base + bonus));
}

export function computeScoreFromWorkshop(
  assessment: Omit<OfflineAssessmentRecord, 'id' | 'createdAt' | 'synced' | 'computedScore'>
): { pillars: PillarScores; holistic: HolisticBonus; total: number } {
  const { station1, station2, station3, station4, station5 } = assessment;

  // Station 1: Medical Quotient (max 250) with Clinical Fairness Rule
  let medical = 180;
  if (station1.hba1c <= 5.6) medical += 35;
  else if (station1.hba1c <= 6.4) medical += 18;
  else medical -= 15;

  if (station1.bpSys <= 125 && station1.bpDia <= 82) medical += 25;
  else if (station1.bpSys <= 138) medical += 10;
  else medical -= 15;

  if (station1.lipidRisk === 'Optimal') medical += 10;
  else if (station1.lipidRisk === 'High') medical -= 15;

  // Clinical Fairness Rule: well-controlled medicated biomarkers receive parity boost
  if (station1.controlledOnMeds) {
    medical = Math.min(250, medical + 20);
  }
  medical = Math.max(80, Math.min(250, medical));

  // Station 2: Physio & Mobility (max 200)
  const physioRaw =
    station2.postureScore * 0.9 +
    station2.coreFlexibility * 0.8 +
    (station2.ergoRisk === 'Low' ? 30 : station2.ergoRisk === 'Moderate' ? 15 : 0);
  const physio = Math.max(60, Math.min(200, Math.round(physioRaw)));

  // Station 3: Nutrition & Body Comp (max 200)
  let nutrition = Math.round(station3.hydrationScore * 0.9 + station3.muscleMassPct * 2.1);
  if (station3.visceralFat <= 9) nutrition += 35;
  else if (station3.visceralFat <= 13) nutrition += 15;
  if (!station3.vitDDeficient) nutrition += 15;
  nutrition = Math.max(70, Math.min(200, nutrition));

  // Station 4: Mental & Sleep (max 150) + Activity baseline (max 200)
  const stressComponent = Math.max(0, 40 - station4.pssStress) * 1.8;
  const sleepComponent = station4.sleepQuality * 0.78;
  const mentalSleep = Math.max(45, Math.min(150, Math.round(stressComponent + sleepComponent)));
  const activity = station4.burnoutRisk === 'Low' ? 165 : station4.burnoutRisk === 'Moderate' ? 140 : 115;

  // Station 5: Verified Holistic Weights (up to +100)
  const holistic: HolisticBonus = {
    consistentPractice: station5.holisticVerified ? 40 : 0,
    drugFreeSymptom: station5.drugFreeSymptomVerified ? 30 : 0,
    physicianDeprescribing: station5.physicianDeprescribingSigned ? 30 : 0,
  };

  const pillars: PillarScores = { medical, physio, nutrition, mentalSleep, activity };
  const total = computePulseScore(pillars, holistic);
  return { pillars, holistic, total };
}

export function getScoreTier(score: number): { label: string; colorClass: string } {
  if (score >= 820) return { label: 'Platinum Pulse', colorClass: 'text-emerald-400' };
  if (score >= 720) return { label: 'Gold Pulse', colorClass: 'text-sky-400' };
  if (score >= 600) return { label: 'Silver Pulse', colorClass: 'text-amber-400' };
  return { label: 'Focus Cohort', colorClass: 'text-rose-400' };
}
