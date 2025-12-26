---
name: react-state-management
description: Master modern React state management with Redux Toolkit, Zustand, Jotai, and React Query. Use when setting up global state, managing server state, or choosing between state management solutions.
version: 1.0.0
---

# React State Management

Comprehensive guide to modern React state management patterns, from local component state to global stores and server state synchronization.

## When to Use This Skill

- Setting up global state management in a React app
- Choosing between Redux Toolkit, Zustand, or Jotai
- Managing server state with React Query or SWR
- Implementing optimistic updates
- Debugging state-related issues
- Migrating from legacy Redux to modern patterns

## State Categories

| Type | Description | Solutions |
|------|-------------|-----------|
| **Local State** | Component-specific | useState, useReducer |
| **Global State** | Shared across components | Redux Toolkit, Zustand, Jotai |
| **Server State** | Remote data, caching | React Query, SWR, RTK Query |
| **URL State** | Route parameters | React Router, nuqs |
| **Form State** | Input values | React Hook Form, Formik |

## Selection Criteria

```
Small app, simple state → Zustand or Jotai
Large app, complex state → Redux Toolkit
Heavy server interaction → React Query + light client state
Atomic/granular updates → Jotai
```

## Zustand (Simplest)

```typescript
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface AppState {
  user: User | null
  theme: 'light' | 'dark'
  setUser: (user: User | null) => void
  toggleTheme: () => void
}

export const useStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        theme: 'light',
        setUser: (user) => set({ user }),
        toggleTheme: () => set((s) => ({
          theme: s.theme === 'light' ? 'dark' : 'light'
        })),
      }),
      { name: 'app-storage' }
    )
  )
)
```

## Redux Toolkit

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const userSlice = createSlice({
  name: 'user',
  initialState: { current: null, status: 'idle' },
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.current = action.payload
    },
  },
})
```

## Jotai (Atomic)

```typescript
import { atom } from 'jotai'

export const userAtom = atom<User | null>(null)
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null)
```

## React Query for Server State

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const userKeys = {
  all: ['users'] as const,
  detail: (id: string) => [...userKeys.all, id] as const,
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) })
    },
  })
}
```

## Best Practices

### Do's
- **Colocate state** - Keep state close to where it's used
- **Use selectors** - Prevent unnecessary re-renders
- **Normalize data** - Flatten nested structures
- **Type everything** - Full TypeScript coverage
- **Separate concerns** - Server state vs client state

### Don'ts
- **Don't over-globalize** - Not everything needs global state
- **Don't duplicate server state** - Let React Query manage it
- **Don't mutate directly** - Always use immutable updates
- **Don't store derived data** - Compute it instead
