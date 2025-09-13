import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '../../utils/logger';

describe('logger utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('main logger', () => {
    it('should log debug messages', () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      
      logger.debug('test debug message');
      
      expect(consoleSpy).toHaveBeenCalledWith('test debug message', '');
      
      consoleSpy.mockRestore();
    });

    it('should log info messages', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      
      logger.info('test info message');
      
      expect(consoleSpy).toHaveBeenCalledWith('test info message', '');
      
      consoleSpy.mockRestore();
    });

    it('should log warning messages', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      logger.warn('test warning message');
      
      expect(consoleSpy).toHaveBeenCalledWith('test warning message', '');
      
      consoleSpy.mockRestore();
    });

    it('should log error messages', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      logger.error('test error message');
      
      expect(consoleSpy).toHaveBeenCalledWith('test error message', '');
      
      consoleSpy.mockRestore();
    });

    it('should log messages with additional objects', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const testObj = { key: 'value', number: 42 };
      
      logger.info('test message with object', testObj);
      
      expect(consoleSpy).toHaveBeenCalledWith('test message with object', testObj);
      
      consoleSpy.mockRestore();
    });

    it('should handle undefined objects gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      
      logger.info('test message without object', undefined);
      
      expect(consoleSpy).toHaveBeenCalledWith('test message without object', '');
      
      consoleSpy.mockRestore();
    });
  });

  describe('child logger', () => {
    it('should create child logger with prefix', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      
      const childLogger = logger.child('test-module');
      childLogger.info('child message');
      
      expect(consoleSpy).toHaveBeenCalledWith('[test-module] child message', '');
      
      consoleSpy.mockRestore();
    });

    it('should create nested child loggers', () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      
      const parentChild = logger.child('parent');
      const nestedChild = parentChild.child('nested');
      nestedChild.debug('nested message');
      
      expect(consoleSpy).toHaveBeenCalledWith('[parent:nested] nested message', '');
      
      consoleSpy.mockRestore();
    });

    it('should support all log levels in child loggers', () => {
      const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const childLogger = logger.child('services');
      
      childLogger.debug('debug msg');
      childLogger.info('info msg');
      childLogger.warn('warn msg');
      childLogger.error('error msg');
      
      expect(debugSpy).toHaveBeenCalledWith('[services] debug msg', '');
      expect(infoSpy).toHaveBeenCalledWith('[services] info msg', '');
      expect(warnSpy).toHaveBeenCalledWith('[services] warn msg', '');
      expect(errorSpy).toHaveBeenCalledWith('[services] error msg', '');
      
      debugSpy.mockRestore();
      infoSpy.mockRestore();
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });

    it('should pass objects correctly in child loggers', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const testError = { message: 'test error', code: 500 };
      
      const childLogger = logger.child('api');
      childLogger.error('API error occurred', testError);
      
      expect(consoleSpy).toHaveBeenCalledWith('[api] API error occurred', testError);
      
      consoleSpy.mockRestore();
    });
  });

  describe('integration with actual usage patterns', () => {
    it('should work like the location service logger', () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      
      const log = logger.child('services:location');
      log.debug('fetchAmenities invoked', { lat: 40.7580, lon: -73.9855, radiusMeters: 1609 });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[services:location] fetchAmenities invoked',
        { lat: 40.7580, lon: -73.9855, radiusMeters: 1609 }
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle error logging patterns', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const log = logger.child('services:location');
      const error = new Error('Network timeout');
      log.error('endpoint error', { endpoint: 'https://test.com', error: error.message });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[services:location] endpoint error',
        { endpoint: 'https://test.com', error: 'Network timeout' }
      );
      
      consoleSpy.mockRestore();
    });
  });
});