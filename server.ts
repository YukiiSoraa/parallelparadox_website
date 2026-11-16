import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '4mb' }));

// Persistent hard-drive storage directory
const DATA_DIR = path.resolve(__dirname, 'data');
const ACCOUNTS_FILE = path.join(DATA_DIR, 'accounts.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const ROSTER_FILE = path.join(DATA_DIR, 'roster.json');
const TRYOUTS_FILE = path.join(DATA_DIR, 'tryouts.json');

interface StoredAccount {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: 'owner' | 'member';
  createdAt: string;
}

interface StoredSession {
  token: string;
  userId: string;
  email: string;
  role: 'owner' | 'member';
  createdAt: string;
}

interface TryoutRecord {
  ign: string;
  division: string;
  rank: string;
  email: string;
  createdAt: string;
  dossierId: string;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJsonFile(filePath: string, data: unknown) {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const candidate = crypto.scryptSync(password, salt, 64);
  const existing = Buffer.from(storedHash, 'hex');
  if (candidate.length !== existing.length) return false;
  return crypto.timingSafeEqual(candidate, existing);
}

function getSessionFromRequest(req: express.Request): StoredSession | null {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) return null;
  const sessions = readJsonFile<StoredSession[]>(SESSIONS_FILE, []);
  return sessions.find((s) => s.token === token) || null;
}

// Auth Status
app.get('/api/auth/status', (req, res) => {
  const accounts = readJsonFile<StoredAccount[]>(ACCOUNTS_FILE, []);
  const session = getSessionFromRequest(req);
  const hasOwner = accounts.some((a) => a.role === 'owner');
  res.json({
    hasOwner,
    totalAccounts: accounts.length,
    user: session ? { email: session.email, role: session.role } : null,
  });
});

// Sign Up (Persisted on hard drive; ONLY the very first account becomes Owner)
app.post('/api/auth/signup', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  const normalizedEmail = (email || '').trim().toLowerCase();

  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }
  if (!password || password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters.' });
    return;
  }

  const accounts = readJsonFile<StoredAccount[]>(ACCOUNTS_FILE, []);
  if (accounts.some((a) => a.email === normalizedEmail)) {
    res.status(409).json({ error: 'An account with this email already exists. Try logging in.' });
    return;
  }

  const hasOwner = accounts.some((a) => a.role === 'owner');
  const role: 'owner' | 'member' = hasOwner ? 'member' : 'owner';

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);

  const newAccount: StoredAccount = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    passwordHash,
    salt,
    role,
    createdAt: new Date().toISOString(),
  };

  accounts.push(newAccount);
  writeJsonFile(ACCOUNTS_FILE, accounts);

  const token = crypto.randomBytes(32).toString('hex');
  const sessions = readJsonFile<StoredSession[]>(SESSIONS_FILE, []);
  sessions.push({
    token,
    userId: newAccount.id,
    email: newAccount.email,
    role: newAccount.role,
    createdAt: new Date().toISOString(),
  });
  writeJsonFile(SESSIONS_FILE, sessions);

  res.json({
    ok: true,
    token,
    user: { email: newAccount.email, role: newAccount.role },
  });
});

// Log In (Verified against persistent hard-drive account storage)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  const normalizedEmail = (email || '').trim().toLowerCase();

  if (!normalizedEmail || !password) {
    res.status(400).json({ error: 'Enter both your email and password.' });
    return;
  }

  const accounts = readJsonFile<StoredAccount[]>(ACCOUNTS_FILE, []);
  const account = accounts.find((a) => a.email === normalizedEmail);
  if (!account || !verifyPassword(password, account.salt, account.passwordHash)) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const sessions = readJsonFile<StoredSession[]>(SESSIONS_FILE, []);
  sessions.push({
    token,
    userId: account.id,
    email: account.email,
    role: account.role,
    createdAt: new Date().toISOString(),
  });
  writeJsonFile(SESSIONS_FILE, sessions);

  res.json({
    ok: true,
    token,
    user: { email: account.email, role: account.role },
  });
});

// Log Out
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (token) {
    const sessions = readJsonFile<StoredSession[]>(SESSIONS_FILE, []);
    const next = sessions.filter((s) => s.token !== token);
    writeJsonFile(SESSIONS_FILE, next);
  }
  res.json({ ok: true });
});

// Public Roster Read
app.get('/api/roster', (_req, res) => {
  const saved = readJsonFile<Record<string, unknown>>(ROSTER_FILE, { custom: false });
  res.json(saved);
});

// Owner-Only Roster Write
app.put('/api/roster', (req, res) => {
  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: 'Please log in with the Owner account to save edits.' });
    return;
  }
  if (session.role !== 'owner') {
    res.status(403).json({ error: 'Only the single Clan Owner account can edit this website.' });
    return;
  }

  const payload = req.body;
  if (!payload || !Array.isArray(payload.members)) {
    res.status(400).json({ error: 'Invalid roster format.' });
    return;
  }

  writeJsonFile(ROSTER_FILE, payload);
  res.json({ ok: true });
});

// Persistent Tryout Submissions
app.post('/api/tryout', (req, res) => {
  const { ign, division, rank, email } = req.body as {
    ign?: string;
    division?: string;
    rank?: string;
    email?: string;
  };
  if (
    !ign ||
    !ign.trim() ||
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    res.status(400).json({ error: 'Please fill in your IGN and a valid email.' });
    return;
  }
  const dossierId = `PRX-${Math.floor(1000 + Math.random() * 9000)}`;
  const tryouts = readJsonFile<TryoutRecord[]>(TRYOUTS_FILE, []);
  tryouts.push({
    ign: ign.trim(),
    division: division || 'Call of Duty: Mobile',
    rank: (rank || 'Applicant').trim(),
    email: email.trim().toLowerCase(),
    createdAt: new Date().toISOString(),
    dossierId,
  });
  writeJsonFile(TRYOUTS_FILE, tryouts);
  res.json({ ok: true, dossierId });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Parallel Paradox server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
