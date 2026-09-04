import { Router } from 'express';
import {
  getOverview,
  getRevenue,
  getPaymentHealth,
} from '../controllers/analytics.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/overview', getOverview);
router.get('/revenue', getRevenue);
router.get('/payment-health', getPaymentHealth);

export default router;
