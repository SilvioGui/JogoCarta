import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { runMigrations } from './db/migrate';
import authRoutes from './api/routes/auth.routes';
import deckRoutes from './api/routes/deck.routes';
import { registerGameHandlers } from './socket/game.socket';
import { registerMatchmakingHandlers } from './socket/matchmaking.socket';
import { registerTutorialHandlers } from './socket/tutorial.socket';

const app = express();
const httpServer = createServer(app);

// Suporte a múltiplas origens separadas por vírgula no FRONTEND_URL
// Ex: FRONTEND_URL=http://localhost:5173,http://192.168.1.100:5173
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

function corsOrigin(origin: string | undefined, cb: (e: Error | null, allow?: boolean) => void) {
  // Sem origin = mesma origem ou servidor-a-servidor (permitido)
  if (!origin) return cb(null, true);
  if (allowedOrigins.includes(origin)) return cb(null, true);
  cb(new Error(`CORS: origin não permitida — ${origin}`));
}

const io = new SocketIOServer(httpServer, {
  cors: { origin: corsOrigin, credentials: true },
});

// Segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'", 'ws://localhost:*', 'wss://*', 'ws://*'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: corsOrigin,
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
  registerTutorialHandlers(io, socket);
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Handler global de erros (deve ser o último middleware)
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server] Erro não tratado:', err.message);
  res.status(500).json({ error: 'Erro interno do servidor' });
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
