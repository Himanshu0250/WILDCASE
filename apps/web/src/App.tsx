import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { useGameStore } from './stores/useGameStore.js';
import { usePageVisibility } from './hooks/usePageVisibility.js';
import { TacticalNavbar } from './components/TacticalNavbar.js';
import { ErrorBanner } from './components/ErrorBanner.js';
import { LandingView } from './views/LandingView.js';
import { CaseBriefView } from './views/CaseBriefView.js';
import { PrepareView } from './views/PrepareView.js';
import { FieldModeView } from './views/FieldModeView.js';
import { CameraHUDView } from './views/CameraHUDView.js';
import { RevealView } from './views/RevealView.js';
import { AccuseView } from './views/AccuseView.js';
import { VerdictView } from './views/VerdictView.js';
import { FieldReportView } from './views/FieldReportView.js';
import { CaseFilesView } from './views/CaseFilesView.js';
import { PrivacyLedgerView } from './views/PrivacyLedgerView.js';

// Case loader wrapper
const CaseRouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { caseId } = useParams<{ caseId: string }>();
  const { activeCase, allCases, selectCase } = useGameStore();

  useEffect(() => {
    if (caseId && (!activeCase || activeCase.id !== caseId)) {
      const match = allCases.find((c) => c.id === caseId);
      if (match) {
        selectCase(match);
      }
    }
  }, [caseId, activeCase, allCases, selectCase]);

  return <>{children}</>;
};

// Root App Shell
const AppShell: React.FC = () => {
  const { session, updateVisibilityTick, loadCases } = useGameStore();

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  // Track real-time page visibility (Screen Time vs Away Time)
  const isInvestigationActive = !!session;
  usePageVisibility(isInvestigationActive, updateVisibilityTick);

  return (
    <div className="min-h-screen bg-case-bg text-case-paper flex flex-col font-sans">
      <TacticalNavbar />
      <ErrorBanner />
      <main className="flex-1">
        <Routes>
          {/* Landing / Entry */}
          <Route path="/" element={<LandingView />} />

          {/* Case Files Archive */}
          <Route path="/cases" element={<CaseFilesView />} />

          {/* Settings & Privacy Ledger */}
          <Route path="/settings" element={<PrivacyLedgerView />} />
          <Route path="/privacy" element={<PrivacyLedgerView />} />

          {/* Case Investigation Routes */}
          <Route
            path="/case/:caseId"
            element={
              <CaseRouteWrapper>
                <CaseBriefView />
              </CaseRouteWrapper>
            }
          />
          <Route
            path="/case/:caseId/brief"
            element={
              <CaseRouteWrapper>
                <CaseBriefView />
              </CaseRouteWrapper>
            }
          />
          <Route
            path="/case/:caseId/prepare"
            element={
              <CaseRouteWrapper>
                <PrepareView />
              </CaseRouteWrapper>
            }
          />
          <Route
            path="/case/:caseId/field"
            element={
              <CaseRouteWrapper>
                <FieldModeView />
              </CaseRouteWrapper>
            }
          />
          <Route
            path="/case/:caseId/evidence"
            element={
              <CaseRouteWrapper>
                <CameraHUDView />
              </CaseRouteWrapper>
            }
          />
          <Route
            path="/case/:caseId/reveal"
            element={
              <CaseRouteWrapper>
                <RevealView />
              </CaseRouteWrapper>
            }
          />
          <Route
            path="/case/:caseId/accuse"
            element={
              <CaseRouteWrapper>
                <AccuseView />
              </CaseRouteWrapper>
            }
          />
          <Route
            path="/case/:caseId/verdict"
            element={
              <CaseRouteWrapper>
                <VerdictView />
              </CaseRouteWrapper>
            }
          />
          <Route
            path="/case/:caseId/report"
            element={
              <CaseRouteWrapper>
                <FieldReportView />
              </CaseRouteWrapper>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
};
