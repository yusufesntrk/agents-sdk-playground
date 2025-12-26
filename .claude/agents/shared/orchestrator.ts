/**
 * Orchestrator für Multi-Agent Koordination
 * Verwaltet Ausführungsreihenfolge, Abhängigkeiten und Datenaustausch
 */

import { AgentType, ExecutionPlan, ExecutionResult, AgentPhase, AgentOutput, AgentStatus, Logger } from './types';
import { ConsoleLogger } from './logger';

export class OrchestratorConfig {
  maxTurns: number = 100;
  maxCost: number = 10.0;
  timeout: number = 300000; // 5 minutes
  parallelAgents: boolean = true;
  errorHandling: 'fail-fast' | 'continue' | 'retry' = 'continue';
  agentInstances: Map<AgentType, any> = new Map();

  constructor(config?: Partial<OrchestratorConfig>) {
    Object.assign(this, config);
  }
}

export class AgentOrchestrator {
  private config: OrchestratorConfig;
  private logger: Logger;
  private executionPlan: ExecutionPlan | null = null;
  private agentResults: Map<AgentType, AgentOutput> = new Map();
  private startTime: Date | null = null;
  private endTime: Date | null = null;

  constructor(config: OrchestratorConfig, logger?: Logger) {
    this.config = config;
    this.logger = logger || new ConsoleLogger('Orchestrator');
  }

  /**
   * Führt ein komplexes Orchestrierungs-Feature aus
   */
  async orchestrate(input: any): Promise<ExecutionResult> {
    this.startTime = new Date();
    this.logger.info('🎼 Orchestrator started', { inputKeys: Object.keys(input) });

    try {
      // Step 1: Build Execution Plan
      this.logger.info('📋 Building execution plan...');
      this.executionPlan = this.buildExecutionPlan(input);
      this.logger.debug('Execution plan created', {
        phases: this.executionPlan.agentSequence.length,
        parallelGroups: this.executionPlan.parallelGroups.length
      });

      // Step 2: Execute Plan
      this.logger.info('🚀 Starting agent execution...');
      await this.executePlan(this.executionPlan, input);

      // Step 3: Aggregate Results
      this.logger.info('📊 Aggregating results...');
      const consolidatedReport = this.aggregateResults();

      this.endTime = new Date();

      return {
        success: true,
        startedAt: this.startTime,
        completedAt: this.endTime,
        duration: this.endTime.getTime() - this.startTime.getTime(),
        agentResults: this.agentResults,
        totalCost: this.calculateTotalCost(),
        totalTurns: this.calculateTotalTurns(),
        consolidatedReport
      };
    } catch (error) {
      this.endTime = new Date();
      this.logger.error('❌ Orchestration failed', error);

      return {
        success: false,
        startedAt: this.startTime!,
        completedAt: this.endTime,
        duration: this.endTime ? this.endTime.getTime() - this.startTime!.getTime() : 0,
        agentResults: this.agentResults,
        totalCost: this.calculateTotalCost(),
        totalTurns: this.calculateTotalTurns()
      };
    }
  }

  /**
   * Baut einen Executionsplan basierend auf Agent-Abhängigkeiten
   */
  private buildExecutionPlan(input: any): ExecutionPlan {
    // Define standard execution order based on PLAN.md
    const dependencyGraph = this.buildDependencyGraph();
    const parallelGroups = this.identifyParallelGroups(dependencyGraph);

    const agentSequence: AgentPhase[] = [];

    // Phase 1: Backend Agent (no dependencies)
    agentSequence.push({
      agentType: 'backend',
      dependsOn: [],
      parallel: false,
      timeout: 60000,
      maxRetries: 1
    });

    // Phase 2: Frontend Agent + UI Review Agent (parallel)
    agentSequence.push({
      agentType: 'frontend',
      dependsOn: ['backend'],
      parallel: true,
      timeout: 60000,
      maxRetries: 1
    });

    agentSequence.push({
      agentType: 'ui-review',
      dependsOn: ['frontend'],
      parallel: true,
      timeout: 45000,
      maxRetries: 1
    });

    // Phase 3: Test Agent (depends on both)
    agentSequence.push({
      agentType: 'test',
      dependsOn: ['frontend', 'backend'],
      parallel: false,
      timeout: 90000,
      maxRetries: 1
    });

    // Debug Agent: always available (independent)
    // Skipped unless explicitly requested

    return {
      agentSequence,
      dependencies: dependencyGraph,
      parallelGroups,
      estimatedCost: 2.5,
      estimatedDuration: 240000 // 4 minutes
    };
  }

  /**
   * Baut Dependency Graph für Agents
   */
  private buildDependencyGraph(): Map<AgentType, AgentType[]> {
    const graph = new Map<AgentType, AgentType[]>();

    graph.set('backend', []);
    graph.set('frontend', ['backend']);
    graph.set('test', ['frontend', 'backend']);
    graph.set('debug', []);
    graph.set('ui-review', ['frontend']);

    return graph;
  }

  /**
   * Identifiziert Agents die parallel ausgeführt werden können
   */
  private identifyParallelGroups(
    dependencyGraph: Map<AgentType, AgentType[]>
  ): AgentType[][] {
    // Group 1: Backend (no dependencies)
    // Group 2: Frontend + UI Review (both depend on backend)
    // Group 3: Test (depends on both)

    return [
      ['backend'],
      ['frontend', 'ui-review'],
      ['test']
    ];
  }

  /**
   * Führt den Executionsplan aus
   */
  private async executePlan(
    plan: ExecutionPlan,
    input: any
  ): Promise<void> {
    // Execute sequentially with parallel support
    for (const phase of plan.agentSequence) {
      // Check dependencies
      const dependenciesMet = phase.dependsOn.every(dep => {
        const result = this.agentResults.get(dep);
        return result && result.status === AgentStatus.COMPLETED;
      });

      if (!dependenciesMet) {
        this.logger.warn(`Skipping ${phase.agentType} - dependencies not met`);
        continue;
      }

      // Execute agent
      this.logger.info(`▶️  Executing agent: ${phase.agentType}`);

      try {
        const agent = this.config.agentInstances.get(phase.agentType);
        if (!agent) {
          this.logger.warn(`Agent not available: ${phase.agentType}`);
          continue;
        }

        // Prepare input for this agent
        const agentInput = this.prepareAgentInput(phase.agentType, input);

        // Execute with timeout
        const result = await Promise.race([
          agent.execute(agentInput),
          this.createTimeoutPromise(phase.timeout)
        ]);

        this.agentResults.set(phase.agentType, result);

        if (result.status === AgentStatus.COMPLETED) {
          this.logger.info(`✅ ${phase.agentType} completed`, {
            duration: result.metadata?.totalTurns,
            cost: result.metadata?.totalCost
          });
        } else {
          this.logger.warn(`⚠️  ${phase.agentType} failed`, {
            error: result.metadata?.error
          });

          if (this.config.errorHandling === 'fail-fast') {
            throw new Error(`Agent ${phase.agentType} failed: ${result.metadata?.error}`);
          }
        }
      } catch (error) {
        this.logger.error(`Error executing ${phase.agentType}`, error);

        if (this.config.errorHandling === 'fail-fast') {
          throw error;
        }
      }
    }
  }

  /**
   * Bereitet Input für einen spezifischen Agent vor
   */
  private prepareAgentInput(agentType: AgentType, baseInput: any): any {
    const input = { ...baseInput };

    // Inject dependencies from previous agents
    const dependencies = this.buildDependencyGraph().get(agentType) || [];

    for (const dep of dependencies) {
      const depResult = this.agentResults.get(dep);
      if (depResult) {
        input[`${dep}Output`] = depResult.result;
      }
    }

    return input;
  }

  /**
   * Aggregiert Ergebnisse von allen Agents
   */
  private aggregateResults(): string {
    const report: string[] = [];

    report.push('═══════════════════════════════════════════');
    report.push('         🎼 ORCHESTRATOR EXECUTION REPORT');
    report.push('═══════════════════════════════════════════');
    report.push('');

    for (const [agentType, result] of this.agentResults) {
      report.push(`\n📌 ${agentType.toUpperCase()} Agent`);
      report.push(`   Status: ${result.status}`);

      if (result.metadata?.totalTurns) {
        report.push(`   Turns: ${result.metadata.totalTurns}`);
      }

      if (result.metadata?.totalCost) {
        report.push(`   Cost: $${result.metadata.totalCost.toFixed(4)}`);
      }

      if (result.errors && result.errors.length > 0) {
        report.push(`   Errors:`);
        result.errors.forEach(error => {
          report.push(`     - ${error}`);
        });
      }

      if (result.result) {
        if (result.result.nextSteps) {
          report.push(`   Next Steps:`);
          result.result.nextSteps.forEach((step: string) => {
            report.push(`     - ${step}`);
          });
        }
      }
    }

    report.push('\n═══════════════════════════════════════════');
    report.push(`Total Duration: ${this.calculateDuration()}ms`);
    report.push(`Total Cost: $${this.calculateTotalCost().toFixed(4)}`);
    report.push(`Success Rate: ${this.calculateSuccessRate()}%`);
    report.push('═══════════════════════════════════════════');

    return report.join('\n');
  }

  /**
   * Erstellt ein Timeout Promise
   */
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Execution timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Berechnet Gesamtkosten
   */
  private calculateTotalCost(): number {
    return Array.from(this.agentResults.values()).reduce((sum, result) => {
      return sum + (result.metadata?.totalCost || 0);
    }, 0);
  }

  /**
   * Berechnet Gesamtanzahl von Turns
   */
  private calculateTotalTurns(): number {
    return Array.from(this.agentResults.values()).reduce((sum, result) => {
      return sum + (result.metadata?.totalTurns || 0);
    }, 0);
  }

  /**
   * Berechnet Dauer
   */
  private calculateDuration(): number {
    if (!this.startTime || !this.endTime) return 0;
    return this.endTime.getTime() - this.startTime.getTime();
  }

  /**
   * Berechnet Success Rate
   */
  private calculateSuccessRate(): number {
    if (this.agentResults.size === 0) return 0;

    const successful = Array.from(this.agentResults.values()).filter(
      r => r.status === AgentStatus.COMPLETED
    ).length;

    return Math.round((successful / this.agentResults.size) * 100);
  }
}

/**
 * Convenience Function für einfache Orchestration
 */
export async function runOrchestrator(
  input: any,
  agents: Map<AgentType, any>,
  logger?: Logger
): Promise<ExecutionResult> {
  const config = new OrchestratorConfig({ agentInstances: agents });
  const orchestrator = new AgentOrchestrator(config, logger);
  return orchestrator.orchestrate(input);
}
