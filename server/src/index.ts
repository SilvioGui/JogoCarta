import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { runMigrations } from './db/migrate';
import authRoutes from './api/routes/auth.routes';
import deckRoutes from './api/routes/deck.routes';
import { registerGameHandlers } from './socket/game.socket';
import { registerMatchmakingHandlers } from './socket/matchmaking.socket';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'", 'ws://localhost:*', 'wss://*'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Rate limit geral
app.use('/api', rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Rotas HTTP
app.use('/api/auth', authRoutes);
app.use('/api/decks', deckRoutes);

// Socket.io — autenticar e registrar handlers de jogo
io.use((socket, next) => {
  // Autenticação via token na query ou handshake
  const token = socket.handshake.auth.token as string | undefined;
  if (!token) return next(new Error('Token não fornecido'));

  try {
    const jwt = require('jsonwebtoken');
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { sub: string; username: string };
    (socket as unknown as { data: { userId: string; username: string } }).data = {
      userId: payload.sub,
      username: payload.username,
    };
    next();
  } catch {
    next(new Error('Token inválido'));
  }
});

io.on('connection', (socket) => {
  console.log(`[Socket] Conectado: ${(socket as unknown as { data: { username: string } }).data.username}`);
  registerGameHandlers(io, socket);
  registerMatchmakingHandlers(io, socket);
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Inicialização
async function start() {
  try {
    runMigrations();
    console.log('[DB] Migrações concluídas');

    const PORT = process.env.PORT || 3001;
    httpServer.listen(PORT, () => {
      console.log(`[Server] Rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[Server] Falha ao iniciar:', error);
    process.exit(1);
  }
}

start();
