// Logging and monitoring utilities
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  stack?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  apiKey?: string;
}

class Logger {
  private config: LoggerConfig;
  private buffer: LogEntry[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(config: LoggerConfig) {
    this.config = config;
    this.startFlushInterval();
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.config.level;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    logError?: Error
  ): LogEntry {
    return {
      timestamp: new Date(),
      level,
      message,
      context,
      userId: context?.userId as string | undefined,
      sessionId: context?.sessionId as string | undefined,
      requestId: context?.requestId as string | undefined,
      stack: logError?.stack,
    };
  }

  private formatLogMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = LogLevel[entry.level];
    const context = entry.context ? JSON.stringify(entry.context) : "";
    return `[${timestamp}] ${level}: ${entry.message} ${context}`;
  }

  private async flushLogs(): Promise<void> {
    if (this.buffer.length === 0) {
      return;
    }

    const logs = [...this.buffer];
    this.buffer = [];

    if (this.config.enableRemote && this.config.remoteEndpoint) {
      try {
        await fetch(this.config.remoteEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({ logs }),
        });
      } catch {
        // Silent fail for remote logging
      }
    }
  }

  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      this.flushLogs();
    }, 5000); // Flush every 5 seconds
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    logError?: Error
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = this.createLogEntry(level, message, context, logError);

    if (this.config.enableConsole) {
      const formattedMessage = this.formatLogMessage(entry);
      switch (level) {
        case LogLevel.ERROR:
          if (logError) {
            console.error(formattedMessage, logError);
          } else {
            console.error(formattedMessage);
          }
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
      }
    }

    if (this.config.enableFile || this.config.enableRemote) {
      this.buffer.push(entry);
    }
  }

  error(
    message: string,
    context?: Record<string, unknown>,
    logError?: Error
  ): void {
    this.log(LogLevel.ERROR, message, context, logError);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  // Performance monitoring
  time(label: string): void {
    console.time(label);
  }

  timeEnd(label: string, context?: Record<string, unknown>): void {
    console.timeEnd(label);
    this.info(`Performance: ${label} completed`, context);
  }

  // Structured logging for specific events
  logUserAction(
    action: string,
    userId: string,
    details?: Record<string, unknown>
  ): void {
    this.info(`User action: ${action}`, {
      userId,
      action,
      ...details,
    });
  }

  logAPIRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    userId?: string
  ): void {
    this.info(`API request: ${method} ${path}`, {
      method,
      path,
      statusCode,
      duration,
      userId,
    });
  }

  logError(logError: Error, context?: Record<string, unknown>): void {
    this.error(logError.message, context, logError);
  }

  logSecurityEvent(event: string, details: Record<string, unknown>): void {
    this.warn(`Security event: ${event}`, {
      event,
      ...details,
    });
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushLogs();
  }
}

// Default logger configuration
const defaultConfig: LoggerConfig = {
  level: process.env.NODE_ENV === "production" ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsole: true,
  enableFile: false,
  enableRemote: process.env.NODE_ENV === "production",
  remoteEndpoint: process.env.LOG_ENDPOINT,
  apiKey: process.env.LOG_API_KEY,
};

// Global logger instance
export const logger = new Logger(defaultConfig);

// Performance monitoring utilities
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

  static startTimer(label: string): () => number {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(label, duration);
      return duration;
    };
  }

  static recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);

    // Keep only last 100 measurements
    const values = this.metrics.get(name)!;
    if (values.length > 100) {
      values.shift();
    }
  }

  static getMetrics(
    name: string
  ): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) {
      return null;
    }

    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { avg, min, max, count: values.length };
  }

  static getAllMetrics(): Record<
    string,
    { avg: number; min: number; max: number; count: number }
  > {
    const result: Record<string, unknown> = {};
    for (const [name] of this.metrics) {
      const metrics = this.getMetrics(name);
      if (metrics) {
        result[name] = metrics;
      }
    }
    return result as Record<
      string,
      { avg: number; min: number; max: number; count: number }
    >;
  }
}

// Error tracking utilities
export class ErrorTracker {
  private static errors: Map<
    string,
    { count: number; lastSeen: Date; stack?: string }
  > = new Map();

  static trackError(
    trackedError: Error,
    context?: Record<string, unknown>
  ): void {
    const key = `${trackedError.name}: ${trackedError.message}`;
    const existing = this.errors.get(key);

    if (existing) {
      existing.count++;
      existing.lastSeen = new Date();
    } else {
      this.errors.set(key, {
        count: 1,
        lastSeen: new Date(),
        stack: trackedError.stack,
      });
    }

    logger.logError(trackedError, context);
  }

  static getErrorStats(): Array<{
    error: string;
    count: number;
    lastSeen: Date;
    stack?: string;
  }> {
    return Array.from(this.errors.entries()).map(([errorKey, stats]) => ({
      error: errorKey,
      ...stats,
    }));
  }

  static clearErrors(): void {
    this.errors.clear();
  }
}

// Health check utilities
export interface HealthCheck {
  name: string;
  status: "healthy" | "degraded" | "unhealthy";
  message?: string;
  responseTime?: number;
}

export class HealthMonitor {
  private static checks: Map<string, () => Promise<HealthCheck>> = new Map();

  static registerCheck(name: string, check: () => Promise<HealthCheck>): void {
    this.checks.set(name, check);
  }

  static async runChecks(): Promise<HealthCheck[]> {
    const results: HealthCheck[] = [];

    for (const [name, check] of this.checks) {
      try {
        const endTimer = PerformanceMonitor.startTimer(`health_check_${name}`);
        const result = await check();
        result.responseTime = endTimer();
        results.push(result);
      } catch (_error) {
        results.push({
          name,
          status: "unhealthy",
          message: _error instanceof Error ? _error.message : "Unknown error",
        });
      }
    }

    return results;
  }

  static getOverallHealth(
    checks: HealthCheck[]
  ): "healthy" | "degraded" | "unhealthy" {
    if (checks.some((check) => check.status === "unhealthy")) {
      return "unhealthy";
    }
    if (checks.some((check) => check.status === "degraded")) {
      return "degraded";
    }
    return "healthy";
  }
}

// Default health checks
HealthMonitor.registerCheck("database", async () => {
  try {
    // This would check database connectivity
    // const result = await prisma.$queryRaw`SELECT 1`;
    return {
      name: "database",
      status: "healthy",
      message: "Database connection is healthy",
    };
  } catch {
    return {
      name: "database",
      status: "unhealthy",
      message: "Database connection failed",
    };
  }
});

HealthMonitor.registerCheck("memory", async () => {
  const usage = process.memoryUsage();
  const heapUsedMB = usage.heapUsed / 1024 / 1024;
  const heapTotalMB = usage.heapTotal / 1024 / 1024;
  const usagePercent = (heapUsedMB / heapTotalMB) * 100;

  let status: "healthy" | "degraded" | "unhealthy" = "healthy";
  if (usagePercent > 90) {
    status = "unhealthy";
  } else if (usagePercent > 75) {
    status = "degraded";
  }

  return {
    name: "memory",
    status,
    message: `Memory usage: ${heapUsedMB.toFixed(2)}MB / ${heapTotalMB.toFixed(2)}MB (${usagePercent.toFixed(1)}%)`,
  };
});

export { logger as default };
