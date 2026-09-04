import { Router } from 'express';
import { handleRazorpayWebhook } from '../controllers/webhook.controller.js';

const router = Router();

// Webhook listener receives POST requests from Razorpay servers
router.post('/razorpay', handleRazorpayWebhook);

export default router;
