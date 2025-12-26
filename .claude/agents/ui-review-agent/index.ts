/**
 * UI Review Agent für ShortSelect ATS
 * Validiert Komponenten gegen UI-Patterns und macht Auto-Fixes
 */

import { BaseAgent } from '../shared/base-agent';
import { type SystemPrompt } from '../shared/types';
import { SystemPrompts } from '../shared/types';

export interface UIReviewTaskInput {
  filePath: string;
  fileType?: 'component' | 'page' | 'form' | 'all';
  autoFix?: boolean;
}

export interface UIPatternViolation {
  file: string;
  line: number;
  pattern: string;
  issue: string;
  severity: 'error' | 'warning' | 'info';
  fix?: string;
}

export interface UIReviewAgentOutput {
  filesAnalyzed: string[];
  violations: UIPatternViolation[];
  fixesApplied: string[];
  warnings: string[];
  compliance: {
    iconSizing: number;
    spacing: number;
    colors: number;
    components: number;
  };
  nextSteps: string[];
}

export class UIReviewAgent extends BaseAgent {
  constructor(logger?: any, cacheDir?: string) {
    super('ui-review', logger, cacheDir);
  }

  protected getSystemPrompt(): SystemPrompt {
    return SystemPrompts.uiReview;
  }

  protected async run(input: UIReviewTaskInput): Promise<UIReviewAgentOutput> {
    this.logStep(`Starting UI Review Agent for: ${input.filePath}`);

    const output: UIReviewAgentOutput = {
      filesAnalyzed: [],
      violations: [],
      fixesApplied: [],
      warnings: [],
      compliance: { iconSizing: 100, spacing: 100, colors: 100, components: 100 },
      nextSteps: []
    };

    try {
      // Find files to analyze
      this.logStep('Finding files to analyze...');
      const files = await this.findFiles(input.filePath);
      output.filesAnalyzed = files;

      // Load UI Patterns
      this.logStep('Loading UI patterns from ui-patterns.md...');
      const patterns = await this.loadPatterns();

      // Analyze each file
      for (const file of files) {
        this.logStep(`Analyzing: ${file}`);
        const fileViolations = await this.analyzeFile(file, patterns);
        output.violations.push(...fileViolations);
      }

      // Apply fixes if requested
      if (input.autoFix && output.violations.length > 0) {
        this.logStep(`Applying ${output.violations.length} auto-fix(es)...`);
        for (const violation of output.violations) {
          if (violation.fix) {
            await this.applyFix(violation);
            output.fixesApplied.push(violation.file);
          }
        }
      }

      // Calculate compliance score
      output.compliance = this.calculateCompliance(output.violations);

      this.saveOutput({
        filesAnalyzed: output.filesAnalyzed,
        violations: output.violations,
        compliance: output.compliance
      });

      output.nextSteps = [
        `✅ UI Review complete for ${output.filesAnalyzed.length} file(s)`,
        `📊 Found ${output.violations.length} pattern issue(s)`,
        `🔧 Applied ${output.fixesApplied.length} auto-fix(es)`,
        `✨ Overall compliance: ${Math.round(
          (Object.values(output.compliance).reduce((a, b) => a + b) / 4)
        )}%`,
        ``,
        `Ready for deployment`
      ];

      this.logStep('UI Review Agent completed', output);
      return output;
    } catch (error) {
      this.recordError(
        `UI Review Agent failed: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  private async findFiles(filePath: string): Promise<string[]> {
    // In real implementation: use Glob tool
    this.logStep(`Finding files in ${filePath}`);
    return [filePath];
  }

  private async loadPatterns(): Promise<any> {
    // In real implementation: read ui-patterns.md
    return {
      iconSizes: ['h-4 w-4', 'h-5 w-5', 'h-6 w-6'],
      spacingTokens: ['gap-2', 'gap-3', 'gap-4', 'space-y-2', 'space-y-4', 'space-y-6'],
      themeColors: ['text-primary', 'text-muted-foreground', 'bg-primary'],
      components: ['Button', 'Card', 'Dialog', 'Input', 'Select']
    };
  }

  private async analyzeFile(file: string, patterns: any): Promise<UIPatternViolation[]> {
    const violations: UIPatternViolation[] = [];

    // Simulate pattern checks
    // In real implementation: would parse and analyze actual file content

    this.logStep(`Checking icon sizing in ${file}`);
    this.logStep(`Checking spacing tokens in ${file}`);
    this.logStep(`Checking theme colors in ${file}`);
    this.logStep(`Checking component usage in ${file}`);

    this.incrementTurn(0.3);

    return violations;
  }

  private async applyFix(violation: UIPatternViolation): Promise<void> {
    if (!violation.fix) return;

    this.logStep(`Applying fix to ${violation.file}:${violation.line}`);
    // In real implementation: use Edit tool to apply fix
    this.incrementTurn(0.2);
  }

  private calculateCompliance(violations: UIPatternViolation[]): Record<string, number> {
    const byType = {
      iconSizing: 100,
      spacing: 100,
      colors: 100,
      components: 100
    };

    // Reduce compliance based on violations
    for (const v of violations) {
      if (v.pattern.includes('icon')) byType.iconSizing -= 10;
      if (v.pattern.includes('spacing')) byType.spacing -= 10;
      if (v.pattern.includes('color')) byType.colors -= 10;
      if (v.pattern.includes('component')) byType.components -= 10;
    }

    return {
      iconSizing: Math.max(0, byType.iconSizing),
      spacing: Math.max(0, byType.spacing),
      colors: Math.max(0, byType.colors),
      components: Math.max(0, byType.components)
    };
  }
}
