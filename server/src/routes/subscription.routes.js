import { Router } from 'express';
import {
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from '../controllers/subscription.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
} from '../validators/subscription.validator.js';

const router = Router();

router.use(requireAuth);

router.route('/')
  .get(getSubscriptions)
  .post(validate(createSubscriptionSchema), createSubscription);

router.route('/:id')
  .get(getSubscriptionById)
  .patch(validate(updateSubscriptionSchema), updateSubscription)
  .delete(deleteSubscription);

export default router;
