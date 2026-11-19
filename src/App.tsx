import { useEffect, useState } from 'react';
import {
  Activity,
  Building2,
  Crown,
  Download,
  Smartphone,
  Stethoscope,
  Wifi,
  WifiOff,
} from 'lucide-react';
import type {
  CorporateTenant,
  EmployeeProfile,
  GlobalScoreWeights,
  OfflineAssessmentRecord,
  SurfaceMode,
} from './types/pulse';
import {
  DEMO_EMPLOYEE_PRESETS,
  INITIAL_CORPORATE_TENANTS,
  INITIAL_GLOBAL_WEIGHTS,
  INITIAL_OFFLINE_QUEUE,
} from './data/seedData';
import {
  loadEmployeeProfileOffline,
  loadOfflineQueue,
  markAllQueuedRecordsSynced,
  saveAssessmentToOfflineQueue,
  saveEmployeeProfileOffline,
} from './lib/offlineDb';
import { computeScoreFromWorkshop } from './lib/scoring';
import { EmployeeSurface } from './components/EmployeeSurface';
import { ClinicianSurface } from './components/ClinicianSurface';
import { EnterpriseSurface } from './components/EnterpriseSurface';
import { SuperAdminSurface } from './components/SuperAdminSurface';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function App() {
  const [surface, setSurface] = useState<SurfaceMode>('employee');
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
    setOfflineQueue(syncedList.length > 0 ? syncedList : offlineQueue.map((r) => ({ ...r, synced: true })));
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
    setSurface('customer_admin');
  };

  const handleInstallPwa = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  };

  const pendingCount = offlineQueue.filter((r) => !r.synced).length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900">
      {/* Crisp Editorial Top Header */}
      <header className="no-print sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-sm">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-slate-900">PULSE</span>
                <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-800 ring-1 ring-emerald-200">
                  INDIA PWA
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">Corporate Wellness Index</p>
            </div>
          </div>

          {/* 4-Surface Switcher */}
          <div className="flex flex-wrap items-center gap-1 rounded-2xl bg-slate-100 p-1">
            {[
              { id: 'employee', label: 'Employee App', icon: Smartphone },
              { id: 'clinician', label: 'Clinician Tablet', icon: Stethoscope, badge: pendingCount },
              { id: 'customer_admin', label: 'Customer Admin', icon: Building2 },
              { id: 'super_admin', label: 'Super Admin', icon: Crown },
            ].map((item) => {
              const Icon = item.icon;
              const active = surface === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSurface(item.id as SurfaceMode)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    active
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-amber-400 px-1.5 text-[10px] font-extrabold text-slate-950">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Network + Install */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSimulatedOffline((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold transition ${
                isOffline
                  ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-300'
                  : 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
              }`}
            >
              {isOffline ? <WifiOff className="h-3.5 w-3.5" /> : <Wifi className="h-3.5 w-3.5" />}
              {isOffline ? 'Offline' : 'Online'}
            </button>

            {installPrompt && (
              <button
                onClick={handleInstallPwa}
                className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700"
              >
                <Download className="h-3.5 w-3.5" />
                Install PWA
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pt-6">
        {surface === 'employee' && (
          <EmployeeSurface
            profile={profile}
            selectedPresetId={selectedPresetId}
            onSelectPreset={handleSelectEmployeePreset}
            onUpdateProfile={handleUpdateProfile}
            isOffline={isOffline}
          />
        )}
        {surface === 'clinician' && (
          <ClinicianSurface
            isOffline={isOffline}
            onToggleSimulatedOffline={() => setSimulatedOffline((p) => !p)}
            offlineQueue={offlineQueue}
            onSaveAssessment={handleSaveAssessment}
            onSyncQueueNow={handleSyncQueueNow}
          />
        )}
        {surface === 'customer_admin' && (
          <EnterpriseSurface
            tenants={tenants}
            selectedTenantId={selectedTenantId}
            onSelectTenant={setSelectedTenantId}
            onUpdateTenant={handleUpdateTenant}
          />
        )}
        {surface === 'super_admin' && (
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
