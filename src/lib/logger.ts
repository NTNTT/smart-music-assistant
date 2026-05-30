/**
 * Structured Logger – Server-side logging utility
 * Usage: import { logger } from '@/lib/logger'
 * logger.info('Chat API', 'User sent message', { userId: 'x' })
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  module: string;
  message: string;
  meta?: Record<string, unknown>;
}

const LOG_ICONS: Record<LogLevel, string> = {
  debug: '🔍',
  info:  '📘',
  warn:  '⚠️ ',
  error: '🔴',
};

function formatEntry(entry: LogEntry): string {
  const icon = LOG_ICONS[entry.level];
  const base = `${icon} [${entry.timestamp}] [${entry.module}] ${entry.message}`;
  if (entry.meta && Object.keys(entry.meta).length > 0) {
    return `${base} ${JSON.stringify(entry.meta)}`;
  }
  return base;
}

function createEntry(
  level: LogLevel,
  module: string,
  message: string,
  meta?: Record<string, unknown>
): LogEntry {
  return {
    level,
    timestamp: new Date().toISOString(),
    module,
    message,
    meta,
  };
}

export const logger = {
  debug(module: string, message: string, meta?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      const entry = createEntry('debug', module, message, meta);
      console.debug(formatEntry(entry));
    }
  },

  info(module: string, message: string, meta?: Record<string, unknown>) {
    const entry = createEntry('info', module, message, meta);
    console.log(formatEntry(entry));
  },

  warn(module: string, message: string, meta?: Record<string, unknown>) {
    const entry = createEntry('warn', module, message, meta);
    console.warn(formatEntry(entry));
  },

  error(module: string, message: string, meta?: Record<string, unknown>) {
    const entry = createEntry('error', module, message, meta);
    console.error(formatEntry(entry));
  },
};
