/**
 * Claude Code Agents Export
 * 5 Standard Agents + Feature Request Orchestrator
 */

// Shared Utilities
export * from './shared';

// Standard Agents (Feature Implementation)
export { BackendAgent, runBackendAgent } from './backend-agent';
export { FrontendAgent, runFrontendAgent } from './frontend-agent';
export { TestAgent } from './test-agent';
export { DebugAgent } from './debug-agent';
export { UIReviewAgent } from './ui-review-agent';

// Specialized Agents (Orchestration)
export { FeatureRequestAgent, runFeatureRequestAgent } from './feature-request-agent';

// Types
export type { BackendTaskInput, BackendAgentOutput } from './backend-agent';
export type { FrontendTaskInput, FrontendAgentOutput } from './frontend-agent';
export type { TestTaskInput, TestAgentOutput } from './test-agent';
export type { DebugTaskInput, DebugAgentOutput } from './debug-agent';
export type { UIReviewTaskInput, UIReviewAgentOutput } from './ui-review-agent';
export type { FeatureRequestPlan, FeatureRequestAgentOutput } from './feature-request-agent';
