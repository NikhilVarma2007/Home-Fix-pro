import { createServer } from 'node:http';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { seedData } from './demoData.js';

const PORT = Number(process.env.PORT || 4000);
const APP_STATE_ID = 'default';
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const MYSQL_URL = process.env.MYSQL_URL || '';
const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MYSQL_PORT = Number(process.env.MYSQL_PORT || 3306);
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || 'sriyan';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'homefix';
const JWT_ISSUER = process.env.JWT_ISSUER || 'homefix-pro';
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-development-secret-before-production';
const JWT_EXPIRATION_SECONDS = Number(process.env.JWT_EXPIRATION_SECONDS || 86400);

let localState = structuredClone(seedData);
let activeDataSource = 'local';
let mysqlPoolPromise;

function hasSupabase() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

function hasMysql() {
  return Boolean(MYSQL_URL || MYSQL_DATABASE);
}

function jsonResponse(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': CORS_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
  });
  response.end(JSON.stringify(payload));
}

function notFound(response, message = 'Not found') {
  jsonResponse(response, 404, { error: message });
}

function unauthorized(response, message = 'Unauthorized') {
  jsonResponse(response, 401, { error: message });
}

async function readRequestBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function cloneState(state) {
  return structuredClone(state);
}

function updateLocalState(nextState) {
  localState = cloneState(nextState);
  return localState;
}

function assertSafeMysqlIdentifier(identifier) {
  if (!/^[a-zA-Z0-9_]+$/.test(identifier)) {
    throw new Error('MYSQL_DATABASE can only contain letters, numbers, and underscores');
  }
}

async function getMysqlPool() {
  if (!hasMysql()) {
    throw new Error('MySQL is not configured');
  }

  if (!mysqlPoolPromise) {
    mysqlPoolPromise = (async () => {
      const { createPool } = await import('mysql2/promise');

      if (MYSQL_URL) {
        const pool = createPool({
          uri: MYSQL_URL,
          waitForConnections: true,
          connectionLimit: 10,
        });
        await ensureMysqlSchema(pool);
        return pool;
      }

      assertSafeMysqlIdentifier(MYSQL_DATABASE);
      const adminPool = createPool({
        host: MYSQL_HOST,
        port: MYSQL_PORT,
        user: MYSQL_USER,
        password: MYSQL_PASSWORD,
        waitForConnections: true,
        connectionLimit: 1,
      });

      await adminPool.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await adminPool.end();

      const pool = createPool({
        host: MYSQL_HOST,
        port: MYSQL_PORT,
        user: MYSQL_USER,
        password: MYSQL_PASSWORD,
        database: MYSQL_DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
      });

      await ensureMysqlSchema(pool);
      return pool;
    })();
  }

  return mysqlPoolPromise;
}

async function ensureMysqlSchema(pool) {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS app_state (
      id VARCHAR(64) PRIMARY KEY,
      data JSON NOT NULL,
      created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
    )
  `);
}

async function loadMysqlState() {
  const pool = await getMysqlPool();
  const [rows] = await pool.execute('SELECT data FROM app_state WHERE id = ?', [APP_STATE_ID]);
  const row = rows?.[0];

  if (!row) {
    return null;
  }

  if (typeof row.data === 'string') {
    return JSON.parse(row.data);
  }

  return row.data;
}

async function saveMysqlState(state) {
  const pool = await getMysqlPool();
  await pool.execute(
    `INSERT INTO app_state (id, data)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = CURRENT_TIMESTAMP(6)`,
    [APP_STATE_ID, JSON.stringify(state)],
  );
}

async function supabaseRequest(path, options = {}) {
  if (!hasSupabase()) {
    throw new Error('Supabase is not configured');
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${text}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return null;
}

async function loadRemoteState() {
  const rows = await supabaseRequest(`app_state?id=eq.${APP_STATE_ID}&select=data`, {
    method: 'GET',
    headers: {
      Prefer: 'return=representation',
    },
  });

  return rows?.[0]?.data || null;
}

async function saveRemoteState(state) {
  await supabaseRequest('app_state?on_conflict=id', {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify({
      id: APP_STATE_ID,
      data: state,
    }),
  });
}

async function loadAppState() {
  if (hasMysql()) {
    try {
      const mysqlState = await loadMysqlState();
      activeDataSource = 'mysql';

      if (mysqlState) {
        updateLocalState(mysqlState);
        return mysqlState;
      }

      await saveMysqlState(seedData);
      updateLocalState(seedData);
      return cloneState(seedData);
    } catch {
      activeDataSource = 'local';
    }
  }

  if (!hasSupabase()) {
    activeDataSource = 'local';
    return cloneState(localState);
  }

  try {
    const remoteState = await loadRemoteState();
    activeDataSource = 'supabase';
    if (remoteState) {
      updateLocalState(remoteState);
      return remoteState;
    }

    await saveRemoteState(seedData);
    updateLocalState(seedData);
    return cloneState(seedData);
  } catch {
    activeDataSource = 'local';
    return cloneState(localState);
  }
}

async function persistAppState(state) {
  updateLocalState(state);

  if (hasMysql()) {
    try {
      await saveMysqlState(state);
      activeDataSource = 'mysql';
      return;
    } catch {
      activeDataSource = 'local';
    }
  }

  if (!hasSupabase()) {
    return;
  }

  try {
    await saveRemoteState(state);
    activeDataSource = 'supabase';
  } catch {
    return;
  }
}

function normalizeState(state) {
  return {
    user: state.user || seedData.user,
    categories: Array.isArray(state.categories) ? state.categories : seedData.categories,
    professionals: Array.isArray(state.professionals) ? state.professionals : seedData.professionals,
    bookings: Array.isArray(state.bookings) ? state.bookings : seedData.bookings,
    chatThreads: Array.isArray(state.chatThreads) ? state.chatThreads : seedData.chatThreads,
  };
}

async function handleBootstrap(response) {
  const state = normalizeState(await loadAppState());
  jsonResponse(response, 200, state);
}

async function handleStats(response) {
  const state = normalizeState(await loadAppState());
  jsonResponse(response, 200, {
    source: activeDataSource,
    totalBookings: state.bookings.length,
    activeBookings: state.bookings.filter((booking) => ['pending', 'confirmed', 'in_progress'].includes(booking.status)).length,
    totalProfessionals: state.professionals.length,
    totalCategories: state.categories.length,
    lastUpdated: new Date().toISOString(),
  });
}

function normalizeRole(role) {
  return ['customer', 'service', 'admin'].includes(role) ? role : 'customer';
}

function base64UrlJson(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function signJwt(unsignedToken) {
  return createHmac('sha256', JWT_SECRET).update(unsignedToken).digest('base64url');
}

function issueJwt(payload) {
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    ...payload,
    iss: JWT_ISSUER,
    iat: now,
    exp: now + JWT_EXPIRATION_SECONDS,
  };
  const unsignedToken = `${base64UrlJson({ alg: 'HS256', typ: 'JWT' })}.${base64UrlJson(claims)}`;
  return `${unsignedToken}.${signJwt(unsignedToken)}`;
}

function verifyJwt(token) {
  const parts = token?.split('.') || [];
  if (parts.length !== 3) {
    throw new Error('Invalid JWT');
  }

  const unsignedToken = `${parts[0]}.${parts[1]}`;
  const expectedSignature = signJwt(unsignedToken);
  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(parts[2]);

  if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) {
    throw new Error('Invalid JWT signature');
  }

  const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  if (claims.iss !== JWT_ISSUER) {
    throw new Error('Invalid JWT issuer');
  }

  if (!claims.exp || claims.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error('JWT expired');
  }

  return claims;
}

function requireAuth(request, response) {
  const authorization = request.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice('Bearer '.length).trim() : '';

  if (!token) {
    unauthorized(response, 'Missing bearer token');
    return null;
  }

  try {
    return verifyJwt(token);
  } catch {
    unauthorized(response, 'Invalid bearer token');
    return null;
  }
}

async function handleAuthLogin(request, response) {
  const body = await readRequestBody(request);
  const role = normalizeRole(body.role);
  const name = body.name?.trim?.() || 'Guest User';
  const phone = body.phone?.trim?.() || '+91 00000 00000';
  const token = issueJwt({
    sub: phone,
    role,
    name,
    phone,
    businessName: body.businessName || null,
    profession: body.profession || null,
    language: body.language || 'en',
    experience: body.experience || null,
    serviceArea: body.serviceArea || null,
  });

  jsonResponse(response, 200, {
    token,
    tokenType: 'Bearer',
    expiresInSeconds: JWT_EXPIRATION_SECONDS,
    user: {
      name,
      phone,
      role,
    },
  });
}

async function handleCreateBooking(request, response) {
  const body = await readRequestBody(request);
  const booking = body.booking;

  if (!booking?.id) {
    return jsonResponse(response, 400, { error: 'booking is required' });
  }

  const state = normalizeState(await loadAppState());
  const bookings = [booking, ...state.bookings.filter((item) => item.id !== booking.id)];
  await persistAppState({ ...state, bookings });
  jsonResponse(response, 201, { booking });
}

async function handleUpdateBooking(request, response, bookingId) {
  const body = await readRequestBody(request);
  const booking = body.booking;

  if (!booking?.id) {
    return jsonResponse(response, 400, { error: 'booking is required' });
  }

  const state = normalizeState(await loadAppState());
  const bookingExists = state.bookings.some((item) => item.id === bookingId);

  if (!bookingExists) {
    return notFound(response, 'Booking not found');
  }

  const bookings = state.bookings.map((item) => (item.id === bookingId ? booking : item));
  await persistAppState({ ...state, bookings });
  jsonResponse(response, 200, { booking });
}

async function handleCreateMessage(request, response, threadId) {
  const body = await readRequestBody(request);
  const message = body.message;

  if (!message?.id) {
    return jsonResponse(response, 400, { error: 'message is required' });
  }

  const state = normalizeState(await loadAppState());
  const thread = state.chatThreads.find((item) => item.id === threadId);

  if (!thread) {
    return notFound(response, 'Thread not found');
  }

  const updatedThreads = state.chatThreads.map((item) => {
    if (item.id !== threadId) {
      return item;
    }

    const isFromUser = message.senderId === state.user?.id;
    return {
      ...item,
      messages: [...item.messages, message],
      lastMessage: message.text,
      lastMessageTime: message.timestamp,
      unread: isFromUser ? item.unread : item.unread + 1,
    };
  });

  await persistAppState({ ...state, chatThreads: updatedThreads });
  jsonResponse(response, 201, { message });
}

const server = createServer(async (request, response) => {
  if (!request.url) {
    return notFound(response);
  }

  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': CORS_ORIGIN,
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
    });
    response.end();
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

  if (request.method === 'GET' && url.pathname === '/health') {
    return jsonResponse(response, 200, {
      ok: true,
      source: hasMysql() ? 'mysql' : hasSupabase() ? 'supabase' : 'local',
      auth: 'jwt',
    });
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/login') {
    return handleAuthLogin(request, response);
  }

  if (request.method === 'GET' && url.pathname === '/api/stats') {
    if (!requireAuth(request, response)) {
      return;
    }
    return handleStats(response);
  }

  if (request.method === 'GET' && url.pathname === '/api/bootstrap') {
    return handleBootstrap(response);
  }

  if (request.method === 'POST' && url.pathname === '/api/bookings') {
    if (!requireAuth(request, response)) {
      return;
    }
    return handleCreateBooking(request, response);
  }

  if (request.method === 'PATCH' && url.pathname.startsWith('/api/bookings/')) {
    if (!requireAuth(request, response)) {
      return;
    }
    const bookingId = url.pathname.split('/').pop();
    if (!bookingId) {
      return notFound(response, 'Booking not found');
    }
    return handleUpdateBooking(request, response, bookingId);
  }

  if (request.method === 'POST' && url.pathname.startsWith('/api/chat-threads/') && url.pathname.endsWith('/messages')) {
    if (!requireAuth(request, response)) {
      return;
    }
    const parts = url.pathname.split('/');
    const threadId = parts[3];
    if (!threadId) {
      return notFound(response, 'Thread not found');
    }
    return handleCreateMessage(request, response, threadId);
  }

  return notFound(response);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the old backend process or run with another port: $env:PORT=4001; npm run dev`);
    process.exit(1);
  }

  console.error(error);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
