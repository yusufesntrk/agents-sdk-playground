/**
 * Feature Request Agent
 * Koordiniert die Implementierung von Feature Requests aus dem Feedback Portal
 *
 * Workflow:
 * 1. Empfängt Feature Request mit Plan vom Feedback Portal
 * 2. Zerlegt Plan in konkrete Backend/Frontend/Test Tasks
 * 3. Ruft Agents auf (Backend → Frontend → Test → UI Review)
 * 4. Verwaltet Abhängigkeiten und Kommunikation zwischen Agents
 * 5. Returned konsolidiertes Implementierungs-Result
 */

import { BaseAgent, AgentOutput, AgentStatus } from '../shared';
import { AgentOrchestrator, OrchestratorConfig } from '../shared/orchestrator';
import { ConsoleLogger, CompositeLogger, FileLogger } from '../shared/logger';

export interface FeatureRequestPlan {
  featureId: string;
  title: string;
  description: string;
  plan: string;
  tables?: Array<{
    name: string;
    columns: Array<{
      name: string;
      type: string;
      nullable?: boolean;
    }>;
  }>;
  components?: Array<{
    name: string;
    type: 'page' | 'component' | 'dialog' | 'card' | 'form';
    description: string;
  }>;
  hooks?: Array<{
    name: string;
    type: 'query' | 'mutation';
    description: string;
  }>;
  testScenarios?: Array<{
    name: string;
    type: 'happy-path' | 'error' | 'edge-case';
    description: string;
  }>;
}

export interface FeatureRequestAgentOutput {
  featureId: string;
  status: 'success' | 'partial' | 'failed';
  backendResult?: any;
  frontendResult?: any;
  testResult?: any;
  uiReviewResult?: any;
  summary: string;
  nextSteps: string[];
  errors: string[];
}

export class FeatureRequestAgent extends BaseAgent {
  private orchestrator: AgentOrchestrator | null = null;
  private agents: Map<string, any> = new Map();

  constructor() {
    const logger = new CompositeLogger([
      new ConsoleLogger('FeatureRequestAgent'),
      new FileLogger('.claude/agents/logs/feature-request-agent.log')
    ]);
    super('feature-request-agent', logger);
  }

  /**
   * Registriert die verfügbaren Agents für Orchestrierung
   */
  registerAgents(agents: Map<string, any>): void {
    this.agents = agents;
    this.logStep('Agents registriert', { count: agents.size });
  }

  /**
   * Haupteinstiegspunkt: Verarbeitet Feature Request Plan
   */
  async run(input: FeatureRequestPlan): Promise<FeatureRequestAgentOutput> {
    this.logStep('Feature Request empfangen', {
      featureId: input.featureId,
      title: input.title
    });

    try {
      // Step 1: Zerlege Plan in Tasks
      this.logStep('Zerlege Plan in Tasks');
      const tasks = this.parsePlan(input);

      // Step 2: Rufe Orchestrator auf mit den Tasks
      this.logStep('Starte Orchestration');
      const orchestrationConfig = new OrchestratorConfig({
        agentInstances: this.agents,
        errorHandling: 'continue',
        parallelAgents: true
      });

      this.orchestrator = new AgentOrchestrator(orchestrationConfig, this.logger);

      const orchestrationResult = await this.orchestrator.orchestrate({
        featureId: input.featureId,
        featureName: input.title,
        featureDescription: input.description,
        plan: input.plan,
        ...tasks
      });

      // Step 3: Aggregiere Results
      this.logStep('Aggregiere Ergebnisse');
      return this.aggregateResults(input, orchestrationResult);

    } catch (error) {
      this.recordError(error instanceof Error ? error.message : String(error));

      return {
        featureId: input.featureId,
        status: 'failed',
        summary: `Feature Request fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        nextSteps: [
          'Logs prüfen',
          'Fehlerursache analysieren',
          'Feature Request erneut versuchen'
        ],
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Zerlegt Feature Request Plan in konkrete Agent Tasks
   */
  private parsePlan(input: FeatureRequestPlan): any {
    const result: any = {
      backendTasks: {
        tables: input.tables || [],
        hooks: input.hooks || [],
        rlsPolicies: []
      },
      frontendTasks: {
        components: input.components || [],
        pages: input.components?.filter(c => c.type === 'page') || [],
        hooks: input.hooks || []
      },
      testTasks: {
        scenarios: input.testScenarios || [],
        components: input.components || []
      }
    };

    this.logStep('Plan geparst', {
      tables: result.backendTasks.tables.length,
      components: result.frontendTasks.components.length,
      testScenarios: result.testTasks.scenarios.length
    });

    return result;
  }

  /**
   * Aggregiert Results von allen Agents
   */
  private aggregateResults(
    input: FeatureRequestPlan,
    orchestrationResult: any
  ): FeatureRequestAgentOutput {
    const errors: string[] = [];
    const nextSteps: string[] = [];

    // Sammle Ergebnisse
    const backendResult = orchestrationResult.agentResults?.get('backend');
    const frontendResult = orchestrationResult.agentResults?.get('frontend');
    const testResult = orchestrationResult.agentResults?.get('test');
    const uiReviewResult = orchestrationResult.agentResults?.get('ui-review');

    // Bestimme Status
    let status: 'success' | 'partial' | 'failed' = 'success';

    if (!backendResult || backendResult.status === 'failed') {
      status = 'failed';
      errors.push('Backend Agent fehlgeschlagen');
    } else if (!frontendResult || frontendResult.status === 'failed') {
      status = 'partial';
      errors.push('Frontend Agent fehlgeschlagen');
    } else if (!testResult || testResult.status === 'failed') {
      status = 'partial';
      errors.push('Test Agent fehlgeschlagen');
    }

    // Erstelle Summary
    const summary = `Feature "${input.title}" wurde ${
      status === 'success' ? 'erfolgreich' : status === 'partial' ? 'teilweise' : 'nicht'
    } implementiert.

Backend: ${backendResult?.status || 'skipped'}
Frontend: ${frontendResult?.status || 'skipped'}
Tests: ${testResult?.status || 'skipped'}
UI Review: ${uiReviewResult?.status || 'skipped'}`;

    // Füge Next Steps hinzu basierend auf Status
    if (status === 'failed') {
      nextSteps.push('Fehler analysieren und beheben');
      nextSteps.push('Feature Request erneut versuchen');
    } else if (status === 'partial') {
      nextSteps.push('Fehlgeschlagene Agents debuggen');
      nextSteps.push('Fehlende Komponenten manuell erstellen');
      nextSteps.push('Nächste Versuche mit Debug-Modus');
    } else {
      nextSteps.push('Feature in Produktionsumgebung testen');
      nextSteps.push('Code Review durchführen');
      nextSteps.push('In main Branch mergen');
    }

    this.logStep('Results aggregiert', {
      status,
      errors: errors.length,
      nextSteps: nextSteps.length
    });

    return {
      featureId: input.featureId,
      status,
      backendResult,
      frontendResult,
      testResult,
      uiReviewResult,
      summary,
      nextSteps,
      errors
    };
  }

  /**
   * Speichert Output für andere Agents
   */
  async execute(input: FeatureRequestPlan): Promise<AgentOutput> {
    const startTime = new Date();
    this.startTime = startTime;

    try {
      const result = await this.run(input);

      const output: AgentOutput = {
        status: result.status === 'success' ? AgentStatus.COMPLETED :
                result.status === 'partial' ? AgentStatus.COMPLETED : AgentStatus.FAILED,
        result,
        metadata: {
          totalTurns: this.turns,
          totalCost: this.cost,
          startedAt: startTime,
          completedAt: new Date(),
          error: result.errors.length > 0 ? result.errors[0] : undefined
        },
        errors: result.errors
      };

      await this.saveOutput(output);
      return output;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.recordError(errorMsg);

      return {
        status: AgentStatus.FAILED,
        result: null,
        metadata: {
          totalTurns: this.turns,
          totalCost: this.cost,
          error: errorMsg
        },
        errors: [errorMsg]
      };
    }
  }
}

/**
 * Convenience Function
 */
export async function runFeatureRequestAgent(
  plan: FeatureRequestPlan,
  agents: Map<string, any>
): Promise<FeatureRequestAgentOutput> {
  const agent = new FeatureRequestAgent();
  agent.registerAgents(agents);
  const output = await agent.execute(plan);
  return output.result || {
    featureId: plan.featureId,
    status: 'failed',
    summary: 'Agent execution failed',
    nextSteps: [],
    errors: output.errors || []
  };
}
