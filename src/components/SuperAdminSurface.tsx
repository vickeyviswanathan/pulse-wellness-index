import React, { useState } from 'react';
import {
  Award,
  Building2,
  CheckCircle2,
  Crown,
  IndianRupee,
  Plus,
  Settings2,
  ShieldCheck,
  Sliders,
  Trophy,
  Users,
} from 'lucide-react';
import type { CorporateTenant, GlobalScoreWeights } from '../types/pulse';

interface SuperAdminSurfaceProps {
  tenants: CorporateTenant[];
  onAddTenant: (tenant: CorporateTenant) => void;
  onSelectTenantForCustomerAdmin: (tenantId: string) => void;
  weights: GlobalScoreWeights;
  onUpdateWeights: (w: GlobalScoreWeights) => void;
}

export const SuperAdminSurface: React.FC<SuperAdminSurfaceProps> = ({
  tenants,
  onAddTenant,
  onSelectTenantForCustomerAdmin,
  weights,
  onUpdateWeights,
}) => {
  const [activeTab, setActiveTab] = useState<'tenants' | 'scoring' | 'partners'>('tenants');
  const [seasonStatus, setSeasonStatus] = useState<'Registration Open' | 'Season Live' | 'Winners Published'>('Season Live');
  const [showAddForm, setShowAddForm] = useState(false);

  const [newName, setNewName] = useState('');
  const [newCity, setNewCity] = useState('Bengaluru');
  const [newIndustry, setNewIndustry] = useState('Tech / SaaS');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newBroker, setNewBroker] = useState('Plum Benefits India');
  const [newHeadcount, setNewHeadcount] = useState(350);
  const [newPepm, setNewPepm] = useState(220);

  const totalLives = tenants.reduce((s, t) => s + t.headcount, 0);
  const totalActive = tenants.reduce((s, t) => s + t.activeCount, 0);
  const totalArrLakhs = +(
    tenants.reduce((s, t) => s + t.headcount * t.pepmInr * 12, 0) / 100000
  ).toFixed(1);
  const avgScore = Math.round(tenants.reduce((s, t) => s + t.pulseScore, 0) / Math.max(1, tenants.length));
  const baseWeightSum =
    weights.medical + weights.physio + weights.nutrition + weights.mentalSleep + weights.activity;

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const id = `TEN-${Date.now()}`;
    const created: CorporateTenant = {
      id,
      name: newName.trim(),
      city: newCity,
      industry: newIndustry,
      tier:
        newHeadcount < 250
          ? 'Startup (<250)'
          : newHeadcount <= 1000
            ? 'Mid-Market (250-1,000)'
            : 'Enterprise (1,000+)',
      adminName: newAdminName.trim() || 'HR Wellness Admin',
      adminEmail: newAdminEmail.trim() || 'hr@company.in',
      brokerPartner: newBroker,
      headcount: newHeadcount,
      activeCount: Math.round(newHeadcount * 0.8),
      participationPct: 80,
      pulseScore: 720,
      avgDelta: 42,
      pepmInr: newPepm,
      gmcPremiumLakhs: Math.round(newHeadcount * 0.5),
      certifiedTier: 'Pending',
      status: 'Onboarding',
      departments: [
        { id: `${id}-d1`, name: 'Engineering & Tech', activeCount: Math.round(newHeadcount * 0.4), totalCount: Math.round(newHeadcount * 0.5), avgScore: 730, avgDelta: 45, participationPct: 80 },
        { id: `${id}-d2`, name: 'Operations & Sales', activeCount: Math.round(newHeadcount * 0.35), totalCount: Math.round(newHeadcount * 0.45), avgScore: 708, avgDelta: 38, participationPct: 78 },
        { id: `${id}-d3`, name: 'Leadership & Legal', activeCount: 6, totalCount: 8, avgScore: 750, avgDelta: 30, participationPct: 75 },
      ],
      roster: [
        { empCode: 'NEW-001', name: newAdminName.trim() || 'Primary Admin', email: newAdminEmail.trim() || 'hr@company.in', department: 'Leadership & Legal', workMode: 'Hybrid', status: 'Active', lastWorkshop: 'Scheduled' },
      ],
      workshops: [
        { id: `wk-${id}`, title: 'Baseline Onboarding Wellness Camp', date: 'Next Month', mode: 'On-Site 5-Station Camp', labPartner: 'Tata 1mg Enterprise', bookedCount: Math.round(newHeadcount * 0.6), capacity: newHeadcount, status: 'Confirmed' },
      ],
    };
    onAddTenant(created);
    setShowAddForm(false);
    setNewName('');
    setNewAdminName('');
    setNewAdminEmail('');
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      {/* Dark Executive Founder Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#111827] to-[#064E3B] p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-emerald-300">
              <Crown className="h-3.5 w-3.5" />
              Platform Super-Admin Console (Founder View)
            </span>
            <h2 className="font-editorial mt-2 text-4xl text-white">
              PULSE India Multi-Tenant Control Plane
            </h2>
            <p className="mt-1 text-xs text-slate-300">
              Provision corporate tenants, govern global 1,000-point scoring weights, and manage
              broker &amp; lab partner rails.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg hover:bg-emerald-300"
          >
            <Plus className="h-4 w-4" />
            Onboard New Corporate Customer
          </button>
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Platform SaaS ARR', value: `₹${totalArrLakhs}L`, sub: `${tenants.length} active tenants`, icon: IndianRupee, tone: 'text-emerald-300' },
            { label: 'Covered Lives', value: totalLives.toLocaleString(), sub: `${totalActive.toLocaleString()} active`, icon: Users, tone: 'text-sky-300' },
            { label: 'India Avg Index', value: `${avgScore}/1000`, sub: 'Verified composite', icon: Award, tone: 'text-amber-300' },
            { label: 'Season Status', value: seasonStatus, sub: '2026–27 Championship', icon: Trophy, tone: 'text-white' },
          ].map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>{k.label}</span>
                  <Icon className="h-4 w-4 text-emerald-300" />
                </div>
                <p className={`font-mono-num mt-1.5 text-xl font-extrabold ${k.tone}`}>{k.value}</p>
                <p className="text-[10px] text-slate-400">{k.sub}</p>
              </div>
            );
          })}
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateTenant} className="rounded-3xl border border-emerald-300 bg-white p-6 card-elevated">
          <h3 className="text-sm font-extrabold text-slate-900">
            Provision New Corporate Customer Tenant
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-4 text-xs">
            <input required placeholder="Company Name *" value={newName} onChange={(e) => setNewName(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900" />
            <select value={newCity} onChange={(e) => setNewCity(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900">
              <option>Bengaluru</option><option>Mumbai</option><option>Gurugram</option><option>Hyderabad</option><option>Pune</option>
            </select>
            <input value={newIndustry} onChange={(e) => setNewIndustry(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900" />
            <select value={newBroker} onChange={(e) => setNewBroker(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900">
              <option>Plum Benefits India</option><option>Marsh India Corporate</option><option>Pazcare Benefits</option><option>Direct Enterprise</option>
            </select>
            <input placeholder="Customer Admin Name" value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900" />
            <input placeholder="chro@company.in" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900" />
            <input type="number" min={50} value={newHeadcount} onChange={(e) => setNewHeadcount(Number(e.target.value))} className="font-mono-num rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900" />
            <input type="number" min={100} value={newPepm} onChange={(e) => setNewPepm(Number(e.target.value))} className="font-mono-num rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900" />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600">Cancel</button>
            <button type="submit" className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-extrabold text-white hover:bg-emerald-700">Create Tenant</button>
          </div>
        </form>
      )}

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'tenants', label: 'Corporate Customer Tenants', icon: Building2 },
          { id: 'scoring', label: 'Global Score Weights & Seasons', icon: Sliders },
          { id: 'partners', label: 'Brokers & Diagnostic Labs', icon: Settings2 },
        ].map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as 'tenants' | 'scoring' | 'partners')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                active
                  ? 'bg-slate-900 text-white shadow'
                  : 'border border-slate-200 bg-white text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'tenants' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 card-elevated">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold text-slate-900">
              Corporate Tenants ({tenants.length}) — Click any customer to open their Customer Admin Portal
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" /> Zero-PHI Tenant Isolation
            </span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400">
                  <th className="py-2.5 pr-4">Company</th>
                  <th className="py-2.5 pr-4">Customer Admin</th>
                  <th className="py-2.5 pr-4">Broker Channel</th>
                  <th className="py-2.5 pr-4">Lives</th>
                  <th className="py-2.5 pr-4">PULSE Score</th>
                  <th className="py-2.5 pr-4">ARR (₹)</th>
                  <th className="py-2.5">Workspace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenants.map((t) => {
                  const arrLakhs = +((t.headcount * t.pepmInr * 12) / 100000).toFixed(1);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-3.5 pr-4"><p className="font-extrabold text-slate-900">{t.name}</p><p className="text-[11px] text-slate-500">{t.city} · {t.industry}</p></td>
                      <td className="py-3.5 pr-4"><p className="font-semibold text-slate-800">{t.adminName}</p><p className="text-[11px] text-slate-400">{t.adminEmail}</p></td>
                      <td className="py-3.5 pr-4 font-semibold text-sky-700">{t.brokerPartner}</td>
                      <td className="font-mono-num py-3.5 pr-4"><strong>{t.headcount}</strong> <span className="text-emerald-700">({t.participationPct}%)</span></td>
                      <td className="font-mono-num py-3.5 pr-4 font-extrabold text-slate-900">{t.pulseScore} <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800">{t.certifiedTier}</span></td>
                      <td className="font-mono-num py-3.5 pr-4 font-extrabold text-emerald-700">₹{arrLakhs}L</td>
                      <td className="py-3.5">
                        <button onClick={() => onSelectTenantForCustomerAdmin(t.id)} className="rounded-xl bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700">
                          Open Admin →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'scoring' && (
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 card-elevated">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">Global Score Weight Matrix</h3>
              <span className={`font-mono-num rounded-full px-2.5 py-0.5 text-[11px] font-bold ${baseWeightSum === 1000 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                Base: {baseWeightSum} / 1,000
              </span>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              {[
                { key: 'medical', label: 'Medical Biomarkers (Station 1)', max: 400 },
                { key: 'physio', label: 'Physio & Ergonomics (Station 2)', max: 300 },
                { key: 'nutrition', label: 'Nutrition & Body Comp (Station 3)', max: 300 },
                { key: 'mentalSleep', label: 'Mental & Sleep Quotient (Station 4)', max: 250 },
                { key: 'activity', label: 'Activity & Consistency Sync', max: 300 },
                { key: 'holisticCap', label: 'Holistic Bonus Cap (+)', max: 150 },
              ].map((item) => {
                const k = item.key as keyof GlobalScoreWeights;
                return (
                  <label key={item.key} className="block">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-600">{item.label}</span>
                      <strong className="font-mono-num text-slate-900">{weights[k]} pts</strong>
                    </div>
                    <input type="range" min={50} max={item.max} step={10} value={weights[k]} onChange={(e) => onUpdateWeights({ ...weights, [k]: Number(e.target.value) })} className="mt-1 w-full accent-emerald-600" />
                  </label>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 card-elevated">
            <h3 className="text-sm font-extrabold text-slate-900">National Championship Season Controls</h3>
            <div className="mt-4 space-y-2.5">
              {(['Registration Open', 'Season Live', 'Winners Published'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSeasonStatus(st)}
                  className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-left text-xs font-bold transition ${
                    seasonStatus === st ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  <span>{st}</span>
                  {seasonStatus === st && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'partners' && (
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 card-elevated">
            <h3 className="text-sm font-extrabold text-slate-900">Corporate Insurance Broker Channels</h3>
            <div className="mt-3 space-y-2.5 text-xs">
              {[
                { name: 'Plum Benefits India', clients: 14, lives: '8,400', revShare: '15%' },
                { name: 'Marsh India Corporate', clients: 9, lives: '12,200', revShare: '12%' },
                { name: 'Pazcare Benefits', clients: 11, lives: '6,800', revShare: '15%' },
              ].map((b) => (
                <div key={b.name} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                  <div>
                    <p className="font-extrabold text-slate-900">{b.name}</p>
                    <p className="text-[11px] text-slate-500">{b.clients} Corporates · {b.lives} Lives · {b.revShare} Rev-Share</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">Connected</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 card-elevated">
            <h3 className="text-sm font-extrabold text-slate-900">Diagnostic Lab LIMS Integrations</h3>
            <div className="mt-3 space-y-2.5 text-xs">
              {[
                { name: 'Tata 1mg Enterprise Labs', coverage: 'Pan-India · HL7/FHIR Webhook', status: 'Live' },
                { name: 'Redcliffe Labs', coverage: '220+ Cities · Home Phlebotomy API', status: 'Live' },
                { name: 'Orange Health Labs', coverage: 'BLR / MUM / NCR · 60m Pickup', status: 'Live' },
                { name: 'Metropolis Healthcare', coverage: 'Enterprise BFSI Panels', status: 'Sandbox' },
              ].map((l) => (
                <div key={l.name} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                  <div>
                    <p className="font-extrabold text-slate-900">{l.name}</p>
                    <p className="text-[11px] text-slate-500">{l.coverage}</p>
                  </div>
                  <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-extrabold text-sky-800">{l.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
