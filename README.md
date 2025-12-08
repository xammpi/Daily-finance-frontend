# Daily Finance Frontend

A modern, beautiful web application for tracking daily expenses. Built with React, TypeScript, and Tailwind CSS.

## Features

- 🔐 **User Authentication** - JWT-based login/registration with currency selection
- 📊 **Dashboard** - Financial overview with statistics and recent expenses
- 💰 **Wallet Management** - Track balance, deposits, and withdrawals
- 💸 **Expense Tracking** - Create, edit, delete expenses with categories
- 🏷️ **Category Management** - Organize expenses with custom categories
- 🔍 **Advanced Search** - Powerful search with 14 filter operations
- 📈 **Sorting & Filtering** - Sort by date, amount, or category
- 💱 **Multi-Currency** - Support for 20+ currencies
- 📱 **Responsive Design** - Works on mobile, tablet, and desktop

## Tech Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite 7
- **Routing**: React Router v6
- **State Management**: Zustand
- **API Client**: Axios
- **Styling**: Tailwind CSS v4
- **Icons**: lucide-react
- **Code Quality**: ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see [API_GUIDE.md](./API_GUIDE.md))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/xammpi/Daily-finance-frontend.git
cd daily-finance-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
echo "VITE_API_BASE_URL=http://localhost:8080/api/v1" > .env.local
```

4. **Start development server**
```bash
npm run dev              # Local only
npm run dev -- --host    # Network access (for mobile testing)
```

The app will be available at:
- **Local**: http://localhost:3000
- **Network**: http://192.168.x.x:3000 (with --host)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (local only) |
| `npm run dev -- --host` | Start dev server with network access |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## Project Structure

```
src/
├── api/                    # API client and endpoints
│   ├── client.ts          # Axios client with JWT interceptors
│   ├── auth.ts            # Authentication (login, register)
│   ├── transaction.ts        # Expense CRUD + search
│   ├── categories.ts      # Category CRUD + search
│   ├── currencies.ts      # Currency list (public)
│   └── user.ts            # User profile, wallet, deposit, withdraw
├── components/            # Reusable components
│   ├── Layout.tsx         # Sidebar layout with FAB
│   ├── TransactionModal.tsx   # Modal for add/edit expenses
│   ├── FilterBuilder.tsx  # Generic filter UI
│   └── ProtectedRoute.tsx # Auth guard
├── features/              # Feature-based modules
│   ├── auth/              # LoginPage, RegisterPage
│   ├── dashboard/         # DashboardPage
│   ├── expenses/          # TransactionListPage, TransactionFormPage
│   ├── categories/        # CategoryListPage, CategoryFormPage
│   ├── wallet/            # WalletPage
│   ├── deposit/           # DepositPage
│   └── withdraw/          # WithdrawPage
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts         # Authentication wrapper
│   └── useBalance.ts      # Wallet balance hook
├── store/                 # Zustand stores
│   └── authStore.ts       # Authentication state
├── types/                 # TypeScript definitions
│   ├── index.ts           # Core types (User, Expense, Category, etc.)
│   └── filtering.ts       # Generic filtering types
├── utils/                 # Utility functions
│   ├── CriteriaBuilder.ts # Search query builder
│   ├── formatters.ts      # Currency, date formatting
│   └── dateHelpers.ts     # Date range helpers
├── App.tsx                # Root component with routing
└── main.tsx               # Application entry point
```

## API Integration

The frontend integrates with the Daily Finance Backend API v1.0.0.

### Backend API

- **Base URL**: `http://localhost:8080/api/v1`
- **Authentication**: JWT Bearer tokens
- **Documentation**: See [API_GUIDE.md](./API_GUIDE.md)

### Key Endpoints

**Authentication (Public)**
- `POST /auth/register` - Register with email, username, password, firstName, lastName, currencyId
- `POST /auth/login` - Login with username/password

**Currencies (Public)**
- `GET /currencies` - Get all available currencies

**User & Wallet (Authenticated)**
- `GET /user/profile` - Get user profile
- `GET /user/wallet` - Get wallet details with statistics
- `POST /user/deposit` - Deposit money
- `POST /user/withdraw` - Withdraw money
- `PUT /user/balance` - Update balance
- `PUT /user/currency` - Update currency

**Expenses (Authenticated)**
- `POST /expenses/search` - Advanced search with criteria
- `GET /expenses/{id}` - Get by ID
- `POST /expenses` - Create expense
- `PUT /expenses/{id}` - Update expense
- `DELETE /expenses/{id}` - Delete expense
- `GET /expenses/statistics` - Get expense statistics
- `GET /expenses/statistics/by-category` - Category breakdown

**Categories (Authenticated)**
- `POST /categories/search` - Advanced search with criteria
- `GET /categories/{id}` - Get by ID
- `POST /categories` - Create category
- `PUT /categories/{id}` - Update category
- `DELETE /categories/{id}` - Delete category

### Search System

The app uses a powerful POST-based search system supporting:
- **14 Operations**: EQUALS, LIKE, GREATER_THAN, BETWEEN, etc.
- **Multiple Criteria**: Combine filters with AND logic
- **Nested Fields**: Search by `category.name`
- **Pagination**: Page size and number
- **Sorting**: Any field, ASC/DESC

Example search request:
```json
{
  "criteria": [
    {"field": "amount", "operation": "GREATER_THAN", "value": "100"},
    {"field": "date", "operation": "BETWEEN", "value": "2024-12-01", "valueTo": "2024-12-31"}
  ],
  "page": 0,
  "size": 20,
  "sortBy": "date",
  "sortOrder": "DESC"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8080/api/v1` |

**Important**: System environment variables override `.env.local`. Use `unset VITE_API_BASE_URL` before starting if needed.

## Development

### Code Style

- TypeScript strict mode
- Functional components with hooks only
- PascalCase for components, camelCase for functions/variables
- Avoid `any` types
- Tailwind utility classes for styling
- lucide-react for all icons

### Git Workflow

1. Create feature branch from `main`
2. Make changes
3. Run `npm run lint` and `npm run format`
4. Commit with descriptive messages
5. Create pull request to `main`

### Mobile Testing

1. Start server with network access:
```bash
npm run dev -- --host
```

2. Update `.env.local` with your computer's IP:
```bash
VITE_API_BASE_URL=http://192.168.x.x:8080/api/v1
```

3. Ensure backend allows CORS from your network IP
4. Connect phone to same WiFi network
5. Access `http://192.168.x.x:3000` from your phone

## Documentation

- **[API_GUIDE.md](./API_GUIDE.md)** - Complete backend API reference
- **[CLAUDE.md](./CLAUDE.md)** - Claude Code instructions for AI-assisted development

## License

ISC

## Links

- [Backend Repository](https://github.com/xammpi/Daily-finance-backend)
- [API Documentation](http://localhost:8080/swagger-ui.html)
