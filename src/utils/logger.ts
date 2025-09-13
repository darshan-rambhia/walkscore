// Simple console-based logger for browser environment
export interface LogPayload { [key: string]: unknown }
interface Logger {
  debug: (message: string, obj?: LogPayload) => void;
  info: (message: string, obj?: LogPayload) => void;
  warn: (message: string, obj?: LogPayload) => void;
  error: (message: string, obj?: LogPayload) => void;
  child: (name: string) => Logger;
}

const createLogger = (prefix?: string): Logger => ({
  debug: (message: string, obj?: LogPayload) => console.debug(prefix ? `[${prefix}] ${message}` : message, obj || ''),
  info: (message: string, obj?: LogPayload) => console.info(prefix ? `[${prefix}] ${message}` : message, obj || ''),
  warn: (message: string, obj?: LogPayload) => console.warn(prefix ? `[${prefix}] ${message}` : message, obj || ''),
  error: (message: string, obj?: LogPayload) => console.error(prefix ? `[${prefix}] ${message}` : message, obj || ''),
  child: (name: string) => createLogger(prefix ? `${prefix}:${name}` : name)
});

export const logger = createLogger();