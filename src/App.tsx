import { useEffect, useState } from 'react';
import {
  Activity,
  Download,
  Globe,
  LogOut,
  Repeat,
  Wifi,
  WifiOff,
} from 'lucide-react';
import type {
  CorporateTenant,
  EmployeeProfile,
  GlobalScoreWeights,
  OfflineAssessmentRecord,
} from './types/pulse';
import {
  DEMO_EMPLOYEE_PRESETS,
  INITIAL_CORPORATE_TENANTS,
  INITIAL_GLOBAL_WEIGHTS,
  INITIAL_OFFLINE_QUEUE,
} from './data/seedData';
import { DEMO_ACCOUNTS, type DemoAccount } from './data/demoAccounts';
import {
  loadEmployeeProfileOffline,
  loadOfflineQueue,
  markAllQueuedRecordsSynced,
  saveAssessmentToOfflineQueue,
  saveEmployeeProfileOffline,
} from './lib/offlineDb';
import { computeScoreFromWorkshop } from './lib/scoring';
import { MarketingSite } from './components/MarketingSite';
import { DemoLoginView } from './components/DemoLoginView';
import { EmployeeSurface } from './components/EmployeeSurface';
import { ClinicianSurface } from './components/ClinicianSurface';
import { EnterpriseSurface } from './components/EnterpriseSurface';
import { SuperAdminSurface } from './components/SuperAdminSurface';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type AppView = 'marketing' | 'login' | 'app';

export function App() {
  const [view, setView] = useState<AppView>('marketing');
  const [activeAccount, setActiveAccount] = useState<DemoAccount>(DEMO_ACCOUNTS[0]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(DEMO_EMPLOYEE_PRESETS[0].id);
  const [profile, setProfile] = useState<EmployeeProfile>(DEMO_EMPLOYEE_PRESETS[0]);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAssessmentRecord[]>(INITIAL_OFFLINE_QUEUE);
  const [tenants, setTenants] = useState<CorporateTenant[]>(INITIAL_CORPORATE_TENANTS);
  const [selectedTenantId, setSelectedTenantId] = useState<string>(INITIAL_CORPORATE_TENANTS[0].id);
  const [globalWeights, setGlobalWeights] = useState<GlobalScoreWeights>(INITIAL_GLOBAL_WEIGHTS);

  const [browserOffline, setBrowserOffline] = useState(!navigator.onLine);
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const isOffline = browserOffline || simulatedOffline;

  useEffect(() => {
    loadEmployeeProfileOffline().then((saved) => {
      if (saved) setProfile(saved);
    });
    loadOfflineQueue().then((q) => {
      if (q.length > 0) setOfflineQueue(q);
    });

    const handleOnline = () => setBrowserOffline(false);
    const handleOffline = () => setBrowserOffline(true);
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleSelectDemoAccount = (acc: DemoAccount) => {
    setActiveAccount(acc);
    if (acc.employeePresetId) {
      const preset = DEMO_EMPLOYEE_PRESETS.find((p) => p.id === acc.employeePresetId);
      if (preset) {
        setSelectedPresetId(preset.id);
        setProfile(preset);
        void saveEmployeeProfileOffline(preset);
      }
    }
    if (acc.tenantId) {
      setSelectedTenantId(acc.tenantId);
    }
    setView('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickLaunchById = (accountId: string) => {
    const found = DEMO_ACCOUNTS.find((a) => a.id === accountId) ?? DEMO_ACCOUNTS[0];
    handleSelectDemoAccount(found);
  };

  const handleSelectEmployeePreset = (presetId: string) => {
    const found = DEMO_EMPLOYEE_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setSelectedPresetId(presetId);
    setProfile(found);
    void saveEmployeeProfileOffline(found);
  };

  const handleUpdateProfile = (next: EmployeeProfile) => {
    setProfile(next);
    void saveEmployeeProfileOffline(next);
  };

  const applyAssessmentToEmployeeIfMatching = (record: OfflineAssessmentRecord) => {
    if (record.empCode !== profile.empCode) return;
    const { pillars, holistic } = computeScoreFromWorkshop(record);
    handleUpdateProfile({ ...profile, pillars, holistic, restingHr: record.station1.restingHr });
  };

  const handleSaveAssessment = async (record: OfflineAssessmentRecord, syncImmediately: boolean) => {
    await saveAssessmentToOfflineQueue(record);
    const latest = await loadOfflineQueue();
    setOfflineQueue(latest);
    if (syncImmediately) applyAssessmentToEmployeeIfMatching(record);
  };

  const handleSyncQueueNow = async () => {
    const pending = offlineQueue.filter((r) => !r.synced);
    const syncedList = await markAllQueuedRecordsSynced();
    setOfflineQueue(
      syncedList.length > 0 ? syncedList : offlineQueue.map((r) => ({ ...r, synced: true }))
    );
    for (const rec of pending) applyAssessmentToEmployeeIfMatching(rec);
  };

  const handleAddTenant = (newTenant: CorporateTenant) => {
    setTenants((prev) => [newTenant, ...prev]);
    setSelectedTenantId(newTenant.id);
  };

  const handleUpdateTenant = (updated: CorporateTenant) => {
    setTenants((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleOpenCustomerAdminFromSuperAdmin = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    const match =
      DEMO_ACCOUNTS.find((a) => a.tenantId === tenantId) ??
      DEMO_ACCOUNTS.find((a) => a.surface === 'customer_admin')!;
    setActiveAccount(match);
  };

  const handleInstallPwa = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  };

  if (view === 'marketing') {
    return (
      <MarketingSite
        onOpenLogin={() => setView('login')}
        onQuickLaunchAccount={handleQuickLaunchById}
      />
    );
  }

  if (view === 'login') {
    return (
      <DemoLoginView
        onSelectAccount={handleSelectDemoAccount}
        onBackToMarketing={() => setView('marketing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900">
      {/* Single-Row, Clean, Role-Isolated Top Bar (100% Mobile Friendly) */}
      <header className="no-print sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:px-4">
          {/* Brand + Signed-in Role Badge */}
          <div className="flex min-w-0 items-center gap-2">
            <button
              onClick={() => setView('marketing')}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-sm"
              title="Back to PULSE Website"
            >
              <Activity className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-extrabold text-slate-900">
                  {activeAccount.name}
                </span>
                <span
                  className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold sm:inline-block ${activeAccount.badgeColor}`}
                >
                  {activeAccount.roleLabel}
                </span>
              </div>
              <p className="truncate text-[10px] font-medium text-slate-500">
                {activeAccount.org}
              </p>
            </div>
          </div>

          {/* Right Controls: Clean & Compact on Mobile */}
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={() => setSimulatedOffline((prev) => !prev)}
              className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition ${
                isOffline
                  ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-300'
                  : 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
              }`}
              title="Toggle Offline Mode"
            >
              {isOffline ? <WifiOff className="h-3.5 w-3.5" /> : <Wifi className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{isOffline ? 'Offline' : 'Online'}</span>
            </button>

            {installPrompt && (
              <button
                onClick={handleInstallPwa}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Install</span>
              </button>
            )}

            <button
              onClick={() => setView('login')}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700"
              title="Switch Demo Account"
            >
              <Repeat className="h-3.5 w-3.5" />
              <span>Switch Role</span>
            </button>

            <button
              onClick={() => setView('marketing')}
              className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 md:inline-flex"
              title="Back to Marketing Website"
            >
              <Globe className="h-3.5 w-3.5" />
              Website
            </button>

            <button
              onClick={() => setView('login')}
              className="rounded-xl border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Role-Isolated Surface */}
      <main className="px-3 pt-4 sm:px-4 sm:pt-6">
        {activeAccount.surface === 'employee' && (
          <EmployeeSurface
            profile={profile}
            selectedPresetId={selectedPresetId}
            onSelectPreset={handleSelectEmployeePreset}
            onUpdateProfile={handleUpdateProfile}
            isOffline={isOffline}
          />
        )}
        {activeAccount.surface === 'clinician' && (
          <ClinicianSurface
            isOffline={isOffline}
            onToggleSimulatedOffline={() => setSimulatedOffline((p) => !p)}
            offlineQueue={offlineQueue}
            onSaveAssessment={handleSaveAssessment}
            onSyncQueueNow={handleSyncQueueNow}
          />
        )}
        {activeAccount.surface === 'customer_admin' && (
          <EnterpriseSurface
            tenants={tenants}
            selectedTenantId={selectedTenantId}
            onSelectTenant={setSelectedTenantId}
            onUpdateTenant={handleUpdateTenant}
          />
        )}
        {activeAccount.surface === 'super_admin' && (
          <SuperAdminSurface
            tenants={tenants}
            onAddTenant={handleAddTenant}
            onSelectTenantForCustomerAdmin={handleOpenCustomerAdminFromSuperAdmin}
            weights={globalWeights}
            onUpdateWeights={setGlobalWeights}
          />
        )}
      </main>
    </div>
  );
}

export default App;
