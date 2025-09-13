// Simple console-based logger for browser environment
interface Logger {
  debug: (message: string, obj?: any) => void;
  info: (message: string, obj?: any) => void;
  warn: (message: string, obj?: any) => void;
  error: (message: string, obj?: any) => void;
  child: (name: string) => Logger;
}

const createLogger = (prefix?: string): Logger => ({
  debug: (message: string, obj?: any) => console.debug(prefix ? `[${prefix}] ${message}` : message, obj || ''),
  info: (message: string, obj?: any) => console.info(prefix ? `[${prefix}] ${message}` : message, obj || ''),
  warn: (message: string, obj?: any) => console.warn(prefix ? `[${prefix}] ${message}` : message, obj || ''),
  error: (message: string, obj?: any) => console.error(prefix ? `[${prefix}] ${message}` : message, obj || ''),
  child: (name: string) => createLogger(prefix ? `${prefix}:${name}` : name)
});

export const logger = createLogger();