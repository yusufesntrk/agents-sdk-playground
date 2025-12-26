/**
 * Debug Agent für ShortSelect ATS
 * Debuggt Browser-Probleme mit Playwright
 */

import { BaseAgent } from '../shared/base-agent';
import { type SystemPrompt } from '../shared/types';
import { SystemPrompts } from '../shared/types';

export interface DebugTaskInput {
  page: string;
  issue: string;
  context?: {
    url?: string;
    userAction?: string;
    expectedBehavior?: string;
  };
}

export interface DebugAgentOutput {
  screenshots: string[];
  consoleLogs: ConsolLog[];
  networkRequests: NetworkRequest[];
  performanceMetrics: PerformanceMetrics;
  findings: string[];
  suggestions: string[];
}

export interface ConsolLog {
  level: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: number;
}

export interface NetworkRequest {
  url: string;
  status: number;
  method: string;
  duration: number;
  error?: string;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
}

export class DebugAgent extends BaseAgent {
  constructor(logger?: any, cacheDir?: string) {
    super('debug', logger, cacheDir);
  }

  protected getSystemPrompt(): SystemPrompt {
    return SystemPrompts.debug;
  }

  protected async run(input: DebugTaskInput): Promise<DebugAgentOutput> {
    this.logStep(`Starting Debug Agent for page: ${input.page}`);
    this.logStep(`Issue: ${input.issue}`);

    const output: DebugAgentOutput = {
      screenshots: [],
      consoleLogs: [],
      networkRequests: [],
      performanceMetrics: { pageLoadTime: 0, firstContentfulPaint: 0, largestContentfulPaint: 0 },
      findings: [],
      suggestions: []
    };

    try {
      // Launch Playwright
      this.logStep('Launching browser...');
      const browserContext = await this.launchBrowser();

      // Navigate to page
      this.logStep(`Navigating to: ${input.page}`);
      const page = await browserContext.newPage();

      // Setup monitoring
      const consoleLogs: ConsolLog[] = [];
      const networkRequests: NetworkRequest[] = [];

      page.on('console', msg => {
        consoleLogs.push({
          level: msg.type() as any,
          message: msg.text(),
          timestamp: Date.now()
        });
      });

      page.on('response', response => {
        networkRequests.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method(),
          duration: 0
        });
      });

      // Navigate
      await page.goto(`http://localhost:5173${input.page}`);
      this.logStep('Page loaded');

      // Take screenshot
      const screenshotPath = `debug-${Date.now()}.png`;
      await page.screenshot({ path: screenshotPath });
      output.screenshots.push(screenshotPath);

      // Perform user action if provided
      if (input.context?.userAction) {
        this.logStep(`Performing action: ${input.context.userAction}`);
        // Parse and execute action
      }

      // Collect metrics
      const metrics = await page.metrics();
      output.performanceMetrics = {
        pageLoadTime: metrics.TaskDuration,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0
      };

      output.consoleLogs = consoleLogs;
      output.networkRequests = networkRequests;

      // Analyze findings
      output.findings = this.analyzeLogs(consoleLogs, networkRequests);
      output.suggestions = this.generateSuggestions(output.findings);

      // Cleanup
      await page.close();
      await browserContext.close();

      this.saveOutput({
        issue: input.issue,
        findings: output.findings,
        suggestions: output.suggestions
      });

      return output;
    } catch (error) {
      this.recordError(
        `Debug Agent failed: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  private async launchBrowser(): Promise<any> {
    // In real implementation: use Playwright SDK
    return {};
  }

  private analyzeLogs(logs: ConsolLog[], requests: NetworkRequest[]): string[] {
    const findings: string[] = [];

    const errors = logs.filter(l => l.level === 'error');
    if (errors.length > 0) {
      findings.push(`Found ${errors.length} console error(s)`);
      errors.forEach(e => {
        findings.push(`  - ${e.message}`);
      });
    }

    const failedRequests = requests.filter(r => r.status >= 400);
    if (failedRequests.length > 0) {
      findings.push(`Found ${failedRequests.length} failed network request(s)`);
      failedRequests.forEach(r => {
        findings.push(`  - ${r.method} ${r.url} (${r.status})`);
      });
    }

    return findings;
  }

  private generateSuggestions(findings: string[]): string[] {
    return [
      '1. Check console errors - likely JS exceptions',
      '2. Verify API endpoints are responding',
      '3. Check network tab for failed requests',
      '4. Verify authentication/authorization',
      '5. Check performance metrics'
    ];
  }
}
