# Space Hub Frontend

Modern, type-safe Next.js frontend for the Space Hub commercial property rental platform.

## 🚀 Features

- **Type-Safe**: Full TypeScript implementation with strict type checking
- **Animated UI**: Smooth animations with Framer Motion
- **Responsive**: Mobile-first design with Tailwind CSS
- **Bilingual**: English/Kiswahili language support
- **State Management**: Zustand for global state
- **Form Validation**: React Hook Form with Zod schemas
- **API Integration**: Type-safe API client with error handling
- **Modern Stack**: Next.js 14, React 18, TypeScript 5

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion 11
- **State**: Zustand 5
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 🛠️ Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Update .env.local with your API URL and Google Maps key
```

## 🏃 Development

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type check
pnpm type-check

# Lint
pnpm lint
```

## 📁 Project Structure

```
space-hub-frontend/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Homepage
│   ├── listings/            # Property listings pages
│   ├── properties/          # Property detail pages
│   └── dashboard/           # Owner dashboard pages
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Badge.tsx
│   ├── layout/              # Layout components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── property/            # Property-specific components
│       ├── PropertyCard.tsx
│       ├── PropertyFilters.tsx
│       └── PropertyMap.tsx
├── lib/
│   ├── api-client.ts        # Type-safe API client
│   ├── utils.ts             # Utility functions
│   └── store/               # Zustand stores
│       ├── auth-store.ts
│       └── language-store.ts
├── types/
│   └── index.ts             # TypeScript type definitions
├── styles/
│   └── globals.css          # Global styles
├── public/                  # Static assets
└── tailwind.config.ts       # Tailwind configuration
```

## 🎨 Design System

### Colors

```typescript
// Brand Colors
primary: #2D5F5D    // Deep Teal
secondary: #F4A261  // Warm Orange
accent: #E76F51     // Coral

// Neutral Colors
bg: #FAFAFA         // Off-white
surface: #FFFFFF    // Pure white
text-primary: #1A1A1A
text-secondary: #6B6B6B
border: #E0E0E0

// Status Colors
success: #2A9D8F
warning: #F4A261
error: #E76F51
info: #264653
```

### Typography

```typescript
H1: 36px / 44px, 700
H2: 28px / 36px, 600
H3: 22px / 30px, 600
Body: 16px / 24px, 400
Small: 14px / 20px, 400
Tiny: 12px / 18px, 500
```

### Spacing (8px base)

```typescript
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
3xl: 64px
```

## 🔧 Component Usage

### Button

```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="md" isLoading={false}>
  Click Me
</Button>
```

### Input

```tsx
import { Input } from '@/components/ui/Input';

<Input
  label="Email"
  type="email"
  error={errors.email?.message}
  leftIcon={<Mail />}
/>
```

### Property Card

```tsx
import { PropertyCard } from '@/components/property/PropertyCard';

<PropertyCard
  property={property}
  onClick={(p) => router.push(`/properties/${p.id}`)}
  onContact={(p) => console.log('Contact', p)}
/>
```

## 🌐 API Integration

### Using API Client

```typescript
import { apiClient } from '@/lib/api-client';
import type { Property, PaginatedResponse } from '@/types';

// GET request
const response = await apiClient.get<PaginatedResponse<Property>>(
  '/properties'
);

// POST request
const response = await apiClient.post<Property>(
  '/properties',
  propertyData
);

// File upload
await apiClient.uploadFiles(
  '/properties/images',
  files,
  (progress) => console.log(`${progress}%`)
);
```

## 🗂️ State Management

### Authentication Store

```typescript
import { useAuthStore } from '@/lib/store/auth-store';

const { user, isAuthenticated, login, logout } = useAuthStore();

await login(email, password);
```

### Language Store

```typescript
import { useLanguageStore } from '@/lib/store/language-store';

const { language, setLanguage, t } = useLanguageStore();

const title = t('home.hero_title');
setLanguage('sw');
```

## 🎭 Animations

### Framer Motion Examples

```tsx
import { motion } from 'framer-motion';

// Fade in animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// Hover animation
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Hover Me
</motion.button>

// Stagger children
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

<motion.div variants={container} initial="hidden" animate="visible">
  {items.map(item => <motion.div key={item.id} variants={itemVariant} />)}
</motion.div>
```

## 📱 Responsive Design

All components are mobile-first and responsive:

```typescript
// Tailwind breakpoints
sm: 640px
md: 768px
lg: 1024px
xl: 1280px

// Usage
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

## 🔒 Type Safety

### Using Types

```typescript
import type { Property, PropertyFormData, SearchFilters } from '@/types';

// Component props
interface PropertyListProps {
  properties: Property[];
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
}

// API response
const response = await apiClient.get<PaginatedResponse<Property>>(
  '/properties'
);
if (response.success && response.data) {
  const properties = response.data.data; // Type-safe
}
```

## 🌍 Internationalization

Translations are managed in the language store:

```typescript
// Adding translations
const translations = {
  en: {
    common: {
      search: 'Search',
      filter: 'Filter',
    },
  },
  sw: {
    common: {
      search: 'Tafuta',
      filter: 'Chuja',
    },
  },
};

// Using translations
const searchText = t('common.search');
```

## 🧪 Best Practices

1. **Type Safety**: Always use TypeScript interfaces and types
2. **Components**: Keep components small and focused
3. **Animations**: Use Framer Motion for smooth transitions
4. **Styling**: Use Tailwind utility classes, extract common patterns
5. **State**: Use Zustand for global state, local state for UI
6. **Forms**: Use React Hook Form with Zod validation
7. **API**: Type all API responses and handle errors gracefully
8. **Accessibility**: Include ARIA labels and keyboard navigation

## 🚧 Development Guidelines

### Adding a New Component

1. Create component in appropriate directory
2. Add TypeScript interfaces for props
3. Implement with Framer Motion animations
4. Style with Tailwind classes
5. Export from component directory

### Adding a New Page

1. Create in `app/` directory
2. Add to navigation if needed
3. Implement with proper TypeScript types
4. Add SEO metadata
5. Test responsive layout

## 📈 Performance

- Image optimization with Next.js Image component
- Lazy loading for routes and components
- API response caching
- Debounced search inputs
- Code splitting by route

## 🔐 Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
NEXT_PUBLIC_APP_NAME=Space Hub
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📄 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with TypeScript types
4. Test thoroughly
5. Submit a pull request

## 🐛 Known Issues

None currently. Report issues on GitHub.

## 🗺️ Roadmap

- [ ] Property comparison feature
- [ ] Advanced map filters
- [ ] Real-time notifications
- [ ] Property reviews system
- [ ] Saved searches
- [ ] Mobile app (React Native)

## 📞 Support

For support, email: hello@spacehub.ke
