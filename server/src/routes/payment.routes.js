import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  getPayments,
  getPaymentById,
  retryPayment,
} from '../controllers/payment.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createOrderSchema,
  verifyPaymentSchema,
} from '../validators/payment.validator.js';

const router = Router();

router.use(requireAuth);

router.post('/create-order', validate(createOrderSchema), createOrder);
router.post('/verify', validate(verifyPaymentSchema), verifyPayment);
router.get('/', getPayments);
router.get('/:id', getPaymentById);
router.post('/:id/retry', retryPayment);

export default router;
