import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  Award,
  Building2,
  Calculator,
  CheckCircle2,
  Menu,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Trophy,
  WifiOff,
  X,
} from 'lucide-react';
import { ScoreGauge } from './ScoreGauge';

interface MarketingSiteProps {
  onOpenLogin: () => void;
  onQuickLaunchAccount: (accountId: string) => void;
}

export const MarketingSite: React.FC<MarketingSiteProps> = ({
  onOpenLogin,
  onQuickLaunchAccount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pilotModalOpen, setPilotModalOpen] = useState(false);
  const [pilotSubmitted, setPilotSubmitted] = useState(false);

  // Interactive Landing Page CFO Estimator
  const [empCount, setEmpCount] = useState(500);
  const [gmcLakhs, setGmcLakhs] = useState(250);
  const pulseAnnualLakhs = +((empCount * 220 * 12) / 100000).toFixed(1);
  const gmcRebateLakhs = +(gmcLakhs * 0.1).toFixed(1);
  const netGainLakhs = +(gmcRebateLakhs - pulseAnnualLakhs).toFixed(1);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900">
      {/* Sticky Marketing Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-sm">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900">PULSE</span>
              <span className="ml-1.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-800 ring-1 ring-emerald-200">
                INDIA
              </span>
            </div>
          </div>

          <nav className="hidden items-center gap-7 text-xs font-bold text-slate-600 md:flex">
            <a href="#buyers" className="hover:text-slate-900">For CFO &amp; CHRO</a>
            <a href="#how-it-works" className="hover:text-slate-900">How It Works</a>
            <a href="#roi" className="hover:text-slate-900">GMC ROI Calculator</a>
            <a href="#pricing" className="hover:text-slate-900">Pricing</a>
          </nav>

          <div className="hidden items-center gap-2.5 md:flex">
            <button
              onClick={onOpenLogin}
              className="rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Sign In
            </button>
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-emerald-700"
            >
              Try Live Demo <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="rounded-xl border border-slate-200 p-2 text-slate-700 md:hidden"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm font-bold text-slate-700">
              <a href="#buyers" onClick={() => setMobileMenuOpen(false)}>For CFO &amp; CHRO</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
              <a href="#roi" onClick={() => setMobileMenuOpen(false)}>GMC ROI Calculator</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLogin();
                  }}
                  className="rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-900"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLogin();
                  }}
                  className="rounded-xl bg-slate-900 py-2.5 text-xs font-extrabold text-white"
                >
                  Try Live Demo
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 md:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-[11px] font-extrabold text-emerald-900">
              <Sparkles className="h-3.5 w-3.5" />
              India’s Standardized Corporate Wellness Index · DPDP Act 2023 Ready
            </span>

            <h1 className="font-editorial mt-5 text-5xl leading-[1.06] tracking-tight text-slate-900 sm:text-6xl">
              The <span className="italic text-emerald-700">CIBIL Score</span> &amp;{' '}
              <span className="italic text-emerald-700">Great Place to Work®</span> of Corporate Health.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
              PULSE turns quarterly hybrid clinical workshops, verified holistic habits, and
              offline-first diagnostics into a standardized <strong>1,000-point Workforce Index</strong> —
              unlocking <strong>5–15% Group Health Insurance (GMC) renewal rebates</strong>,{' '}
              <strong>SEBI BRSR compliance</strong>, and national employer-brand prestige.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-slate-900/15 hover:bg-emerald-700"
              >
                Explore 8 Live Demo Accounts
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setPilotSubmitted(false);
                  setPilotModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 hover:bg-slate-50"
              >
                Book a Q1 Baseline Pilot
              </button>
            </div>

            {/* Trust Strip */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Mumbai (asia-south1) Data Residency
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Strict k ≥ 10 Zero-PHI Privacy
              </span>
              <span className="inline-flex items-center gap-1.5">
                <WifiOff className="h-4 w-4 text-emerald-600" /> Offline-First Camp PWA
              </span>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-5">
            <div className="mx-auto max-w-sm">
              <ScoreGauge
                score={784}
                delta={54}
                holisticBonus={70}
                rankLabel="Acme Tech India · Gold Certified · #3 Mid-Market League"
              />
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => onQuickLaunchAccount('acc-aarav')}
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-emerald-400"
                >
                  <p className="text-[11px] font-extrabold text-emerald-700">Employee App →</p>
                  <p className="text-[11px] text-slate-500">Try Breathing Orb &amp; Delta League</p>
                </button>
                <button
                  onClick={() => onQuickLaunchAccount('acc-acme-admin')}
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-emerald-400"
                >
                  <p className="text-[11px] font-extrabold text-slate-900">CFO / CHRO Portal →</p>
                  <p className="text-[11px] text-slate-500">See GMC ROI &amp; SEBI BRSR</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BUYER VALUE PROPS (CFO / CHRO / CISO) */}
      <section id="buyers" className="border-y border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-2xl">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">
              Built for the Enterprise Buying Committee
            </span>
            <h2 className="font-editorial mt-2 text-4xl text-slate-900">
              Not another HR wellness vitamin. A measurable P&amp;L, brand, and compliance engine.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                role: 'For the CFO & Insurance Broker',
                title: 'Turn 15% GMC hikes into 5–15% rebates',
                desc: 'Clinician-verified pre-diabetic, hypertension, and MSK risk-reduction cohorts give underwriters hard actuarial proof at Group Medical Cover renewal.',
                icon: TrendingUp,
                cta: 'Launch Broker / CFO Demo',
                acc: 'acc-broker',
              },
              {
                role: 'For the CHRO & CEO',
                title: 'PULSE Certified Healthy Workplace™',
                desc: 'Compete in India’s Annual Inter-Company Championship, earn Gold/Platinum employer-brand badges for LinkedIn, and export audit-ready SEBI BRSR Principle 3 filings.',
                icon: Award,
                cta: 'Launch CHRO Admin Demo',
                acc: 'acc-finstack-admin',
              },
              {
                role: 'For the CISO & Legal DPO',
                title: 'DPDP Act 2023 Zero-PHI Architecture',
                desc: 'Individual lab PDFs and medications live in employee-only AES-256 + ABHA vaults. HR dashboards enforce strict k ≥ 10 anonymity at the PostgreSQL layer.',
                icon: ShieldCheck,
                cta: 'Launch Super-Admin Console',
                acc: 'acc-superadmin',
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.role}
                  className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-[#F8F9FA] p-6 transition hover:border-emerald-300 hover:bg-white hover:shadow-md"
                >
                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
                      {card.role}
                    </p>
                    <h3 className="mt-1.5 text-lg font-extrabold text-slate-900">{card.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">{card.desc}</p>
                  </div>
                  <button
                    onClick={() => onQuickLaunchAccount(card.acc)}
                    className="mt-6 inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-900 hover:text-emerald-700"
                  >
                    {card.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (4 PILLARS) */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">
            End-to-End Hybrid Operating System
          </span>
          <h2 className="font-editorial mt-2 text-4xl text-slate-900">
            One Offline-First Platform. Zero Clinic Payroll.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: '01',
              title: '5-Station Hybrid Camps',
              desc: 'Partnered labs (Tata 1mg, Redcliffe) for on-site & at-home bloodwork + offline clinician tablet PWA (<90s/station).',
              icon: Stethoscope,
            },
            {
              step: '02',
              title: '1,000-Pt + Holistic Halo',
              desc: 'Rewards clinical parity plus verified yoga, pranayama, drug-free protocols, and MD-signed deprescribing (+100 pts).',
              icon: Sparkles,
            },
            {
              step: '03',
              title: 'Delta (Most Improved) League',
              desc: 'Pre-diabetic & sedentary employees compete on verified improvement, lifting 90-day retention 2.7× over step apps.',
              icon: Trophy,
            },
            {
              step: '04',
              title: 'Actuarial & BRSR Output',
              desc: '1-click CFO GMC renewal packs, k ≥ 10 HR heatmaps, and Annual Inter-Company Championship certification.',
              icon: Building2,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="rounded-3xl border border-slate-200 bg-white p-5 card-elevated">
                <div className="flex items-center justify-between">
                  <span className="font-mono-num text-xs font-extrabold text-emerald-700">STEP {item.step}</span>
                  <Icon className="h-4 w-4 text-slate-400" />
                </div>
                <h3 className="mt-3 text-sm font-extrabold text-slate-900">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* INTERACTIVE LANDING PAGE CFO ROI CALCULATOR */}
      <section id="roi" className="bg-gradient-to-br from-[#062C23] via-[#0B1F2A] to-[#0F172A] py-16 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] font-bold text-emerald-300">
              <Calculator className="h-3.5 w-3.5" /> Interactive CFO Business Case
            </span>
            <h2 className="font-editorial mt-3 text-4xl leading-tight">
              PULSE pays for itself at your very next GMC insurance renewal.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Slide your workforce size and current Group Medical Cover premium to estimate your net
              annual P&amp;L gain assuming a conservative <strong>10% insurer renewal rebate</strong>.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md lg:col-span-6">
            <div className="space-y-4 text-xs">
              <label className="block">
                <div className="flex justify-between">
                  <span className="text-slate-300">Covered Employees</span>
                  <strong className="font-mono-num text-white">{empCount} employees</strong>
                </div>
                <input
                  type="range"
                  min={150}
                  max={2500}
                  step={50}
                  value={empCount}
                  onChange={(e) => setEmpCount(Number(e.target.value))}
                  className="mt-2 w-full accent-emerald-400"
                />
              </label>

              <label className="block">
                <div className="flex justify-between">
                  <span className="text-slate-300">Annual GMC Insurance Premium</span>
                  <strong className="font-mono-num text-white">₹{gmcLakhs} Lakhs</strong>
                </div>
                <input
                  type="range"
                  min={50}
                  max={1000}
                  step={25}
                  value={gmcLakhs}
                  onChange={(e) => setGmcLakhs(Number(e.target.value))}
                  className="mt-2 w-full accent-sky-400"
                />
              </label>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
                <p className="text-[10px] text-slate-400">PULSE SaaS / Yr</p>
                <p className="font-mono-num mt-1 text-lg font-extrabold text-white">₹{pulseAnnualLakhs}L</p>
              </div>
              <div className="rounded-2xl bg-emerald-500/15 p-3 ring-1 ring-emerald-400/30">
                <p className="text-[10px] text-emerald-200">10% GMC Rebate</p>
                <p className="font-mono-num mt-1 text-lg font-extrabold text-emerald-300">₹{gmcRebateLakhs}L</p>
              </div>
              <div className="rounded-2xl bg-sky-500/15 p-3 ring-1 ring-sky-400/30">
                <p className="text-[10px] text-sky-200">Net CFO Gain</p>
                <p className="font-mono-num mt-1 text-lg font-extrabold text-sky-300">
                  {netGainLakhs >= 0 ? `+₹${netGainLakhs}L` : `-₹${Math.abs(netGainLakhs)}L`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INDIA PRICING TIERS */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">
            Transparent India B2B Pricing
          </span>
          <h2 className="font-editorial mt-2 text-4xl text-slate-900">
            Start with a 4-Week Paid Baseline Pilot. Scale Enterprise-Wide.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              name: 'Startup & Growth',
              size: 'Up to 250 employees',
              price: '₹199',
              unit: '/ emp / month',
              features: [
                'Employee Offline PWA + ABHA Vault',
                'Delta League & Alias Leaderboards',
                'DPDP k ≥ 10 HR Dashboard',
                'Partnered At-Home / On-Site Lab Camps',
              ],
              highlight: false,
            },
            {
              name: 'Mid-Market Flagship',
              size: '250 – 1,000 employees',
              price: '₹249',
              unit: '/ emp / month',
              features: [
                'Everything in Startup + Clinician Tablet PWA',
                'CFO & Broker GMC Renewal Risk Audit Pack',
                '1-Click SEBI BRSR Principle 3 Export',
                'Annual Inter-Company Championship Entry',
              ],
              highlight: true,
            },
            {
              name: 'Enterprise & Broker',
              size: '1,000+ employees / Multi-Client',
              price: 'Custom',
              unit: 'Annual License',
              features: [
                'Dedicated Mumbai PostgreSQL Tenant',
                'Co-Branded Insurance Broker Portal',
                'PULSE Certified Healthy Workplace™ Seal',
                'HRMS Auto-Sync (Darwinbox / Workday / Keka)',
              ],
              highlight: false,
            },
          ].map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col justify-between rounded-3xl border p-6 ${
                tier.highlight
                  ? 'border-emerald-600 bg-white shadow-xl ring-2 ring-emerald-500/15'
                  : 'border-slate-200 bg-white card-elevated'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900">{tier.name}</h3>
                  {tier.highlight && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                      Most Popular
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{tier.size}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-mono-num text-3xl font-extrabold text-slate-900">{tier.price}</span>
                  <span className="text-xs text-slate-500">{tier.unit}</span>
                </div>
                <ul className="mt-5 space-y-2.5 text-xs text-slate-600">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => {
                  setPilotSubmitted(false);
                  setPilotModalOpen(true);
                }}
                className={`mt-6 w-full rounded-xl py-2.5 text-xs font-extrabold transition ${
                  tier.highlight
                    ? 'bg-slate-900 text-white hover:bg-emerald-700'
                    : 'border border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100'
                }`}
              >
                Book Pilot / Request Proposal
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-6xl px-4">
          <p className="font-bold text-slate-800">PULSE — India Corporate Wellness Index</p>
          <p className="mt-1">
            Hosted on Google Cloud Mumbai (asia-south1) · Built for India DPDP Act 2023 &amp; SEBI BRSR Compliance
          </p>
        </div>
      </footer>

      {/* Pilot Booking Modal */}
      {pilotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Book a 4-Week Corporate Pilot</h3>
              <button onClick={() => setPilotModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            {pilotSubmitted ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                <p className="mt-3 text-sm font-extrabold text-slate-900">Pilot Request Received!</p>
                <p className="mt-1 text-xs text-slate-500">
                  Our enterprise team will share your custom GMC ROI &amp; Workshop SOW within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setPilotModalOpen(false);
                    onOpenLogin();
                  }}
                  className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-extrabold text-white"
                >
                  Explore Live Demo Meanwhile →
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setPilotSubmitted(true);
                }}
                className="mt-4 space-y-3 text-xs"
              >
                <input required placeholder="Your Name & Title (e.g., CHRO / CFO)" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-900" />
                <input required type="email" placeholder="Work Email" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-900" />
                <input required placeholder="Company Name & Headcount" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-900" />
                <button type="submit" className="w-full rounded-xl bg-slate-900 py-3 text-xs font-extrabold text-white hover:bg-emerald-700">
                  Request Baseline Pilot SOW
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
