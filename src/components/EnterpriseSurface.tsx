import React, { useEffect, useState } from 'react';
import {
  Award,
  Building2,
  Calculator,
  Calendar,
  Check,
  Copy,
  Download,
  Lock,
  Plus,
  ShieldCheck,
  TrendingDown,
  UserPlus,
  Users,
} from 'lucide-react';
import type { CorporateTenant, TenantEmployeeRow, WorkshopScheduleItem } from '../types/pulse';
import { INTER_COMPANY_STANDINGS } from '../data/seedData';

interface EnterpriseSurfaceProps {
  tenants: CorporateTenant[];
  selectedTenantId: string;
  onSelectTenant: (id: string) => void;
  onUpdateTenant: (updated: CorporateTenant) => void;
}

export const EnterpriseSurface: React.FC<EnterpriseSurfaceProps> = ({
  tenants,
  selectedTenantId,
  onSelectTenant,
  onUpdateTenant,
}) => {
  const tenant = tenants.find((t) => t.id === selectedTenantId) ?? tenants[0];
  const [adminTab, setAdminTab] = useState<'overview' | 'roster' | 'workshops'>('overview');
  const [copiedBadge, setCopiedBadge] = useState(false);

  const [headcount, setHeadcount] = useState(tenant.headcount);
  const [gmcPremiumLakhs, setGmcPremiumLakhs] = useState(tenant.gmcPremiumLakhs);
  const [rebatePct, setRebatePct] = useState(10);
  const [pepmInr, setPepmInr] = useState(tenant.pepmInr);

  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empDept, setEmpDept] = useState(tenant.departments[0]?.name ?? 'Engineering');
  const [empMode, setEmpMode] = useState<'On-site' | 'Hybrid' | 'Remote'>('Hybrid');

  const [wkTitle, setWkTitle] = useState('');
  const [wkDate, setWkDate] = useState('Feb 15, 2027');
  const [wkMode, setWkMode] = useState<'On-Site 5-Station Camp' | 'At-Home Phlebotomy + Tele-Consult'>('On-Site 5-Station Camp');
  const [wkLab, setWkLab] = useState('Tata 1mg Enterprise');

  useEffect(() => {
    setHeadcount(tenant.headcount);
    setGmcPremiumLakhs(tenant.gmcPremiumLakhs);
    setPepmInr(tenant.pepmInr);
    setEmpDept(tenant.departments[0]?.name ?? 'Engineering');
  }, [tenant.id]);

  const annualPulseCostLakhs = +((headcount * pepmInr * 12) / 100000).toFixed(2);
  const projectedGmcSavingsLakhs = +((gmcPremiumLakhs * rebatePct) / 100).toFixed(2);
  const netBenefitLakhs = +(projectedGmcSavingsLakhs - annualPulseCostLakhs).toFixed(2);
  const roiMultiple =
    annualPulseCostLakhs > 0 ? +(projectedGmcSavingsLakhs / annualPulseCostLakhs).toFixed(1) : 0;

  const maxBar = Math.max(annualPulseCostLakhs, projectedGmcSavingsLakhs, 1);

  const handleCopyBadge = () => {
    navigator.clipboard?.writeText(
      `Proud to share that ${tenant.name} is a PULSE Certified Healthy Workplace (${tenant.certifiedTier} Tier · ${tenant.pulseScore}/1,000 Index)! #PULSEIndex #WorkplaceWellbeing`
    );
    setCopiedBadge(true);
    window.setTimeout(() => setCopiedBadge(false), 2500);
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim()) return;
    const newRow: TenantEmployeeRow = {
      empCode: `${tenant.id.slice(4, 8)}-${Math.floor(1000 + Math.random() * 9000)}`,
      name: empName.trim(),
      email: empEmail.trim() || `${empName.toLowerCase().replace(/\s+/g, '.')}@company.in`,
      department: empDept,
      workMode: empMode,
      status: 'Invited',
      lastWorkshop: 'Pending',
    };
    onUpdateTenant({ ...tenant, headcount: tenant.headcount + 1, roster: [newRow, ...tenant.roster] });
    setEmpName('');
    setEmpEmail('');
  };

  const handleScheduleWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wkTitle.trim()) return;
    const item: WorkshopScheduleItem = {
      id: `wk-${Date.now()}`,
      title: wkTitle.trim(),
      date: wkDate,
      mode: wkMode,
      labPartner: wkLab,
      bookedCount: 0,
      capacity: Math.min(250, tenant.headcount),
      status: 'Confirmed',
    };
    onUpdateTenant({ ...tenant, workshops: [item, ...tenant.workshops] });
    setWkTitle('');
  };

  const downloadCsv = (filename: string, rows: string[][]) => {
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportBrsrPack = () => {
    downloadCsv(`PULSE_SEBI_BRSR_${tenant.id}_2026.csv`, [
      ['SEBI BRSR Principle 3 Indicator', 'Metric Value', 'Verification Standard', 'Privacy Rule'],
      ['Organization', tenant.name, 'PULSE Index v2.0', 'DPDP Act 2023 Compliant'],
      ['Active Preventive Screening Coverage', `${tenant.participationPct}% (${tenant.activeCount}/${tenant.headcount})`, 'Clinician Verified Workshops', 'k-Anonymity >= 10'],
      ['Composite Corporate PULSE Index', `${tenant.pulseScore} / 1,000 (${tenant.certifiedTier} Certified)`, '1,000-pt Clinical + Holistic', 'Zero Individual PHI'],
    ]);
  };

  const exportBrokerActuarialPack = () => {
    downloadCsv(`PULSE_Broker_GMC_${tenant.id}_2026.csv`, [
      ['Risk Cohort (Anonymized)', 'Baseline Q2', 'Current Q4', 'Verified Delta', 'Broker Channel'],
      ['Pre-Diabetic / Elevated HbA1c (>5.7%)', '24.2%', '18.6%', '-5.6 pts', tenant.brokerPartner],
      ['Stage 1-2 Hypertension (>130/85)', '19.8%', '14.1%', '-5.7 pts', tenant.brokerPartner],
      ['High MSK / Ergonomic Risk', '31.5%', '21.0%', '-10.5 pts', tenant.brokerPartner],
    ]);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      {/* Top Customer Workspace Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 card-elevated">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Customer Tenant
          </span>
          <select
            value={tenant.id}
            onChange={(e) => onSelectTenant(e.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-extrabold text-slate-900"
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.city} · {t.headcount} emp)
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-500">
            Admin: <strong className="text-slate-800">{tenant.adminName}</strong>
          </span>
        </div>

        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {[
            { id: 'overview', label: 'Executive & CFO ROI' },
            { id: 'roster', label: `Roster (${tenant.roster.length})` },
            { id: 'workshops', label: `Workshops (${tenant.workshops.length})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setAdminTab(t.id as 'overview' | 'roster' | 'workshops')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                adminTab === t.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {adminTab === 'overview' && (
        <>
          {/* Hero Executive Bento */}
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 card-elevated lg:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-200">
                    <Building2 className="h-3.5 w-3.5" />
                    {tenant.name} · {tenant.industry}
                  </span>
                  <h2 className="font-editorial mt-3 text-4xl text-slate-900">
                    Workforce PULSE Index:{' '}
                    <span className="font-mono-num font-extrabold text-emerald-700">
                      {tenant.pulseScore}
                    </span>
                    <span className="text-xl text-slate-400"> / 1,000</span>
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Channel Partner: <strong className="text-slate-800">{tenant.brokerPartner}</strong> ·{' '}
                    {tenant.participationPct}% Active (1.1× Multiplier) · DPDP k ≥ 10 Verified
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={exportBrsrPack}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50"
                  >
                    <Download className="h-3.5 w-3.5 text-emerald-600" />
                    SEBI BRSR CSV
                  </button>
                  <button
                    onClick={exportBrokerActuarialPack}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Broker GMC Pack
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Active Screened', value: `${tenant.participationPct}%`, sub: `${tenant.activeCount} / ${tenant.headcount} Staff`, tone: 'text-emerald-700' },
                  { label: 'Quarterly Delta', value: `+${tenant.avgDelta} pts`, sub: 'Verified Lift', tone: 'text-sky-700' },
                  { label: 'High-Risk Drop', value: '-23%', sub: 'Pre-DM & HTN', tone: 'text-emerald-700' },
                  { label: 'DPDP Privacy', value: '100%', sub: 'Zero Raw PHI', tone: 'text-amber-700' },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
                    <p className="text-[11px] font-semibold text-slate-500">{kpi.label}</p>
                    <p className={`font-mono-num mt-1 text-xl font-extrabold ${kpi.tone}`}>{kpi.value}</p>
                    <p className="text-[10px] text-slate-400">{kpi.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Metallic Gold Certification Seal Card */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C1917] via-[#292524] to-[#451A03] p-6 text-white shadow-xl">
              <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-amber-400/20 blur-2xl" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                    Employer Brand Seal
                  </span>
                  <Award className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="font-editorial mt-4 text-3xl leading-tight text-white">
                  PULSE Certified Healthy Workplace™
                </h3>
                <p className="mt-1.5 text-xs font-extrabold tracking-wider text-amber-300">
                  {tenant.certifiedTier.toUpperCase()} TIER · INDIA 2026–27
                </p>
                <p className="mt-2 text-xs leading-relaxed text-stone-300">
                  Audit-verified top-quartile workforce health index for LinkedIn, campus hiring,
                  and SEBI BRSR Principle 3 filings.
                </p>
              </div>
              <button
                onClick={handleCopyBadge}
                className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-400 px-3 py-2 text-xs font-extrabold text-stone-950 hover:bg-amber-300"
              >
                {copiedBadge ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedBadge ? 'Copied LinkedIn Post!' : 'Copy LinkedIn Announcement'}
              </button>
            </div>
          </div>

          {/* CFO GMC ROI Visual Calculator + Risk Cohorts */}
          <div className="grid gap-5 lg:grid-cols-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 card-elevated lg:col-span-3">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  CFO &amp; Broker · Group Medical Cover (GMC) Renewal ROI (₹)
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Simulate verified chronic risk reduction turning into 5–15% GMC renewal rebates.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 text-xs">
                <label className="block">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-600">Covered Employees</span>
                    <strong className="font-mono-num text-slate-900">{headcount}</strong>
                  </div>
                  <input type="range" min={100} max={2500} step={25} value={headcount} onChange={(e) => setHeadcount(Number(e.target.value))} className="mt-1.5 w-full accent-emerald-600" />
                </label>
                <label className="block">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-600">Annual GMC Premium</span>
                    <strong className="font-mono-num text-slate-900">₹{gmcPremiumLakhs}L</strong>
                  </div>
                  <input type="range" min={50} max={1000} step={10} value={gmcPremiumLakhs} onChange={(e) => setGmcPremiumLakhs(Number(e.target.value))} className="mt-1.5 w-full accent-sky-600" />
                </label>
                <label className="block">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-600">Negotiated GMC Rebate</span>
                    <strong className="font-mono-num text-emerald-700">{rebatePct}%</strong>
                  </div>
                  <input type="range" min={5} max={15} step={1} value={rebatePct} onChange={(e) => setRebatePct(Number(e.target.value))} className="mt-1.5 w-full accent-emerald-600" />
                </label>
                <label className="block">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-600">PULSE SaaS Fee (PEPM)</span>
                    <strong className="font-mono-num text-slate-900">₹{pepmInr}/mo</strong>
                  </div>
                  <input type="range" min={150} max={350} step={10} value={pepmInr} onChange={(e) => setPepmInr(Number(e.target.value))} className="mt-1.5 w-full accent-slate-800" />
                </label>
              </div>

              {/* Visual Cost vs Savings Comparison Bars */}
              <div className="mt-5 space-y-2.5 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs">
                <div>
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-600">Annual PULSE SaaS Investment</span>
                    <span className="font-mono-num text-slate-900">₹{annualPulseCostLakhs}L</span>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-slate-700 transition-all" style={{ width: `${(annualPulseCostLakhs / maxBar) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-bold">
                    <span className="text-emerald-800">Projected GMC Renewal Rebate</span>
                    <span className="font-mono-num text-emerald-700">₹{projectedGmcSavingsLakhs}L</span>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-emerald-100">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(projectedGmcSavingsLakhs / maxBar) * 100}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-2.5">
                  <span className="font-bold text-slate-700">Net CFO P&amp;L Gain</span>
                  <span className="font-mono-num rounded-full bg-emerald-600 px-3 py-0.5 text-xs font-extrabold text-white">
                    {netBenefitLakhs >= 0 ? `+₹${netBenefitLakhs}L` : `-₹${Math.abs(netBenefitLakhs)}L`} ({roiMultiple}× ROI)
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 card-elevated lg:col-span-2">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Verified Chronic Risk Drop</h3>
              </div>
              <p className="mt-1 text-xs text-slate-500">Anonymized Q2 → Q4 2026 actuarial cohorts</p>
              <div className="mt-4 space-y-2.5 text-xs">
                {[
                  { name: 'Pre-Diabetic (HbA1c > 5.7%)', from: '24.2%', to: '18.6%', delta: '-5.6 pts' },
                  { name: 'Stage-1 Hypertension', from: '19.8%', to: '14.1%', delta: '-5.7 pts' },
                  { name: 'High MSK / Ergonomic Risk', from: '31.5%', to: '21.0%', delta: '-10.5 pts' },
                  { name: 'Severe Burnout / Poor Sleep', from: '27.0%', to: '19.4%', delta: '-7.6 pts' },
                ].map((c) => (
                  <div key={c.name} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{c.name}</span>
                      <span className="font-mono-num rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                        {c.delta}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {c.from} → <strong className="text-slate-900">{c.to}</strong> of screened staff
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DPDP k>=10 Department Analytics */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 card-elevated">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Department Standings (DPDP k ≥ 10 Anonymity Enforced)
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" /> Cohorts &lt;10 auto-shielded
              </span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400">
                    <th className="py-2.5 pr-4">Department</th>
                    <th className="py-2.5 pr-4">Active / Total</th>
                    <th className="py-2.5 pr-4">Participation</th>
                    <th className="py-2.5 pr-4">Avg PULSE Score</th>
                    <th className="py-2.5">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenant.departments.map((d) => {
                    const shielded = d.activeCount < 10;
                    return (
                      <tr key={d.id} className={shielded ? 'bg-amber-50/50 text-slate-400' : ''}>
                        <td className="py-3 pr-4 font-bold text-slate-900">{d.name}</td>
                        <td className="font-mono-num py-3 pr-4">
                          {d.activeCount} / {d.totalCount}
                        </td>
                        <td className="py-3 pr-4">
                          {shielded ? (
                            <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                              <Lock className="h-3.5 w-3.5" /> Rolled up (k &lt; 10)
                            </span>
                          ) : (
                            <span className="font-semibold text-slate-700">
                              {d.participationPct}%{' '}
                              {d.participationPct >= 80 && (
                                <span className="ml-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                                  1.1×
                                </span>
                              )}
                            </span>
                          )}
                        </td>
                        <td className="font-mono-num py-3 pr-4 font-extrabold text-slate-900">
                          {shielded ? 'Shielded (DPDP)' : `${d.avgScore} / 1,000`}
                        </td>
                        <td className="font-mono-num py-3 font-bold text-emerald-700">
                          {shielded ? '—' : `+${d.avgDelta}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inter-Company League */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 card-elevated">
            <h3 className="text-sm font-extrabold text-slate-900">
              India Mid-Market Inter-Company Championship (250–1,000 Employees)
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-5">
              {INTER_COMPANY_STANDINGS.map((c) => (
                <div
                  key={c.company}
                  className={`rounded-2xl border p-4 text-xs ${
                    c.company === tenant.name
                      ? 'border-emerald-500 bg-emerald-50/70'
                      : 'border-slate-200 bg-slate-50/60'
                  }`}
                >
                  <span className="font-mono-num text-[10px] font-bold text-slate-400">RANK #{c.rank}</span>
                  <p className="mt-1 font-extrabold text-slate-900">{c.company}</p>
                  <p className="text-[11px] text-slate-500">{c.city}</p>
                  <p className="font-mono-num mt-2 text-xl font-extrabold text-emerald-700">{c.score}</p>
                  <p className="text-[10px] font-bold text-amber-700">{c.certifiedTier} Certified</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ROSTER TAB */}
      {adminTab === 'roster' && (
        <div className="space-y-5">
          <form onSubmit={handleAddEmployee} className="rounded-3xl border border-slate-200 bg-white p-6 card-elevated">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <UserPlus className="h-4 w-4 text-emerald-600" />
              Invite Employee to {tenant.name} (SSO / Corporate OTP)
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Customer Admins manage eligibility only — individual medical reports remain invisible under DPDP Act 2023.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-4 text-xs">
              <input required placeholder="Employee Full Name" value={empName} onChange={(e) => setEmpName(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900" />
              <input placeholder="work.email@company.in" value={empEmail} onChange={(e) => setEmpEmail(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900" />
              <select value={empDept} onChange={(e) => setEmpDept(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900">
                {tenant.departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
              <div className="flex gap-2">
                <select value={empMode} onChange={(e) => setEmpMode(e.target.value as 'On-site' | 'Hybrid' | 'Remote')} className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2.5 text-slate-900">
                  <option>Hybrid</option><option>On-site</option><option>Remote</option>
                </select>
                <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 font-extrabold text-white hover:bg-emerald-700">+ Add</button>
              </div>
            </div>
          </form>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 card-elevated">
            <h3 className="text-sm font-extrabold text-slate-900">Company Employee Directory</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400">
                    <th className="py-2 pr-4">Emp Code</th>
                    <th className="py-2 pr-4">Employee</th>
                    <th className="py-2 pr-4">Department</th>
                    <th className="py-2 pr-4">Mode</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Last Workshop</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenant.roster.map((r) => (
                    <tr key={r.empCode}>
                      <td className="font-mono-num py-3 pr-4 text-slate-500">{r.empCode}</td>
                      <td className="py-3 pr-4"><p className="font-bold text-slate-900">{r.name}</p><p className="text-[11px] text-slate-400">{r.email}</p></td>
                      <td className="py-3 pr-4 text-slate-700">{r.department}</td>
                      <td className="py-3 pr-4 text-slate-600">{r.workMode}</td>
                      <td className="py-3 pr-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${r.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : r.status === 'Camp Booked' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500">{r.lastWorkshop}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* WORKSHOPS TAB */}
      {adminTab === 'workshops' && (
        <div className="space-y-5">
          <form onSubmit={handleScheduleWorkshop} className="rounded-3xl border border-slate-200 bg-white p-6 card-elevated">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <Calendar className="h-4 w-4 text-emerald-600" />
              Schedule On-Site Wellness Camp or Remote At-Home Wave
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-4 text-xs">
              <input required placeholder="e.g., Q2 2027 Mumbai Offsite Screening" value={wkTitle} onChange={(e) => setWkTitle(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900" />
              <input value={wkDate} onChange={(e) => setWkDate(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900" />
              <select value={wkMode} onChange={(e) => setWkMode(e.target.value as 'On-Site 5-Station Camp' | 'At-Home Phlebotomy + Tele-Consult')} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900">
                <option>On-Site 5-Station Camp</option><option>At-Home Phlebotomy + Tele-Consult</option>
              </select>
              <div className="flex gap-2">
                <select value={wkLab} onChange={(e) => setWkLab(e.target.value)} className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2.5 text-slate-900">
                  <option>Tata 1mg Enterprise</option><option>Redcliffe Labs</option><option>Orange Health Labs</option><option>Metropolis Healthcare</option>
                </select>
                <button type="submit" className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-2 font-extrabold text-white hover:bg-emerald-700"><Plus className="h-3.5 w-3.5" /> Book</button>
              </div>
            </div>
          </form>

          <div className="grid gap-4 md:grid-cols-2">
            {tenant.workshops.map((w) => (
              <div key={w.id} className="rounded-3xl border border-slate-200 bg-white p-5 card-elevated text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{w.title}</h4>
                    <p className="mt-1 text-slate-500">{w.date} · {w.mode}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">{w.status}</span>
                </div>
                <div className="mt-4 flex justify-between text-slate-600">
                  <span>Partner: <strong className="text-slate-900">{w.labPartner}</strong></span>
                  <span className="font-mono-num">Booked: <strong>{w.bookedCount}</strong> / {w.capacity}</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, (w.bookedCount / Math.max(1, w.capacity)) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
