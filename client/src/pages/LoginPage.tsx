import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { api } from '../services/api';
import type { AuthResponse, ApiError } from '../types/auth.types';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { ptBR } from '../locales/pt-BR';

const t = ptBR.auth.login;
const tc = ptBR.common;

const loginSchema = z.object({
  identifier: z.string().min(1, t.errors.identifier),
  password: z.string().min(1, t.errors.password),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);
    setServerError(null);
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      setAuth(response.user, response.accessToken);
      navigate('/lobby');
    } catch (err) {
      const error = err as ApiError;
      setServerError(error.error || t.errors.generic);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'var(--bg-gradient)' }}
    >
      {/* Glows decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, var(--accent) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', filter: 'blur(80px)' }}
        />
      </div>

      {/* Toggle de tema — canto superior direito */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-3">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{
                background: 'var(--accent-subtle)',
                border: '1px solid var(--border-accent)',
                boxShadow: '0 0 30px var(--accent-glow)',
              }}
            >
              ⚔
            </div>
          </div>
          <h1
            className="text-4xl font-bold tracking-tight"
            style={{ color: 'var(--accent)', textShadow: '0 0 40px var(--accent-glow)' }}
          >
            {tc.appName}
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {tc.tagline}
          </p>
        </div>

        {/* Card do formulário */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 0 1px var(--border-accent), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
            {t.title}
          </h2>

          {serverError && (
            <div
              className="mb-5 px-4 py-3 rounded-lg text-sm"
              style={{ background: 'var(--error-bg)', color: 'var(--error)', border: '1px solid var(--error-border)' }}
              role="alert"
            >
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-4">
              <label htmlFor="identifier" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {t.identifier}
              </label>
              <input
                id="identifier"
                type="text"
                autoComplete="username"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors duration-150"
                style={{
                  background: 'var(--bg-input)',
                  border: `1px solid ${errors.identifier ? 'var(--error)' : 'var(--border)'}`,
                  color: 'var(--text-primary)',
                }}
                placeholder={t.identifierPlaceholder}
                {...register('identifier')}
                aria-invalid={!!errors.identifier}
                onFocus={(e) => { if (!errors.identifier) e.currentTarget.style.borderColor = 'var(--border-accent)'; }}
                onBlur={(e) => { if (!errors.identifier) e.currentTarget.style.borderColor = 'var(--border)'; }}
              />
              {errors.identifier && (
                <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>{errors.identifier.message}</p>
              )}
            </div>

            <div className="mb-7">
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {t.password}
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors duration-150"
                style={{
                  background: 'var(--bg-input)',
                  border: `1px solid ${errors.password ? 'var(--error)' : 'var(--border)'}`,
                  color: 'var(--text-primary)',
                }}
                placeholder={t.passwordPlaceholder}
                {...register('password')}
                aria-invalid={!!errors.password}
                onFocus={(e) => { if (!errors.password) e.currentTarget.style.borderColor = 'var(--border-accent)'; }}
                onBlur={(e) => { if (!errors.password) e.currentTarget.style.borderColor = 'var(--border)'; }}
              />
              {errors.password && (
                <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: 'var(--accent)',
                color: 'var(--text-on-accent)',
                boxShadow: isLoading ? 'none' : '0 4px 20px var(--accent-glow)',
              }}
              onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'; }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {t.submitting}
                </span>
              ) : t.submit}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t.noAccount}{' '}
            <Link
              to="/register"
              className="font-semibold transition-colors duration-150"
              style={{ color: 'var(--accent)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-hover)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)'; }}
            >
              {t.createAccount}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
