import winston from 'winston';
import path from 'path';

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

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? prodFmt : devFmt,
    }),
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      format: prodFmt,
    }),
    new winston.transports.File({
      filename: path.join('logs', 'app.log'),
      format: prodFmt,
    }),
  ],
});

// NEVER log these fields
const REDACTED = ['githubToken', 'sessionToken', 'password', 'encryptedToken'];
logger.on('data', (log: Record<string, unknown>) => {
  for (const key of REDACTED) {
    if (key in log) delete log[key];
  }
});
