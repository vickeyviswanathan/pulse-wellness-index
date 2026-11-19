import type { SurfaceMode } from '../types/pulse';

export interface DemoAccount {
  id: string;
  name: string;
  title: string;
  email: string;
  org: string;
  roleLabel: string;
  badgeColor: string;
  surface: SurfaceMode;
  employeePresetId?: string;
  tenantId?: string;
  isBrokerView?: boolean;
  highlight: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'acc-aarav',
    name: 'Aarav Mehta',
    title: 'Senior Engineer',
    email: 'aarav.m@acmetech.in',
    org: 'Acme Tech India · Bengaluru',
    roleLabel: 'Employee',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    surface: 'employee',
    employeePresetId: 'EMP-AARAV-01',
    highlight: 'Borderline HTN improving · +70 Holistic Halo · Delta League',
  },
  {
    id: 'acc-priya',
    name: 'Priya Subramanian',
    title: 'Staff Product Designer',
    email: 'priya.s@acmetech.in',
    org: 'Acme Tech India · Bengaluru',
    roleLabel: 'Employee',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    surface: 'employee',
    employeePresetId: 'EMP-PRIYA-02',
    highlight: 'Top 1% Holistic Champion (892/1,000) · Zero Rx · ABHA Linked',
  },
  {
    id: 'acc-vikram',
    name: 'Vikram Deshmukh',
    title: 'Regional Sales Lead',
    email: 'vikram.d@acmetech.in',
    org: 'Acme Tech India · Mumbai (Remote)',
    roleLabel: 'Employee',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    surface: 'employee',
    employeePresetId: 'EMP-VIKRAM-03',
    highlight: 'Pre-Diabetic Watch · Remote At-Home Screening · Delta Focus',
  },
  {
    id: 'acc-clinician',
    name: 'Dr. Meera Krishnan, MD',
    title: 'Lead Workshop Physician',
    email: 'dr.meera@pulseindex.in',
    org: 'PULSE Clinical Network · India',
    roleLabel: 'Clinician Tablet',
    badgeColor: 'bg-sky-100 text-sky-800',
    surface: 'clinician',
    highlight: 'Offline-first 5-station PWA (<90s/emp) · Lab Auto-Import · MD Sign-Off',
  },
  {
    id: 'acc-acme-admin',
    name: 'Ananya Rao',
    title: 'VP People & Culture',
    email: 'ananya.rao@acmetech.in',
    org: 'Acme Tech India (478 emp)',
    roleLabel: 'Customer Admin',
    badgeColor: 'bg-amber-100 text-amber-900',
    surface: 'customer_admin',
    tenantId: 'TEN-ACME',
    highlight: 'Gold Certified · CFO GMC ROI · DPDP k≥10 · SEBI BRSR Export',
  },
  {
    id: 'acc-finstack-admin',
    name: 'Siddharth Menon',
    title: 'Chief Human Resources Officer',
    email: 'siddharth@finstack.io',
    org: 'FinStack Technologies (640 emp)',
    roleLabel: 'Customer Admin',
    badgeColor: 'bg-amber-100 text-amber-900',
    surface: 'customer_admin',
    tenantId: 'TEN-FINSTACK',
    highlight: 'Platinum Certified (#1 League) · 91% Active · Roster & Camps',
  },
  {
    id: 'acc-broker',
    name: 'Raghav Sharma',
    title: 'VP Corporate Benefits & GMC',
    email: 'raghav@plumhq.demo',
    org: 'Plum Benefits India (Broker Partner)',
    roleLabel: 'Insurance Broker',
    badgeColor: 'bg-indigo-100 text-indigo-800',
    surface: 'customer_admin',
    tenantId: 'TEN-INDUSPAY',
    isBrokerView: true,
    highlight: 'Multi-client GMC Actuarial Cohorts · 5–15% Renewal Rebate Engine',
  },
  {
    id: 'acc-superadmin',
    name: 'Vivek Viswanathan',
    title: 'Founder & Platform Owner',
    email: 'vivek@pulseindex.in',
    org: 'PULSE India HQ',
    roleLabel: 'Platform Super-Admin',
    badgeColor: 'bg-violet-100 text-violet-900',
    surface: 'super_admin',
    highlight: 'Global SaaS ARR · Onboard Tenants · Score Weights · Broker/Lab APIs',
  },
];
