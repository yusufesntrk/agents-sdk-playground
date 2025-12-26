---
name: typescript-write
description: Write TypeScript and JavaScript code following coding standards and best practices. Use when developing or refactoring TypeScript/JavaScript code.
version: 1.0.0
---

# TypeScript/JavaScript Development Skill

## Development Workflow

- Do not attempt to read or edit files outside the project folder
- Add failing tests first, then fix them
- Work autonomously in small, testable increments
- Run targeted tests and lint continuously during development
- Prioritize understanding existing patterns before implementing
- Don't commit changes, leave it for the user to review and make commits

## Commands

### Linting and Formatting

- **Lint:** `yarn lint-eslint-pure` - Run ESLint on the codebase
- **Format:** `yarn prettier` - Format code using Prettier
- **Type Check:** `yarn type-check-pure` - Run TypeScript type checking

### Testing

- **Test a specific file:** `yarn test-unit path/to/file.unit.spec.js`
- **Test by pattern:** `yarn test-unit -t "pattern"` - Runs tests matching pattern

## TypeScript Best Practices

### Type Definitions

```typescript
// Prefer interfaces for objects
interface User {
  id: string;
  name: string;
  email: string;
}

// Use types for unions and complex types
type Status = 'pending' | 'active' | 'inactive';

// Avoid any - use unknown for truly unknown types
function parseJSON(json: string): unknown {
  return JSON.parse(json);
}
```

### Function Patterns

```typescript
// Use explicit return types for public functions
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Use arrow functions for callbacks
const activeUsers = users.filter((user) => user.isActive);

// Destructure parameters when appropriate
function createUser({ name, email }: CreateUserParams): User {
  return { id: generateId(), name, email };
}
```

### Error Handling

```typescript
// Use Result type for expected errors
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// Use try/catch for unexpected errors
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw new UserNotFoundError(id);
  }
}
```

### React Patterns

```typescript
// Properly type component props
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return (
    <button className={styles[variant]} onClick={onClick}>
      {children}
    </button>
  );
}

// Use proper hook patterns
function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const data = await fetchUser(id);
      if (!cancelled) {
        setUser(data);
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  return { user, loading };
}
```

## Code Organization

### File Structure

```
src/
├── components/     # React components
│   ├── ui/        # Generic UI components
│   └── features/  # Feature-specific components
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── types/         # TypeScript types
└── services/      # API and external services
```

### Naming Conventions

- **Files:** `kebab-case.ts` or `PascalCase.tsx` for components
- **Functions:** `camelCase`
- **Types/Interfaces:** `PascalCase`
- **Constants:** `SCREAMING_SNAKE_CASE`

## Testing

### Unit Test Pattern

```typescript
describe('calculateTotal', () => {
  it('returns 0 for empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('sums all item prices', () => {
    const items = [
      { id: '1', price: 10 },
      { id: '2', price: 20 },
    ];
    expect(calculateTotal(items)).toBe(30);
  });
});
```

### Component Test Pattern

```typescript
describe('Button', () => {
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```
