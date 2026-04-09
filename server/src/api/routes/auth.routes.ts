import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { getDb } from '../../db/database';
import { validate } from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserRow, PublicUser, AuthTokens } from '../../types/auth.types';

const router = Router();

// Schemas de validação
const RegisterSchema = z.object({
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Apenas letras, números, _ e -'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter ao menos uma letra maiúscula')
    .regex(/[a-z]/, 'Deve conter ao menos uma letra minúscula')
    .regex(/[0-9]/, 'Deve conter ao menos um número'),
});

const LoginSchema = z.object({
  identifier: z.string().min(1, 'Campo obrigatório'),
  password: z.string().min(1, 'Campo obrigatório'),
});

// Rate limiting: 5 tentativas por 15 minutos
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Muitas tentativas. Aguarde 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3,
  message: { error: 'Muitos cadastros. Aguarde 1 hora.' },
});

// Helpers
function generateTokens(userId: string, username: string): AuthTokens {
  const accessToken = jwt.sign(
    { sub: userId, username },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: (process.env.JWT_ACCESS_EXPIRY || '15m') as jwt.SignOptions['expiresIn'] }
  );

  const refreshToken = uuidv4();
  return { accessToken, refreshToken };
}

function sanitizeUser(user: UserRow): PublicUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar_url: user.avatar_url,
    created_at: user.created_at,
  };
}

// POST /api/auth/register
router.post('/register', registerLimiter, validate(RegisterSchema), async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const db = getDb();

  try {
    // Verificar duplicidade (sem revelar qual campo existe)
    const existing = db
      .prepare('SELECT id FROM users WHERE email = ? OR username = ?')
      .get(email, username);

    if (existing) {
      res.status(409).json({ error: 'Email ou nome de usuário já cadastrado' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    db.transaction(() => {
      db.prepare(
        'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)'
      ).run(userId, username, email, passwordHash);

      db.prepare(
        'INSERT INTO user_stats (user_id) VALUES (?)'
      ).run(userId);
    })();

    const { accessToken, refreshToken } = generateTokens(userId, username);

    // Salvar refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare(
      'INSERT INTO sessions (user_id, refresh_token, expires_at, ip_address) VALUES (?, ?, ?, ?)'
    ).run(userId, refreshToken, expiresAt, req.ip);

    // Refresh token em cookie httpOnly
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as UserRow;

    res.status(201).json({
      user: sanitizeUser(user),
      accessToken,
    });
  } catch (error) {
    console.error('[Auth] Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/auth/login
router.post('/login', loginLimiter, validate(LoginSchema), async (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  const db = getDb();

  try {
    const user = db
      .prepare('SELECT * FROM users WHERE email = ? OR username = ?')
      .get(identifier, identifier) as UserRow | undefined;

    // Sempre fazer bcrypt.compare para evitar timing attacks
    const hashToCompare = user?.password_hash || '$2b$12$dummyhashtopreventtimingXXXXXXXXXXXXXXXXXXXXXX';
    const isValid = await bcrypt.compare(password, hashToCompare);

    if (!user || !isValid) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    if (!user.is_active) {
      res.status(403).json({ error: 'Conta desativada' });
      return;
    }

    if (user.is_banned) {
      res.status(403).json({ error: 'Conta suspensa' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.username);

    // Salvar sessão
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare(
      'INSERT INTO sessions (user_id, refresh_token, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)'
    ).run(user.id, refreshToken, expiresAt, req.ip, req.headers['user-agent'] || '');

    // Atualizar last_login
    db.prepare('UPDATE users SET last_login = datetime("now") WHERE id = ?').run(user.id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });

    res.json({
      user: sanitizeUser(user),
      accessToken,
    });
  } catch (error) {
    console.error('[Auth] Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  const db = getDb();

  if (!token) {
    res.status(401).json({ error: 'Refresh token não encontrado' });
    return;
  }

  const session = db
    .prepare('SELECT * FROM sessions WHERE refresh_token = ? AND expires_at > datetime("now")')
    .get(token) as { user_id: string; id: string } | undefined;

  if (!session) {
    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.status(401).json({ error: 'Sessão inválida ou expirada' });
    return;
  }

  const user = db
    .prepare('SELECT * FROM users WHERE id = ? AND is_active = 1 AND is_banned = 0')
    .get(session.user_id) as UserRow | undefined;

  if (!user) {
    res.status(401).json({ error: 'Usuário não encontrado' });
    return;
  }

  // Rotacionar refresh token
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.username);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  db.transaction(() => {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(session.id);
    db.prepare(
      'INSERT INTO sessions (user_id, refresh_token, expires_at, ip_address) VALUES (?, ?, ?, ?)'
    ).run(user.id, newRefreshToken, expiresAt, req.ip);
  })();

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });

  res.json({ accessToken });
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  const db = getDb();

  if (token) {
    db.prepare('DELETE FROM sessions WHERE refresh_token = ?').run(token);
  }

  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ message: 'Logout realizado com sucesso' });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req: Request, res: Response) => {
  const db = getDb();
  const user = db
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(req.user!.sub) as UserRow | undefined;

  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }

  res.json({ user: sanitizeUser(user) });
});

export default router;
