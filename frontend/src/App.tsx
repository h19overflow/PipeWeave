import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { WorkbenchLayout } from '@/components/layouts/WorkbenchLayout';
import { LandingPage } from '@/pages/LandingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { DatasetUploadPage } from '@/pages/DatasetUploadPage';
import { SchemaDeductionPage } from '@/pages/SchemaDeductionPage';
import { BusinessRuleInjectionPage } from '@/pages/BusinessRuleInjectionPage';
import { PipelineEditorPage } from '@/pages/PipelineEditorPage';
import { ModelsPage } from '@/pages/ModelsPage';
import { SettingsPage } from '@/pages/SettingsPage';

// Lazy load new pages
const EDAPage = lazy(() => import('@/pages/EDAPage').then(m => ({ default: m.EDAPage })));
const PreprocessingPage = lazy(() => import('@/pages/PreprocessingPage').then(m => ({ default: m.PreprocessingPage })));

// Loading fallback
const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center bg-[#0a0a0f]">
    <div className="w-8 h-8 border-2 border-[#3713ec] border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <Routes>
      {/* Landing Page - Public Route */}
      <Route path="/" element={<LandingPage />} />

      {/* Workbench Routes - Unified Layout with Sidebar */}
      <Route element={<WorkbenchLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dataset" element={<DatasetUploadPage />} />
        <Route path="/eda" element={<Suspense fallback={<PageLoader />}><EDAPage /></Suspense>} />
        <Route path="/schema" element={<SchemaDeductionPage />} />
        <Route path="/preprocessing" element={<Suspense fallback={<PageLoader />}><PreprocessingPage /></Suspense>} />
        <Route path="/business-rules" element={<BusinessRuleInjectionPage />} />
        <Route path="/pipeline" element={<PipelineEditorPage />} />
        <Route path="/models" element={<ModelsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
