# PayFlow — Full-Stack Payment Operations & Fintech SaaS

> **PayFlow** is a production-grade, multi-tenant payment management and financial operations SaaS built with **React**, **Node.js/Express**, **MongoDB (Mongoose)**, and **Razorpay Test Mode**.

---

## 🚀 Key Features

- **🔐 Dual-Mode Authentication & Security:**
  - Secure JWT authentication stored in HTTP-only cookies and supported via `Authorization: Bearer <token>` headers.
  - Password encryption using `bcryptjs` with salt work factor 10.
  - Multi-tenant data isolation: all reads and writes are strictly scoped to the authenticated merchant context.

- **💳 Razorpay Test Mode Payment Operations:**
  - Server-side Razorpay Order creation (`POST /api/payments/create-order`) handling integer paise amounts.
  - Frontend Razorpay Checkout modal integration.
  - Server-side HMAC-SHA256 payment signature verification (`POST /api/payments/verify`).
  - Safe transaction state transitions (`created` &rarr; `authorized` &rarr; `captured` &rarr; `failed` &rarr; `refunded`).

- **⚡ Real-Time Webhook Engine & Idempotency:**
  - Dedicated webhook endpoint (`POST /api/webhooks/razorpay`) with `X-Razorpay-Signature` validation.
  - Webhook event deduplication storing event IDs in `WebhookEvent` to guarantee idempotent processing.
  - Handles `payment.captured`, `payment.failed`, `payment.authorized`, and `order.paid`.

- **🛡️ Failed Payment Recovery:**
  - Dedicated recovery view tracking total lost revenue and failure reasons (e.g. insufficient balance, gateway timeout, 3DS authentication declined).
  - 1-click **Retry Payment** workflow creating a new Razorpay checkout attempt linked to historical records.

- **📊 Deep Analytics & Proprietary Payment Health Score:**
  - Real-time gross settlement volume, average transaction value, and success/failure conversion funnels.
  - Interactive Revenue Velocity charts built with **Recharts**.
  - **Payment Health Score (0–100)**: Multi-dimensional metric scoring payment pipeline reliability.

- **🔄 Recurring Subscriptions Management:**
  - Plan definition (Basic, Pro, Enterprise) and billing cycle tracking (Monthly/Yearly).
  - MRR (Monthly Recurring Revenue) calculations and pause/resume/cancellation controls.

- **👥 360° Customer & Product Catalog:**
  - Customer profiles tracking lifetime spend, order history, and contact details.
  - Product catalog supporting one-time invoices and recurring subscription tiers.

- **🔔 Event-Driven Notifications:**
  - In-app notification center for captured payments, failure alerts, and new subscriptions.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Recharts, Lucide Icons |
| **Backend** | Node.js, Express.js (Modular Monolith architecture) |
| **Database** | MongoDB with Mongoose ODM (Indexes, compound unique keys, aggregation pipelines) |
| **Payment Gateway** | Razorpay SDK (Test Mode API & Webhooks) |
| **Security** | Helmet, CORS, Cookie-Parser, Zod schema validation, Crypto (HMAC-SHA256) |

---

## 📁 Folder Structure

```
payflow/
├── docs/                      # PRD, Architecture, Design, Rules, Phases specifications
│   ├── prd.md
│   ├── architecture.md
│   ├── design.md
│   ├── rules.md
│   └── phases.md
├── client/                    # React + Vite Frontend
│   ├── src/
│   │   ├── api/               # Axios client with auth interceptors
│   │   ├── context/           # AuthContext, ToastContext, NotificationContext
│   │   ├── components/        # Sidebar, Header, Layout, StatCard, Badge, Modal, DataTable, CheckoutModal, Skeleton, EmptyState
│   │   ├── pages/             # Login, Register, Dashboard, Customers, CustomerDetail, Products, Payments, PaymentDetail, FailedPayments, Subscriptions, Analytics, Notifications, Settings, NotFound
│   │   ├── utils/             # Formatters, currency helpers, health score calculators
│   │   ├── App.jsx            # Router configuration with ProtectedRoute guards
│   │   └── main.jsx
│   ├── index.html             # Razorpay Checkout SDK script
│   └── package.json
├── server/                    # Node.js + Express Backend
│   ├── src/
│   │   ├── config/            # DB connection, Environment variables
│   │   ├── controllers/       # Auth, Customer, Product, Payment, Webhook, Subscription, Analytics, Notification
│   │   ├── middlewares/       # Auth (JWT/Cookie), Error handler, Zod request validator
│   │   ├── models/            # User, Customer, Product, Transaction, Subscription, WebhookEvent, Notification
│   │   ├── routes/            # REST API endpoints
│   │   ├── services/          # Razorpay service, Analytics aggregations, Notification dispatcher
│   │   ├── validators/        # Zod request validation schemas
│   │   ├── seed.js            # Realistic demo data seeder
│   │   ├── app.js             # Express application & middleware setup
│   │   └── server.js          # HTTP server starter
│   └── package.json
└── package.json               # Root workspace scripts
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- **Node.js** 18+ and **npm**
- **MongoDB** running locally (`mongodb://127.0.0.1:27017/payflow`) or a MongoDB Atlas connection string.

### 2. Install Dependencies
```bash
# In the project root:
npm run install:all
```

### 3. Environment Variables Configuration

Copy the example environment files:
```bash
# Server environment:
cp server/.env.example server/.env

# Client environment:
cp client/.env.example client/.env
```

**`server/.env` example:**
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

**`client/.env` example:**
```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_YourKeyIdHere
```

---

## 🧪 Demo Data & Seed

To populate your database with realistic demo accounts, customers, products, 30 days of transactions, subscriptions, and notifications:

```bash
npm run seed
```

### Default Demo Credentials:
- **Email:** `demo@payflow.test`
- **Password:** `Password123!`
- *(A one-click "Auto-fill Demo" button is also provided on the login screen)*

---

## 🏃 Running the Application

### Development Mode (Concurrent Frontend & Backend):
```bash
npm run dev
```
- **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📡 API Overview

### Authentication
- `POST /api/auth/register` — Register new merchant business
- `POST /api/auth/login` — Sign in and receive JWT / session cookie
- `POST /api/auth/logout` — Clear session
- `GET /api/auth/me` — Get authenticated user profile

### Customers
- `GET /api/customers` — List customers (search & pagination)
- `POST /api/customers` — Create customer
- `GET /api/customers/:id` — Get customer profile
- `PUT /api/customers/:id` — Update customer
- `DELETE /api/customers/:id` — Delete customer

### Products
- `GET /api/products` — List catalog products (status/type filters)
- `POST /api/products` — Create product or subscription tier
- `GET /api/products/:id` — Get product
- `PUT /api/products/:id` — Update product
- `DELETE /api/products/:id` — Delete product

### Payments & Razorpay
- `POST /api/payments/create-order` — Create Razorpay Order & local transaction
- `POST /api/payments/verify` — Validate HMAC-SHA256 signature & capture payment
- `GET /api/payments` — Transaction ledger (filters by status/method/customer)
- `GET /api/payments/:id` — Transaction audit details & receipt
- `POST /api/payments/:id/retry` — Trigger new payment attempt for failed charge

### Webhooks
- `POST /api/webhooks/razorpay` — Ingest Razorpay events with HMAC verification and idempotency

### Subscriptions
- `GET /api/subscriptions` — List recurring subscriptions
- `POST /api/subscriptions` — Create subscription
- `GET /api/subscriptions/:id` — Subscription details
- `PATCH /api/subscriptions/:id` — Update status (pause, resume, cancel)
- `DELETE /api/subscriptions/:id` — Delete subscription

### Analytics
- `GET /api/analytics/overview` — Executive KPIs & recent payments
- `GET /api/analytics/revenue` — Daily revenue timeline (7d / 14d / 30d / 90d)
- `GET /api/analytics/payment-health` — Payment Health Score & system recommendations

### Notifications
- `GET /api/notifications` — Recent notifications & unread count
- `PATCH /api/notifications/:id/read` — Mark notification read
- `PATCH /api/notifications/read-all` — Mark all read

---

## 🔒 Payment Security Architecture

1. **Client Never Dictates Amounts or Status:** All charge amounts are verified and converted to integer paise on the server.
2. **Cryptographic Verification:** Every completed checkout response must pass HMAC-SHA256 signature verification matching `order_id|payment_id` against `RAZORPAY_KEY_SECRET`.
3. **Webhook Signature Validation:** Incoming webhooks validate `X-Razorpay-Signature` against `RAZORPAY_WEBHOOK_SECRET` using raw request payload buffers.
4. **Strict Idempotency:** Duplicate webhook events are discarded cleanly without double-counting transactions or customer spend totals.
5. **No Secret Leakage:** `RAZORPAY_KEY_SECRET` and `JWT_SECRET` are never exposed to the client bundle.

---

## 📄 License
PayFlow is open-source software licensed under the MIT License.
