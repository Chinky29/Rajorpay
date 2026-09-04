# PayFlow — System Architecture

## 1. Architectural Pattern
- **Pattern:** Modular Monolith
- **Frontend:** React 18+ (Vite), Tailwind CSS, React Router v6, Axios, Recharts, Lucide React
- **Backend:** Node.js, Express.js (REST API), MongoDB, Mongoose ODM
- **Payment Provider:** Razorpay API (Test Mode)

## 2. Directory Structure
```
payflow/
├── docs/                      # Specification & architectural documents
├── client/                    # React frontend application
│   ├── src/
│   │   ├── assets/            # Static assets
│   │   ├── components/        # Reusable UI elements (cards, tables, modals)
│   │   ├── context/           # Auth and App contexts
│   │   ├── hooks/             # Custom React hooks
│   │   ├── layouts/           # App layouts (Dashboard, Auth, Landing)
│   │   ├── pages/             # Route views
│   │   ├── services/          # Axios API clients
│   │   └── utils/             # Formatters, calculations
│   └── package.json
└── server/                    # Node.js Express backend
    ├── src/
    │   ├── config/            # DB, Razorpay, Environment configs
    │   ├── controllers/       # Route handlers
    │   ├── middlewares/       # Auth, validation, error handler
    │   ├── models/            # Mongoose schemas
    │   ├── routes/            # REST API endpoints
    │   ├── services/          # Razorpay, email, analytics logic
    │   └── utils/             # ApiError, ApiResponse, asyncHandler
    └── package.json
```

## 3. Data Flow & Security
1. **User Request:** Frontend sends authenticated requests using Bearer JWT or secure HTTP-only cookies.
2. **Context Resolution:** Express middleware verifies token, attaches `req.user` with `businessId` / `userId`.
3. **Database Scope:** Mongoose queries filter on `userId` to enforce strict multi-tenant isolation.
4. **Payment Transactions:**
   - Client requests Order creation (`POST /api/payments/create-order`).
   - Server creates local `Transaction` record (status: `created`) and creates Razorpay Order with integer amount in paise.
   - Frontend invokes Razorpay Checkout SDK.
   - Upon completion, client sends `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature` to `POST /api/payments/verify`.
   - Server validates HMAC-SHA256 signature using `RAZORPAY_KEY_SECRET`.
   - In parallel, Razorpay webhooks trigger `POST /api/webhooks/razorpay` with `X-Razorpay-Signature`, validating against `RAZORPAY_WEBHOOK_SECRET` and guaranteeing idempotent processing.
