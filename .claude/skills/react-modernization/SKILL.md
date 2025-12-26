---
name: react-modernization
description: Upgrade React applications to latest versions, migrate from class components to hooks, and adopt concurrent features. Use when modernizing React codebases, migrating to React Hooks, or upgrading to latest React versions.
version: 1.0.0
---

# React Modernization

Master React version upgrades, class to hooks migration, concurrent features adoption, and codemods for automated transformation.

## When to Use This Skill

- Upgrading React applications to latest versions
- Migrating class components to functional components with hooks
- Adopting concurrent React features (Suspense, transitions)
- Applying codemods for automated refactoring
- Modernizing state management patterns
- Updating to TypeScript
- Improving performance with React 18+ features

## Version Upgrade Path

### Breaking Changes by Version

**React 17:**
- Event delegation changes
- No event pooling
- Effect cleanup timing
- JSX transform (no React import needed)

**React 18:**
- Automatic batching
- Concurrent rendering
- Strict Mode changes (double invocation)
- New root API
- Suspense on server

## Class to Hooks Migration

### State Management
```javascript
// Before: Class component
class Counter extends React.Component {
  state = { count: 0 };
  increment = () => this.setState({ count: this.state.count + 1 });
  render() {
    return <button onClick={this.increment}>{this.state.count}</button>;
  }
}

// After: Functional component with hooks
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Lifecycle Methods to Hooks
```javascript
// Before: componentDidMount, componentDidUpdate, componentWillUnmount
// After: useEffect

useEffect(() => {
  fetchData();
  return () => cleanup(); // componentWillUnmount
}, [dependency]); // componentDidUpdate when dependency changes
```

## React 18 Concurrent Features

### New Root API
```javascript
// Before: React 17
ReactDOM.render(<App />, document.getElementById('root'));

// After: React 18
const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

### Transitions
```javascript
import { useState, useTransition } from 'react';

function SearchResults() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    setQuery(e.target.value); // Urgent
    startTransition(() => {
      setResults(searchResults(e.target.value)); // Non-urgent
    });
  };

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <Results />
    </>
  );
}
```

### Suspense for Data Fetching
```javascript
function ProfilePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProfileDetails />
      <Suspense fallback={<Loading />}>
        <ProfileTimeline />
      </Suspense>
    </Suspense>
  );
}
```

## Codemods

```bash
# Rename UNSAFE_ methods
npx react-codeshift --transform=rename-unsafe-lifecycles.js src/

# Update to new JSX Transform (React 17+)
npx react-codeshift --transform=new-jsx-transform.js src/
```

## Migration Checklist

### Pre-Migration
- [ ] Update dependencies incrementally
- [ ] Review breaking changes in release notes
- [ ] Set up testing suite
- [ ] Create feature branch

### Class → Hooks Migration
- [ ] Start with leaf components (no children)
- [ ] Convert state to useState
- [ ] Convert lifecycle to useEffect
- [ ] Extract custom hooks
- [ ] Test thoroughly

### React 18 Upgrade
- [ ] Update to React 17 first (if needed)
- [ ] Change to createRoot API
- [ ] Test with StrictMode (double invocation)
- [ ] Adopt Suspense/Transitions where beneficial

## Best Practices

1. **Incremental Migration**: Don't migrate everything at once
2. **Test Thoroughly**: Comprehensive testing at each step
3. **Use Codemods**: Automate repetitive transformations
4. **Leverage StrictMode**: Catch issues early
5. **Monitor Performance**: Measure before and after

## Common Pitfalls

- Forgetting useEffect dependencies
- Over-using useMemo/useCallback
- Not handling cleanup in useEffect
- Ignoring StrictMode warnings
