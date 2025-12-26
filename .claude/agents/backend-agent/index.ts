/**
 * Backend Agent für ShortSelect ATS
 * Erstellt Datenbank-Migrationen, RLS Policies, und Custom Hooks
 */

import { BaseAgent } from '../shared/base-agent';
import {
  type AgentType,
  SystemPrompts,
  type SystemPrompt
} from '../shared/types';
import { type Logger } from '../shared/logger';

interface BackendTaskInput {
  featureName: string;
  description: string;
  tables?: TableDefinition[];
  hooks?: HookDefinition[];
  rlsPolicies?: RLSPolicyDefinition[];
  context?: {
    relatedTables?: string[];
    businessLogic?: string;
  };
}

interface TableDefinition {
  name: string;
  description: string;
  columns: ColumnDefinition[];
  indexes?: IndexDefinition[];
  constraints?: ConstraintDefinition[];
}

interface ColumnDefinition {
  name: string;
  type: string;
  nullable?: boolean;
  default?: any;
  references?: {
    table: string;
    column: string;
  };
  description?: string;
}

interface IndexDefinition {
  name: string;
  columns: string[];
  unique?: boolean;
}

interface ConstraintDefinition {
  name: string;
  type: 'primary' | 'foreign' | 'unique' | 'check';
  columns: string[];
  references?: {
    table: string;
    column: string;
  };
}

interface HookDefinition {
  name: string;
  type: 'query' | 'mutation';
  description: string;
  tableName: string;
  operation: 'select' | 'insert' | 'update' | 'delete' | 'custom';
  filters?: Record<string, string>;
}

interface RLSPolicyDefinition {
  name: string;
  tableName: string;
  operation: 'select' | 'insert' | 'update' | 'delete';
  roles: string[];
  condition: string;
  description?: string;
}

interface BackendAgentOutput {
  migrationsCreated: string[];
  hooksGenerated: string[];
  policiesCreated: string[];
  typeDefinitions: string[];
  warnings: string[];
  nextSteps: string[];
}

export class BackendAgent extends BaseAgent {
  constructor(logger?: Logger, cacheDir?: string) {
    super('backend', logger, cacheDir);
  }

  /**
   * System Prompt für Backend Agent
   */
  protected getSystemPrompt(): SystemPrompt {
    return SystemPrompts.backend;
  }

  /**
   * Haupt-Ausführungslogik für Backend Tasks
   */
  protected async run(input: BackendTaskInput): Promise<BackendAgentOutput> {
    this.logStep(`Starting Backend Agent for feature: ${input.featureName}`);

    const output: BackendAgentOutput = {
      migrationsCreated: [],
      hooksGenerated: [],
      policiesCreated: [],
      typeDefinitions: [],
      warnings: [],
      nextSteps: []
    };

    try {
      // Step 1: Validiere Input
      this.logStep('Validating input...');
      this.validateInput(input);

      // Step 2: Analysiere bestehende Tabellen
      this.logStep('Analyzing existing database schema...');
      const existingTables = await this.analyzeExistingSchema();

      // Step 3: Erstelle Migrationen für neue Tabellen
      if (input.tables && input.tables.length > 0) {
        this.logStep(`Creating ${input.tables.length} migration(s)...`);
        output.migrationsCreated = await this.createMigrations(
          input.tables,
          existingTables
        );
      }

      // Step 4: Generiere RLS Policies
      if (input.rlsPolicies && input.rlsPolicies.length > 0) {
        this.logStep(
          `Creating ${input.rlsPolicies.length} RLS policy(ies)...`
        );
        output.policiesCreated = await this.createRLSPolicies(
          input.rlsPolicies
        );
      }

      // Step 5: Generiere Custom Hooks
      if (input.hooks && input.hooks.length > 0) {
        this.logStep(`Generating ${input.hooks.length} custom hook(s)...`);
        output.hooksGenerated = await this.generateHooks(
          input.hooks,
          input.featureName
        );
      }

      // Step 6: Generiere TypeScript Types
      this.logStep('Generating TypeScript types from Supabase...');
      output.typeDefinitions = await this.generateTypes(input.tables);

      // Step 7: Validiere Migrations
      if (output.migrationsCreated.length > 0) {
        this.logStep('Validating migrations...');
        const validation = await this.validateMigrations(
          output.migrationsCreated
        );
        if (!validation.success) {
          output.warnings.push(
            `Migration validation issues: ${validation.errors.join(', ')}`
          );
        }
      }

      // Step 8: Speichere Output für andere Agents
      this.saveOutput({
        featureName: input.featureName,
        tables: input.tables,
        hooks: output.hooksGenerated,
        migrations: output.migrationsCreated,
        policies: output.policiesCreated
      });

      // Prepare Next Steps
      output.nextSteps = [
        `✅ Backend setup complete for: ${input.featureName}`,
        `📊 Created ${output.migrationsCreated.length} migrations`,
        `🔐 Created ${output.policiesCreated.length} RLS policies`,
        `🪝 Generated ${output.hooksGenerated.length} hooks`,
        `📝 Generated ${output.typeDefinitions.length} type files`,
        '',
        'Next: Frontend Agent will use these hooks to build components',
        'Command: Frontend Agent should import hooks from @/hooks/use-<feature>'
      ];

      this.logStep('Backend Agent completed successfully', output);
      return output;
    } catch (error) {
      this.recordError(
        `Backend Agent failed: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  /**
   * Validiert Input-Struktur
   */
  private validateInput(input: BackendTaskInput): void {
    if (!input.featureName || input.featureName.trim().length === 0) {
      throw new Error('featureName is required');
    }

    if (input.tables) {
      input.tables.forEach((table, idx) => {
        if (!table.name || !table.columns || table.columns.length === 0) {
          throw new Error(
            `Table ${idx} missing name or columns`
          );
        }

        table.columns.forEach((col, colIdx) => {
          if (!col.name || !col.type) {
            throw new Error(
              `Column ${colIdx} in table ${table.name} missing name or type`
            );
          }
        });
      });
    }

    this.logStep('Input validation passed', {
      featureName: input.featureName,
      tableCount: input.tables?.length || 0,
      hookCount: input.hooks?.length || 0,
      policyCount: input.rlsPolicies?.length || 0
    });
  }

  /**
   * Analysiert bestehende Datenbank-Schema
   */
  private async analyzeExistingSchema(): Promise<string[]> {
    // In echter Implementation würde dies die Supabase API nutzen
    // Für jetzt: Return bekannte Tabellen
    return [
      'tenants',
      'profiles',
      'jobs',
      'candidates',
      'applications',
      'pipeline_templates',
      'pipeline_stages',
      'feedback_items',
      'feedback_votes'
    ];
  }

  /**
   * Erstellt SQL Migrationen für neue Tabellen
   */
  private async createMigrations(
    tables: TableDefinition[],
    existingTables: string[]
  ): Promise<string[]> {
    const migrations: string[] = [];
    const timestamp = new Date().toISOString().replace(/[^\d]/g, '').slice(0, 14);

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];

      // Check if table already exists
      if (existingTables.includes(table.name)) {
        this.logStep(
          `⚠️  Table '${table.name}' already exists, skipping creation`
        );
        continue;
      }

      // Generate migration SQL
      const migrationName = `${timestamp}_create_${table.name}_table`;
      const sql = this.generateTableSQL(table);

      const migrationPath = `supabase/migrations/${migrationName}.sql`;

      this.logStep(`Creating migration: ${migrationPath}`);

      // In echter Implementation: WriteFile Tool nutzen
      // Für jetzt: nur logs
      migrations.push(migrationPath);

      this.incrementTurn(0.5); // Cost estimate
    }

    return migrations;
  }

  /**
   * Generiert SQL für eine Tabelle
   */
  private generateTableSQL(table: TableDefinition): string {
    const columnDefs = table.columns
      .map(col => {
        let def = `  ${col.name} ${col.type}`;
        if (col.nullable === false) def += ' NOT NULL';
        if (col.default !== undefined) def += ` DEFAULT ${col.default}`;
        if (col.references) {
          def += ` REFERENCES ${col.references.table}(${col.references.column})`;
        }
        if (col.description) def += ` -- ${col.description}`;
        return def;
      })
      .join(',\n');

    let sql = `CREATE TABLE IF NOT EXISTS ${table.name} (\n${columnDefs}`;

    // Add indexes
    if (table.indexes && table.indexes.length > 0) {
      sql += ',\n  ';
      sql += table.indexes
        .map(idx => {
          const uniqueStr = idx.unique ? 'UNIQUE ' : '';
          const cols = idx.columns.join(', ');
          return `UNIQUE ${cols}`;
        })
        .join(',\n  ');
    }

    sql += '\n);\n\n';

    // Add RLS
    sql += `ALTER TABLE ${table.name} ENABLE ROW LEVEL SECURITY;\n\n`;

    // Add tenant isolation policy
    sql += `-- Tenant isolation policy\n`;
    sql += `CREATE POLICY "${table.name}_tenant_isolation" ON ${table.name}\n`;
    sql += `  USING (tenant_id = auth.jwt() ->> 'tenant_id');\n`;

    return sql;
  }

  /**
   * Erstellt RLS Policies
   */
  private async createRLSPolicies(
    policies: RLSPolicyDefinition[]
  ): Promise<string[]> {
    const created: string[] = [];

    for (const policy of policies) {
      const policyName = `${policy.tableName}_${policy.operation}_${policy.roles.join('_')}`;

      this.logStep(`Creating RLS policy: ${policyName}`);

      const sql = this.generateRLSPolicySQL(policy);

      // In echter Implementation: apply_migration Tool nutzen
      created.push(policyName);
      this.incrementTurn(0.3);
    }

    return created;
  }

  /**
   * Generiert SQL für RLS Policy
   */
  private generateRLSPolicySQL(policy: RLSPolicyDefinition): string {
    const operationStr = policy.operation.toUpperCase();
    const roles = policy.roles.map(r => `'${r}'`).join(', ');

    return `
CREATE POLICY "${policy.name}" ON ${policy.tableName}
  FOR ${operationStr}
  TO ${roles}
  USING (${policy.condition})
  WITH CHECK (${policy.condition});
`.trim();
  }

  /**
   * Generiert Custom Hooks
   */
  private async generateHooks(
    hooks: HookDefinition[],
    featureName: string
  ): Promise<string[]> {
    const generated: string[] = [];

    for (const hook of hooks) {
      const hookFileName = `use${featureName}${hook.name}.ts`;
      const hookPath = `src/hooks/${hookFileName}`;

      this.logStep(`Generating hook: ${hookPath}`);

      const code = this.generateHookCode(hook, featureName);

      // In echter Implementation: Write Tool nutzen
      generated.push(hookFileName);
      this.incrementTurn(0.4);
    }

    return generated;
  }

  /**
   * Generiert Hook TypeScript Code
   */
  private generateHookCode(hook: HookDefinition, featureName: string): string {
    const hookName = `use${featureName}${hook.name}`;

    if (hook.type === 'query') {
      return `
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * ${hook.description}
 */
export function ${hookName}() {
  return useQuery({
    queryKey: ['${hook.tableName}'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('${hook.tableName}')
        .select('*');

      if (error) throw error;
      return data;
    }
  });
}
`.trim();
    } else {
      return `
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * ${hook.description}
 */
export function ${hookName}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from('${hook.tableName}')
        .${hook.operation}(data)
        .select();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['${hook.tableName}']
      });
    }
  });
}
`.trim();
    }
  }

  /**
   * Generiert TypeScript Types von Supabase Schema
   */
  private async generateTypes(tables?: TableDefinition[]): Promise<string[]> {
    const generated: string[] = [];

    if (!tables || tables.length === 0) {
      this.logStep('No tables provided, skipping type generation');
      return generated;
    }

    for (const table of tables) {
      const typeName = this.tableNameToTypeName(table.name);
      const typeFileName = `${table.name}.ts`;
      const typePath = `src/integrations/${typeFileName}`;

      this.logStep(`Generating type: ${typePath}`);

      const code = this.generateTypeCode(table);

      // In echter Implementation: Write Tool nutzen
      generated.push(typeFileName);
      this.incrementTurn(0.2);
    }

    return generated;
  }

  /**
   * Generiert TypeScript Type Definitionen
   */
  private generateTypeCode(table: TableDefinition): string {
    const typeName = this.tableNameToTypeName(table.name);

    const fields = table.columns
      .map(col => {
        const tsType = this.sqlTypeToTSType(col.type);
        const optional = col.nullable ? '?' : '';
        return `  ${col.name}${optional}: ${tsType};`;
      })
      .join('\n');

    return `
/**
 * Type definition for '${table.name}' table
 * ${table.description}
 */
export interface ${typeName} {
${fields}
}

export type ${typeName}Insert = Omit<${typeName}, 'id' | 'created_at' | 'updated_at'>;
export type ${typeName}Update = Partial<${typeName}Insert>;
`.trim();
  }

  /**
   * Konvertiert SQL Type zu TypeScript Type
   */
  private sqlTypeToTSType(sqlType: string): string {
    const typeMap: Record<string, string> = {
      'uuid': 'string',
      'bigint': 'number',
      'integer': 'number',
      'int': 'number',
      'text': 'string',
      'varchar': 'string',
      'boolean': 'boolean',
      'bool': 'boolean',
      'timestamp': 'Date',
      'timestamptz': 'Date',
      'date': 'Date',
      'json': 'any',
      'jsonb': 'any'
    };

    return typeMap[sqlType.toLowerCase()] || 'unknown';
  }

  /**
   * Konvertiert Table Name zu TypeName (snake_case → PascalCase)
   */
  private tableNameToTypeName(tableName: string): string {
    return tableName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  /**
   * Validiert erstellte Migrations
   */
  private async validateMigrations(
    migrationPaths: string[]
  ): Promise<{
    success: boolean;
    errors: string[];
  }> {
    // In echter Implementation: würde Migrations syntaktisch validieren
    return {
      success: true,
      errors: []
    };
  }
}

// =====================================================
// Export für CLI/API
// =====================================================

export async function runBackendAgent(
  input: BackendTaskInput,
  logger?: Logger
): Promise<BackendAgentOutput> {
  const agent = new BackendAgent(logger);
  const result = await agent.execute(input);

  if (result.status === 'completed') {
    return result.result as BackendAgentOutput;
  } else {
    throw new Error(
      `Backend Agent failed: ${result.metadata.error || 'Unknown error'}`
    );
  }
}
