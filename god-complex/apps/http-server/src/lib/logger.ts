type LogLevel = "debug" | "info" | "warn" | "error";
interface LogContext {
    requestId?: string;
    userId?: string;
    action?: string;
    [key: string]: unknown;
}
const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};
const MIN_LOG_LEVEL = (process.env.LOG_LEVEL as LogLevel) ||
    (process.env.NODE_ENV === "production" ? "info" : "debug");
const MIN_LEVEL_NUM = LOG_LEVELS[MIN_LOG_LEVEL] || 0;
function shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= MIN_LEVEL_NUM;
}
function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context
        ? Object.entries(context)
            .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
            .join(" ")
        : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr ? ` | ${contextStr}` : ""}`;
}
function formatJson(level: LogLevel, message: string, context?: LogContext): object {
    return {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...context,
    };
}
const USE_JSON = process.env.NODE_ENV === "production";
export const logger = {
    debug(message: string, context?: LogContext): void {
        if (!shouldLog("debug"))
            return;
        if (USE_JSON) {
            console.debug(JSON.stringify(formatJson("debug", message, context)));
        }
        else {
            console.debug(formatMessage("debug", message, context));
        }
    },
    info(message: string, context?: LogContext): void {
        if (!shouldLog("info"))
            return;
        if (USE_JSON) {
            console.info(JSON.stringify(formatJson("info", message, context)));
        }
        else {
            console.info(formatMessage("info", message, context));
        }
    },
    warn(message: string, context?: LogContext): void {
        if (!shouldLog("warn"))
            return;
        if (USE_JSON) {
            console.warn(JSON.stringify(formatJson("warn", message, context)));
        }
        else {
            console.warn(formatMessage("warn", message, context));
        }
    },
    error(message: string, error?: Error | unknown, context?: LogContext): void {
        if (!shouldLog("error"))
            return;
        const errorContext = error instanceof Error
            ? {
                errorName: error.name,
                errorMessage: error.message,
                stack: error.stack,
                ...context
            }
            : { error, ...context };
        if (USE_JSON) {
            console.error(JSON.stringify(formatJson("error", message, errorContext)));
        }
        else {
            console.error(formatMessage("error", message, errorContext));
            if (error instanceof Error && error.stack) {
                console.error(error.stack);
            }
        }
    },
    child(baseContext: LogContext) {
        return {
            debug: (message: string, context?: LogContext) => logger.debug(message, { ...baseContext, ...context }),
            info: (message: string, context?: LogContext) => logger.info(message, { ...baseContext, ...context }),
            warn: (message: string, context?: LogContext) => logger.warn(message, { ...baseContext, ...context }),
            error: (message: string, error?: Error | unknown, context?: LogContext) => logger.error(message, error, { ...baseContext, ...context }),
        };
    },
    authEvent(event: string, userId?: string, details?: Record<string, unknown>): void {
        logger.info(`[AUTH] ${event}`, {
            action: event,
            userId,
            ...details
        });
    },
};
export default logger;
