import type { ILogger } from "./logger/types.logger.js";

/**
 * @file error.utils.ts
 * @summary Утиліти для нормалізації та єдиного логування помилок.
 */

/**
 * Рівень логу для централізованого обробника помилок.
 */
type ErrorLogLevel = "warn" | "error";

/**
 * Нормалізована форма помилки для логування/телеметрії.
 */
export type AdaptedError = {
    name?: string;
    message: string;
    stack?: string;
    cause?: unknown;
    code?: unknown;
    status?: unknown;
    raw?: unknown;
};

/**
 * Вхідні параметри для `handleError`.
 */
export type HandleErrorInput = {
    /** Логер із необхідними рівнями */
    logger: Pick<ILogger, "warn" | "error">;
    /** Рівень логування (`error` за замовчуванням) */
    level?: ErrorLogLevel;
    /** Логічна область, наприклад `startup`, `shutdown`, `bot` */
    scope: string;
    /** Опис дії/контексту, де сталася помилка */
    action: string;
    /** Первинна помилка будь-якого типу */
    error: unknown;
    /** Додатковий контекст для структурованого логу */
    meta?: Record<string, unknown>;
};

/**
 * Перетворює `unknown` помилку у стабільний структурований об'єкт.
 *
 * @param error Первинна помилка з `catch`.
 * @returns Нормалізований об'єкт помилки.
 */
export function adapterError(error: unknown): AdaptedError {
    if (error instanceof Error) {
        const errWithCode = error as Error & { code?: unknown; status?: unknown };
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: "cause" in error ? error.cause : undefined,
            code: errWithCode.code,
            status: errWithCode.status,
        };
    }

    if (typeof error === "object" && error !== null) {
        const errObject = error as { message?: unknown; code?: unknown; status?: unknown };
        return {
            message: typeof errObject.message === "string" ? errObject.message : String(error),
            code: errObject.code,
            status: errObject.status,
            raw: error,
        };
    }

    return {
        message: String(error),
        raw: error,
    };
}

/**
 * Єдина точка логування помилок у проєкті.
 *
 * Формує стандартизоване повідомлення виду `[scope] action`,
 * логує нормалізовану помилку та повертає її для подальшої обробки.
 *
 * @param input Параметри логування.
 * @returns Нормалізована помилка (`AdaptedError`).
 */
export function handleError({
    logger,
    level = "error",
    scope,
    action,
    error,
    meta = {},
}: HandleErrorInput): AdaptedError {
    const err = adapterError(error);
    const message = `[${scope}] ${action}`;

    logger[level](message, { err, ...meta });
    return err;
}
