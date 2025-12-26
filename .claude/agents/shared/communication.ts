/**
 * Inter-Agent Communication System
 * Verwaltet Datenaustausch zwischen Agents und Cache
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  CacheEntry,
  AgentCache,
  AgentType,
  AgentOutput,
  Logger
} from './types';

// =====================================================
// File-based Cache Implementation
// =====================================================

export class FileCacheSystem implements AgentCache {
  private cacheDir: string;
  private logger: Logger;

  constructor(cacheDir: string, logger: Logger) {
    this.cacheDir = cacheDir;
    this.logger = logger;

    // Ensure cache directory exists
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
      this.logger.debug(`Created cache directory: ${cacheDir}`);
    }
  }

  /**
   * Speichert einen Cache-Eintrag
   */
  set(entry: CacheEntry): void {
    try {
      const filename = this.getFilename(entry.key);
      const cacheData = {
        key: entry.key,
        agentType: entry.agentType,
        data: entry.data,
        timestamp: entry.timestamp.toISOString(),
        ttl: entry.ttl
      };

      fs.writeFileSync(filename, JSON.stringify(cacheData, null, 2));
      this.logger.debug(
        `Cache entry saved: ${entry.key} (agent: ${entry.agentType})`
      );
    } catch (error) {
      this.logger.error(`Failed to save cache entry: ${entry.key}`, error);
      throw error;
    }
  }

  /**
   * Holt einen Cache-Eintrag
   */
  get(key: string): CacheEntry | undefined {
    try {
      const filename = this.getFilename(key);

      if (!fs.existsSync(filename)) {
        return undefined;
      }

      const content = fs.readFileSync(filename, 'utf-8');
      const cached = JSON.parse(content);

      // Check TTL
      if (cached.ttl) {
        const age = Date.now() - new Date(cached.timestamp).getTime();
        if (age > cached.ttl * 1000) {
          this.logger.debug(`Cache entry expired: ${key}`);
          this.delete(key);
          return undefined;
        }
      }

      return {
        key: cached.key,
        agentType: cached.agentType,
        data: cached.data,
        timestamp: new Date(cached.timestamp),
        ttl: cached.ttl
      };
    } catch (error) {
      this.logger.warn(`Failed to read cache entry: ${key}`, error);
      return undefined;
    }
  }

  /**
   * Löscht einen Cache-Eintrag
   */
  delete(key: string): void {
    try {
      const filename = this.getFilename(key);
      if (fs.existsSync(filename)) {
        fs.unlinkSync(filename);
        this.logger.debug(`Cache entry deleted: ${key}`);
      }
    } catch (error) {
      this.logger.warn(`Failed to delete cache entry: ${key}`, error);
    }
  }

  /**
   * Löscht alle Cache-Einträge
   */
  clear(): void {
    try {
      if (fs.existsSync(this.cacheDir)) {
        const files = fs.readdirSync(this.cacheDir);
        files.forEach(file => {
          fs.unlinkSync(path.join(this.cacheDir, file));
        });
        this.logger.debug('Cache cleared');
      }
    } catch (error) {
      this.logger.warn('Failed to clear cache', error);
    }
  }

  /**
   * Holt alle Cache-Einträge für einen spezifischen Agent
   */
  getByAgent(agentType: AgentType): CacheEntry[] {
    const entries: CacheEntry[] = [];

    try {
      if (!fs.existsSync(this.cacheDir)) {
        return entries;
      }

      const files = fs.readdirSync(this.cacheDir);

      files.forEach(file => {
        const content = fs.readFileSync(
          path.join(this.cacheDir, file),
          'utf-8'
        );
        const cached = JSON.parse(content);

        if (cached.agentType === agentType) {
          entries.push({
            key: cached.key,
            agentType: cached.agentType,
            data: cached.data,
            timestamp: new Date(cached.timestamp),
            ttl: cached.ttl
          });
        }
      });
    } catch (error) {
      this.logger.warn(`Failed to get cache entries for agent: ${agentType}`, error);
    }

    return entries;
  }

  /**
   * Private: Generiert einen sicheren Dateinamen für einen Cache-Schlüssel
   */
  private getFilename(key: string): string {
    // Sanitize key für sichere Dateipfade
    const sanitized = key
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .toLowerCase();

    return path.join(this.cacheDir, `${sanitized}.json`);
  }
}

// =====================================================
// Agent Communication Manager
// =====================================================

export class AgentCommunicationManager {
  private cache: AgentCache;
  private logger: Logger;

  constructor(cache: AgentCache, logger: Logger) {
    this.cache = cache;
    this.logger = logger;
  }

  /**
   * Speichert Output eines Agents für andere Agents
   */
  saveAgentOutput(output: AgentOutput): void {
    const key = `agent-output-${output.agentType}`;

    this.cache.set({
      key,
      agentType: output.agentType,
      data: {
        status: output.status,
        result: output.result,
        metadata: output.metadata,
        errors: output.errors,
        logs: output.logs
      },
      timestamp: new Date(),
      ttl: 3600 // 1 hour
    });

    this.logger.debug(
      `Agent output saved: ${key}`,
      { size: JSON.stringify(output).length }
    );
  }

  /**
   * Holt Output eines anderen Agents
   */
  getAgentOutput(agentType: AgentType): AgentOutput | null {
    const key = `agent-output-${agentType}`;
    const cached = this.cache.get(key);

    if (!cached) {
      this.logger.debug(`No cached output for agent: ${agentType}`);
      return null;
    }

    return {
      agentId: cached.data.metadata?.agentId || agentType,
      agentType,
      status: cached.data.status,
      result: cached.data.result,
      metadata: cached.data.metadata,
      errors: cached.data.errors,
      logs: cached.data.logs
    };
  }

  /**
   * Speichert Kontext-Informationen für einen Agent
   * z.B. Feature Name, Task Description, etc.
   */
  setAgentContext(
    agentType: AgentType,
    context: Record<string, any>
  ): void {
    const key = `agent-context-${agentType}`;

    this.cache.set({
      key,
      agentType,
      data: context,
      timestamp: new Date(),
      ttl: 7200 // 2 hours
    });

    this.logger.debug(`Agent context set: ${key}`);
  }

  /**
   * Holt Kontext-Informationen für einen Agent
   */
  getAgentContext(agentType: AgentType): Record<string, any> | null {
    const key = `agent-context-${agentType}`;
    const cached = this.cache.get(key);

    return cached ? cached.data : null;
  }

  /**
   * Speichert Abhängigkeits-Daten zwischen Agents
   * z.B. erstelle Hooks vom Backend für Frontend
   */
  setDependency(
    sourceAgent: AgentType,
    targetAgent: AgentType,
    data: any
  ): void {
    const key = `dependency-${sourceAgent}-to-${targetAgent}`;

    this.cache.set({
      key,
      agentType: sourceAgent,
      data,
      timestamp: new Date(),
      ttl: 3600
    });

    this.logger.debug(
      `Dependency registered: ${sourceAgent} -> ${targetAgent}`
    );
  }

  /**
   * Holt Abhängigkeits-Daten von einem anderen Agent
   */
  getDependency(sourceAgent: AgentType, targetAgent: AgentType): any {
    const key = `dependency-${sourceAgent}-to-${targetAgent}`;
    const cached = this.cache.get(key);

    return cached ? cached.data : null;
  }

  /**
   * Gibt einen Summary aller gecachten Daten für Debugging
   */
  getCacheSummary(): {
    totalEntries: number;
    byAgent: Record<AgentType, number>;
    oldestEntry?: Date;
    newestEntry?: Date;
  } {
    const summary = {
      totalEntries: 0,
      byAgent: {} as Record<AgentType, number>,
      oldestEntry: undefined as Date | undefined,
      newestEntry: undefined as Date | undefined
    };

    const agents: AgentType[] = [
      'frontend',
      'backend',
      'test',
      'debug',
      'ui-review'
    ];

    agents.forEach(agent => {
      const entries = this.cache.getByAgent(agent);
      summary.byAgent[agent] = entries.length;
      summary.totalEntries += entries.length;

      entries.forEach(entry => {
        if (!summary.oldestEntry || entry.timestamp < summary.oldestEntry) {
          summary.oldestEntry = entry.timestamp;
        }
        if (!summary.newestEntry || entry.timestamp > summary.newestEntry) {
          summary.newestEntry = entry.timestamp;
        }
      });
    });

    return summary;
  }

  /**
   * Gibt alle Abhängigkeiten zwischen Agents zurück
   */
  getDependencyGraph(): Map<AgentType, AgentType[]> {
    const graph = new Map<AgentType, AgentType[]>();

    // In real implementation, this would read from cache
    // Für jetzt: statische Abhängigkeiten basierend auf PLAN.md

    graph.set('backend', []);
    graph.set('frontend', ['backend']);
    graph.set('test', ['frontend', 'backend']);
    graph.set('debug', []);
    graph.set('ui-review', ['frontend']);

    return graph;
  }
}
