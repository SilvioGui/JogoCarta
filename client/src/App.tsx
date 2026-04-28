import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { LobbyPage } from './pages/LobbyPage';
import { MainMenuPage } from './pages/MainMenuPage';
import { GamePage } from './pages/GamePage';
import { PlayPage } from './pages/PlayPage';
import { DecksPage } from './pages/DecksPage';
import { CollectionPage } from './pages/CollectionPage';
import { SummonPage } from './pages/SummonPage';
import { TutorialPage } from './pages/TutorialPage';
import { AuthGuard } from './components/auth/AuthGuard';
import { useAuthStore } from './store/auth.store';
import { api } from './services/api';

// Inicializa o tema antes do primeiro render (evita flash)
import './store/theme.store';

/** Redireciona para /menu se autenticado, /login se não */
function SmartRedirect() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  if (isLoading) return null;
  return <Navigate to={user ? '/menu' : '/login'} replace />;
}


function AppRoutes() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    async function restoreSession() {
      try {
        const { accessToken } = await api.post<{ accessToken: string }>('/auth/refresh', {});
        useAuthStore.getState().setToken(accessToken);
        const { user } = await api.get<{ user: import('./types/auth.types').User }>('/auth/me');
        setAuth(user, accessToken);
      } catch {
        setLoading(false);
      }
    }
    restoreSession();
  }, [setAuth, setLoading]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/lobby"
        element={
          <AuthGuard>
            <LobbyPage />
          </AuthGuard>
        }
      />
      <Route
        path="/menu"
        element={
          <AuthGuard>
            <MainMenuPage />
          </AuthGuard>
        }
      />
      <Route
        path="/play"
        element={
          <AuthGuard>
            <PlayPage />
          </AuthGuard>
        }
      />
      <Route
        path="/game"
        element={
          <AuthGuard>
            <GamePage />
          </AuthGuard>
        }
      />
      <Route path="/decks"      element={<AuthGuard><DecksPage /></AuthGuard>} />
      <Route path="/collection" element={<AuthGuard><CollectionPage /></AuthGuard>} />
      <Route path="/summon"     element={<AuthGuard><SummonPage /></AuthGuard>} />
      <Route path="/tutorial"   element={<AuthGuard><TutorialPage /></AuthGuard>} />
      {/* Qualquer rota desconhecida: autenticado → /menu, não autenticado → /login */}
      <Route path="*" element={<SmartRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
