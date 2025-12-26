/**
 * Tool Registry System
 * Verwaltet Tool-Definitionen und Distribution auf Agents
 */

import { z } from 'zod';
import {
  Tool,
  ToolRegistry,
  ToolType,
  AgentType,
  Logger
} from './types';

class DefaultToolRegistry implements ToolRegistry {
  tools: Map<string, Tool> = new Map();
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  addTool(tool: Tool): void {
    if (this.tools.has(tool.name)) {
      this.logger.warn(`Tool '${tool.name}' already exists, overwriting`);
    }
    this.tools.set(tool.name, tool);
    this.logger.debug(`Tool added: ${tool.name} (type: ${tool.type})`);
  }

  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  listTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  filterByType(type: ToolType): Tool[] {
    return this.listTools().filter(tool => tool.type === type);
  }
}

// =====================================================
// Tool Definitions für verschiedene Agent-Typen
// =====================================================

/**
 * Standard File Tools (Read, Write, Edit, Glob)
 * Verfügbar für: Frontend, Backend, Test, UI Review, Debug
 */
export const createFileTool = (name: string, description: string): Tool => ({
  name,
  type: ToolType.FILE,
  description,
  schema: z.object({
    file_path: z.string().describe('Path to the file')
  }),
  handler: async (input: any) => {
    // Real implementation würde Read/Write/Edit Tools aufrufen
    return {
      success: true,
      message: `Tool ${name} called with input`,
      input
    };
  }
});

/**
 * Database Tools (Supabase)
 * Verfügbar für: Backend Agent only
 */
export const createDatabaseTool = (name: string, description: string): Tool => ({
  name,
  type: ToolType.DATABASE,
  description,
  schema: z.object({
    query: z.string().describe('SQL query or operation'),
    params: z.array(z.any()).optional().describe('Query parameters')
  }),
  handler: async (input: any) => {
    // Real implementation würde Supabase SDK nutzen
    return {
      success: true,
      message: `Database operation ${name} executed`,
      input
    };
  }
});

/**
 * Runtime Tools (Bash)
 * Verfügbar für: Test, Debug, Frontend (git/npm)
 */
export const createRuntimeTool = (name: string, description: string): Tool => ({
  name,
  type: ToolType.RUNTIME,
  description,
  schema: z.object({
    command: z.string().describe('Command to execute'),
    cwd: z.string().optional().describe('Working directory')
  }),
  handler: async (input: any) => {
    // Real implementation würde Bash Tool aufrufen
    return {
      success: true,
      message: `Command executed: ${input.command}`,
      input
    };
  }
});

/**
 * Browser Tools (Playwright)
 * Verfügbar für: Debug Agent, Test Agent
 */
export const createBrowserTool = (name: string, description: string): Tool => ({
  name,
  type: ToolType.BROWSER,
  description,
  schema: z.object({
    action: z.string().describe('Browser action to perform'),
    params: z.any().optional().describe('Action parameters')
  }),
  handler: async (input: any) => {
    // Real implementation würde Playwright aufrufen
    return {
      success: true,
      message: `Browser action executed: ${input.action}`,
      input
    };
  }
});

// =====================================================
// Tool Distribution - Welcher Agent bekommt welche Tools?
// =====================================================

export const AGENT_TOOL_MAP: Record<AgentType, string[]> = {
  frontend: [
    'Glob',
    'Read',
    'Edit',
    'Write',
    'Grep',
    'Bash'
  ],
  backend: [
    'Supabase',
    'Read',
    'Edit',
    'Write',
    'Grep',
    'Bash'
  ],
  test: [
    'Bash',
    'Read',
    'Write',
    'Edit',
    'Grep',
    'Glob'
  ],
  debug: [
    'Bash',
    'Read',
    'Grep',
    'Playwright' // Custom Browser Tool
  ],
  'ui-review': [
    'Glob',
    'Grep',
    'Read',
    'Edit',
    'Bash'
  ],
  orchestrator: [
    'Task', // Sub-agent execution
    'Read',
    'Write'
  ]
};

// =====================================================
// Tool Registry Factory
// =====================================================

export class ToolRegistryFactory {
  /**
   * Erstellt eine Tool Registry für einen spezifischen Agent
   */
  static createForAgent(
    agentType: AgentType,
    logger: Logger
  ): ToolRegistry {
    const registry = new DefaultToolRegistry(logger);
    const allowedTools = AGENT_TOOL_MAP[agentType] || [];

    logger.debug(`Creating tool registry for ${agentType} agent`, {
      allowedTools
    });

    // File Tools für alle Agents mit File-Zugriff
    if (allowedTools.includes('Glob')) {
      registry.addTool({
        name: 'Glob',
        type: ToolType.FILE,
        description: 'Find files matching a glob pattern',
        schema: z.object({
          pattern: z.string().describe('Glob pattern'),
          path: z.string().optional().describe('Search path')
        }),
        handler: async (input: any) => ({
          success: true,
          files: []
        })
      });
    }

    if (allowedTools.includes('Read')) {
      registry.addTool({
        name: 'Read',
        type: ToolType.FILE,
        description: 'Read file contents',
        schema: z.object({
          file_path: z.string().describe('Path to file'),
          limit: z.number().optional().describe('Line limit')
        }),
        handler: async (input: any) => ({
          success: true,
          content: ''
        })
      });
    }

    if (allowedTools.includes('Write')) {
      registry.addTool({
        name: 'Write',
        type: ToolType.FILE,
        description: 'Write to a file',
        schema: z.object({
          file_path: z.string().describe('Path to file'),
          content: z.string().describe('File content')
        }),
        handler: async (input: any) => ({
          success: true,
          message: 'File written'
        })
      });
    }

    if (allowedTools.includes('Edit')) {
      registry.addTool({
        name: 'Edit',
        type: ToolType.FILE,
        description: 'Edit file contents',
        schema: z.object({
          file_path: z.string().describe('Path to file'),
          old_string: z.string().describe('String to replace'),
          new_string: z.string().describe('Replacement string')
        }),
        handler: async (input: any) => ({
          success: true,
          message: 'File edited'
        })
      });
    }

    if (allowedTools.includes('Grep')) {
      registry.addTool({
        name: 'Grep',
        type: ToolType.FILE,
        description: 'Search for patterns in files',
        schema: z.object({
          pattern: z.string().describe('Search pattern'),
          path: z.string().optional().describe('Search path')
        }),
        handler: async (input: any) => ({
          success: true,
          matches: []
        })
      });
    }

    // Database Tools nur für Backend Agent
    if (allowedTools.includes('Supabase')) {
      registry.addTool({
        name: 'Supabase',
        type: ToolType.DATABASE,
        description: 'Execute Supabase operations',
        schema: z.object({
          operation: z.string().describe('Operation type'),
          query: z.string().optional().describe('SQL query')
        }),
        handler: async (input: any) => ({
          success: true,
          result: {}
        })
      });
    }

    // Runtime Tools (Bash)
    if (allowedTools.includes('Bash')) {
      registry.addTool({
        name: 'Bash',
        type: ToolType.RUNTIME,
        description: 'Execute shell commands',
        schema: z.object({
          command: z.string().describe('Command to execute'),
          cwd: z.string().optional().describe('Working directory')
        }),
        handler: async (input: any) => ({
          success: true,
          output: ''
        })
      });
    }

    // Browser Tools für Debug & Test
    if (allowedTools.includes('Playwright')) {
      registry.addTool({
        name: 'Playwright',
        type: ToolType.BROWSER,
        description: 'Control browser with Playwright',
        schema: z.object({
          action: z.string().describe('Action to perform'),
          params: z.any().optional().describe('Action parameters')
        }),
        handler: async (input: any) => ({
          success: true,
          result: {}
        })
      });
    }

    // Task/Sub-Agent tool für Orchestrator
    if (allowedTools.includes('Task')) {
      registry.addTool({
        name: 'Task',
        type: ToolType.INTEGRATION,
        description: 'Execute sub-agent tasks',
        schema: z.object({
          subagent_type: z.enum(['frontend', 'backend', 'test', 'debug', 'ui-review']),
          description: z.string().describe('Task description'),
          prompt: z.string().describe('Task prompt')
        }),
        handler: async (input: any) => ({
          success: true,
          result: {}
        })
      });
    }

    logger.debug(
      `Tool registry created with ${registry.listTools().length} tools`
    );

    return registry;
  }

  /**
   * Validiert ob ein Agent ein Tool nutzen darf
   */
  static canAgentUseTool(agentType: AgentType, toolName: string): boolean {
    const allowedTools = AGENT_TOOL_MAP[agentType] || [];
    return allowedTools.includes(toolName);
  }

  /**
   * Gibt alle erlaubten Tools für einen Agent zurück
   */
  static getAllowedTools(agentType: AgentType): string[] {
    return AGENT_TOOL_MAP[agentType] || [];
  }
}
