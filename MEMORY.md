# PayFlow — Project Memory & Architecture Context

> **File:** `MEMORY.md`  
> **Project:** PayFlow  
> **Type:** Production-Quality MERN Full-Stack Payment Management & Fintech SaaS  
> **Tech Stack:** React 18, Vite, Tailwind CSS, React Router v6, Axios, Recharts, Lucide Icons, Node.js, Express, MongoDB, Mongoose, Razorpay SDK (Test Mode), JWT, Bcrypt, Zod.

---

## 1. Project Purpose & Core Domain

PayFlow is a multi-tenant payment management platform built for businesses to orchestrate online charges, inspect transaction audit trails, manage subscriptions, recover failed payments, and monitor financial health metrics in real-time using Razorpay Test Mode.

### Key Guarantees:
- **Zero Real-Money Risk:** Uses Razorpay Test Mode exclusively (`rzp_test_...`).
- **Cryptographic Payment Verification:** Every client payment attempt is verified server-side with HMAC-SHA256 signatures before updating state to `captured`.
- **Webhook Idempotency:** Duplicate webhook events from Razorpay are deduplicated using `WebhookEvent` model records.
- **Strict Multi-Tenant Isolation:** Every data entity is tied to `user: req.user._id`. No tenant can read or mutate another tenant's data.

---

## 2. Directory Structure

```
payflow/
├── docs/                      # Architectural specifications & requirements
│   ├── prd.md                 # Product Requirements Document
│   ├── architecture.md        # Modular monolith architecture & data flows
│   ├── design.md              # Design system, colors, typography, UX rules
│   ├── rules.md               # Core engineering & security rules
│   └── phases.md              # Roadmap phases 0 through 15
├── client/                    # React + Vite Frontend
│   ├── src/
│   │   ├── api/axios.js       # Axios client with JWT interceptors & error handlers
│   │   ├── context/           # React Contexts
│   │   │   ├── AuthContext.jsx         # User auth, login, register, logout, session check
│   │   │   ├── ToastContext.jsx        # Floating notifications (success, error, warning, info)
│   │   │   └── NotificationContext.jsx # Polling notification store & unread counter
│   │   ├── components/        # Reusable UI Components
│   │   │   ├── Layout.jsx              # Main responsive shell
│   │   │   ├── Sidebar.jsx             # Collapsible navigation with badges
│   │   │   ├── Header.jsx              # Header with business name, search, user menu
│   │   │   ├── ProtectedRoute.jsx      # Auth & public route guards
│   │   │   ├── StatCard.jsx            # KPI cards with gradients & trends
│   │   │   ├── Badge.jsx               # Semantic status pills (captured, failed, active, etc.)
│   │   │   ├── Modal.jsx               # Accessible dialog modal
│   │   │   ├── DataTable.jsx           # Paginated data table with loading skeletons
│   │   │   ├── Skeleton.jsx            # Loading skeleton placeholders
│   │   │   ├── EmptyState.jsx          # Empty state views with actions
│   │   │   └── CheckoutModal.jsx       # Razorpay Test Mode checkout trigger
│   │   ├── pages/             # Route Views
│   │   │   ├── Login.jsx               # Login with 1-click Demo auto-fill
│   │   │   ├── Register.jsx            # Multi-tenant registration
│   │   │   ├── Dashboard.jsx           # KPIs, Recharts Revenue Area Chart, Health Score
│   │   │   ├── Customers.jsx           # Customers list, search, pagination, create/edit modal
│   │   │   ├── CustomerDetail.jsx      # Customer 360 profile & payment ledger
│   │   │   ├── Products.jsx            # Products & plans catalog
│   │   │   ├── Payments.jsx            # Complete transaction audit ledger
│   │   │   ├── PaymentDetail.jsx       # Receipt & HMAC signature details
│   │   │   ├── FailedPayments.jsx      # Failure reasons breakdown & 1-click retry
│   │   │   ├── Subscriptions.jsx       # MRR tracking & recurring plans
│   │   │   ├── Analytics.jsx           # Date-filtered revenue charts & health diagnostics
│   │   │   ├── Notifications.jsx       # In-app notification center
│   │   │   ├── Settings.jsx            # API credentials & webhook URL
│   │   │   └── NotFound.jsx            # 404 page
│   │   ├── utils/formatters.js         # Currency (₹ INR), date, status badge formatters
│   │   ├── App.jsx            # React Router definitions
│   │   ├── index.css          # Tailwind base & custom scrollbar
│   │   └── main.jsx
│   ├── index.html             # Includes Razorpay Checkout SDK script
│   └── package.json
├── server/                    # Node.js + Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js         # Dotenv loader & configuration map
│   │   │   └── db.js          # Mongoose connection with reconnection handlers
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── customer.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── payment.controller.js
│   │   │   ├── webhook.controller.js
│   │   │   ├── subscription.controller.js
│   │   │   ├── analytics.controller.js
│   │   │   └── notification.controller.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js      # JWT cookie / Bearer token validator
│   │   │   ├── error.middleware.js     # Global centralized error handler
│   │   │   └── validate.middleware.js  # Zod schema validation middleware
│   │   ├── models/
│   │   │   ├── user.model.js           # Merchant account (bcrypt + JWT methods)
│   │   │   ├── customer.model.js       # Customer record ({ user, email } unique index)
│   │   │   ├── product.model.js        # Product & pricing catalog
│   │   │   ├── transaction.model.js    # Ledger record with Razorpay Order/Payment refs
│   │   │   ├── subscription.model.js   # Recurring subscription plan & period dates
│   │   │   ├── webhookEvent.model.js   # Idempotency event store
│   │   │   └── notification.model.js   # In-app alerts
│   │   ├── routes/
│   │   │   ├── health.routes.js        # GET /api/health
│   │   │   ├── auth.routes.js          # /api/auth
│   │   │   ├── customer.routes.js      # /api/customers
│   │   │   ├── product.routes.js       # /api/products
│   │   │   ├── payment.routes.js       # /api/payments
│   │   │   ├── webhook.routes.js       # /api/webhooks
│   │   │   ├── subscription.routes.js  # /api/subscriptions
│   │   │   ├── analytics.routes.js     # /api/analytics
│   │   │   └── notification.routes.js  # /api/notifications
│   │   ├── services/
│   │   │   ├── razorpay.service.js     # Razorpay Orders & HMAC signature verification
│   │   │   ├── analytics.service.js    # Aggregations, revenue trends & Health Score
│   │   │   └── notification.service.js # Notification dispatcher
│   │   ├── validators/        # Zod request validation schemas
│   │   ├── seed.js            # Realistic demo database seeder
│   │   ├── app.js             # Express app (Helmet, CORS, rawBody preservation)
│   │   └── server.js          # HTTP server starter
│   └── package.json
├── package.json               # Root scripts (concurrent dev, seed, install)
├── README.md
└── MEMORY.md
```

---

## 3. Database Models & Schema Specifications

### `User` (`server/src/models/user.model.js`)
- `name`: String (required)
- `email`: String (unique, lowercase, indexed)
- `password`: String (hashed with bcrypt salt 10, excluded by default `select: false`)
- `businessName`: String (required)
- `role`: Enum (`merchant`, `admin`, `member`, default: `merchant`)
- `avatar`: String
- `isVerified`: Boolean (default: true)
- Methods: `comparePassword(candidate)`, `generateAuthToken()`

### `Customer` (`server/src/models/customer.model.js`)
- `user`: ObjectId &rarr; `User` (indexed, required)
- `name`: String (required)
- `email`: String (required, lowercase)
- `phone`: String
- `company`: String
- `address`: `{ line1, line2, city, state, postalCode, country }`
- `notes`: String
- `totalSpent`: Number (default: 0)
- `totalOrders`: Number (default: 0)
- `status`: Enum (`active`, `inactive`, default: `active`)
- Indexes: `{ user: 1, email: 1 }` (unique per merchant), `{ user: 1, name: 1 }`

### `Product` (`server/src/models/product.model.js`)
- `user`: ObjectId &rarr; `User` (indexed, required)
- `name`: String (required)
- `description`: String
- `sku`: String (uppercase)
- `price`: Number (min: 0, required)
- `currency`: String (default: `INR`)
- `category`: String (default: `General`)
- `type`: Enum (`one_time`, `recurring`, default: `one_time`)
- `status`: Enum (`active`, `inactive`, `archived`, default: `active`)

### `Transaction` (`server/src/models/transaction.model.js`)
- `user`: ObjectId &rarr; `User` (indexed, required)
- `customer`: ObjectId &rarr; `Customer` (indexed, required)
- `product`: ObjectId &rarr; `Product` (optional)
- `amount`: Number (in standard units, e.g. ₹2999)
- `amountInPaise`: Number (integer paise, e.g. 299900)
- `currency`: String (default: `INR`)
- `status`: Enum (`created`, `authorized`, `captured`, `failed`, `refunded`, default: `created`, indexed)
- `razorpayOrderId`: String (required, indexed)
- `razorpayPaymentId`: String (indexed, nullable)
- `razorpaySignature`: String (nullable)
- `method`: Enum (`card`, `upi`, `netbanking`, `wallet`, `unknown`, default: `unknown`)
- `fee`: Number (default: 0)
- `tax`: Number (default: 0)
- `failureReason`: String
- `failureCode`: String
- `retryCount`: Number (default: 0)
- `parentTransactionId`: ObjectId &rarr; `Transaction` (nullable)

### `Subscription` (`server/src/models/subscription.model.js`)
- `user`: ObjectId &rarr; `User` (indexed, required)
- `customer`: ObjectId &rarr; `Customer` (indexed, required)
- `product`: ObjectId &rarr; `Product` (optional)
- `plan`: Enum (`Basic`, `Pro`, `Enterprise`)
- `amount`: Number (required)
- `currency`: String (default: `INR`)
- `interval`: Enum (`monthly`, `yearly`, default: `monthly`)
- `status`: Enum (`active`, `canceled`, `past_due`, `paused`, default: `active`, indexed)
- `startDate`: Date
- `currentPeriodStart`: Date
- `currentPeriodEnd`: Date
- `cancelAtPeriodEnd`: Boolean (default: false)
- `canceledAt`: Date

### `WebhookEvent` (`server/src/models/webhookEvent.model.js`)
- `eventId`: String (unique, indexed)
- `event`: String (e.g. `payment.captured`)
- `payload`: Mixed
- `status`: Enum (`received`, `processed`, `failed`)
- `error`: String
- `processedAt`: Date

### `Notification` (`server/src/models/notification.model.js`)
- `user`: ObjectId &rarr; `User` (indexed, required)
- `title`: String
- `message`: String
- `type`: Enum (`payment_success`, `payment_failed`, `subscription_created`, `system`)
- `isRead`: Boolean (default: false, indexed)
- `link`: String

---

## 4. REST API Endpoint Catalog

| Group | Method & Path | Description | Protected |
| :--- | :--- | :--- | :---: |
| **System** | `GET /api/health` | Service uptime, timestamp & database status | No |
| **Auth** | `POST /api/auth/register` | Register new business account & issue JWT cookie | No |
| **Auth** | `POST /api/auth/login` | Verify credentials & issue JWT cookie | No |
| **Auth** | `POST /api/auth/logout` | Clear session cookie | Yes |
| **Auth** | `GET /api/auth/me` | Fetch currently authenticated user profile | Yes |
| **Customers** | `GET /api/customers` | Search & paginate customers | Yes |
| **Customers** | `POST /api/customers` | Create new customer (scoped email uniqueness) | Yes |
| **Customers** | `GET /api/customers/:id` | Fetch single customer profile | Yes |
| **Customers** | `PUT /api/customers/:id` | Update customer details | Yes |
| **Customers** | `DELETE /api/customers/:id` | Remove customer | Yes |
| **Products** | `GET /api/products` | Query products catalog with status/type filters | Yes |
| **Products** | `POST /api/products` | Create product or subscription tier | Yes |
| **Products** | `GET /api/products/:id` | Fetch product details | Yes |
| **Products** | `PUT /api/products/:id` | Update product price, SKU, status | Yes |
| **Products** | `DELETE /api/products/:id` | Delete product | Yes |
| **Payments** | `POST /api/payments/create-order` | Generate Razorpay Order in paise & create local tx | Yes |
| **Payments** | `POST /api/payments/verify` | Validate HMAC-SHA256 payment signature & capture | Yes |
| **Payments** | `GET /api/payments` | Search & filter transaction ledger | Yes |
| **Payments** | `GET /api/payments/:id` | Get transaction audit & receipt breakdown | Yes |
| **Payments** | `POST /api/payments/:id/retry` | Initialize new checkout attempt for failed payment | Yes |
| **Webhooks** | `POST /api/webhooks/razorpay` | Ingest Razorpay events with HMAC verification | No (HMAC) |
| **Subscriptions** | `GET /api/subscriptions` | Query recurring subscriptions & intervals | Yes |
| **Subscriptions** | `POST /api/subscriptions` | Create recurring subscription schedule | Yes |
| **Subscriptions** | `GET /api/subscriptions/:id` | Fetch subscription details | Yes |
| **Subscriptions** | `PATCH /api/subscriptions/:id` | Update status (pause, resume, cancel) | Yes |
| **Subscriptions** | `DELETE /api/subscriptions/:id` | Delete subscription | Yes |
| **Analytics** | `GET /api/analytics/overview` | KPI summaries, gross revenue, MRR, Health Score | Yes |
| **Analytics** | `GET /api/analytics/revenue` | Timeline data for charts (7d, 14d, 30d, 90d) | Yes |
| **Analytics** | `GET /api/analytics/payment-health` | Detailed Health Score diagnostics & advice | Yes |
| **Notifications** | `GET /api/notifications` | Fetch recent alerts & unread count | Yes |
| **Notifications** | `PATCH /api/notifications/:id/read` | Mark individual notification read | Yes |
| **Notifications** | `PATCH /api/notifications/read-all` | Mark all alerts read | Yes |

---

## 5. Security & Payment Processing Rules

1. **Amount Integrity:** Never accept charge amounts from client state during verification. Order creation converts standard currency units into integer paise (`Math.round(amount * 100)`).
2. **Server-Side Verification:**
   ```javascript
   const generatedSignature = crypto
     .createHmac('sha256', config.razorpayKeySecret)
     .update(`${orderId}|${paymentId}`)
     .digest('hex');
   const isValid = crypto.timingSafeEqual(Buffer.from(generatedSignature), Buffer.from(signature));
   ```
3. **Webhook Verification & Idempotency:**
   - The raw payload buffer is captured via `express.json({ verify: (req, res, buf) => req.rawBody = buf })`.
   - Webhook signature is validated against `X-Razorpay-Signature` using `RAZORPAY_WEBHOOK_SECRET`.
   - Before processing, `WebhookEvent.findOne({ eventId })` is queried. If status is `processed`, the endpoint returns `200 OK` immediately without re-mutating balances or counters.
4. **Payment Health Score Formula:**
   $$\text{Health Score} = \text{round}\Big(\text{SuccessRate} \times 0.70 + (100 - \text{FailureRate}) \times 0.20 + (100 - \text{PendingRate}) \times 0.10\Big)$$
   - `90 - 100`: Excellent
   - `80 - 89`: Good
   - `60 - 79`: Moderate
   - `< 60`: Critical

---

## 6. Environment Variables

### `server/.env`
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/payflow
JWT_SECRET=super_secret_jwt_key_for_payflow_saas_dev_mode_32chars
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=rzp_test_YourKeyIdHere
RAZORPAY_KEY_SECRET=YourRazorpayKeySecretHere
RAZORPAY_WEBHOOK_SECRET=YourWebhookSecretHere
```

### `client/.env`
```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_YourKeyIdHere
```

---

## 7. Operational Commands & Demo Access

```bash
# Start frontend and backend concurrently
npm run dev

# Seed database with realistic demo records
npm run seed

# Run standalone backend
npm run dev:server

# Run standalone frontend
npm run dev:client

# Production client build test
npm run build:client
```

### Default Demo Account:
- **Email:** `demo@payflow.test`
- **Password:** `Password123!`
