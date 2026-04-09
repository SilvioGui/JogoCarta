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

const t = ptBR.auth.register;
const tc = ptBR.common;

const registerSchema = z.object({
  username: z
    .string()
    .min(3, t.errors.usernameMin)
    .max(20, t.errors.usernameMax)
    .regex(/^[a-zA-Z0-9_-]+$/, t.errors.usernamePattern),
  email: z.string().email(t.errors.email),
  password: z
    .string()
    .min(8, t.errors.passwordMin)
    .regex(/[A-Z]/, t.errors.passwordUpper)
    .regex(/[a-z]/, t.errors.passwordLower)
    .regex(/[0-9]/, t.errors.passwordNumber),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: t.errors.confirmPassword,
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>{message}</p>;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError: boolean;
}

function ThemedInput({ hasError, ...props }: InputProps) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors duration-150"
      style={{
        background: 'var(--bg-input)',
        border: `1px solid ${hasError ? 'var(--error)' : 'var(--border)'}`,
        color: 'var(--text-primary)',
      }}
      onFocus={(e) => { if (!hasError) e.currentTarget.style.borderColor = 'var(--border-accent)'; props.onFocus?.(e); }}
      onBlur={(e) => { if (!hasError) e.currentTarget.style.borderColor = 'var(--border)'; props.onBlur?.(e); }}
    />
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    setIsLoading(true);
    setServerError(null);
    try {
      const { confirmPassword: _, ...payload } = data;
      const response = await api.post<AuthResponse>('/auth/register', payload);
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
      className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{ background: 'var(--bg-gradient)' }}
    >
      {/* Glows decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, var(--accent) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
      </div>

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative animate-fade-in">
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
            {t.subtitle}
          </p>
        </div>

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

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {t.username}
              </label>
              <ThemedInput
                id="username"
                type="text"
                autoComplete="username"
                placeholder={t.usernamePlaceholder}
                hasError={!!errors.username}
                aria-invalid={!!errors.username}
                {...register('username')}
              />
              <FieldError message={errors.username?.message} />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {t.email}
              </label>
              <ThemedInput
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t.emailPlaceholder}
                hasError={!!errors.email}
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              <FieldError message={errors.email?.message} />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {t.password}
              </label>
              <ThemedInput
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder={t.passwordPlaceholder}
                hasError={!!errors.password}
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              <FieldError message={errors.password?.message} />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {t.confirmPassword}
              </label>
              <ThemedInput
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder={t.confirmPasswordPlaceholder}
                hasError={!!errors.confirmPassword}
                aria-invalid={!!errors.confirmPassword}
                {...register('confirmPassword')}
              />
              <FieldError message={errors.confirmPassword?.message} />
            </div>

            <div className="pt-2">
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
            </div>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t.hasAccount}{' '}
            <Link
              to="/login"
              className="font-semibold transition-colors duration-150"
              style={{ color: 'var(--accent)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-hover)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)'; }}
            >
              {t.login}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
