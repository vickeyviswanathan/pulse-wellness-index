export type SurfaceMode = 'employee' | 'clinician' | 'customer_admin' | 'super_admin';
export type EmployeeTab = 'home' | 'regimen' | 'reports' | 'compete';

export interface PillarScores {
  medical: number;      // max 250
  physio: number;       // max 200
  nutrition: number;    // max 200
  mentalSleep: number;  // max 150
  activity: number;     // max 200
}

export interface HolisticBonus {
  consistentPractice: number; // max 40 (verified 4+ days/week)
  drugFreeSymptom: number;    // max 30
  physicianDeprescribing: number; // max 30 (requires MD sign-off)
}

export interface NextBestAction {
  id: string;
  title: string;
  subtitle: string;
  points: number;
  category: 'holistic' | 'hydration' | 'physio' | 'medical';
  completed: boolean;
  requiresVerificationTimer?: boolean;
  durationSec?: number;
}

export interface MedicationItem {
  id: string;
  name: string;
  type: 'Rx' | 'OTC' | 'Supplement';
  dosage: string;
  schedule: string;
  condition: string;
  status: 'Active' | 'Deprescribing Review' | 'Clinician Stopped';
}

export interface HolisticLogItem {
  id: string;
  modality: string;
  durationMin: number;
  timestamp: string;
  verifiedBy: 'Guided Timer' | 'Wearable HRV' | 'Clinician Sign-Off';
  impactNote: string;
}

export interface WorkshopReport {
  id: string;
  quarter: string;
  date: string;
  score: number;
  restingHr: number;
  hba1c: number;
  vitaminD: number;
  bp: string;
  highlights: { label: string; value: string; status: 'OPTIMAL' | 'BORDERLINE' | 'ACTION' }[];
  holisticProtocol: string;
  medicationsSummary: string;
}

export interface DpdpConsents {
  workshopClinicalCapture: boolean;
  anonymizedDepartmentBenchmark: boolean;
  wearableSync: boolean;
  abhaHealthLockerLink: boolean;
  aliasModeOnLeaderboard: boolean;
}

export interface EmployeeProfile {
  id: string;
  empCode: string;
  name: string;
  alias: string;
  company: string;
  department: string;
  city: string;
  abhaId: string;
  archetypeNote: string;
  previousScore: number;
  pillars: PillarScores;
  holistic: HolisticBonus;
  streakDays: number;
  waterLiters: number;
  waterTargetLiters: number;
  sleepHours: number;
  restingHr: number;
  nextBestActions: NextBestAction[];
  medications: MedicationItem[];
  holisticLogs: HolisticLogItem[];
  reports: WorkshopReport[];
  consents: DpdpConsents;
}

export interface OfflineAssessmentRecord {
  id: string;
  createdAt: string;
  synced: boolean;
  empCode: string;
  employeeName: string;
  department: string;
  station1: {
    bpSys: number;
    bpDia: number;
    hba1c: number;
    restingHr: number;
    lipidRisk: 'Optimal' | 'Borderline' | 'High';
    controlledOnMeds: boolean;
  };
  station2: {
    postureScore: number;
    coreFlexibility: number;
    ergoRisk: 'Low' | 'Moderate' | 'High';
  };
  station3: {
    visceralFat: number;
    muscleMassPct: number;
    hydrationScore: number;
    vitDDeficient: boolean;
  };
  station4: {
    pssStress: number;
    sleepQuality: number;
    burnoutRisk: 'Low' | 'Moderate' | 'High';
  };
  station5: {
    activeRxCount: number;
    holisticVerified: boolean;
    drugFreeSymptomVerified: boolean;
    physicianDeprescribingSigned: boolean;
    clinicianNotes: string;
    clinicianName: string;
  };
  computedScore: number;
}

export interface DepartmentStanding {
  id: string;
  name: string;
  activeCount: number;
  totalCount: number;
  avgScore: number;
  avgDelta: number;
  participationPct: number;
}

export interface PeerStanding {
  id: string;
  name: string;
  alias: string;
  department: string;
  score: number;
  delta: number;
  holisticBadge?: string;
  isCurrentUser?: boolean;
}

export interface InterCompanyStanding {
  rank: number;
  company: string;
  city: string;
  tier: 'Startup (<250)' | 'Mid-Market (250-1,000)' | 'Enterprise (1,000+)';
  score: number;
  delta: number;
  participationPct: number;
  certifiedTier: 'Platinum' | 'Gold' | 'Silver';
  isCurrentCompany?: boolean;
}

export interface TenantEmployeeRow {
  empCode: string;
  name: string;
  email: string;
  department: string;
  workMode: 'On-site' | 'Hybrid' | 'Remote';
  status: 'Active' | 'Invited' | 'Camp Booked';
  lastWorkshop: string;
}

export interface WorkshopScheduleItem {
  id: string;
  title: string;
  date: string;
  mode: 'On-Site 5-Station Camp' | 'At-Home Phlebotomy + Tele-Consult';
  labPartner: string;
  bookedCount: number;
  capacity: number;
  status: 'Confirmed' | 'In Progress' | 'Completed';
}

export interface CorporateTenant {
  id: string;
  name: string;
  city: string;
  industry: string;
  tier: 'Startup (<250)' | 'Mid-Market (250-1,000)' | 'Enterprise (1,000+)';
  adminName: string;
  adminEmail: string;
  brokerPartner: string;
  headcount: number;
  activeCount: number;
  participationPct: number;
  pulseScore: number;
  avgDelta: number;
  pepmInr: number;
  gmcPremiumLakhs: number;
  certifiedTier: 'Platinum' | 'Gold' | 'Silver' | 'Pending';
  status: 'Active' | 'Pilot' | 'Onboarding';
  departments: DepartmentStanding[];
  roster: TenantEmployeeRow[];
  workshops: WorkshopScheduleItem[];
}

export interface GlobalScoreWeights {
  medical: number;
  physio: number;
  nutrition: number;
  mentalSleep: number;
  activity: number;
  holisticCap: number;
}
