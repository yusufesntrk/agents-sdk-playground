/**
 * Shared Types for Claude Code Agent SDK
 * Zentrale Type-Definitionen für alle 5 Agents
 */

import { z } from 'zod';

// =====================================================
// Agent Lifecycle & Status
// =====================================================

export enum AgentStatus {
  INITIALIZING = 'initializing',
  RUNNING = 'running',
  WAITING = 'waiting',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface AgentMetadata {
  agentId: string;
  agentType: AgentType;
  status: AgentStatus;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  totalCost?: number;
  totalTurns?: number;
}

export type AgentType =
  | 'frontend'
  | 'backend'
  | 'test'
  | 'debug'
  | 'ui-review'
  | 'orchestrator';

// =====================================================
// Tool Definitions & Capabilities
// =====================================================

export enum ToolType {
  FILE = 'file',
  RUNTIME = 'runtime',
  DATABASE = 'database',
  BROWSER = 'browser',
  INTEGRATION = 'integration'
}

export interface Tool {
  name: string;
  type: ToolType;
  description: string;
  schema: z.ZodSchema;
  handler: (input: any) => Promise<any>;
}

export interface ToolRegistry {
  tools: Map<string, Tool>;
  addTool(tool: Tool): void;
  getTool(name: string): Tool | undefined;
  listTools(): Tool[];
  filterByType(type: ToolType): Tool[];
}

// =====================================================
// Agent Communication & Data Exchange
// =====================================================

export interface AgentOutput {
  agentId: string;
  agentType: AgentType;
  status: AgentStatus;
  result: any;
  metadata: AgentMetadata;
  errors?: string[];
  logs?: string[];
}

export interface CacheEntry {
  key: string;
  agentType: AgentType;
  data: any;
  timestamp: Date;
  ttl?: number; // Time to live in seconds
}

export interface AgentCache {
  set(entry: CacheEntry): void;
  get(key: string): CacheEntry | undefined;
  delete(key: string): void;
  clear(): void;
  getByAgent(agentType: AgentType): CacheEntry[];
}

// =====================================================
// Orchestrator & Execution
// =====================================================

export interface OrchestratorConfig {
  maxTurns?: number;
  maxCost?: number;
  timeout?: number;
  parallelAgents?: boolean;
  executionOrder?: AgentType[];
  errorHandling?: 'fail-fast' | 'continue' | 'retry';
}

export interface ExecutionPlan {
  agentSequence: AgentPhase[];
  dependencies: Map<AgentType, AgentType[]>;
  parallelGroups: AgentType[][];
  estimatedCost: number;
  estimatedDuration: number;
}

export interface AgentPhase {
  agentType: AgentType;
  dependsOn: AgentType[];
  parallel: boolean;
  timeout: number;
  maxRetries: number;
}

export interface ExecutionResult {
  success: boolean;
  startedAt: Date;
  completedAt: Date;
  duration: number;
  agentResults: Map<AgentType, AgentOutput>;
  totalCost: number;
  totalTurns: number;
  consolidatedReport?: string;
}

// =====================================================
// Feature Request & Feedback Integration
// =====================================================

export interface AgentTaskContext {
  contextType: 'feature' | 'bugfix' | 'refactor' | 'debug';
  contextId?: string;
  featureName?: string;
  description: string;
  prdReference?: string;
  featuresReference?: string;
}

// =====================================================
// Error Handling
// =====================================================

export class AgentError extends Error {
  constructor(
    public agentType: AgentType,
    public code: string,
    message: string,
    public context?: any
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

export const ErrorCodes = {
  TOOL_NOT_FOUND: 'TOOL_NOT_FOUND',
  TOOL_EXECUTION_FAILED: 'TOOL_EXECUTION_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',
  TIMEOUT: 'TIMEOUT',
  AGENT_FAILED: 'AGENT_FAILED',
  ORCHESTRATION_FAILED: 'ORCHESTRATION_FAILED',
  COMMUNICATION_FAILED: 'COMMUNICATION_FAILED'
} as const;

// =====================================================
// System Prompts
// =====================================================

export interface SystemPrompt {
  role: string;
  responsibilities: string[];
  constraints: string[];
  bestPractices: string[];
  tools: string[];
}

export const SystemPrompts = {
  frontend: {
    role: 'Frontend Agent for ShortSelect ATS',
    responsibilities: [
      'Build React components and pages',
      'Implement UI logic and state management',
      'Ensure UI pattern compliance',
      'Generate TypeScript types'
    ],
    constraints: [
      'Use ui-patterns.md for consistency',
      'Only use shadcn/ui components',
      'Follow Tailwind CSS conventions',
      'No custom HTML elements'
    ],
    bestPractices: [
      'Check existing patterns before building',
      'Import required hooks from @/hooks',
      'Use consistent spacing and colors',
      'Write TypeScript-first code'
    ],
    tools: ['Glob', 'Read', 'Edit', 'Write', 'Grep', 'Bash']
  },

  backend: {
    role: 'Backend Agent for ShortSelect ATS',
    responsibilities: [
      'Create database migrations',
      'Define RLS policies',
      'Generate custom hooks',
      'Manage data models'
    ],
    constraints: [
      'Use Supabase for all database operations',
      'Follow tenant isolation patterns',
      'Always implement RLS policies',
      'Generate types automatically'
    ],
    bestPractices: [
      'Name migrations with timestamps',
      'Test migrations before deploying',
      'Document complex queries',
      'Use transactions for multi-step operations'
    ],
    tools: ['Supabase', 'Read', 'Edit', 'Write', 'Grep', 'Bash']
  },

  test: {
    role: 'Test Agent for ShortSelect ATS',
    responsibilities: [
      'Write Playwright E2E tests',
      'Create unit tests',
      'Run test suites',
      'Analyze test coverage'
    ],
    constraints: [
      'Test coverage target: >80%',
      'Follow existing test patterns',
      'Use Playwright for browser automation',
      'Test both happy and error paths'
    ],
    bestPractices: [
      'Use descriptive test names',
      'Keep tests focused and isolated',
      'Mock external dependencies',
      'Clean up resources after tests',
      // State Handling (learned from document tests)
      'ALWAYS handle both empty and existing state - e.g. check for "Ersetzen" OR "Hochladen" buttons',
      'Use .isVisible().catch(() => false) to safely check element existence',
      'Use specific selectors within sections (e.g. page.locator("[role=tabpanel]")) to avoid matching unrelated elements',
      'Match exact text patterns - e.g. "Bytes" not "B" if that\'s what the code outputs'
    ],
    tools: ['Bash', 'Read', 'Write', 'Edit', 'Grep', 'Glob']
  },

  debug: {
    role: 'Debug Agent for ShortSelect ATS',
    responsibilities: [
      'Debug browser issues',
      'Analyze performance problems',
      'Capture logs and screenshots',
      'Identify root causes'
    ],
    constraints: [
      'Use Playwright for browser automation',
      'Capture network requests and console logs',
      'Analyze errors and exceptions',
      'Provide actionable findings'
    ],
    bestPractices: [
      'Check for common issues first',
      'Reproduce issues consistently',
      'Provide detailed findings',
      'Suggest concrete solutions'
    ],
    tools: ['Bash', 'Read', 'Grep']
  },

  uiReview: {
    role: 'UI Review Agent for ShortSelect ATS',
    responsibilities: [
      'Validate components against ui-patterns.md',
      'Take screenshots with Playwright for visual inspection',
      'Check for duplicate buttons (especially in Dialogs)',
      'Verify icon sizing and spacing consistency',
      'Generate compliance reports with fixes'
    ],
    constraints: [
      'Use ui-patterns.md as source of truth',
      'ALWAYS run after Frontend Agent changes',
      'Use Playwright to open pages and take screenshots',
      'Count buttons per container (max 1 Close button!)',
      'Check shadcn/ui component compliance'
    ],
    bestPractices: [
      'Open the actual page in Playwright, don\'t just read code',
      'Screenshot dialogs/modals when open to catch visual issues',
      'Count buttons: Close/X should appear exactly ONCE per dialog',
      'Check DialogContent - it has built-in close button, don\'t add another',
      'Report findings back to Frontend Agent for fixes',
      'Re-check after fixes are applied'
    ],
    tools: ['Glob', 'Grep', 'Read', 'Edit', 'Bash']
  }
} as const;

// =====================================================
// Utility Types
// =====================================================

export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export interface Logger {
  debug(message: string, context?: any): void;
  info(message: string, context?: any): void;
  warn(message: string, context?: any): void;
  error(message: string, error?: Error | string, context?: any): void;
}
