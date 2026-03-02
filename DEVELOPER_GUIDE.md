# Developer Guide
## LA Union Skymall Property Management System

Welcome to the development team! This guide will help you get started with the codebase.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Architecture](#project-architecture)
3. [Code Style Guide](#code-style-guide)
4. [Component Guidelines](#component-guidelines)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Adding New Features](#adding-new-features)
8. [Common Patterns](#common-patterns)
9. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- Git
- Code editor (VS Code recommended)

### Initial Setup

1. **Clone repository:**
```bash
git clone https://github.com/your-org/skymall-frontend.git
cd skymall-frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment:**
```bash
cp .env.example .env
```

4. **Start development server:**
```bash
npm run dev
```

5. **Open browser:**
```
http://localhost:5173
```

### VS Code Extensions (Recommended)

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

---

## Project Architecture

### Folder Structure

```
/src
├── /app
│   ├── App.tsx              # Main app component
│   ├── routes.tsx           # Route definitions
│   │
│   ├── /components
│   │   ├── Layout.tsx       # Main layout
│   │   ├── Navbar.tsx       # Top navigation
│   │   ├── Sidebar.tsx      # Side navigation
│   │   └── /ui              # Reusable UI components
│   │
│   ├── /context
│   │   ├── AuthContext.tsx  # Authentication state
│   │   └── ThemeContext.tsx # Theme state
│   │
│   ├── /pages
│   │   ├── /admin           # Admin pages
│   │   ├── /staff           # Staff pages
│   │   └── /tenant          # Tenant pages
│   │
│   └── /services
│       ├── api.ts           # API service layer
│       └── mockData.ts      # Mock data
│
└── /styles                  # Global styles
```

### Architecture Principles

**1. Component-Based Architecture**
- Small, focused components
- Single responsibility principle
- Composition over inheritance

**2. Context for Global State**
- Authentication state in AuthContext
- Theme state in ThemeContext
- Minimal prop drilling

**3. Service Layer Pattern**
- All API calls in `/services/api.ts`
- Clear separation from UI components
- Easy to mock for testing

**4. Route-Based Code Splitting**
- Each page is a separate route
- Lazy loading ready
- Optimized bundle size

---

## Code Style Guide

### Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `UserManagement.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Styles: `kebab-case.css` (e.g., `custom-styles.css`)

**Variables:**
```typescript
// camelCase for variables and functions
const userName = "John";
function getUserData() {}

// PascalCase for components and types
function UserProfile() {}
type UserData = {};

// UPPER_CASE for constants
const API_BASE_URL = "...";
const MAX_FILE_SIZE = 5242880;
```

**Components:**
```typescript
// Use named exports for components
export function UserManagement() {
  // Component code
}

// Default export only for main App
export default App;
```

### TypeScript Guidelines

**Use explicit types:**
```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  role: 'admin' | 'staff' | 'tenant';
}

function getUser(id: string): User {
  // ...
}

// ❌ Avoid
function getUser(id) {
  // ...
}
```

**Avoid `any`:**
```typescript
// ✅ Good
interface ApiResponse {
  data: User[];
  error?: string;
}

// ❌ Avoid
function fetchData(): any {
  // ...
}
```

### React Best Practices

**Functional Components:**
```typescript
// ✅ Good
export function UserProfile({ user }: { user: User }) {
  return <div>{user.name}</div>;
}

// ❌ Avoid class components
class UserProfile extends React.Component {
  // ...
}
```

**Hooks:**
```typescript
// ✅ Good - Hooks at top level
export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    // ...
  }, []);
  
  return <div>...</div>;
}

// ❌ Avoid conditional hooks
export function UserList() {
  if (condition) {
    useState([]); // Wrong!
  }
}
```

### Tailwind CSS Guidelines

**Use Tailwind utility classes:**
```tsx
// ✅ Good
<div className="flex items-center gap-4 p-4 border rounded-lg">

// ❌ Avoid inline styles
<div style={{ display: 'flex', padding: '16px' }}>
```

**Group related classes:**
```tsx
// ✅ Good
<div className="
  flex items-center justify-between
  p-4 bg-white dark:bg-gray-900
  border rounded-lg shadow-sm
">

// Consider using cn() utility for complex conditions
<div className={cn(
  "base classes",
  isActive && "active classes",
  "more classes"
)}>
```

---

## Component Guidelines

### Component Structure

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

// DJANGO BACKEND INTEGRATION POINT
// Component-level API documentation

interface ComponentProps {
  // Props definition
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 1. Hooks
  const { user } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState();
  
  // 2. Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // 3. Event handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // 4. Render helpers
  const renderItem = (item) => {
    return <div>{item}</div>;
  };
  
  // 5. Return JSX
  return (
    <div>
      {/* Component markup */}
    </div>
  );
}
```

### Props Interface

```typescript
// ✅ Good - Explicit interface
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function UserCard({ user, onEdit, onDelete, className }: UserCardProps) {
  // ...
}

// ❌ Avoid inline types
export function UserCard({ user }: { user: any }) {
  // ...
}
```

### Component Composition

```typescript
// ✅ Good - Composition
export function UserManagementPage() {
  return (
    <Layout role="admin">
      <PageHeader title="User Management" />
      <UserFilters />
      <UserTable />
    </Layout>
  );
}

// ❌ Avoid monolithic components
export function UserManagementPage() {
  return (
    <div>
      {/* 500 lines of JSX */}
    </div>
  );
}
```

---

## State Management

### Local State (useState)

Use for:
- Form inputs
- UI state (modals, dropdowns)
- Component-specific data

```typescript
export function UserForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  
  const handleSubmit = () => {
    // Use formData
  };
}
```

### Context (useContext)

Use for:
- Authentication state
- Theme preferences
- Global app settings

```typescript
// Context definition
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Usage in components
const { user } = useAuth();
```

### Server State (API Data)

```typescript
export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchUsers() {
      try {
        setIsLoading(true);
        // DJANGO BACKEND INTEGRATION POINT
        // const response = await userAPI.getUsers();
        const response = mockUsers; // Mock for now
        setUsers(response);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUsers();
  }, []);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{/* Render users */}</div>;
}
```

---

## API Integration

### Adding a New API Endpoint

**Step 1:** Define in `/src/app/services/api.ts`

```typescript
export const newModuleAPI = {
  // GET /api/new-module/items/
  // Response: { count: number, results: Item[] }
  getItems: async (params?: { search?: string; page?: number }) => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiRequest(`/new-module/items/?${queryString}`);
  },
  
  // POST /api/new-module/items/
  // Request: Item data object
  // Response: Created Item object
  createItem: async (itemData: any) => {
    return apiRequest('/new-module/items/', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },
};
```

**Step 2:** Use in component

```typescript
import api from '../services/api';

export function ItemList() {
  const [items, setItems] = useState([]);
  
  useEffect(() => {
    async function fetchItems() {
      try {
        const response = await api.newModule.getItems();
        setItems(response.results);
      } catch (error) {
        console.error('Failed to fetch items:', error);
      }
    }
    
    fetchItems();
  }, []);
  
  return <div>{/* Render items */}</div>;
}
```

### Error Handling

```typescript
async function handleSubmit() {
  try {
    setIsLoading(true);
    await api.users.createUser(formData);
    toast.success('User created successfully');
    navigate('/admin/users');
  } catch (error) {
    if (error.response?.status === 400) {
      toast.error('Invalid data provided');
    } else if (error.response?.status === 401) {
      toast.error('Unauthorized');
      navigate('/');
    } else {
      toast.error('An error occurred. Please try again.');
    }
  } finally {
    setIsLoading(false);
  }
}
```

---

## Adding New Features

### Adding a New Page

**Step 1:** Create page component

```typescript
// /src/app/pages/admin/NewFeature.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';

export function NewFeature() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);
  
  return (
    <Layout role="admin">
      <div>
        <h1>New Feature</h1>
        {/* Feature content */}
      </div>
    </Layout>
  );
}
```

**Step 2:** Add route in `/src/app/routes.tsx`

```typescript
import { NewFeature } from './pages/admin/NewFeature';

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      // ... existing routes
      { path: "admin/new-feature", Component: NewFeature },
    ],
  },
]);
```

**Step 3:** Add navigation in `/src/app/components/Sidebar.tsx`

```typescript
const adminMenuItems = [
  // ... existing items
  { icon: NewIcon, label: 'New Feature', path: '/admin/new-feature' },
];
```

### Adding a New UI Component

**Step 1:** Create component in `/src/app/components/ui/`

```typescript
// /src/app/components/ui/custom-button.tsx
import * as React from "react";
import { cn } from "./utils";

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function CustomButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: CustomButtonProps) {
  return (
    <button
      className={cn(
        "rounded font-medium",
        variant === 'primary' && "bg-blue-600 text-white",
        variant === 'secondary' && "bg-gray-200 text-gray-900",
        size === 'sm' && "px-2 py-1 text-sm",
        size === 'md' && "px-4 py-2",
        size === 'lg' && "px-6 py-3 text-lg",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

**Step 2:** Use in pages

```typescript
import { CustomButton } from '../components/ui/custom-button';

<CustomButton variant="primary" size="lg" onClick={handleClick}>
  Click Me
</CustomButton>
```

---

## Common Patterns

### Data Fetching Pattern

```typescript
export function DataFetchingComponent() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await api.getData();
        
        if (!cancelled) {
          setData(response);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    
    fetchData();
    
    return () => {
      cancelled = true;
    };
  }, []);
  
  // Render logic
}
```

### Form Handling Pattern

```typescript
export function FormComponent() {
  const [formData, setFormData] = useState({
    field1: '',
    field2: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.field1) {
      newErrors.field1 = 'Field 1 is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      setIsSubmitting(true);
      await api.submitForm(formData);
      toast.success('Form submitted successfully');
    } catch (error) {
      toast.error('Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Input
        name="field1"
        value={formData.field1}
        onChange={handleChange}
        error={errors.field1}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}
```

### Modal Pattern

```typescript
export function ModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Open Modal
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modal Title</DialogTitle>
          </DialogHeader>
          <div>{/* Modal content */}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAction}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

---

## Troubleshooting

### Common Issues

**Issue: Component not updating**
```typescript
// ✅ Solution: Use functional updates
setCount(prev => prev + 1);

// ❌ Avoid: Direct state updates
count = count + 1;
```

**Issue: useEffect running infinitely**
```typescript
// ✅ Solution: Add dependencies
useEffect(() => {
  fetchData();
}, [id]); // Only re-run when id changes

// ❌ Avoid: Missing dependencies
useEffect(() => {
  fetchData(id);
}); // Runs on every render!
```

**Issue: Type errors**
```typescript
// ✅ Solution: Define proper types
interface User {
  id: string;
  name: string;
}

const user: User = { id: '1', name: 'John' };

// ❌ Avoid: Using any
const user: any = { ... };
```

---

## Git Workflow

### Branch Naming

- `feature/user-management` - New features
- `bugfix/login-error` - Bug fixes
- `hotfix/security-patch` - Urgent fixes
- `refactor/api-service` - Code refactoring

### Commit Messages

```
feat: Add user management page
fix: Resolve login authentication issue
docs: Update API documentation
style: Format code with Prettier
refactor: Simplify state management
test: Add unit tests for UserCard
chore: Update dependencies
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Manual testing completed
- [ ] Browser testing completed
- [ ] Mobile testing completed

## Screenshots
(if applicable)
```

---

## Performance Tips

**1. Memoization:**
```typescript
import { useMemo, useCallback } from 'react';

const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

**2. Code Splitting:**
```typescript
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
```

**3. Avoid Unnecessary Renders:**
```typescript
export const UserCard = React.memo(({ user }) => {
  return <div>{user.name}</div>;
});
```

---

## Resources

- **React Docs:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com
- **Radix UI:** https://radix-ui.com
- **TypeScript:** https://www.typescriptlang.org

---

## Support

For development questions:
- **Email:** dev@launionskymall.com
- **Slack:** #skymall-dev

Happy coding! 🚀
