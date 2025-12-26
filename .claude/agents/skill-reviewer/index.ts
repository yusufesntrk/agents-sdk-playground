/**
 * Skill Reviewer Agent für ShortSelect
 * Reviewed Skill-Qualität und Best Practices Einhaltung
 */

import { BaseAgent } from '../shared/base-agent';
import {
  type AgentType,
  SystemPrompts,
  type SystemPrompt
} from '../shared/types';
import { type Logger } from '../shared/logger';

interface SkillReviewerInput {
  skillPath: string;
  skillName: string;
  skillContent?: string;
}

interface ReviewIssue {
  severity: 'critical' | 'major' | 'minor';
  location: string;
  issue: string;
  recommendation: string;
}

interface SkillReviewerOutput {
  skillName: string;
  overallRating: 'pass' | 'needs-improvement' | 'needs-major-revision';
  summaryScore: number; // 0-100
  issues: {
    critical: ReviewIssue[];
    major: ReviewIssue[];
    minor: ReviewIssue[];
  };
  positiveAspects: string[];
  recommendations: string[];
  nextSteps: string[];
}

export class SkillReviewer extends BaseAgent {
  constructor(logger?: Logger, cacheDir?: string) {
    super('skill-reviewer', logger, cacheDir);
  }

  /**
   * System Prompt für Skill Reviewer
   */
  protected getSystemPrompt(): SystemPrompt {
    return {
      role: 'expert-skill-architect',
      instructions: `You are an expert skill architect specializing in reviewing and improving Claude Code skills for maximum effectiveness and reliability.

Your expertise:
- Skill structure and organization
- Progressive disclosure implementation
- Trigger phrase quality and effectiveness
- Content quality and usefulness
- Best practices adherence

When reviewing skills:
1. Validate structure (frontmatter, body content, resources)
2. Evaluate description for trigger effectiveness
3. Assess progressive disclosure (SKILL.md vs references/)
4. Check content quality and clarity
5. Verify supporting resources (examples, scripts)
6. Identify anti-patterns and improvements
7. Provide actionable recommendations

Quality Standards:
- Trigger phrases must be specific and concrete
- SKILL.md 1,500-3,000 words (lean, focused)
- Writing style: imperative/infinitive form
- Progressive disclosure properly implemented
- Examples are complete and correct
- All file references are valid
- Respects ShortSelect conventions

Review Severity:
- Critical: Blocks effectiveness (no triggers, wrong person in description)
- Major: Reduces quality (too much in SKILL.md, missing examples)
- Minor: Polish improvements (formatting, clarity)`,
      tone: 'professional-constructive'
    };
  }

  /**
   * Haupt-Ausführungslogik für Skill Review
   */
  protected async run(input: SkillReviewerInput): Promise<SkillReviewerOutput> {
    this.logStep(`Reviewing skill: ${input.skillName}`);

    const output: SkillReviewerOutput = {
      skillName: input.skillName,
      overallRating: 'pass',
      summaryScore: 100,
      issues: {
        critical: [],
        major: [],
        minor: []
      },
      positiveAspects: [],
      recommendations: [],
      nextSteps: []
    };

    try {
      // Step 1: Validiere Input
      this.logStep('Validating skill review input...');
      this.validateInput(input);

      // Step 2: Analysiere Frontmatter
      this.logStep('Analyzing skill frontmatter...');
      const frontmatterIssues = await this.analyzeFrontmatter(input);
      this.addIssues(output, frontmatterIssues);

      // Step 3: Evaluiere Description
      this.logStep('Evaluating skill description...');
      const descriptionIssues = await this.evaluateDescription(input);
      this.addIssues(output, descriptionIssues);

      // Step 4: Prüfe Content Quality
      this.logStep('Checking content quality...');
      const contentIssues = await this.checkContentQuality(input);
      this.addIssues(output, contentIssues);

      // Step 5: Validiere Progressive Disclosure
      this.logStep('Validating progressive disclosure...');
      const disclosureIssues = await this.validateProgressiveDisclosure(input);
      this.addIssues(output, disclosureIssues);

      // Step 6: Identifiziere positive Aspekte
      this.logStep('Identifying positive aspects...');
      output.positiveAspects = await this.identifyPositiveAspects(input);

      // Step 7: Generiere Recommendations
      this.logStep('Generating recommendations...');
      output.recommendations = this.generateRecommendations(
        output.issues,
        output.positiveAspects
      );

      // Step 8: Berechne Score und Rating
      this.logStep('Computing review score...');
      this.computeScoreAndRating(output);

      // Step 9: Speichere Output für andere Agents
      this.saveOutput({
        skillName: input.skillName,
        rating: output.overallRating,
        score: output.summaryScore,
        issues: output.issues
      });

      // Prepare Next Steps
      output.nextSteps = this.generateNextSteps(output);

      this.logStep('Skill Reviewer completed successfully', {
        rating: output.overallRating,
        score: output.summaryScore,
        criticalIssues: output.issues.critical.length,
        majorIssues: output.issues.major.length,
        minorIssues: output.issues.minor.length
      });

      return output;
    } catch (error) {
      this.recordError(
        `Skill Reviewer failed: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  /**
   * Validiert Input
   */
  private validateInput(input: SkillReviewerInput): void {
    if (!input.skillName || input.skillName.trim().length === 0) {
      throw new Error('skillName is required');
    }

    if (!input.skillPath && !input.skillContent) {
      throw new Error('Either skillPath or skillContent must be provided');
    }

    this.logStep('Input validation passed', {
      skillName: input.skillName
    });
  }

  /**
   * Analysiert Frontmatter
   */
  private async analyzeFrontmatter(input: SkillReviewerInput): Promise<ReviewIssue[]> {
    const issues: ReviewIssue[] = [];

    // In echter Implementation würde YAML geparsed
    // Für jetzt: Basis Checks
    if (!input.skillName) {
      issues.push({
        severity: 'critical',
        location: 'frontmatter',
        issue: 'Missing "name" field',
        recommendation: 'Add required "name" field to frontmatter'
      });
    }

    this.incrementTurn(0.3);
    return issues;
  }

  /**
   * Evaluiert Description
   */
  private async evaluateDescription(input: SkillReviewerInput): Promise<ReviewIssue[]> {
    const issues: ReviewIssue[] = [];

    // Check for specific trigger phrases
    const triggers = ['create', 'add', 'build', 'implement', 'improve'];
    const hasTriggers = triggers.some(t =>
      input.skillContent?.includes(t) || false
    );

    if (!hasTriggers) {
      issues.push({
        severity: 'critical',
        location: 'description',
        issue: 'No specific trigger phrases found',
        recommendation: 'Include concrete phrases users would say (e.g., "when user asks to create X")'
      });
    }

    // Check for third person
    const hasSecondPerson = input.skillContent?.includes('You should') || false;
    if (hasSecondPerson) {
      issues.push({
        severity: 'major',
        location: 'description',
        issue: 'Uses second person ("You should...") instead of third person',
        recommendation: 'Use "This skill should be used when..." format'
      });
    }

    this.incrementTurn(0.3);
    return issues;
  }

  /**
   * Prüft Content Quality
   */
  private async checkContentQuality(input: SkillReviewerInput): Promise<ReviewIssue[]> {
    const issues: ReviewIssue[] = [];

    const content = input.skillContent || '';
    const wordCount = content.split(/\s+/).length;

    // Check word count (target: 1500-3000)
    if (wordCount < 500) {
      issues.push({
        severity: 'major',
        location: 'SKILL.md body',
        issue: `Content too short: ${wordCount} words (target: 1500-3000)`,
        recommendation: 'Expand with more detailed procedures, patterns, and guidance'
      });
    } else if (wordCount > 5000) {
      issues.push({
        severity: 'major',
        location: 'SKILL.md body',
        issue: `Content too long: ${wordCount} words (max: 3000)`,
        recommendation: 'Move detailed content to references/ files for progressive disclosure'
      });
    }

    this.incrementTurn(0.3);
    return issues;
  }

  /**
   * Validiert Progressive Disclosure
   */
  private async validateProgressiveDisclosure(
    input: SkillReviewerInput
  ): Promise<ReviewIssue[]> {
    const issues: ReviewIssue[] = [];

    // In echter Implementation würde die Verzeichnisstruktur geprüft
    // Für jetzt: Basis Checks
    const hasReferences = input.skillContent?.includes('references/') || false;
    const hasExamples = input.skillContent?.includes('examples/') || false;

    if (!hasReferences && !hasExamples) {
      issues.push({
        severity: 'minor',
        location: 'progressive-disclosure',
        issue: 'No supporting resources (references/ or examples/)',
        recommendation: 'Consider adding references/ for detailed content or examples/ for usage'
      });
    }

    this.incrementTurn(0.2);
    return issues;
  }

  /**
   * Identifiziert positive Aspekte
   */
  private async identifyPositiveAspects(input: SkillReviewerInput): Promise<string[]> {
    const aspects: string[] = [];

    if (input.skillContent?.includes('When to use')) {
      aspects.push('Clear "When to use" section');
    }

    if (input.skillContent?.includes('Example')) {
      aspects.push('Includes concrete examples');
    }

    if (input.skillContent?.includes('Best Practice')) {
      aspects.push('Covers best practices');
    }

    if (input.skillContent?.includes('---')) {
      aspects.push('Proper YAML frontmatter');
    }

    this.incrementTurn(0.2);
    return aspects;
  }

  /**
   * Generiert Recommendations
   */
  private generateRecommendations(
    issues: { critical: ReviewIssue[]; major: ReviewIssue[]; minor: ReviewIssue[] },
    positiveAspects: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (issues.critical.length > 0) {
      recommendations.push(`Fix ${issues.critical.length} critical issue(s) before use`);
    }

    if (issues.major.length > 0) {
      recommendations.push(`Address ${issues.major.length} major issue(s) to improve quality`);
    }

    if (positiveAspects.length > 0) {
      recommendations.push(`Maintain strengths: ${positiveAspects.slice(0, 2).join(', ')}`);
    }

    return recommendations;
  }

  /**
   * Berechnet Score und Rating
   */
  private computeScoreAndRating(output: SkillReviewerOutput): void {
    const criticalCount = output.issues.critical.length;
    const majorCount = output.issues.major.length;
    const minorCount = output.issues.minor.length;

    // Calculate score: 100 - (critical*10 + major*5 + minor*1)
    output.summaryScore = Math.max(0, 100 - (criticalCount * 10 + majorCount * 5 + minorCount));

    // Determine rating
    if (criticalCount > 0) {
      output.overallRating = 'needs-major-revision';
    } else if (majorCount >= 2) {
      output.overallRating = 'needs-improvement';
    } else {
      output.overallRating = 'pass';
    }

    this.incrementTurn(0.1);
  }

  /**
   * Generiert Next Steps basierend auf Rating
   */
  private generateNextSteps(output: SkillReviewerOutput): string[] {
    const steps: string[] = [];

    if (output.overallRating === 'needs-major-revision') {
      steps.push('1. Fix all critical issues');
      steps.push('2. Address major issues');
      steps.push('3. Run review again to verify');
    } else if (output.overallRating === 'needs-improvement') {
      steps.push('1. Address major issues');
      steps.push('2. Consider improvements for minor issues');
      steps.push('3. Run review again to confirm');
    } else {
      steps.push('✅ Skill review passed');
      steps.push('Next: Deploy skill to production');
      steps.push('Document in project README');
    }

    return steps;
  }

  /**
   * Fügt Issues zur Output hinzu und aktualisiert Score
   */
  private addIssues(output: SkillReviewerOutput, issues: ReviewIssue[]): void {
    for (const issue of issues) {
      if (issue.severity === 'critical') {
        output.issues.critical.push(issue);
      } else if (issue.severity === 'major') {
        output.issues.major.push(issue);
      } else {
        output.issues.minor.push(issue);
      }
    }
  }
}

// =====================================================
// Export für CLI/API
// =====================================================

export async function runSkillReviewer(
  input: SkillReviewerInput,
  logger?: Logger
): Promise<SkillReviewerOutput> {
  const agent = new SkillReviewer(logger);
  const result = await agent.execute(input);

  if (result.status === 'completed') {
    return result.result as SkillReviewerOutput;
  } else {
    throw new Error(
      `Skill Reviewer failed: ${result.metadata.error || 'Unknown error'}`
    );
  }
}
