import winston from 'winston';
import path from 'path';
import fs from 'fs';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const devFmt = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, requestId, userId, stack }) => {
    let line = `${ts} [${level}]`;
    if (requestId) line += ` [req:${requestId}]`;
    if (userId) line += ` [user:${userId}]`;
    line += ` ${message}`;
    if (stack) line += `\n${stack}`;
    return line;
  })
);

const prodFmt = combine(timestamp(), errors({ stack: true }), json());

const isProduction = process.env.NODE_ENV === 'production';

// On Vercel (production), the filesystem is read-only — file transports crash
// with ENOENT. Use console-only logging; Vercel captures stdout/stderr and
// shows them in the Functions log dashboard.
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: isProduction ? prodFmt : devFmt,
  }),
];

if (!isProduction) {
  // File transports only in local development where the filesystem is writable
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: prodFmt,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
      format: prodFmt,
    })
  );
}

export const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  transports,
});

// NEVER log these fields
const REDACTED = ['githubToken', 'sessionToken', 'password', 'encryptedToken'];
logger.on('data', (log: Record<string, unknown>) => {
  for (const key of REDACTED) {
    if (key in log) delete log[key];
  }
});