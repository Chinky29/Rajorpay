# PayFlow — Development Phases

## Phase 0 — Project Setup
- Root project configuration
- Create client (Vite + React + Tailwind)
- Create server (Express + Node.js)
- Configure Git & .gitignore
- Create .env.example
- Install dependencies
- Configure ESLint & Prettier

## Phase 1 — Backend Foundation
- Express server setup
- MongoDB connection with Mongoose
- Environment configuration
- Error middleware & API response utilities
- Request validation utility
- Health endpoint `GET /api/health`

## Phase 2 — Authentication
- User model & bcrypt hashing
- Register, Login, Logout endpoints
- JWT generation & verification middleware
- Current user `GET /api/auth/me`

## Phase 3 — Core CRUD
- Customers CRUD with search & pagination
- Products CRUD with catalog management

## Phase 4 — Frontend Foundation
- React Router, Tailwind layout, navigation, auth context, API client

## Phase 5 — Dashboard
- KPI summary cards, Revenue chart, Payment status chart, Health score card

## Phase 6 — Razorpay Integration
- Test mode configuration, order creation, checkout integration, payment verification

## Phase 7 — Webhooks
- Webhook endpoint, HMAC verification, idempotency, event handling

## Phase 8 — Transactions
- Transaction history, filter, search, detail view

## Phase 9 — Failed Payment Recovery
- Dedicated failed payment insights and retry workflow

## Phase 10 — Subscriptions
- Plan definitions, subscription status, MRR metrics

## Phase 11 — Analytics
- Aggregated financial data, success/failure rate, growth trends

## Phase 12 — Notifications
- Notification model, unread badges, list view

## Phase 13 — UX Polish
- Skeleton loaders, responsive layout, micro-animations, polish

## Phase 14 — Testing
- End-to-end verification and error path checks

## Phase 15 — Documentation
- Comprehensive README with setup and architecture guide
