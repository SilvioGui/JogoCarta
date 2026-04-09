import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { LobbyPage } from './pages/LobbyPage';
import { MainMenuPage } from './pages/MainMenuPage';
import { AuthGuard } from './components/auth/AuthGuard';
import { useAuthStore } from './store/auth.store';
import { api } from './services/api';

// Inicializa o tema antes do primeiro render (evita flash)
import './store/theme.store';

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
      <Route path="*" element={<Navigate to="/login" replace />} />
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
