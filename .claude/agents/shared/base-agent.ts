/**
 * Base Agent Class
 * Template für alle spezialisierten Agents
 */

import {
  type AgentType,
  type AgentMetadata,
  type AgentOutput,
  AgentStatus,
  AgentError,
  ErrorCodes,
  type SystemPrompt,
  SystemPrompts,
  type Logger
} from './types';
import { ToolRegistry, ToolRegistryFactory } from './tool-registry';
import {
  AgentCommunicationManager,
  FileCacheSystem
} from './communication';
import { ConsoleLogger, LogLevel } from './logger';

export abstract class BaseAgent {
  protected agentId: string;
  protected agentType: AgentType;
  protected logger: Logger;
  protected toolRegistry: ToolRegistry;
  protected communicationManager: AgentCommunicationManager;
  protected metadata: AgentMetadata;

  // Tracking
  private startTime?: Date;
  private endTime?: Date;
  private turns: number = 0;
  private cost: number = 0;
  private errors: string[] = [];
  private logs: string[] = [];

  constructor(
    agentType: AgentType,
    logger?: Logger,
    cacheDir: string = '.claude/.cache/agent-outputs'
  ) {
    this.agentId = `${agentType}-${Date.now()}`;
    this.agentType = agentType;
    this.logger = logger || new ConsoleLogger(agentType, LogLevel.INFO);

    // Setup Tool Registry
    this.toolRegistry = ToolRegistryFactory.createForAgent(
      agentType,
      this.logger
    );

    // Setup Communication Manager
    const cache = new FileCacheSystem(cacheDir, this.logger);
    this.communicationManager = new AgentCommunicationManager(
      cache,
      this.logger
    );

    // Initialize Metadata
    this.metadata = {
      agentId: this.agentId,
      agentType,
      status: AgentStatus.INITIALIZING,
      startedAt: new Date()
    };

    this.logger.debug(`Agent initialized: ${this.agentId}`, {
      type: this.agentType,
      tools: this.toolRegistry.listTools().length
    });
  }

  /**
   * Führt die Agent-Logik aus
   * Überschreiben in spezialisierten Agents
   */
  async execute(input: any): Promise<AgentOutput> {
    this.startTime = new Date();
    this.metadata.status = AgentStatus.RUNNING;

    try {
      this.logger.info(`Executing agent: ${this.agentId}`, { input });

      // Get System Prompt
      const systemPrompt = this.getSystemPrompt();

      // Pre-execution Setup
      await this.setupAgent();

      // Execute Agent Logic
      const result = await this.run(input);

      // Post-execution Cleanup
      await this.cleanupAgent();

      // Mark as completed
      this.endTime = new Date();
      this.metadata.status = AgentStatus.COMPLETED;
      this.metadata.completedAt = this.endTime;
      this.metadata.totalCost = this.cost;
      this.metadata.totalTurns = this.turns;

      const output: AgentOutput = {
        agentId: this.agentId,
        agentType: this.agentType,
        status: this.metadata.status,
        result,
        metadata: this.metadata,
        errors: this.errors.length > 0 ? this.errors : undefined,
        logs: this.logs.length > 0 ? this.logs : undefined
      };

      this.logger.info(`Agent completed successfully: ${this.agentId}`);
      return output;
    } catch (error) {
      this.endTime = new Date();
      this.metadata.status = AgentStatus.FAILED;
      this.metadata.completedAt = this.endTime;
      this.metadata.error = error instanceof Error ? error.message : String(error);

      const errorMessage = error instanceof Error
        ? error.message
        : String(error);

      this.logger.error(`Agent failed: ${this.agentId}`, error);

      return {
        agentId: this.agentId,
        agentType: this.agentType,
        status: AgentStatus.FAILED,
        result: null,
        metadata: this.metadata,
        errors: [errorMessage],
        logs: this.logs
      };
    }
  }

  /**
   * Haupt-Ausführungslogik (zu überschreiben)
   */
  protected abstract run(input: any): Promise<any>;

  /**
   * Setup vor Ausführung (optional zu überschreiben)
   */
  protected async setupAgent(): Promise<void> {
    // Default: nichts
  }

  /**
   * Cleanup nach Ausführung (optional zu überschreiben)
   */
  protected async cleanupAgent(): Promise<void> {
    // Default: nichts
  }

  /**
   * System Prompt für den Agent (zu überschreiben)
   */
  protected getSystemPrompt(): SystemPrompt {
    const prompts = SystemPrompts as any;
    const key = this.agentType === 'ui-review' ? 'uiReview' : this.agentType;
    return prompts[key] || SystemPrompts.frontend;
  }

  // =====================================================
  // Protected Helper Methods
  // =====================================================

  /**
   * Protokolliert eine Aktion/Schritt
   */
  protected logStep(message: string, context?: any): void {
    this.logger.info(message, context);
    this.logs.push(message);
  }

  /**
   * Registriert einen Fehler
   */
  protected recordError(error: string): void {
    this.errors.push(error);
    this.logger.error(error);
  }

  /**
   * Inkrementiert Turn Counter
   */
  protected incrementTurn(cost: number = 0): void {
    this.turns++;
    this.cost += cost;
  }

  /**
   * Holt Output eines anderen Agents
   */
  protected getAgentOutput(agentType: AgentType): AgentOutput | null {
    return this.communicationManager.getAgentOutput(agentType);
  }

  /**
   * Speichert eigenen Output für andere Agents
   */
  protected saveOutput(result: any): void {
    const output: AgentOutput = {
      agentId: this.agentId,
      agentType: this.agentType,
      status: this.metadata.status,
      result,
      metadata: this.metadata,
      errors: this.errors.length > 0 ? this.errors : undefined,
      logs: this.logs
    };

    this.communicationManager.saveAgentOutput(output);
  }

  /**
   * Setzt Kontext für andere Agents
   */
  protected setContext(context: Record<string, any>): void {
    this.communicationManager.setAgentContext(this.agentType, context);
  }

  /**
   * Holt Kontext für diesen Agent
   */
  protected getContext(): Record<string, any> | null {
    return this.communicationManager.getAgentContext(this.agentType);
  }

  /**
   * Setzt eine Abhängigkeit für einen anderen Agent
   */
  protected setDependency(
    targetAgent: AgentType,
    data: any
  ): void {
    this.communicationManager.setDependency(
      this.agentType,
      targetAgent,
      data
    );
  }

  /**
   * Holt Abhängigkeits-Daten von einem anderen Agent
   */
  protected getDependency(sourceAgent: AgentType): any {
    return this.communicationManager.getDependency(
      sourceAgent,
      this.agentType
    );
  }

  // =====================================================
  // Public API
  // =====================================================

  /**
   * Gibt Agentmetadaten zurück
   */
  getMetadata(): AgentMetadata {
    return this.metadata;
  }

  /**
   * Gibt verfügbare Tools zurück
   */
  getTools(): string[] {
    return this.toolRegistry.listTools().map(tool => tool.name);
  }

  /**
   * Gibt den aktuellen Status zurück
   */
  getStatus(): AgentStatus {
    return this.metadata.status;
  }

  /**
   * Gibt Execution-Zusammenfassung zurück
   */
  getSummary(): {
    duration: number;
    turns: number;
    cost: number;
    errors: number;
    logs: number;
  } {
    const duration = this.startTime && this.endTime
      ? this.endTime.getTime() - this.startTime.getTime()
      : 0;

    return {
      duration,
      turns: this.turns,
      cost: this.cost,
      errors: this.errors.length,
      logs: this.logs.length
    };
  }
}
