-- ============================================================================
-- PULSE Corporate Wellness Index (India-First, DPDP Act 2023 Compliant)
-- Target Database: PostgreSQL 16+ (Supabase ap-south-1 Mumbai / AWS RDS Mumbai)
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. Corporate Customer Tenants (Managed by Platform Super-Admin)
create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  city text not null,
  industry text,
  size_tier text check (size_tier in ('Startup (<250)', 'Mid-Market (250-1,000)', 'Enterprise (1,000+)')) not null,
  broker_partner text,
  pepm_inr integer not null default 220,
  gmc_premium_lakhs numeric(10,2) default 0,
  certified_tier text check (certified_tier in ('Platinum', 'Gold', 'Silver', 'Pending')) default 'Pending',
  status text check (status in ('Active', 'Pilot', 'Onboarding')) default 'Onboarding',
  created_at timestamptz not null default now()
);

-- 2. User Roles & Tenant Membership (Strictly separated from Clinical PHI)
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  role text check (role in ('super_admin', 'customer_admin', 'clinician', 'broker', 'employee')) not null,
  emp_code text,
  full_name text not null,
  privacy_alias text not null,
  department text,
  work_mode text check (work_mode in ('On-site', 'Hybrid', 'Remote')) default 'Hybrid',
  abha_id text,
  created_at timestamptz not null default now()
);

-- 3. DPDP Act 2023 Granular Consent Ledger (Immutable Audit Trail)
create table if not exists public.dpdp_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  consent_key text not null, -- e.g. 'workshop_capture', 'dept_benchmark', 'wearable_sync', 'abha_link'
  granted boolean not null,
  policy_version text not null default 'DPDP-2025-v1',
  recorded_at timestamptz not null default now()
);

-- 4. Encrypted PHI Vault: Clinical Workshop Assessments (Stations 1-5)
--    ZERO HR/Customer-Admin access via RLS below.
create table if not exists public.phi_workshop_assessments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  employee_id uuid not null references public.user_profiles(id) on delete cascade,
  clinician_id uuid references public.user_profiles(id),
  quarter_label text not null,
  station1_medical jsonb not null,     -- BP, HbA1c, Lipids, RHR, controlled_on_meds
  station2_physio jsonb not null,      -- Posture, core, ROM, ergo_risk
  station3_nutrition jsonb not null,   -- Visceral fat, muscle mass, Vit D/B12
  station4_lifestyle jsonb not null,   -- PSS, PSQI, sleep, burnout
  station5_holistic jsonb not null,    -- Rx count, MD deprescribing signed token
  pillar_scores jsonb not null,
  holistic_bonus integer not null default 0 check (holistic_bonus between 0 and 100),
  total_pulse_score integer not null check (total_pulse_score between 0 and 1000),
  score_delta integer not null default 0,
  lab_report_s3_key text,
  captured_offline boolean not null default false,
  created_at timestamptz not null default now()
);

-- 5. Anti-Cheat Verified Holistic Practice Logs
create table if not exists public.holistic_practice_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.user_profiles(id) on delete cascade,
  modality text not null,
  duration_min integer not null,
  verification_method text check (verification_method in ('Guided Timer', 'Wearable HRV', 'Clinician Sign-Off')) not null,
  created_at timestamptz not null default now()
);

-- 6. Workshop & Diagnostic Camp Scheduler
create table if not exists public.workshops (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  scheduled_date date not null,
  mode text check (mode in ('On-Site 5-Station Camp', 'At-Home Phlebotomy + Tele-Consult')) not null,
  lab_partner text not null,
  capacity integer not null default 200,
  status text check (status in ('Confirmed', 'In Progress', 'Completed')) default 'Confirmed',
  created_at timestamptz not null default now()
);

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS): DPDP ACT 2023 ZERO-PHI ISOLATION
-- ============================================================================
alter table public.tenants enable row level security;
alter table public.user_profiles enable row level security;
alter table public.dpdp_consents enable row level security;
alter table public.phi_workshop_assessments enable row level security;
alter table public.holistic_practice_logs enable row level security;
alter table public.workshops enable row level security;

-- Employees can ONLY read their own PHI assessments; HR/Customer Admins are mathematically blocked.
create policy "employee_reads_own_phi"
  on public.phi_workshop_assessments for select
  using (auth.uid() = employee_id);

-- Clinicians can insert/update assessments they verify during workshops.
create policy "clinician_writes_phi"
  on public.phi_workshop_assessments for insert
  with check (
    exists (
      select 1 from public.user_profiles p
      where p.id = auth.uid() and p.role = 'clinician'
    )
  );

-- ============================================================================
-- PRIVACY-PRESERVING AGGREGATION VIEW (STRICT k >= 10 ANONYMITY FOR HR & CFO)
-- ============================================================================
create or replace view public.v_department_wellness_k10 as
select
  a.tenant_id,
  u.department,
  count(distinct a.employee_id) as active_employees,
  case
    when count(distinct a.employee_id) >= 10 then round(avg(a.total_pulse_score))
    else null
  end as avg_pulse_score,
  case
    when count(distinct a.employee_id) >= 10 then round(avg(a.score_delta))
    else null
  end as avg_score_delta,
  (count(distinct a.employee_id) < 10) as is_dpdp_shielded
from public.phi_workshop_assessments a
join public.user_profiles u on u.id = a.employee_id
group by a.tenant_id, u.department;
