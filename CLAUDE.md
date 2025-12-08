# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Daily Finance Frontend — modern, beautiful web application for tracking daily expenses. This frontend connects to the Daily Finance Backend REST API V2.0.0, providing an intuitive interface for managing expenses, categories, and user balance.

### Key Features Implemented ✅
- Modern UI with gradient designs and smooth animations
- User authentication (JWT-based login/registration)
- Dashboard with financial overview and recent expenses
- Expense management via modal dialog (create, edit, delete)
- Category management with colorful visual design
- User balance tracking with deposit functionality
- Floating action button for quick expense creation
- Search and filter functionality
- Responsive design (mobile, tablet, desktop)
- Network-accessible for mobile testing

### Technology Highlights
- **Icons**: lucide-react for consistent modern iconography
- **Modals**: Custom modal components for better UX
- **Gradients**: Indigo/purple for primary actions, emerald/teal for deposits, red/orange for expenses
- **Design System**: Rounded corners (xl, 2xl), shadows, hover effects, transitions

## Development Commands

### Setup
```bash
# Clone repository
git clone https://github.com/xammpi/Daily-finance-frontend.git
cd daily-finance-frontend

# Install dependencies
npm install

# Create .env.local for local development
echo "VITE_API_BASE_URL=http://localhost:8080/api/v1" > .env.local
```

### Running the Application
```bash
# Development mode (local only)
npm run dev

# Development mode with network access (for mobile testing)
npm run dev -- --host

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Format code with Prettier
npm run format
```

**Local Development:** http://localhost:3000
**Network Access:** Will show network IP (e.g., http://192.168.100.250:3000)

### Mobile Testing Setup
To test on mobile devices:
1. Start server with network access: `npm run dev -- --host`
2. Update `.env.local` to use your computer's IP:
   ```bash
   VITE_API_BASE_URL=http://192.168.100.250:8080/api/v1
   ```
3. Ensure backend CORS allows your network IP
4. Connect phone to same WiFi network
5. Access the network URL from your phone

## Architecture

### Technology Stack
| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | React 18+ | UI framework |
| Language | TypeScript | Type safety |
| Build Tool | Vite 7 | Fast builds and HMR |
| Routing | React Router v6 | Client-side routing |
| State Management | Zustand | Global state management |
| API Client | Axios | HTTP requests |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| Icons | lucide-react | Modern icon library |
| Code Quality | ESLint + Prettier | Linting & formatting |

### Project Structure (Current)
```
src/
├── api/                      # API client and endpoints
│   ├── client.ts            # Axios client with JWT interceptors ✅
│   ├── auth.ts              # Authentication API (login, register) ✅
│   ├── transaction.ts          # Expense CRUD operations ✅
│   ├── categories.ts        # Category management API ✅
│   └── user.ts              # User profile, deposit, balance summary ✅
├── assets/                  # Static assets
├── components/              # Reusable components
│   ├── Layout.tsx           # Sidebar layout with navigation ✅
│   ├── TransactionModal.tsx     # Modal for create/edit expenses ✅
│   └── ProtectedRoute.tsx   # Auth guard ✅ (moved from routes/)
├── features/                # Feature-based modules
│   ├── auth/                # Authentication pages ✅
│   │   ├── LoginPage.tsx       # Modern login with gradient design ✅
│   │   └── RegisterPage.tsx    # Modern registration ✅
│   ├── dashboard/           # Dashboard ✅
│   │   └── DashboardPage.tsx   # Stats cards + recent expenses ✅
│   ├── expenses/            # Expense pages ✅
│   │   ├── TransactionListPage.tsx  # List with search, uses modal ✅
│   │   └── TransactionFormPage.tsx  # Legacy page (keep for routes) ✅
│   ├── categories/          # Category pages ✅
│   │   ├── CategoryListPage.tsx  # Grid with colorful cards ✅
│   │   └── CategoryFormPage.tsx  # Create/edit form ✅
│   └── deposit/             # Deposit page ✅
│       └── DepositPage.tsx      # Add funds to balance ✅
├── hooks/                   # Custom React hooks
│   └── useAuth.ts           # Authentication hook wrapper ✅
├── store/                   # Zustand stores
│   └── authStore.ts         # Authentication state ✅
├── types/                   # TypeScript type definitions
│   └── index.ts             # All shared types ✅
├── App.tsx                  # Root component with routing ✅
├── main.tsx                 # Application entry point ✅
├── index.css                # Global styles with Tailwind ✅
└── vite-env.d.ts            # Vite environment types ✅
```

### Important Files
- `src/api/client.ts` - Axios client with JWT interceptors
- `src/api/transaction.ts` - Expense API calls (getAll, create, update, delete)
- `src/api/user.ts` - User API (profile, deposit, balance-summary)
- `src/components/Layout.tsx` - Sidebar layout with navigation and FAB
- `src/components/TransactionModal.tsx` - Modal for adding/editing expenses
- `src/store/authStore.ts` - Zustand store for authentication state
- `src/types/index.ts` - TypeScript interfaces matching backend DTOs

## Backend API Integration (V2.0.0)

### Base URL Configuration
Set in `.env.local`:
```bash
# Local development
VITE_API_BASE_URL=http://localhost:8080/api/v1

# Network/mobile testing (use your computer's IP)
VITE_API_BASE_URL=http://192.168.100.250:8080/api/v1
```

### Key API Concepts
The backend V2.0.0 uses an **Expense-only model**:
- ❌ No Account entity (removed in V8 migration)
- ❌ No INCOME/EXPENSE type distinction
- ✅ User has `balance` and `currency` fields
- ✅ Only tracks expenses (reduce balance)
- ✅ Deposits increase balance via `/user/deposit`
- ✅ Multi-currency support (20 currencies)

### Available API Endpoints

#### Authentication (Public)
- `POST /auth/register` - Register new user (firstName, lastName required)
  ```json
  {
    "email": "user@example.com",
    "username": "username",
    "password": "password",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```
- `POST /auth/login` - Login with username/password
  ```json
  { "username": "username", "password": "password" }
  ```
- `POST /auth/refresh` - Refresh JWT token

#### User Endpoints (Authenticated)
- `GET /user/profile` - Get current user profile
  ```json
  {
    "id": 1,
    "username": "john",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "balance": 1000.00,
    "currency": "USD"
  }
  ```
- `POST /user/deposit` - Add funds to balance
  ```json
  { "amount": 100.00 }
  ```
- `GET /user/balance-summary` - Get balance summary
  ```json
  {
    "currentBalance": 1000.00,
    "totalExpensesThisMonth": 350.50,
    "remainingBalance": 649.50,
    "currency": "USD"
  }
  ```

#### Expenses (Authenticated)
- `GET /expenses` - List all user expenses
- `POST /expenses` - Create expense
  ```json
  {
    "amount": 50.00,
    "date": "2025-12-02",
    "description": "Grocery shopping",
    "categoryId": 1
  }
  ```
- `GET /expenses/{id}` - Get expense by ID
- `PUT /expenses/{id}` - Update expense
- `DELETE /expenses/{id}` - Delete expense

#### Categories (Authenticated)
- `GET /categories` - List all user categories
- `POST /categories` - Create category
  ```json
  {
    "name": "Groceries",
    "description": "Food and household items"
  }
  ```
- `GET /categories/{id}` - Get category by ID
- `PUT /categories/{id}` - Update category
- `DELETE /categories/{id}` - Delete category

**API Documentation:** http://localhost:8080/swagger-ui.html

### Authentication Flow
1. User enters username and password on `/login`
2. Frontend sends `POST /auth/login` with credentials
3. Backend returns `AuthResponse` with `accessToken`, `refreshToken`, `userId`, `username`
4. Frontend stores `accessToken` in localStorage
5. All subsequent requests include `Authorization: Bearer {accessToken}` header
6. On 401 response, user is redirected to `/login`

## TypeScript Type Definitions

### User & Auth Types
```typescript
export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  balance: number
  currency: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  userId: number
  username: string
}
```

### Expense & Category Types
```typescript
export interface Expense {
  id: number
  amount: number
  date: string
  description: string
  categoryId: number
  categoryName: string
}

export interface ExpenseRequest {
  amount: number
  date: string
  description: string
  categoryId: number
}

export interface Category {
  id: number
  name: string
  description?: string
}

export interface BalanceSummary {
  currentBalance: number
  totalExpensesThisMonth: number
  remainingBalance: number
  currency: string
}

export interface DepositRequest {
  amount: number
}
```

## UI/UX Design Patterns

### Color System
- **Primary Actions**: Gradient from indigo-500 to purple-600
- **Expenses**: Red-500 to orange-600 (negative/outgoing money)
- **Deposits**: Emerald-500 to teal-600 (positive/incoming money)
- **Categories**: 13 different gradient combinations for visual distinction
- **Backgrounds**: slate-50 via blue-50 to indigo-50

### Component Patterns

#### 1. Layout Component
All authenticated pages use `<Layout>` component:
```typescript
<Layout onAddExpense={() => handleOpenModal()}>
  {/* Page content */}
</Layout>
```
- Sidebar navigation (Dashboard, Expenses, Categories, Deposit)
- User profile section with logout
- Floating action button (FAB) for quick expense creation
- Optional `onAddExpense` callback for modal integration

#### 2. Modal Pattern for Expenses
Instead of navigating to a form page, expenses use a modal:
```typescript
<TransactionModal
  isOpen={isModalOpen}
  onClose={handleCloseModal}
  onSuccess={handleModalSuccess}
  expenseId={editingExpenseId} // undefined for create, number for edit
/>
```
Benefits:
- No navigation/context loss
- Faster interaction
- Better mobile UX
- Backdrop blur effect

#### 3. Card-Based Layouts
- Dashboard uses stat cards with gradients
- Expenses grouped by date with card containers
- Categories in colorful grid layout
- All cards have hover effects and shadows

#### 4. Icons Throughout
Using lucide-react for consistent iconography:
- `Wallet` - Finance/money/balance
- `Receipt` - Expenses
- `FolderOpen` / `Tag` - Categories
- `PiggyBank` - Deposits/savings
- `TrendingDown` - Expense items
- `Plus` - Create actions
- `Edit2` / `Trash2` - Item actions
- `Save` - Form submissions

#### 5. Form Styling
Modern form inputs with:
```typescript
className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3
  transition-all focus:border-indigo-500 focus:outline-none
  focus:ring-2 focus:ring-indigo-500/20"
```
- Rounded-xl corners
- Subtle borders (slate-200)
- Focus states with indigo ring
- Icons in labels

#### 6. Button Styling
Gradient buttons for primary actions:
```typescript
className="flex items-center justify-center gap-2 rounded-xl
  bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3
  font-medium text-white shadow-lg transition-all hover:scale-105
  disabled:opacity-50 disabled:cursor-not-allowed
  disabled:hover:scale-100"
```

### Loading States
- Spinner with indigo gradient
- Centered with descriptive text
- Consistent across all pages

### Empty States
- Illustrative icon (large, centered)
- Clear message explaining state
- Call-to-action button
- Friendly, helpful tone

## Implementation Status

### ✅ Phase 1: Foundation (Completed)
- ✅ Project setup (Vite + React + TypeScript)
- ✅ Configure ESLint, Prettier, TypeScript
- ✅ Setup routing (React Router v6)
- ✅ Create API client with interceptors
- ✅ Implement authentication flow
- ✅ Create protected route wrapper
- ✅ Setup global state management (Zustand)
- ✅ Install lucide-react icon library

### ✅ Phase 2: Backend V2.0.0 Alignment (Completed)
- ✅ Refactor from Transaction to Expense model
- ✅ Remove Account entity references
- ✅ Add User balance/currency fields
- ✅ Create user API (profile, deposit, balance-summary)
- ✅ Update all routes from /transactions to /expenses
- ✅ Implement Deposit functionality

### ✅ Phase 3: Modern UI Redesign (Completed)
- ✅ Create Layout component with sidebar
- ✅ Redesign LoginPage with modern styling
- ✅ Redesign RegisterPage with modern styling
- ✅ Redesign DashboardPage with stats cards
- ✅ Redesign TransactionListPage with card layout
- ✅ Redesign TransactionFormPage with modern styling
- ✅ Redesign CategoryListPage with colorful cards
- ✅ Redesign CategoryFormPage with modern styling
- ✅ Redesign DepositPage with modern design
- ✅ Add floating action button
- ✅ Implement search functionality
- ✅ Add beautiful empty states

### ✅ Phase 4: Modal & UX Improvements (Completed)
- ✅ Create TransactionModal component
- ✅ Integrate modal in TransactionListPage
- ✅ Integrate modal in DashboardPage
- ✅ Connect FAB to modal
- ✅ Implement edit expense via modal
- ✅ Add backdrop blur effect

### 📋 Phase 5: Future Enhancements
- [ ] Dashboard charts (spending trends, category breakdown)
- [ ] Date range filters for expenses
- [ ] Export expenses to CSV
- [ ] Budget tracking and alerts
- [ ] Recurring expense management
- [ ] Receipt image uploads
- [ ] Dark mode theme toggle
- [ ] Notifications/toasts for actions
- [ ] Advanced search and filters
- [ ] User profile editing
- [ ] Multi-language support
- [ ] Performance optimization (React.memo, lazy loading)
- [ ] Unit and E2E tests

## Important Notes

### Environment Configuration
Create `.env.local` (never commit this file):
```bash
# For local development
VITE_API_BASE_URL=http://localhost:8080/api/v1

# For mobile/network testing
VITE_API_BASE_URL=http://192.168.100.250:8080/api/v1
```

### CORS Configuration
Backend must allow CORS from frontend origin. For network testing, add both local and network origins:
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                    "http://localhost:3000",
                    "http://192.168.100.250:3000"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### Authentication & Security
- JWT token stored in localStorage (key: `accessToken`)
- Token included in all API requests via Authorization header
- 401 responses trigger automatic redirect to login
- Passwords must be at least 6 characters
- Client-side validation before API calls

### Code Conventions
- **TypeScript**: Strict mode, avoid `any` types
- **Components**: One component per file, functional components only
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Imports**: External → Internal → Relative
- **Styling**: Tailwind utility classes, consistent spacing
- **Icons**: lucide-react for all icons
- **Colors**: Use design system colors (indigo, purple, emerald, teal, red, orange)

### Mobile Testing Checklist
- [ ] Start dev server with `--host` flag
- [ ] Update `.env.local` with computer's IP
- [ ] Ensure backend allows CORS from network IP
- [ ] Ensure backend accepts connections on 0.0.0.0
- [ ] Connect phone to same WiFi network
- [ ] Test login/register flow
- [ ] Test expense creation via modal
- [ ] Test navigation and responsiveness

## Common Issues & Solutions

### Issue: Network error on mobile
**Cause**: Backend not accessible or CORS blocking
**Solution**:
1. Check backend is running on `0.0.0.0:8080` (not `localhost:8080`)
2. Add network IP to CORS allowed origins
3. Update `.env.local` with network IP

### Issue: Modal not closing after save
**Cause**: Missing `onSuccess` callback or not calling `fetchExpenses`
**Solution**: Ensure `handleModalSuccess` calls data refresh function

### Issue: Authentication token not persisting
**Cause**: LocalStorage not being set properly
**Solution**: Check `authStore.ts` is storing token in `accessToken` key

### Issue: Categories showing same color
**Cause**: Color array index not being used
**Solution**: Use modulo operator: `colors[index % colors.length]`

## Useful Resources
- **Backend API**: http://localhost:8080
- **API Docs**: http://localhost:8080/swagger-ui.html
- **Vite Docs**: https://vitejs.dev
- **React Router**: https://reactrouter.com
- **Tailwind CSS**: https://tailwindcss.com
- **lucide-react Icons**: https://lucide.dev
- **Zustand**: https://github.com/pmndrs/zustand

## Quick Start Guide
```bash
# 1. Install dependencies
npm install

# 2. Create environment file
echo "VITE_API_BASE_URL=http://localhost:8080/api/v1" > .env.local

# 3. Ensure backend is running on port 8080

# 4. Start dev server
npm run dev

# 5. Open browser to http://localhost:3000

# 6. Register a new user and start tracking expenses!
```

For mobile testing, use `npm run dev -- --host` and update `.env.local` with your network IP.
