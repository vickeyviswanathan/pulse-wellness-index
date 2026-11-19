import React, { useState } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { DEMO_ACCOUNTS, type DemoAccount } from '../data/demoAccounts';

interface DemoLoginViewProps {
  onSelectAccount: (account: DemoAccount) => void;
  onBackToMarketing: () => void;
}

export const DemoLoginView: React.FC<DemoLoginViewProps> = ({
  onSelectAccount,
  onBackToMarketing,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'employee' | 'ops' | 'enterprise'>('all');

  const handleSsoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const match =
      DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === emailInput.trim().toLowerCase()) ??
      DEMO_ACCOUNTS[0];
    onSelectAccount(match);
  };

  const filtered = DEMO_ACCOUNTS.filter((a) => {
    if (filterRole === 'all') return true;
    if (filterRole === 'employee') return a.surface === 'employee';
    if (filterRole === 'ops') return a.surface === 'clinician' || a.surface === 'super_admin';
    return a.surface === 'customer_admin';
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Top Back Bar */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onBackToMarketing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Website
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-sm font-extrabold text-slate-900">PULSE India</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left: Corporate SSO Sign-In Box */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 card-elevated lg:col-span-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
              <Lock className="h-3 w-3" /> Corporate SSO &amp; OTP
            </span>
            <h1 className="font-editorial mt-3 text-3xl text-slate-900">Sign in to PULSE</h1>
            <p className="mt-1.5 text-xs text-slate-500">
              Use your corporate email or pick any of the <strong>8 live role-isolated demo accounts</strong> on the right.
            </p>

            <form onSubmit={handleSsoSubmit} className="mt-5 space-y-3 text-xs">
              <label className="block">
                <span className="font-bold text-slate-700">Work Email</span>
                <div className="relative mt-1">
                  <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="name@company.in"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-slate-900"
                  />
                </div>
              </label>
              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-extrabold text-white hover:bg-emerald-700"
              >
                Continue with Corporate OTP
              </button>
            </form>

            <div className="mt-6 rounded-2xl bg-slate-50 p-3.5 text-[11px] text-slate-600 ring-1 ring-slate-200/70">
              <p className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Strict Role Isolation Active
              </p>
              <p className="mt-1 leading-relaxed">
                Each demo account only sees the interface permitted for its role (e.g., Employees never see Admin; HR never sees raw PHI).
              </p>
            </div>
          </div>

          {/* Right: 8-Account 1-Click Demo Launcher */}
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <h2 className="text-sm font-extrabold text-slate-900">
                  1-Click Live Demo Accounts (8 Personas)
                </h2>
              </div>

              <div className="flex flex-wrap gap-1 rounded-xl bg-slate-200/70 p-1 text-[11px] font-bold">
                {[
                  { id: 'all', label: 'All (8)' },
                  { id: 'employee', label: 'Employees (3)' },
                  { id: 'enterprise', label: 'HR / CFO / Broker (3)' },
                  { id: 'ops', label: 'Clinician & Founder (2)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterRole(f.id as 'all' | 'employee' | 'ops' | 'enterprise')}
                    className={`rounded-lg px-2.5 py-1 ${
                      filterRole === f.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {filtered.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => onSelectAccount(acc)}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-500 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${acc.badgeColor}`}>
                        {acc.roleLabel}
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                    </div>
                    <p className="mt-2.5 text-sm font-extrabold text-slate-900">{acc.name}</p>
                    <p className="text-[11px] font-medium text-slate-500">
                      {acc.title} · {acc.org}
                    </p>
                    <p className="font-mono-num mt-1 text-[10px] text-slate-400">{acc.email}</p>
                  </div>
                  <p className="mt-3 rounded-xl bg-slate-50 px-2.5 py-1.5 text-[11px] font-medium text-slate-700">
                    {acc.highlight}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
