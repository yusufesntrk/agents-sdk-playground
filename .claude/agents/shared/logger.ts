/**
 * Logger für Agent System
 * Zentrale Logging-Utility für alle Agents
 */

import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './types';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class ConsoleLogger implements Logger {
  private level: LogLevel;
  private prefix: string;

  constructor(prefix: string = 'Agent', level: LogLevel = LogLevel.INFO) {
    this.prefix = prefix;
    this.level = level;
  }

  debug(message: string, context?: any): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`[${this.prefix}:DEBUG]`, message, context);
    }
  }

  info(message: string, context?: any): void {
    if (this.level <= LogLevel.INFO) {
      console.log(`[${this.prefix}:INFO]`, message, context);
    }
  }

  warn(message: string, context?: any): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[${this.prefix}:WARN]`, message, context);
    }
  }

  error(message: string, error?: Error | string, context?: any): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(
        `[${this.prefix}:ERROR]`,
        message,
        error instanceof Error ? error.message : error,
        context
      );
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }
}

export class FileLogger implements Logger {
  private level: LogLevel;
  private prefix: string;
  private logFile: string;

  constructor(
    logFile: string,
    prefix: string = 'Agent',
    level: LogLevel = LogLevel.INFO
  ) {
    this.logFile = logFile;
    this.prefix = prefix;
    this.level = level;

    // Ensure log directory exists
    const dir = path.dirname(logFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private write(level: string, message: string, context?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      prefix: this.prefix,
      level,
      message,
      context
    };

    try {
      fs.appendFileSync(
        this.logFile,
        JSON.stringify(logEntry) + '\n'
      );
    } catch (error) {
      console.error(`Failed to write to log file: ${this.logFile}`, error);
    }
  }

  debug(message: string, context?: any): void {
    if (this.level <= LogLevel.DEBUG) {
      this.write('DEBUG', message, context);
    }
  }

  info(message: string, context?: any): void {
    if (this.level <= LogLevel.INFO) {
      this.write('INFO', message, context);
    }
  }

  warn(message: string, context?: any): void {
    if (this.level <= LogLevel.WARN) {
      this.write('WARN', message, context);
    }
  }

  error(message: string, error?: Error | string, context?: any): void {
    if (this.level <= LogLevel.ERROR) {
      this.write('ERROR', message, {
        error: error instanceof Error ? error.message : error,
        ...context
      });
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Gibt die letzten N Zeilen der Log-Datei zurück
   */
  tail(lines: number = 50): string[] {
    try {
      const content = fs.readFileSync(this.logFile, 'utf-8');
      return content.split('\n').slice(-lines);
    } catch (error) {
      return [];
    }
  }
}

export class CompositeLogger implements Logger {
  private loggers: Logger[];

  constructor(...loggers: Logger[]) {
    this.loggers = loggers;
  }

  debug(message: string, context?: any): void {
    this.loggers.forEach(logger => logger.debug(message, context));
  }

  info(message: string, context?: any): void {
    this.loggers.forEach(logger => logger.info(message, context));
  }

  warn(message: string, context?: any): void {
    this.loggers.forEach(logger => logger.warn(message, context));
  }

  error(message: string, error?: Error | string, context?: any): void {
    this.loggers.forEach(logger => logger.error(message, error, context));
  }

  addLogger(logger: Logger): void {
    this.loggers.push(logger);
  }

  removeLogger(logger: Logger): void {
    const index = this.loggers.indexOf(logger);
    if (index > -1) {
      this.loggers.splice(index, 1);
    }
  }
}
