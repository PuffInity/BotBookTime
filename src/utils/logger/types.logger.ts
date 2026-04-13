/**
 * @file types.logger.ts
 * @summary uk: Типи logger-контрактів.
 * en: Logger contract types.
 * cz: Typy logger kontraktů.
 */
import {Logger} from "winston";
import TransportStream from "winston-transport";

/**
 * uk: Контракт логера
 * en: Logger contract
 * cz: Kontrakt loggeru
 */
export interface ILogger {
    info(t: string, context?: Record<string, unknown>): void
    debug(t: string, context?: Record<string, unknown>): void
    warn(t: string, context?: Record<string, unknown>): void
    error(t: string, context?: Record<string, unknown>): void
    flush(): Promise<void>
    close(): Promise<void>
}

/**
 * uk: Фабрика логера
 * en: Logger factory
 * cz: Factory loggeru
 */
export interface ILoggerFactory {
    createLogger(context?: Record<string, unknown>): ILogger
}

/**
 * uk: Контекст лога
 * en: Log context
 * cz: Kontext logu
 */
export interface LogContext {
    userId?: number,
    locale?: string,
    endPoint?: string,
    service?: string,
    method?: string,
    [key: string]: unknown
}

/** uk: Тип Winston | en: Winston type | cz: Typ Winston */
export type WinstonLogger = Logger


/**
 * uk: Закривний транспорт
 * en: Closable transport
 * cz: Uzavíratelný transport
 */
export type ClosableTransport = TransportStream & {close: () => void}

/**
 * uk: Перевірка close
 * en: Check close
 * cz: Kontrola close
 */
export function hasClose(t:TransportStream): t is ClosableTransport {
    return 'close' in t && typeof (t as {close: unknown}).close === 'function'
}
