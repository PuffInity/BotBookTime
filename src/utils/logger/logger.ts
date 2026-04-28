/**
 * @file logger.ts
 * @summary uk: Winston logger фабрика.
 * en: Winston logger factory.
 * cz: Winston logger factory.
 */
import { createLogger, format as wformat, transports } from 'winston';
import { ILogger, ILoggerFactory, WinstonLogger, LogContext, hasClose } from './types.logger.js';
import TransportStream from 'winston-transport';
import { format as lformat, type TransformableInfo } from 'logform';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import { RequestContext } from '../requestId.utils.js';

/** uk: Прод режим | en: Prod mode | cz: Prod režim */
const isProd = process.env.NODE_ENV === 'production';

/** uk: Папка логів | en: Logs directory | cz: Složka logů */
const logsDir = path.resolve('logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/** uk: Чутливі ключі | en: Sensitive keys | cz: Citlivé klíče */
const SENSITIVE = ['authorization', 'email', 'pass', 'password', 'hash', 'token', 'cookie', 'cookies', 'phone'];

/**
 * uk: Маскування даних
 * en: Data redaction
 * cz: Maskování dat
 */
const redact = lformat((info: TransformableInfo) => {
  const scrub = (obj: unknown): unknown => {
    if (!obj || typeof obj !== 'object') return obj;
    const o = obj as Record<string, unknown>;
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (v && typeof v === 'object') o[k] = scrub(v);
      if (SENSITIVE.some((s) => k.toLowerCase().includes(s.toLowerCase()))) o[k] = '[REDACTED]';
    }
    return o;
  };
  scrub(info);
  return info;
});

/** uk: Формат файлу | en: File format | cz: Formát souboru */
const fileFormat = wformat.combine(redact(), wformat.timestamp(), wformat.errors({ stack: true }), wformat.json());

/** uk: Формат консолі | en: Console format | cz: Formát konzole */
const consoleFormat = wformat.combine(
  redact(),
  wformat.colorize(),
  wformat.timestamp({ format: 'HH:mm:ss:SSS' }),
  wformat.printf(({ timestamp, level, message, stack, ...meta }) => {
    const extra = Object.keys(meta).length ? `${JSON.stringify(meta)}` : '';
    return stack ? `[${timestamp}] ${level}: ${message}\n${stack} ${extra}` : `[${timestamp}] ${level}: ${message} ${extra}`;
  }),
);

/** uk: Error ротація | en: Error rotation | cz: Error rotace */
const errorFile = new DailyRotateFile({
  dirname: logsDir,
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '30d',
  format: fileFormat,
});

/** uk: Combined ротація | en: Combined rotation | cz: Combined rotace */
const combinedFile = new DailyRotateFile({
  dirname: logsDir,
  filename: 'combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat,
});

/** uk: Базовий logger | en: Base logger | cz: Základní logger */
export const logger = createLogger({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  format: isProd ? fileFormat : consoleFormat,
  transports: [...(isProd ? [errorFile, combinedFile] : []), new transports.Console({ format: consoleFormat })],
  exceptionHandlers: [
    new transports.Console({ format: consoleFormat }),
    ...(isProd
      ? [
          new DailyRotateFile({
            dirname: logsDir,
            filename: 'exception-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '10m',
            maxFiles: '30d',
            format: fileFormat,
          }),
        ]
      : []),
  ],
  rejectionHandlers: [
    new transports.Console({ format: consoleFormat }),
    ...(isProd
      ? [
          new DailyRotateFile({
            dirname: logsDir,
            filename: 'rejection-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '10m',
            maxFiles: '30d',
            format: fileFormat,
          }),
        ]
      : []),
  ],
});

/**
 * uk: ILogger адаптер
 * en: ILogger adapter
 * cz: ILogger adaptér
 */
class WinstonLoggerAdapter implements ILogger {
  constructor(
    private winston: WinstonLogger,
    private baseContext: LogContext = {},
  ) {}

  /**
   * uk: Додати контекст
   * en: Merge context
   * cz: Sloučit kontext
   */
  private withCtx(meta: Record<string, unknown> = {}) {
    const requestId = RequestContext.getRequestId();
    return requestId ? { requestId, ...meta } : { ...meta };
  }

  /**
   * uk: Рівень info
   * en: Info level
   * cz: Úroveň info
   */
  info(message: string, meta: Record<string, unknown> = {}): void {
    this.winston.info(message, this.withCtx({ ...this.baseContext, ...meta }));
  }

  /**
   * uk: Рівень debug
   * en: Debug level
   * cz: Úroveň debug
   */
  debug(message: string, meta: Record<string, unknown> = {}): void {
    this.winston.debug(message, this.withCtx({ ...this.baseContext, ...meta }));
  }

  /**
   * uk: Рівень warn
   * en: Warn level
   * cz: Úroveň warn
   */
  warn(message: string, meta: Record<string, unknown> = {}): void {
    this.winston.warn(message, this.withCtx({ ...this.baseContext, ...meta }));
  }

  /**
   * uk: Рівень error
   * en: Error level
   * cz: Úroveň error
   */
  error(message: string, meta: Record<string, unknown> = {}): void {
    this.winston.error(message, this.withCtx({ ...this.baseContext, ...meta }));
  }

  /**
   * uk: Дочекатись I/O
   * en: Flush I/O
   * cz: Flush I/O
   */
  async flush(): Promise<void> {
    await new Promise<void>((resolve) => setImmediate(() => resolve()));
  }

  /**
   * uk: Закрити логер
   * en: Close logger
   * cz: Zavřít logger
   */
  async close(): Promise<void> {
    await this.flush();
    this.winston.close();

    const transports: ReadonlyArray<TransportStream> = this.winston.transports;
    for (const t of transports) {
      try {
        t.end();
      } catch {
        // noop
      }
      if (hasClose(t)) {
        try {
          t.close();
        } catch {
          // noop
        }
      }
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 25));
  }
}

/**
 * uk: Фабрика логерів
 * en: Logger factory
 * cz: Factory loggerů
 */
export class AppLoggerFactory implements ILoggerFactory {
  constructor(private winstonLogger: WinstonLogger) {}

  /**
   * uk: Створити logger
   * en: Create logger
   * cz: Vytvořit logger
   */
  createLogger(context: LogContext = {}): ILogger {
    return new WinstonLoggerAdapter(this.winstonLogger, context);
  }
}

/** uk: Глобальна фабрика | en: Global factory | cz: Globální factory */
export const loggerFactory: ILoggerFactory = new AppLoggerFactory(logger);

/**
 * uk: Створити app logger
 * en: Create app logger
 * cz: Vytvořit app logger
 */
export const createAppLogger = (context?: LogContext): ILogger => loggerFactory.createLogger(context);
