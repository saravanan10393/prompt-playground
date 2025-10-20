/**
 * Centralized logging utility for API routes
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatMessage("info", message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage("warn", message, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = error instanceof Error
      ? { ...context, error: error.message, stack: error.stack }
      : { ...context, error };
    console.error(this.formatMessage("error", message, errorContext));
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(this.formatMessage("debug", message, context));
    }
  }

  /**
   * Log API request details
   */
  apiRequest(method: string, path: string, context?: LogContext): void {
    this.info(`API Request: ${method} ${path}`, context);
  }

  /**
   * Log API response details
   */
  apiResponse(
    method: string,
    path: string,
    status: number,
    duration?: number,
    context?: LogContext
  ): void {
    const durationStr = duration ? ` (${duration}ms)` : "";
    this.info(`API Response: ${method} ${path} - ${status}${durationStr}`, context);
  }

  /**
   * Log API errors
   */
  apiError(
    method: string,
    path: string,
    error: Error | unknown,
    context?: LogContext
  ): void {
    this.error(`API Error: ${method} ${path}`, error, context);
  }
}

// Export singleton instance
export const logger = new Logger();

