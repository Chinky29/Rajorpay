# PayFlow — Engineering Rules & Constraints

1. **Security First:** Never trust input from the client. Never expose secrets (`RAZORPAY_KEY_SECRET`, `JWT_SECRET`, `RAZORPAY_WEBHOOK_SECRET`) to the browser.
2. **Data Isolation:** All database read/write queries must enforce `user: req.user._id` multi-tenant boundaries.
3. **Idempotency:** Webhook processing must check `WebhookEvent` history before applying state changes to prevent duplicate accounting.
4. **Amount Integrity:** Always handle amounts in base units / paise for Razorpay calculations and avoid floating-point math inaccuracies.
5. **No Direct Secret Commits:** Use environment variables and provide `.env.example` templates.
6. **Graceful Error Handling:** Centralize API responses via `ApiResponse` and `ApiError` utilities.
