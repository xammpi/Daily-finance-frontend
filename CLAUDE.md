# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Daily Finance Frontend — modern, responsive web application for tracking daily expenses and income. This frontend connects to the Daily Finance Backend REST API, providing an intuitive interface for managing transactions, categories, accounts, budgets, and recurring payments.

### Key Features
- User authentication (JWT-based login/registration)
- Dashboard with financial overview and analytics
- Transaction management (create, edit, delete expenses/income)
- Category management with hierarchical organization
- Multiple account management (bank cards, cash, etc.)
- Real-time account balance tracking
- Responsive design (mobile, tablet, desktop)

### Planned Features
- Budget tracking and alerts
- Recurring transaction management
- Advanced analytics and charts
- CSV export functionality
- Receipt image uploads
- Multi-currency support
- Dark mode theme

## Development Commands

### Setup
```bash
# Clone repository
git clone https://github.com/xammpi/Daily-finance-frontend.git
cd daily-finance-frontend

# Install dependencies
npm install

# Create environment configuration (already exists in project)
# .env.local is already configured, edit if needed
```

### Running the Application
```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Format code with Prettier
npm run format
```

The development server runs on http://localhost:3000

## Architecture

### Technology Stack (Implemented)
| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | React 18+ | UI framework |
| Language | TypeScript | Type safety |
| Build Tool | Vite 7 | Fast builds and HMR |
| Routing | React Router v6 | Client-side routing |
| State Management | Zustand | Global state management |
| API Client | Axios | HTTP requests |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| Code Quality | ESLint + Prettier | Linting & formatting |

### Project Structure (Current Implementation)
```
src/
├── api/                    # API client and endpoints
│   ├── client.ts          # Axios client with JWT interceptors ✅
│   ├── auth.ts            # Authentication API (login, register) ✅
│   ├── transactions.ts    # Transaction CRUD operations ✅
│   ├── categories.ts      # Category management API ✅
│   └── accounts.ts        # Account management API ✅
├── assets/                # Static assets (empty for now)
├── components/            # Reusable components
│   ├── ui/               # UI components (to be added)
│   ├── layouts/          # Layout components (to be added)
│   └── common/           # Common components (to be added)
├── features/             # Feature-based modules
│   ├── auth/             # Authentication pages ✅
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── dashboard/        # Dashboard ✅
│   │   └── DashboardPage.tsx
│   ├── transactions/     # Transaction pages (to be added)
│   ├── categories/       # Category pages (to be added)
│   └── accounts/         # Account pages (to be added)
├── hooks/                # Custom React hooks
│   └── useAuth.ts        # Authentication hook wrapper ✅
├── lib/                  # Utilities (to be added as needed)
├── routes/               # Route definitions
│   └── ProtectedRoute.tsx # Auth guard component ✅
├── store/                # Zustand stores
│   └── authStore.ts      # Authentication state ✅
├── types/                # TypeScript type definitions
│   └── index.ts          # All shared types ✅
├── App.tsx               # Root component with routing ✅
├── main.tsx              # Application entry point ✅
├── index.css             # Global styles with Tailwind ✅
└── vite-env.d.ts         # Vite environment types ✅
```

### Important Files
- `src/api/client.ts` - Axios client configured with JWT token interceptors
- `src/store/authStore.ts` - Zustand store for authentication state
- `src/routes/ProtectedRoute.tsx` - Route guard requiring authentication
- `src/types/index.ts` - TypeScript interfaces matching backend API models

### Backend API Integration

**Base URL:** `http://localhost:8080/api/v1` (configurable via environment variables)

**Authentication Flow:**
1. User submits login credentials
2. Frontend sends POST to `/auth/login`
3. Backend returns JWT token
4. Frontend stores token (localStorage/sessionStorage/cookies)
5. All subsequent requests include `Authorization: Bearer {token}` header
6. On 401 response, redirect to login page

**Available API Endpoints:**

Authentication (Public):
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and receive JWT token

Transactions (Authenticated):
- `GET /transactions` - List transactions (supports pagination)
- `POST /transactions` - Create transaction
- `GET /transactions/{id}` - Get transaction details
- `PUT /transactions/{id}` - Update transaction
- `DELETE /transactions/{id}` - Delete transaction

Categories (Authenticated):
- `GET /categories` - List all user categories
- `POST /categories` - Create category
- `GET /categories/{id}` - Get category details
- `PUT /categories/{id}` - Update category
- `DELETE /categories/{id}` - Delete category

Accounts (Authenticated):
- `GET /accounts` - List all user accounts
- `POST /accounts` - Create account
- `GET /accounts/{id}` - Get account details
- `PUT /accounts/{id}` - Update account
- `DELETE /accounts/{id}` - Delete account

**API Documentation:** http://localhost:8080/swagger-ui.html

### Key Implementation Patterns

**1. API Client Setup**
```typescript
// Example with Axios
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**2. Protected Routes**
```typescript
// Require authentication for specific routes
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  return isAuthenticated ? children : <Navigate to="/login" />;
};
```

**3. Form Validation**
- Client-side validation before API calls
- Match backend validation rules (see backend's `messages.properties`)
- Display server-side validation errors from API responses

**4. Error Handling**
- Display user-friendly error messages
- Handle network errors gracefully
- Show loading states during API calls
- Implement retry logic for failed requests

**5. State Management Strategy**
- Use local state for component-specific data
- Use global state for user auth, theme preferences
- Use TanStack Query (React Query) for server state caching
- Optimistic updates for better UX

## Important Notes

### Environment Configuration
Create `.env.local` with the following variables:
```bash
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_APP_NAME=Daily Finance
VITE_ENABLE_ANALYTICS=false
```

**Never commit** `.env.local` — add to `.gitignore`

### Authentication & Security
- Store JWT token securely (consider httpOnly cookies for production)
- Implement token refresh mechanism if backend supports it
- Clear token on logout
- Handle token expiration gracefully
- Validate all user inputs
- Sanitize data before rendering to prevent XSS

### Performance Best Practices
- Lazy load routes with React.lazy() / Vue async components
- Implement virtual scrolling for long transaction lists
- Debounce search inputs
- Optimize images (use WebP format)
- Enable gzip compression for production
- Use React.memo / Vue computed for expensive calculations
- Implement pagination for large data sets

### Code Conventions
- **TypeScript**: Use strict mode, avoid `any` types
- **Components**: One component per file, use functional components
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Props**: Define explicit TypeScript interfaces for all props
- **Imports**: Organize imports (external → internal → relative)
- **Error Boundaries**: Wrap feature modules with error boundaries
- **Accessibility**: Use semantic HTML, ARIA labels, keyboard navigation

### Testing Strategy
- **Unit Tests**: Test utilities, hooks, and complex logic
- **Component Tests**: Test component rendering and user interactions
- **Integration Tests**: Test feature workflows
- **E2E Tests**: Test critical user journeys (login, create transaction, etc.)
- **Coverage Goal**: Aim for 80%+ coverage

## Implementation Status

### Phase 1: Foundation ✅ (Completed)
- ✅ Project setup (Vite + React + TypeScript)
- ✅ Configure ESLint, Prettier, TypeScript
- ✅ Setup routing (React Router v6)
- ✅ Create API client with interceptors (src/api/client.ts)
- ✅ Implement authentication flow (Login/Register pages)
- ✅ Create protected route wrapper (src/routes/ProtectedRoute.tsx)
- ✅ Setup global state management (Zustand for auth)
- ✅ Basic Dashboard page with placeholder cards

### Phase 2: Core Features 🚧 (Next Steps)
- [ ] Transaction list view (with pagination, sorting, filtering)
- [ ] Transaction create/edit form
- [ ] Transaction delete with confirmation
- [ ] Account list and management
- [ ] Account balance display (connect to real API)
- [ ] Category list with hierarchy visualization
- [ ] Category management (create, edit, delete)
- [ ] Integrate real data from backend API

### Phase 3: Enhanced Features 📋 (Future)
- [ ] Dashboard charts (spending trends, category breakdown)
- [ ] Date range filters
- [ ] Search functionality
- [ ] Transaction import/export (CSV)
- [ ] Budget tracking UI
- [ ] Recurring transaction management
- [ ] User profile and settings

### Phase 4: Polish & Optimization 🎨 (Future)
- [ ] Responsive design improvements (mobile-first)
- [ ] Dark mode toggle
- [ ] Loading skeletons
- [ ] Empty states (already basic ones in Dashboard)
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Enhanced form validation
- [ ] Accessibility improvements
- [ ] Performance optimization
- [ ] Unit and E2E tests

## Sample API Usage

### Login Example
```typescript
const login = async (email: string, password: string) => {
  const response = await apiClient.post('/auth/login', { email, password });
  const { token } = response.data;
  localStorage.setItem('accessToken', token);
  return response.data;
};
```

### Fetch Transactions Example
```typescript
const getTransactions = async (params?: {
  page?: number;
  size?: number;
  sort?: string;
}) => {
  const response = await apiClient.get('/transactions', { params });
  return response.data;
};
```

### Create Transaction Example
```typescript
const createTransaction = async (transaction: {
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  description: string;
  accountId: number;
  categoryId: number;
}) => {
  const response = await apiClient.post('/transactions', transaction);
  return response.data;
};
```

## Common Commands Quick Reference
```bash
npm run dev                 # Start development server
npm run build               # Build for production
npm run test                # Run tests
npm run lint                # Check code quality
npm run format              # Format code with Prettier
```

## Useful Resources
- Backend API: http://localhost:8080
- API Documentation: http://localhost:8080/swagger-ui.html
- Backend Repository: [Link to Daily-finance-backend]
- Design System: [Link to Figma/Design files if available]

## Getting Started Checklist
- [ ] Clone repository and install dependencies
- [ ] Copy `.env.example` to `.env.local` and configure API URL
- [ ] Start backend server (ensure it's running on localhost:8080)
- [ ] Start frontend development server
- [ ] Create a test user via registration
- [ ] Verify authentication flow works
- [ ] Begin implementing dashboard and transaction features
