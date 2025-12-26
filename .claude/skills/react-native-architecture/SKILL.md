---
name: react-native-architecture
description: Build production React Native apps with Expo, navigation, native modules, offline sync, and cross-platform patterns. Use when developing mobile apps, implementing native integrations, or architecting React Native projects.
version: 1.0.0
---

# React Native Architecture

Production-ready patterns for React Native development with Expo, including navigation, state management, native modules, and offline-first architecture.

## When to Use This Skill

- Starting a new React Native or Expo project
- Implementing complex navigation patterns
- Integrating native modules and platform APIs
- Building offline-first mobile applications
- Optimizing React Native performance
- Setting up CI/CD for mobile releases

## Project Structure

```
src/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Auth group
│   ├── (tabs)/            # Tab navigation
│   └── _layout.tsx        # Root layout
├── components/
│   ├── ui/                # Reusable UI components
│   └── features/          # Feature-specific components
├── hooks/                 # Custom hooks
├── services/              # API and native services
├── stores/                # State management
└── types/                 # TypeScript types
```

## Quick Start

```bash
npx create-expo-app@latest my-app -t expo-template-blank-typescript
npx expo install expo-router react-native-safe-area-context
```

## Expo Router Navigation

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router'

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  )
}

// Navigation
import { router } from 'expo-router'
router.push('/profile/123')
router.replace('/login')
router.back()
```

## Authentication Flow

```typescript
// providers/AuthProvider.tsx
import { useRouter, useSegments } from 'expo-router'
import * as SecureStore from 'expo-secure-store'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)'
    if (!user && !inAuthGroup) router.replace('/login')
    else if (user && inAuthGroup) router.replace('/(tabs)')
  }, [user, segments])

  // ...
}
```

## Offline-First with React Query

```typescript
import { QueryClient } from '@tanstack/react-query'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { onlineManager } from '@tanstack/react-query'

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected)
  })
})
```

## Native Module Integration

```typescript
// Haptics
import * as Haptics from 'expo-haptics'
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

// Biometrics
import * as LocalAuthentication from 'expo-local-authentication'
const result = await LocalAuthentication.authenticateAsync()

// Push Notifications
import * as Notifications from 'expo-notifications'
const token = await Notifications.getExpoPushTokenAsync()
```

## Performance Optimization

```typescript
// Use FlashList for long lists
import { FlashList } from '@shopify/flash-list'

// Memoize components
const ProductItem = memo(function ProductItem({ item, onPress }) {
  return <Pressable onPress={() => onPress(item.id)}>...</Pressable>
})

// Use Reanimated for animations
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
```

## EAS Build & Submit

```bash
eas build --platform ios --profile production
eas submit --platform ios
eas update --branch production --message "Bug fixes"
```

## Best Practices

### Do's
- **Use Expo** - Faster development, OTA updates
- **FlashList over FlatList** - Better performance
- **Memoize components** - Prevent re-renders
- **Use Reanimated** - 60fps animations
- **Test on real devices**

### Don'ts
- **Don't inline styles** - Use StyleSheet.create
- **Don't fetch in render** - Use useEffect/React Query
- **Don't ignore platform differences**
- **Don't store secrets in code**
