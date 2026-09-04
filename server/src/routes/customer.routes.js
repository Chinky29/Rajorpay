import { Router } from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customer.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createCustomerSchema,
  updateCustomerSchema,
} from '../validators/customer.validator.js';

const router = Router();

// All customer routes are protected by authentication
router.use(requireAuth);

router.route('/')
  .get(getCustomers)
  .post(validate(createCustomerSchema), createCustomer);

router.route('/:id')
  .get(getCustomerById)
  .put(validate(updateCustomerSchema), updateCustomer)
  .delete(deleteCustomer);

export default router;
