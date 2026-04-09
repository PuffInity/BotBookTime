import { ZodError } from "zod";
import type { ILogger } from "./logger/types.logger.js";
import {loggerErrorUtils} from "./logger/loggers-list.js";

/**
 * @file error.utils.ts
 * @summary Єдиний модуль системи помилок:
 * - доменні AppError-класи,
 * - нормалізація Zod/PG/unknown,
 * - Telegraf-сумісні helper-и (`asyncHandler`, `createTelegrafErrorHandler`),
 * - централізоване логування помилок.
 */

type ErrorLogLevel = "warn" | "error";
const errorUtilsLogger = loggerErrorUtils;

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
 * Коди доменних API-помилок.
 */
export const ERROR_CODE = {
    VALIDATION_ERROR: "VALIDATION_ERROR",
    DATABASE_ERROR: "DATABASE_ERROR",
    DATABASE_UNIQUE_VIOLATION: "DATABASE_UNIQUE_VIOLATION",
    DATABASE_FOREIGN_KEY_VIOLATION: "DATABASE_FOREIGN_KEY_VIOLATION",
    DATABASE_NOT_NULL_VIOLATION: "DATABASE_NOT_NULL_VIOLATION",
    AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
    AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
    NOT_FOUND: "NOT_FOUND",
    EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
    INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];

/**
 * Базова прикладна помилка.
 */
export class AppError extends Error {
    readonly statusCode: number;
    readonly code: ErrorCode | string;
    readonly metadata?: Record<string, unknown>;
    readonly isOperational: boolean;

    constructor({
        message,
        statusCode,
        code,
        metadata,
        cause,
        isOperational = true,
    }: {
        message: string;
        statusCode: number;
        code: ErrorCode | string;
        metadata?: Record<string, unknown>;
        cause?: unknown;
        isOperational?: boolean;
    }) {
        super(message, { cause });
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.metadata = metadata;
        this.isOperational = isOperational;
    }
}

export class ValidationError extends AppError {
    constructor(message = "Invalid request data", metadata?: Record<string, unknown>, cause?: unknown) {
        super({ message, statusCode: 400, code: ERROR_CODE.VALIDATION_ERROR, metadata, cause });
    }
}

export class DatabaseError extends AppError {
    constructor(
        message = "Database operation failed",
        metadata?: Record<string, unknown>,
        cause?: unknown,
        code: ErrorCode | string = ERROR_CODE.DATABASE_ERROR,
        statusCode = 500,
    ) {
        super({ message, statusCode, code, metadata, cause });
    }
}

export class AuthenticationError extends AppError {
    constructor(message = "Authentication required", metadata?: Record<string, unknown>, cause?: unknown) {
        super({ message, statusCode: 401, code: ERROR_CODE.AUTHENTICATION_ERROR, metadata, cause });
    }
}

export class AuthorizationError extends AppError {
    constructor(message = "Access denied", metadata?: Record<string, unknown>, cause?: unknown) {
        super({ message, statusCode: 403, code: ERROR_CODE.AUTHORIZATION_ERROR, metadata, cause });
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Resource not found", metadata?: Record<string, unknown>, cause?: unknown) {
        super({ message, statusCode: 404, code: ERROR_CODE.NOT_FOUND, metadata, cause });
    }
}

export class ExternalServiceError extends AppError {
    constructor(message = "External service request failed", metadata?: Record<string, unknown>, cause?: unknown) {
        super({ message, statusCode: 502, code: ERROR_CODE.EXTERNAL_SERVICE_ERROR, metadata, cause });
    }
}

export class InternalServerError extends AppError {
    constructor(message = "Internal Server Error", metadata?: Record<string, unknown>, cause?: unknown) {
        super({
            message,
            statusCode: 500,
            code: ERROR_CODE.INTERNAL_SERVER_ERROR,
            metadata,
            cause,
            isOperational: false,
        });
    }
}

/**
 * Мінімальний Telegraf-like контекст, достатній для логування та відповіді користувачу.
 */
export type BotContextLike = {
    updateType?: string;
    from?: { id?: number; username?: string };
    chat?: { id?: number; type?: string };
    update?: unknown;
    reply?: (text: string) => Promise<unknown>;
};

/**
 * Async обробник Telegraf-команди/сцени.
 */
export type BotHandler<C extends BotContextLike = BotContextLike> = (ctx: C) => Promise<unknown>;
export type BotCatchHandler<C extends BotContextLike = BotContextLike> = (error: unknown, ctx: C) => Promise<void>;

/**
 * Вхідні параметри для `handleError`.
 */
export type HandleErrorInput = {
    logger: Pick<ILogger, "warn" | "error">;
    level?: ErrorLogLevel;
    scope: string;
    action: string;
    error: unknown;
    meta?: Record<string, unknown>;
};

type UnifiedErrorLog = {
    code: string;
    statusCode: number;
    name?: string;
    message: string;
    reason: string;
    isOperational: boolean;
    stack?: string;
    causeMessage?: string;
};

/**
 * Нормалізатор помилки з `catch` у стабільний об'єкт для логування.
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

    return { message: String(error), raw: error };
}

function extractCauseMessage(cause: unknown): string | undefined {
    if (cause instanceof Error) return cause.message;
    if (typeof cause === "string") return cause;
    if (cause && typeof cause === "object") {
        const candidate = cause as { message?: unknown };
        if (typeof candidate.message === "string") return candidate.message;
    }
    return undefined;
}

function toUnifiedErrorLog(error: unknown): UnifiedErrorLog {
    const adapted = adapterError(error);

    if (error instanceof AppError) {
        const causeMessage = extractCauseMessage(error.cause);
        return {
            code: String(error.code),
            statusCode: error.statusCode,
            name: adapted.name ?? error.name,
            message: error.message,
            reason: causeMessage ?? adapted.message,
            isOperational: error.isOperational,
            stack: adapted.stack,
            causeMessage,
        };
    }

    const causeMessage = extractCauseMessage(adapted.cause);
    return {
        code: ERROR_CODE.INTERNAL_SERVER_ERROR,
        statusCode: 500,
        name: adapted.name,
        message: adapted.message,
        reason: causeMessage ?? adapted.message,
        isOperational: false,
        stack: adapted.stack,
        causeMessage,
    };
}

/**
 * Єдина точка логування помилок у проєкті.
 */
export function handleError({
    logger,
    level = "error",
    scope,
    action,
    error,
    meta = {},
}: HandleErrorInput): AdaptedError {
    const err = toUnifiedErrorLog(error);
    const message = `[${scope}] ${action}`;
    logger[level](message, { err, ...meta });
    return adapterError(error);
}

type PgLikeError = {
    code?: string;
    message?: string;
    detail?: string;
    table?: string;
    column?: string;
    constraint?: string;
    schema?: string;
};

function isPgLikeError(error: unknown): error is PgLikeError {
    if (!error || typeof error !== "object") return false;
    const candidate = error as { code?: unknown };
    return typeof candidate.code === "string";
}

/**
 * Перетворює Zod-помилку у `ValidationError`.
 */
export function normalizeZodError(error: ZodError): ValidationError {
    const issues = error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
        code: issue.code,
    }));
    const first = issues[0]?.message ?? "Invalid request data";
    return new ValidationError(first, { issues }, error);
}

/**
 * Перетворює типові помилки PostgreSQL (`pg`) у безпечні AppError.
 */
export function normalizePgError(error: unknown): AppError | null {
    if (!isPgLikeError(error)) return null;

    const metadata: Record<string, unknown> = {
        table: error.table,
        column: error.column,
        constraint: error.constraint,
        schema: error.schema,
    };

    switch (error.code) {
        case "23505":
            return new DatabaseError(
                "Duplicate value violates unique constraint",
                metadata,
                error,
                ERROR_CODE.DATABASE_UNIQUE_VIOLATION,
                409,
            );
        case "23503":
            return new DatabaseError(
                "Related entity does not exist",
                metadata,
                error,
                ERROR_CODE.DATABASE_FOREIGN_KEY_VIOLATION,
                409,
            );
        case "23502":
            return new DatabaseError(
                "Required field is missing",
                metadata,
                error,
                ERROR_CODE.DATABASE_NOT_NULL_VIOLATION,
                400,
            );
        default:
            return new DatabaseError("Database operation failed", metadata, error);
    }
}

/**
 * Нормалізує `unknown` у цільовий `AppError`.
 */
export function normalizeError(error: unknown): AppError {
    if (error instanceof AppError) return error;
    if (error instanceof ZodError) return normalizeZodError(error);

    const pgMapped = normalizePgError(error);
    if (pgMapped) return pgMapped;

    if (error instanceof Error) {
        return new InternalServerError("Internal Server Error", { originalName: error.name }, error);
    }
    return new InternalServerError("Internal Server Error", { raw: error });
}

/**
 * Обгортка для async-обробників Telegraf без ручного `try/catch`.
 * Помилка нормалізується і пробрасывается в `bot.catch(...)`.
 */
export function asyncHandler<C extends BotContextLike>(handler: BotHandler<C>) {
    return async (ctx: C): Promise<void> => {
        try {
            await handler(ctx);
        } catch (error) {
            const normalizedError = normalizeError(error);
            handleError({
                logger: errorUtilsLogger,
                level: normalizedError.statusCode >= 500 ? "error" : "warn",
                scope: "error-utils",
                action: "Помилка в asyncHandler Telegraf",
                error: normalizedError,
                meta: { updateType: ctx.updateType },
            });
            throw normalizedError;
        }
    };
}

/**
 * Явний alias під Telegraf, щоб код був читабельнішим.
 */
export const asyncBotHandler = asyncHandler;

const SENSITIVE_KEYS = [
    "password",
    "pass",
    "token",
    "authorization",
    "cookie",
    "cookies",
    "phone",
    "email",
    "secret",
];

function sanitizeValue(input: unknown): unknown {
    if (input === null || input === undefined) return input;
    if (typeof input !== "object") return input;
    if (Array.isArray(input)) return input.map(sanitizeValue);

    const obj = input as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
        const isSensitive = SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s));
        result[key] = isSensitive ? "[REDACTED]" : sanitizeValue(value);
    }
    return result;
}

function getBotUserMessage(error: AppError, isProduction: boolean): string {
    if (
        error instanceof ExternalServiceError &&
        error.metadata?.provider === "twilio" &&
        error.metadata?.reason === "not_configured"
    ) {
        return "⚠️ Функція підтвердження номера телефону тимчасово недоступна. Спробуйте пізніше.";
    }

    const code = String(error.code ?? ERROR_CODE.INTERNAL_SERVER_ERROR);
    const causeMessage = extractCauseMessage(error.cause);
    const reason =
        error.statusCode >= 500
            ? isProduction
                ? "Сталася внутрішня помилка. Спробуйте ще раз пізніше."
                : causeMessage ?? error.message
            : error.message;

    return `⚠️ Помилка [${code}]\nПричина: ${reason}`;
}

/**
 * Фабрика глобального обробника помилок Telegraf (`bot.catch`).
 */
export function createTelegrafErrorHandler<C extends BotContextLike>({
    logger,
    env = process.env.NODE_ENV ?? "development",
    replyToUser = true,
    isPrivilegedUser,
    restrictedUserMessage = "⚠️ Ця дія недоступна. Звʼяжіться з адміністратором.",
}: {
    logger: Pick<ILogger, "warn" | "error">;
    env?: string;
    replyToUser?: boolean;
    isPrivilegedUser?: (ctx: C) => Promise<boolean>;
    restrictedUserMessage?: string | ((ctx: C, appError: AppError) => Promise<string> | string);
}): BotCatchHandler<C> {
    const isProduction = env === "production";

    return async (error: unknown, ctx: C): Promise<void> => {
        const appError = normalizeError(error);

        const ctxMeta = sanitizeValue({
            updateType: ctx.updateType,
            from: {
                id: ctx.from?.id,
                username: ctx.from?.username,
            },
            chat: {
                id: ctx.chat?.id,
                type: ctx.chat?.type,
            },
        });

        handleError({
            logger,
            level: appError.statusCode >= 500 ? "error" : "warn",
            scope: "bot",
            action: `Помилка обробки update (${ctx.updateType ?? "unknown"})`,
            error: appError,
            meta: {
                code: appError.code,
                statusCode: appError.statusCode,
                context: ctxMeta as Record<string, unknown>,
            },
        });

        if (!replyToUser || typeof ctx.reply !== "function") return;

        try {
            let canSeeDetailedError = true;
            if (isPrivilegedUser) {
                try {
                    canSeeDetailedError = await isPrivilegedUser(ctx);
                } catch (roleCheckError) {
                    canSeeDetailedError = false;
                    handleError({
                        logger,
                        level: "warn",
                        scope: "bot",
                        action: "Не вдалося перевірити роль користувача для формату помилки",
                        error: roleCheckError,
                    });
                }
            }

            const userMessage = canSeeDetailedError
                ? getBotUserMessage(appError, isProduction)
                : typeof restrictedUserMessage === "function"
                    ? await restrictedUserMessage(ctx, appError)
                    : restrictedUserMessage;

            await ctx.reply(userMessage);
        } catch (replyError) {
            handleError({
                logger,
                level: "warn",
                scope: "bot",
                action: "Не вдалося відправити повідомлення користувачу після помилки",
                error: replyError,
            });
        }
    };
}
