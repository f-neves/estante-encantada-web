import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LayoutModeProvider, useLayoutMode } from './layout/LayoutModeContext';
import { OnboardingProvider, useOnboarding } from './onboarding/OnboardingContext';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ChildProvider, useChild } from './profiles/ChildContext';
import { AppearanceProvider } from './appearance/AppearanceContext';
import AppShell from './layout/AppShell';
import WebShell from './layout/WebShell';
import Loading from './components/Loading';
import ErrorState from './components/ErrorState';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import BookDetailScreen from './screens/BookDetailScreen';
import ReaderScreen from './screens/ReaderScreen';
import RewardsScreen from './screens/RewardsScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import SettingsScreen from './screens/SettingsScreen';
import CustomizeScreen from './screens/CustomizeScreen';
import AdminScreen from './screens/AdminScreen';
import ProfilesScreen from './screens/ProfilesScreen';

// Sem personagem ativo não há o que ler: manda escolher, como faz o app.
function RequireProfile({ children }: { children: ReactNode }) {
  const { activeProfile } = useChild();
  if (!activeProfile) {
    return <Navigate to="/perfis" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { mode } = useLayoutMode();

  return (
    <Routes>
      <Route element={mode === 'app' ? <AppShell /> : <WebShell />}>
        <Route
          path="/"
          element={
            <RequireProfile>
              <HomeScreen />
            </RequireProfile>
          }
        />
        <Route
          path="/livro/:bookId"
          element={
            <RequireProfile>
              <BookDetailScreen />
            </RequireProfile>
          }
        />
        <Route
          path="/ler/:bookId"
          element={
            <RequireProfile>
              <ReaderScreen />
            </RequireProfile>
          }
        />
        <Route
          path="/recompensas"
          element={
            <RequireProfile>
              <RewardsScreen />
            </RequireProfile>
          }
        />
        <Route
          path="/favoritos"
          element={
            <RequireProfile>
              <FavoritesScreen />
            </RequireProfile>
          }
        />
        <Route path="/configuracoes" element={<SettingsScreen />} />
        <Route path="/personalizar" element={<CustomizeScreen />} />
        <Route path="/admin" element={<AdminScreen />} />
        <Route path="/perfis" element={<ProfilesScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

// Decide a raiz por estado, não por navegação imperativa (mesma ideia do
// RootNavigator do app): introdução, carregando, erro ou o site em si.
function Root() {
  const { done: onboarded, complete } = useOnboarding();
  const { loading: authLoading, error: authError, retry } = useAuth();
  const { loading: childLoading, activeProfile } = useChild();

  if (onboarded === null || authLoading || (childLoading && !activeProfile)) {
    return <Loading label="Abrindo a estante..." />;
  }

  if (authError) {
    return <ErrorState message={authError} onRetry={retry} />;
  }

  if (!onboarded) {
    return <OnboardingScreen onDone={complete} />;
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <LayoutModeProvider>
      <OnboardingProvider>
        <AuthProvider>
          <ChildProvider>
            <AppearanceProvider>
              <Root />
            </AppearanceProvider>
          </ChildProvider>
        </AuthProvider>
      </OnboardingProvider>
    </LayoutModeProvider>
  );
}
