/**
 * Frontend Agent Tools Definition
 * File-basierte Tools für React Component Generierung
 */

import { Tool, ToolType } from '../shared/types';
import { z } from 'zod';

// =====================================================
// File Discovery Tools
// =====================================================

export const globFilesTool: Tool = {
  name: 'Glob',
  type: ToolType.FILE,
  description: 'Find files matching a glob pattern (e.g., src/components/**/*.tsx)',
  schema: z.object({
    pattern: z.string().describe('Glob pattern'),
    path: z.string().optional().describe('Search path')
  }),
  handler: async (input: any) => {
    console.log(`[Glob] Finding files matching: ${input.pattern}`);
    return {
      success: true,
      files: []
    };
  }
};

// =====================================================
// File Reading Tool
// =====================================================

export const readFileTool: Tool = {
  name: 'Read',
  type: ToolType.FILE,
  description: 'Read file contents',
  schema: z.object({
    file_path: z.string().describe('Path to file'),
    limit: z.number().optional().describe('Line limit')
  }),
  handler: async (input: any) => {
    console.log(`[Read] Reading file: ${input.file_path}`);
    return {
      success: true,
      content: ''
    };
  }
};

// =====================================================
// File Writing Tool
// =====================================================

export const writeFileTool: Tool = {
  name: 'Write',
  type: ToolType.FILE,
  description: 'Write to a file',
  schema: z.object({
    file_path: z.string().describe('Path to file'),
    content: z.string().describe('File content')
  }),
  handler: async (input: any) => {
    console.log(`[Write] Creating file: ${input.file_path}`);
    return {
      success: true,
      message: `File created: ${input.file_path}`
    };
  }
};

// =====================================================
// File Editing Tool
// =====================================================

export const editFileTool: Tool = {
  name: 'Edit',
  type: ToolType.FILE,
  description: 'Edit file contents',
  schema: z.object({
    file_path: z.string().describe('Path to file'),
    old_string: z.string().describe('String to replace'),
    new_string: z.string().describe('Replacement string')
  }),
  handler: async (input: any) => {
    console.log(`[Edit] Modifying file: ${input.file_path}`);
    return {
      success: true,
      message: `File edited: ${input.file_path}`
    };
  }
};

// =====================================================
// Search Tool (Grep)
// =====================================================

export const grepTool: Tool = {
  name: 'Grep',
  type: ToolType.FILE,
  description: 'Search for patterns in files',
  schema: z.object({
    pattern: z.string().describe('Search pattern (regex)'),
    path: z.string().optional().describe('Search path'),
    type: z.string().optional().describe('File type to search (e.g., tsx, ts)')
  }),
  handler: async (input: any) => {
    console.log(`[Grep] Searching for pattern: ${input.pattern}`);
    return {
      success: true,
      matches: []
    };
  }
};

// =====================================================
// UI Component Helper Tool
// =====================================================

export const shadcnComponentTool: Tool = {
  name: 'Shadcn.GetComponent',
  type: ToolType.INTEGRATION,
  description: 'Get information about a shadcn/ui component',
  schema: z.object({
    component: z.enum([
      'Button',
      'Card',
      'Dialog',
      'Input',
      'Select',
      'Form',
      'Table',
      'Sheet',
      'Tabs',
      'Dropdown',
      'Badge',
      'Toast',
      'Avatar'
    ]).describe('Component name from shadcn/ui'),
    action: z.enum(['get-props', 'get-usage', 'get-import']).describe('What to retrieve')
  }),
  handler: async (input: any) => {
    const componentInfo: Record<string, any> = {
      'Button': {
        import: "import { Button } from '@/components/ui/button'",
        props: ['variant', 'size', 'disabled', 'onClick'],
        usage: '<Button>Click me</Button>'
      },
      'Card': {
        import: "import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'",
        props: ['children'],
        usage: '<Card><CardHeader><CardTitle>Title</CardTitle></CardHeader><CardContent>Content</CardContent></Card>'
      },
      'Dialog': {
        import: "import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'",
        props: ['open', 'onOpenChange'],
        usage: '<Dialog><DialogTrigger>Open</DialogTrigger><DialogContent><DialogHeader><DialogTitle>Title</DialogTitle></DialogHeader></DialogContent></Dialog>'
      }
    };

    const component = componentInfo[input.component] || { import: '', props: [], usage: '' };

    return {
      success: true,
      component: input.component,
      info: component
    };
  }
};

// =====================================================
// UI Pattern Validator Tool
// =====================================================

export const validateUIPatternTool: Tool = {
  name: 'UIPattern.Validate',
  type: ToolType.INTEGRATION,
  description: 'Validate a component against UI patterns',
  schema: z.object({
    filePath: z.string().describe('Path to component file'),
    patterns: z.array(z.string()).optional().describe('Specific patterns to check')
  }),
  handler: async (input: any) => {
    console.log(`[UIPattern] Validating: ${input.filePath}`);
    return {
      success: true,
      filePath: input.filePath,
      issues: [],
      compliant: true
    };
  }
};

// =====================================================
// Component Template Tool
// =====================================================

export const componentTemplateTool: Tool = {
  name: 'Template.GetComponent',
  type: ToolType.INTEGRATION,
  description: 'Get a component template scaffold',
  schema: z.object({
    type: z.enum(['card', 'list', 'form', 'dialog', 'page', 'hook']).describe('Template type'),
    name: z.string().describe('Component/hook name'),
    withTypescript: z.boolean().optional().default(true)
  }),
  handler: async (input: any) => {
    const templates: Record<string, string> = {
      'card': `export function ${input.name}() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>${input.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  );
}`,
      'form': `export function ${input.name}() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Submit logic
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
      <Button type="submit" disabled={loading}>Submit</Button>
    </form>
  );
}`,
      'page': `export default function ${input.name}() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">${input.name}</h1>
        <p className="text-muted-foreground">Description</p>
      </div>
      {/* Page content */}
    </div>
  );
}`,
      'hook': `import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function ${input.name}() {
  return useQuery({
    queryKey: ['key'],
    queryFn: async () => {
      const { data, error } = await supabase.from('table').select('*');
      if (error) throw error;
      return data;
    }
  });
}`
    };

    return {
      success: true,
      template: templates[input.type] || '',
      type: input.type,
      name: input.name
    };
  }
};

// =====================================================
// Import Organizer Tool
// =====================================================

export const organizeImportsTool: Tool = {
  name: 'Code.OrganizeImports',
  type: ToolType.INTEGRATION,
  description: 'Organize and validate imports in a file',
  schema: z.object({
    filePath: z.string().describe('Path to file'),
    autoFix: z.boolean().optional().default(true)
  }),
  handler: async (input: any) => {
    console.log(`[Imports] Organizing: ${input.filePath}`);
    return {
      success: true,
      filePath: input.filePath,
      organized: true,
      missingImports: []
    };
  }
};

// =====================================================
// Bash Command Tool
// =====================================================

export const bashTool: Tool = {
  name: 'Bash',
  type: ToolType.RUNTIME,
  description: 'Execute shell commands',
  schema: z.object({
    command: z.string().describe('Command to execute'),
    cwd: z.string().optional().describe('Working directory')
  }),
  handler: async (input: any) => {
    console.log(`[Bash] Executing: ${input.command}`);
    return {
      success: true,
      output: '',
      exitCode: 0
    };
  }
};

// =====================================================
// Export Tool List
// =====================================================

export const frontendAgentTools: Tool[] = [
  globFilesTool,
  readFileTool,
  writeFileTool,
  editFileTool,
  grepTool,
  shadcnComponentTool,
  validateUIPatternTool,
  componentTemplateTool,
  organizeImportsTool,
  bashTool
];
