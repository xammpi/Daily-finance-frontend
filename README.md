# Daily Finance Frontend

A modern, responsive web application for tracking daily expenses and income. Built with React, TypeScript, and Tailwind CSS.

## Features

- User authentication (JWT-based login/registration)
- Dashboard with financial overview
- Transaction management (create, edit, delete expenses/income)
- Category management with hierarchical organization
- Multiple account management
- Real-time account balance tracking
- Responsive design

## Tech Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **API Client**: Axios
- **Styling**: Tailwind CSS v4
- **Code Quality**: ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on http://localhost:8080 (see [Daily-finance-backend](https://github.com/xammpi/Daily-finance-backend))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/xammpi/Daily-finance-frontend.git
cd daily-finance-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` if you need to change the API URL (default is http://localhost:8080/api/v1)

4. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── api/                    # API client and endpoints
│   ├── client.ts          # Axios client with interceptors
│   ├── auth.ts            # Authentication endpoints
│   ├── transactions.ts    # Transaction endpoints
│   ├── categories.ts      # Category endpoints
│   └── accounts.ts        # Account endpoints
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── layouts/          # Layout components
│   └── common/           # Common components
├── features/             # Feature-based modules
│   ├── auth/             # Login & Register pages
│   └── dashboard/        # Dashboard page
├── hooks/                # Custom React hooks
│   └── useAuth.ts        # Authentication hook
├── routes/               # Route definitions
│   └── ProtectedRoute.tsx # Auth guard component
├── store/                # Zustand stores
│   └── authStore.ts      # Authentication state
├── types/                # TypeScript type definitions
│   └── index.ts          # Shared types
├── App.tsx               # Root component with routing
└── main.tsx              # Application entry point
```

## API Integration

The frontend connects to the Daily Finance Backend API:

- **Base URL**: http://localhost:8080/api/v1
- **Authentication**: JWT tokens stored in localStorage
- **Interceptors**: Automatic token injection and 401 handling

### API Endpoints

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /transactions` - List transactions
- `POST /transactions` - Create transaction
- `GET /categories` - List categories
- `GET /accounts` - List accounts

See the [API Documentation](http://localhost:8080/swagger-ui.html) for complete endpoint details.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8080/api/v1` |
| `VITE_APP_NAME` | Application name | `Daily Finance` |

## Development

### Code Style

- Follow TypeScript strict mode
- Use functional components with hooks
- Use PascalCase for components, camelCase for functions/variables
- Avoid `any` types

### Git Workflow

1. Create a feature branch
2. Make your changes
3. Run linting: `npm run lint`
4. Format code: `npm run format`
5. Commit and push
6. Create a pull request

## License

ISC

## Links

- [Backend Repository](https://github.com/xammpi/Daily-finance-backend)
- [API Documentation](http://localhost:8080/swagger-ui.html)
