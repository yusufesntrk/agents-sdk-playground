/**
 * Agent Creator für ShortSelect
 * Erstellt neue Claude Agents mit optimaler Struktur und Best Practices
 */

import { BaseAgent } from '../shared/base-agent';
import {
  type AgentType,
  SystemPrompts,
  type SystemPrompt
} from '../shared/types';
import { type Logger } from '../shared/logger';

interface AgentCreatorInput {
  agentName: string;
  description: string;
  purpose: string;
  responsibilities?: string[];
  triggers?: string[];
  requiredTools?: string[];
  color?: string;
  model?: 'haiku' | 'sonnet' | 'opus' | 'inherit';
}

interface AgentConfig {
  name: string;
  description: string;
  systemPrompt: string;
  triggers: string[];
  color: string;
  tools: string[];
  metadata: {
    createdAt: string;
    purpose: string;
    responsibilities: string[];
  };
}

interface AgentCreatorOutput {
  agentName: string;
  agentPath: string;
  config: AgentConfig;
  files: {
    indexPath: string;
    skillPath: string;
  };
  warnings: string[];
  nextSteps: string[];
}

export class AgentCreator extends BaseAgent {
  constructor(logger?: Logger, cacheDir?: string) {
    super('agent-creator', logger, cacheDir);
  }

  /**
   * System Prompt für Agent Creator
   */
  protected getSystemPrompt(): SystemPrompt {
    return {
      role: 'expert-agent-architect',
      instructions: `You are an elite AI agent architect specializing in creating high-performance Claude Agents for ShortSelect ATS.

Your expertise:
- Designing agent personas with clear domain expertise
- Creating comprehensive system prompts with multi-step reasoning
- Anticipating edge cases and providing guidance
- Aligning agents with project patterns and conventions

When creating agents:
1. Design an expert persona embodying domain knowledge
2. Create a system prompt with clear responsibilities and methodology
3. Define triggering conditions with 2-4 concrete examples
4. Include edge case handling and quality standards
5. Choose appropriate color and tool access
6. Ensure alignment with ShortSelect CLAUDE.md standards

Reference existing agents in .claude/agents/ for patterns and structure.
Respect project conventions (German comments OK, RLS policies, multi-tenancy).`,
      tone: 'professional-creative'
    };
  }

  /**
   * Haupt-Ausführungslogik für Agent Creation
   */
  protected async run(input: AgentCreatorInput): Promise<AgentCreatorOutput> {
    this.logStep(`Creating new agent: ${input.agentName}`);

    const output: AgentCreatorOutput = {
      agentName: input.agentName,
      agentPath: `.claude/agents/${this.kebabCase(input.agentName)}`,
      config: {} as AgentConfig,
      files: {
        indexPath: '',
        skillPath: ''
      },
      warnings: [],
      nextSteps: []
    };

    try {
      // Step 1: Validiere Input
      this.logStep('Validating agent definition...');
      this.validateInput(input);

      // Step 2: Generiere System Prompt
      this.logStep('Generating system prompt...');
      const systemPrompt = await this.generateSystemPrompt(input);

      // Step 3: Erstelle Agent Config
      this.logStep('Creating agent configuration...');
      const config = this.createAgentConfig(input, systemPrompt);
      output.config = config;

      // Step 4: Generiere Triggering Examples
      this.logStep('Generating triggering examples...');
      const triggeringExamples = await this.generateTriggeringExamples(input);

      // Step 5: Bestimme erforderliche Tools
      this.logStep('Analyzing required tools...');
      const tools = input.requiredTools || this.inferTools(input);

      // Step 6: Generiere File Structure
      this.logStep('Generating agent file structure...');
      const indexContent = this.generateIndexContent(config, systemPrompt);
      const skillContent = this.generateSkillContent(config, triggeringExamples);

      output.files = {
        indexPath: `${output.agentPath}/index.ts`,
        skillPath: `${output.agentPath}/SKILL.md`
      };

      // Step 7: Validiere gegen Best Practices
      this.logStep('Validating against best practices...');
      const validation = await this.validateAgentDesign(config, systemPrompt);
      if (!validation.isValid) {
        output.warnings.push(...validation.issues);
      }

      // Step 8: Speichere Output für andere Agents
      this.saveOutput({
        agentName: input.agentName,
        agentPath: output.agentPath,
        config: config,
        indexContent: indexContent,
        skillContent: skillContent
      });

      // Prepare Next Steps
      output.nextSteps = [
        `✅ Agent design complete: ${input.agentName}`,
        `📋 Description: ${input.description}`,
        `🔧 System prompt generated with clear responsibilities`,
        `🎯 Triggering examples defined for auto-discovery`,
        '',
        `Files to create:`,
        `  1. ${output.files.indexPath}`,
        `  2. ${output.files.skillPath}`,
        '',
        'Next: Run skill-reviewer agent to validate design'
      ];

      this.logStep('Agent Creator completed successfully', output);
      return output;
    } catch (error) {
      this.recordError(
        `Agent Creator failed: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  /**
   * Validiert Input-Struktur
   */
  private validateInput(input: AgentCreatorInput): void {
    if (!input.agentName || input.agentName.trim().length === 0) {
      throw new Error('agentName is required');
    }

    if (!input.description || input.description.trim().length === 0) {
      throw new Error('description is required');
    }

    if (!input.purpose || input.purpose.trim().length === 0) {
      throw new Error('purpose is required');
    }

    this.logStep('Input validation passed', {
      agentName: input.agentName,
      triggersCount: input.triggers?.length || 0,
      toolsCount: input.requiredTools?.length || 0
    });
  }

  /**
   * Generiert System Prompt für Agent
   */
  private async generateSystemPrompt(input: AgentCreatorInput): Promise<string> {
    const responsibilities = input.responsibilities || [
      `Execute ${input.agentName} tasks according to ShortSelect standards`,
      'Provide clear, actionable output',
      'Handle edge cases gracefully'
    ];

    const prompt = `You are an expert in ${input.purpose.toLowerCase()}.

**Your Core Responsibilities:**
${responsibilities.map((r, i) => `${i + 1}. ${r}`).join('\n')}

**Your Methodology:**
1. Analyze the task context thoroughly
2. Break down complex problems into manageable steps
3. Consider edge cases and provide guidance
4. Deliver high-quality, production-ready output
5. Include clear next steps or recommendations

**Quality Standards:**
- Output must be production-ready
- All decisions must be justified
- Edge cases must be anticipated
- Follow ShortSelect conventions strictly
- Respect multi-tenancy and RLS requirements

**Output Format:**
Provide structured output with:
- Clear summary of what was accomplished
- Specific findings or recommendations
- Next steps or follow-up actions
- Any warnings or considerations

**Important Context:**
This is ShortSelect ATS (Applicant Tracking System):
- Multi-tenant Supabase backend
- React 19 + TypeScript frontend
- RLS-based security model
- All tables tenant-isolated`;

    this.incrementTurn(0.5);
    return prompt;
  }

  /**
   * Erstellt Agent Configuration
   */
  private createAgentConfig(input: AgentCreatorInput, systemPrompt: string): AgentConfig {
    return {
      name: this.kebabCase(input.agentName),
      description: input.description,
      systemPrompt,
      triggers: input.triggers || [`create ${input.agentName.toLowerCase()}`],
      color: input.color || 'blue',
      tools: input.requiredTools || ['Read', 'Write', 'Grep'],
      metadata: {
        createdAt: new Date().toISOString(),
        purpose: input.purpose,
        responsibilities: input.responsibilities || []
      }
    };
  }

  /**
   * Generiert Triggering Examples
   */
  private async generateTriggeringExamples(
    input: AgentCreatorInput
  ): Promise<string> {
    const baseAction = input.agentName.toLowerCase();
    const triggers = input.triggers || [`create ${baseAction}`];

    const examples = triggers.map(trigger => `
<example>
Context: User needs ${input.purpose}
user: "I need help with ${trigger}"
assistant: "I'll use the ${this.kebabCase(input.agentName)} agent to help with that."
<commentary>
User request matches agent trigger: "${trigger}"
</commentary>
</example>`).join('\n');

    this.incrementTurn(0.3);
    return examples;
  }

  /**
   * Inferred erforderliche Tools basierend auf Beschreibung
   */
  private inferTools(input: AgentCreatorInput): string[] {
    const description = input.description.toLowerCase();
    const tools = new Set<string>();

    // Standard
    tools.add('Read');

    // Code-based?
    if (description.includes('code') || description.includes('implement')) {
      tools.add('Write');
      tools.add('Edit');
      tools.add('Bash');
    }

    // Analysis?
    if (description.includes('review') || description.includes('analyze')) {
      tools.add('Grep');
    }

    // Database?
    if (description.includes('database') || description.includes('migration')) {
      tools.add('Bash');
    }

    return Array.from(tools);
  }

  /**
   * Generiert index.ts Content
   */
  private generateIndexContent(config: AgentConfig, systemPrompt: string): string {
    const className = this.pascalCase(config.name);

    return `/**
 * ${className} für ShortSelect ATS
 * ${config.metadata.purpose}
 */

import { BaseAgent } from '../shared/base-agent';
import {
  type AgentType,
  SystemPrompts,
  type SystemPrompt
} from '../shared/types';
import { type Logger } from '../shared/logger';

interface ${className}Input {
  // Define input parameters for your agent
  [key: string]: any;
}

interface ${className}Output {
  // Define output parameters for your agent
  [key: string]: any;
}

export class ${className} extends BaseAgent {
  constructor(logger?: Logger, cacheDir?: string) {
    super('${config.name}', logger, cacheDir);
  }

  /**
   * System Prompt für ${className}
   */
  protected getSystemPrompt(): SystemPrompt {
    return {
      role: 'expert-${config.name}',
      instructions: \`${systemPrompt}\`,
      tone: 'professional-helpful'
    };
  }

  /**
   * Haupt-Ausführungslogik für ${className}
   */
  protected async run(input: ${className}Input): Promise<${className}Output> {
    this.logStep('Starting ${className}');

    const output: ${className}Output = {
      // Add output fields
    };

    try {
      // Implement your agent logic here
      // Use this.logStep() for progress tracking
      // Use this.incrementTurn() for cost tracking
      // Use this.recordError() for error handling

      this.logStep('${className} completed successfully', output);
      return output;
    } catch (error) {
      this.recordError(
        \`${className} failed: \${error instanceof Error ? error.message : String(error)}\`
      );
      throw error;
    }
  }
}
`;
  }

  /**
   * Generiert SKILL.md Content
   */
  private generateSkillContent(config: AgentConfig, examples: string): string {
    return `---
name: ${config.name}
description: ${config.description}
color: ${config.color}
tools: [${config.tools.map(t => `"${t}"`).join(', ')}]
---

# ${config.name}

${config.metadata.purpose}

## Purpose

${config.metadata.purpose}

## Responsibilities

${config.metadata.responsibilities.map(r => `- ${r}`).join('\n')}

## When to Use

This agent triggers automatically when:
${config.triggers.map(t => `- User asks to "${t}"`).join('\n')}

## Examples

${examples}

## Process

1. Analyze input and context
2. Execute core responsibilities
3. Handle edge cases and errors
4. Deliver output with next steps

## Output Format

Structured output with:
- Summary of completed work
- Key findings or recommendations
- Next steps
- Any warnings or considerations

## Implementation Notes

This agent follows ShortSelect conventions:
- Multi-tenant Supabase backend
- RLS-based security
- React + TypeScript frontend
- All operations respecting tenant isolation
`;
  }

  /**
   * Validiert Agent Design gegen Best Practices
   */
  private async validateAgentDesign(
    config: AgentConfig,
    systemPrompt: string
  ): Promise<{ isValid: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Check description length
    if (config.description.length < 20) {
      issues.push('Description too short (minimum 20 characters)');
    }

    // Check triggers
    if (config.triggers.length === 0) {
      issues.push('At least one trigger phrase required');
    }

    // Check system prompt
    if (systemPrompt.length < 100) {
      issues.push('System prompt too short (minimum 100 characters)');
    }

    // Check tools
    if (config.tools.length === 0) {
      issues.push('At least one tool should be specified');
    }

    // Check name format
    if (!/^[a-z0-9-]+$/.test(config.name)) {
      issues.push('Agent name must be kebab-case (lowercase with hyphens)');
    }

    this.incrementTurn(0.2);

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Utility: Convert to kebab-case
   */
  private kebabCase(str: string): string {
    return str
      .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
      .toLowerCase()
      .trim();
  }

  /**
   * Utility: Convert to PascalCase
   */
  private pascalCase(str: string): string {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}

// =====================================================
// Export für CLI/API
// =====================================================

export async function runAgentCreator(
  input: AgentCreatorInput,
  logger?: Logger
): Promise<AgentCreatorOutput> {
  const agent = new AgentCreator(logger);
  const result = await agent.execute(input);

  if (result.status === 'completed') {
    return result.result as AgentCreatorOutput;
  } else {
    throw new Error(
      `Agent Creator failed: ${result.metadata.error || 'Unknown error'}`
    );
  }
}
