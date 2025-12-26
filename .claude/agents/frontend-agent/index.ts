/**
 * Frontend Agent für ShortSelect ATS
 * Erstellt React Komponenten, Pages, und UI-Logik basierend auf Backend Agent Output
 */

import { BaseAgent } from '../shared/base-agent';
import {
  type AgentType,
  SystemPrompts,
  type SystemPrompt
} from '../shared/types';
import { type Logger } from '../shared/logger';

interface FrontendTaskInput {
  featureName: string;
  description: string;
  components?: ComponentDefinition[];
  pages?: PageDefinition[];
  forms?: FormDefinition[];
  context?: {
    backendDependencies?: string[]; // Hook names to import
    relatedComponents?: string[]; // Similar components to reference
    uiPatterns?: string[]; // Patterns from ui-patterns.md to follow
  };
}

interface ComponentDefinition {
  name: string;
  type: 'card' | 'form' | 'list' | 'dialog' | 'detail' | 'custom';
  description: string;
  props?: PropertyDefinition[];
  state?: StateDefinition[];
  hooks?: string[]; // Hook names from Backend Agent
}

interface PropertyDefinition {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
}

interface StateDefinition {
  name: string;
  type: string;
  initialValue?: string;
  description?: string;
}

interface PageDefinition {
  name: string;
  path: string;
  description: string;
  components: string[]; // Component names to use
  hooks?: string[];
  layout?: 'sidebar' | 'full' | 'modal';
}

interface FormDefinition {
  name: string;
  fields: FormField[];
  submitAction?: string;
  validation?: ValidationRule[];
}

interface FormField {
  name: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date';
  label: string;
  required?: boolean;
  validation?: string;
  options?: { label: string; value: string }[];
}

interface ValidationRule {
  field: string;
  rule: string;
  message: string;
}

interface FrontendAgentOutput {
  componentsCreated: string[];
  pagesCreated: string[];
  hooksImported: string[];
  typesGenerated: string[];
  warnings: string[];
  nextSteps: string[];
  uiPatternIssues?: string[];
}

export class FrontendAgent extends BaseAgent {
  constructor(logger?: Logger, cacheDir?: string) {
    super('frontend', logger, cacheDir);
  }

  /**
   * System Prompt für Frontend Agent
   */
  protected getSystemPrompt(): SystemPrompt {
    return SystemPrompts.frontend;
  }

  /**
   * Haupt-Ausführungslogik für Frontend Tasks
   */
  protected async run(input: FrontendTaskInput): Promise<FrontendAgentOutput> {
    this.logStep(`Starting Frontend Agent for feature: ${input.featureName}`);

    const output: FrontendAgentOutput = {
      componentsCreated: [],
      pagesCreated: [],
      hooksImported: [],
      typesGenerated: [],
      warnings: [],
      nextSteps: [],
      uiPatternIssues: []
    };

    try {
      // Step 1: Validiere Input
      this.logStep('Validating input...');
      this.validateInput(input);

      // Step 2: Hol Backend Agent Output
      this.logStep('Loading Backend Agent dependencies...');
      const backendOutput = this.getAgentOutput('backend');
      if (!backendOutput) {
        this.logStep('⚠️  No Backend Agent output found, continuing anyway');
      }

      // Step 3: Lade UI Patterns
      this.logStep('Loading UI patterns...');
      const patterns = await this.loadUIPatterns();

      // Step 4: Erstelle Komponenten
      if (input.components && input.components.length > 0) {
        this.logStep(`Creating ${input.components.length} component(s)...`);
        const created = await this.createComponents(
          input.components,
          backendOutput?.result?.hooks || []
        );
        output.componentsCreated = created;
      }

      // Step 5: Erstelle Pages
      if (input.pages && input.pages.length > 0) {
        this.logStep(`Creating ${input.pages.length} page(s)...`);
        const created = await this.createPages(
          input.pages,
          input.components || [],
          backendOutput?.result?.hooks || []
        );
        output.pagesCreated = created;
      }

      // Step 6: Erstelle Formulare
      if (input.forms && input.forms.length > 0) {
        this.logStep(`Creating ${input.forms.length} form(s)...`);
        const created = await this.createForms(input.forms);
        output.componentsCreated.push(...created);
      }

      // Step 7: Sammle importierte Hooks
      output.hooksImported = input.context?.backendDependencies || [];

      // Step 8: Validiere UI Patterns
      this.logStep('Validating UI patterns...');
      const issues = await this.validateUIPatterns(output.componentsCreated);
      output.uiPatternIssues = issues;

      if (issues.length > 0) {
        output.warnings.push(
          `Found ${issues.length} UI pattern issue(s) - see uiPatternIssues`
        );
      }

      // Step 9: Speichere Output für andere Agents
      this.saveOutput({
        featureName: input.featureName,
        components: output.componentsCreated,
        pages: output.pagesCreated,
        hooksImported: output.hooksImported
      });

      // Prepare Next Steps
      output.nextSteps = [
        `✅ Frontend setup complete for: ${input.featureName}`,
        `🧩 Created ${output.componentsCreated.length} components`,
        `📄 Created ${output.pagesCreated.length} pages`,
        `🪝 Imported ${output.hooksImported.length} hooks from Backend`,
        `📝 Generated ${output.typesGenerated.length} type files`,
        '',
        'Next: UI Review Agent will validate components for pattern compliance',
        'Then: Test Agent will create E2E tests for new pages'
      ];

      this.logStep('Frontend Agent completed successfully', output);
      return output;
    } catch (error) {
      this.recordError(
        `Frontend Agent failed: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  /**
   * Validiert Input-Struktur
   */
  private validateInput(input: FrontendTaskInput): void {
    if (!input.featureName || input.featureName.trim().length === 0) {
      throw new Error('featureName is required');
    }

    if (input.components) {
      input.components.forEach((comp, idx) => {
        if (!comp.name || !comp.type) {
          throw new Error(
            `Component ${idx} missing name or type`
          );
        }
      });
    }

    if (input.pages) {
      input.pages.forEach((page, idx) => {
        if (!page.name || !page.path) {
          throw new Error(
            `Page ${idx} missing name or path`
          );
        }
      });
    }

    this.logStep('Input validation passed', {
      featureName: input.featureName,
      componentCount: input.components?.length || 0,
      pageCount: input.pages?.length || 0,
      formCount: input.forms?.length || 0
    });
  }

  /**
   * Erstellt React Komponenten
   */
  private async createComponents(
    components: ComponentDefinition[],
    availableHooks: string[]
  ): Promise<string[]> {
    const created: string[] = [];

    for (const component of components) {
      const fileName = `${component.name}.tsx`;
      const filePath = `src/components/${component.name}/${fileName}`;

      this.logStep(`Creating component: ${filePath}`);

      const code = this.generateComponentCode(
        component,
        availableHooks
      );

      // In echter Implementation: Write Tool nutzen
      created.push(fileName);
      this.incrementTurn(0.6);
    }

    return created;
  }

  /**
   * Generiert React Komponenten-Code
   */
  private generateComponentCode(
    component: ComponentDefinition,
    availableHooks: string[]
  ): string {
    const imports = this.generateComponentImports(component, availableHooks);
    const propsType = this.generatePropsType(component);
    const stateLogic = this.generateStateLogic(component);
    const jsx = this.generateComponentJSX(component);

    return `
${imports}

${propsType}

/**
 * ${component.name}
 *
 * ${component.description}
 */
export function ${component.name}(props: ${component.name}Props) {
${stateLogic}

  return (
${jsx}
  );
}
`.trim();
  }

  /**
   * Generiert Import-Statements
   */
  private generateComponentImports(
    component: ComponentDefinition,
    availableHooks: string[]
  ): string {
    const imports = [
      "import { useState, useCallback } from 'react';",
      "import { Button } from '@/components/ui/button';",
      "import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';",
      "import { DialogTrigger, DialogContent } from '@/components/ui/dialog';"
    ];

    // Add hook imports
    if (component.hooks) {
      const hookImports = component.hooks
        .filter(h => availableHooks.includes(h))
        .map(h => h.toLowerCase());

      if (hookImports.length > 0) {
        imports.push(`import { ${hookImports.join(', ')} } from '@/hooks';`);
      }
    }

    return imports.join('\n');
  }

  /**
   * Generiert Props Type Definition
   */
  private generatePropsType(component: ComponentDefinition): string {
    if (!component.props || component.props.length === 0) {
      return `interface ${component.name}Props {}`;
    }

    const propDefs = component.props
      .map(prop => {
        const optional = prop.required === false ? '?' : '';
        return `  ${prop.name}${optional}: ${prop.type}; // ${prop.description || ''}`;
      })
      .join('\n');

    return `interface ${component.name}Props {
${propDefs}
}`;
  }

  /**
   * Generiert State-Management-Logik
   */
  private generateStateLogic(component: ComponentDefinition): string {
    if (!component.state || component.state.length === 0) {
      return '  // No local state';
    }

    const stateLines = component.state
      .map(s => `  const [${s.name}, set${this.capitalize(s.name)}] = useState<${s.type}>(${s.initialValue || 'null'});`)
      .join('\n');

    return stateLines;
  }

  /**
   * Generiert JSX
   */
  private generateComponentJSX(component: ComponentDefinition): string {
    const type = component.type;

    switch (type) {
      case 'card':
        return `    <Card>
      <CardHeader>
        <CardTitle>${component.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* TODO: Add content here */}
      </CardContent>
    </Card>`;

      case 'list':
        return `    <div className="space-y-2">
      {/* TODO: Map over items and render ListItem */}
      <p className="text-sm text-muted-foreground">
        No items found
      </p>
    </div>`;

      case 'form':
        return `    <form className="space-y-4">
      {/* TODO: Add form fields */}
      <Button type="submit">Submit</Button>
    </form>`;

      case 'detail':
        return `    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Details</h3>
        {/* TODO: Add detail fields */}
      </div>
      <div className="flex gap-2">
        <Button>Edit</Button>
        <Button variant="outline">Delete</Button>
      </div>
    </div>`;

      case 'dialog':
        return `    <Dialog>
      <DialogTrigger asChild>
        <Button>{/* trigger label */}</Button>
      </DialogTrigger>
      <DialogContent>
        <div className="space-y-4">
          {/* TODO: Add dialog content */}
        </div>
      </DialogContent>
    </Dialog>`;

      default:
        return `    <div>{/* ${component.name} content */}</div>`;
    }
  }

  /**
   * Erstellt Pages
   */
  private async createPages(
    pages: PageDefinition[],
    components: ComponentDefinition[],
    availableHooks: string[]
  ): Promise<string[]> {
    const created: string[] = [];

    for (const page of pages) {
      const fileName = `${page.name}.tsx`;
      const filePath = `src/pages/${fileName}`;

      this.logStep(`Creating page: ${filePath}`);

      const code = this.generatePageCode(page, components, availableHooks);

      // In echter Implementation: Write Tool nutzen
      created.push(fileName);
      this.incrementTurn(0.8);
    }

    return created;
  }

  /**
   * Generiert Page-Code
   */
  private generatePageCode(
    page: PageDefinition,
    components: ComponentDefinition[],
    availableHooks: string[]
  ): string {
    const imports = this.generatePageImports(page, availableHooks);

    return `
${imports}

/**
 * ${page.name}
 *
 * Route: ${page.path}
 * ${page.description}
 */
export default function ${page.name}() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">${page.name}</h1>
        <p className="text-muted-foreground">${page.description}</p>
      </div>

      {/* Components */}
      ${page.components.map(c => `<${c} />`).join('\n      ')}
    </div>
  );
}
`.trim();
  }

  /**
   * Generiert Page Imports
   */
  private generatePageImports(page: PageDefinition, availableHooks: string[]): string {
    const imports = ["import { Suspense } from 'react';"];

    // Add component imports
    page.components.forEach(comp => {
      imports.push(`import { ${comp} } from '@/components/${comp}';`);
    });

    // Add hook imports
    if (page.hooks) {
      const hookImports = page.hooks
        .filter(h => availableHooks.includes(h))
        .map(h => h.toLowerCase());

      if (hookImports.length > 0) {
        imports.push(`import { ${hookImports.join(', ')} } from '@/hooks';`);
      }
    }

    return imports.join('\n');
  }

  /**
   * Erstellt Formulare
   */
  private async createForms(forms: FormDefinition[]): Promise<string[]> {
    const created: string[] = [];

    for (const form of forms) {
      const fileName = `${form.name}.tsx`;
      const filePath = `src/components/${form.name}/${fileName}`;

      this.logStep(`Creating form: ${filePath}`);

      const code = this.generateFormCode(form);

      // In echter Implementation: Write Tool nutzen
      created.push(fileName);
      this.incrementTurn(0.7);
    }

    return created;
  }

  /**
   * Generiert Form-Code
   */
  private generateFormCode(form: FormDefinition): string {
    const fieldJSX = form.fields
      .map(field => {
        const label = field.label;
        return `      <div className="space-y-2">
        <label htmlFor="${field.name}">${label}</label>
        <${this.getInputComponent(field.type)} id="${field.name}" name="${field.name}" ${field.required ? 'required' : ''} />
      </div>`;
      })
      .join('\n');

    return `
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * ${form.name}
 */
export function ${form.name}() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Submit form
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
${fieldJSX}
      <Button type="submit" disabled={loading}>
        {loading ? 'Loading...' : '${form.submitAction || 'Submit'}'}
      </Button>
    </form>
  );
}
`.trim();
  }

  /**
   * Gibt Input-Komponente für Field Type zurück
   */
  private getInputComponent(fieldType: string): string {
    const map: Record<string, string> = {
      'text': 'Input',
      'email': 'Input',
      'number': 'Input',
      'textarea': 'Textarea',
      'select': 'Select',
      'checkbox': 'Checkbox',
      'date': 'Input'
    };

    return map[fieldType] || 'Input';
  }

  /**
   * Lädt UI-Patterns
   */
  private async loadUIPatterns(): Promise<Record<string, any>> {
    // In echter Implementation: würde ui-patterns.md lesen
    return {
      iconSize: 'h-4 w-4',
      spacing: ['gap-2', 'gap-3', 'gap-4'],
      colors: ['text-primary', 'text-muted-foreground']
    };
  }

  /**
   * Validiert gegen UI-Patterns
   */
  private async validateUIPatterns(createdFiles: string[]): Promise<string[]> {
    const issues: string[] = [];

    // In echter Implementation: würde tatsächliche Validierung durchführen
    // Für jetzt: Nur Demo-Validierung
    this.logStep(`Validating ${createdFiles.length} component(s) against UI patterns...`);

    return issues;
  }

  /**
   * Helper: Capitalize String
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// =====================================================
// Export für CLI/API
// =====================================================

export async function runFrontendAgent(
  input: FrontendTaskInput,
  logger?: Logger
): Promise<FrontendAgentOutput> {
  const agent = new FrontendAgent(logger);
  const result = await agent.execute(input);

  if (result.status === 'completed') {
    return result.result as FrontendAgentOutput;
  } else {
    throw new Error(
      `Frontend Agent failed: ${result.metadata.error || 'Unknown error'}`
    );
  }
}
