import { Customer } from '../models/customer.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getCustomers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const { search, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  // Base filter enforces multi-tenant isolation
  const query = { user: req.user._id };

  if (status && ['active', 'inactive'].includes(status)) {
    query.status = status;
  }

  if (search && search.trim() !== '') {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { company: searchRegex },
    ];
  }

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [customers, totalItems] = await Promise.all([
    Customer.find(query).sort(sort).skip(skip).limit(limit),
    Customer.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return ApiResponse.success(
    res,
    {
      customers,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
    'Customers retrieved successfully'
  );
});

export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }

  return ApiResponse.success(res, { customer }, 'Customer retrieved successfully');
});

export const createCustomer = asyncHandler(async (req, res) => {
  const { name, email, phone, company, address, notes, status } = req.body;

  // Check duplicate email for current merchant
  const existingCustomer = await Customer.findOne({
    user: req.user._id,
    email: email.toLowerCase(),
  });

  if (existingCustomer) {
    throw new ApiError(409, 'A customer with this email address already exists in your account.');
  }

  const customer = await Customer.create({
    user: req.user._id,
    name,
    email: email.toLowerCase(),
    phone,
    company,
    address,
    notes,
    status: status || 'active',
  });

  return ApiResponse.created(res, { customer }, 'Customer created successfully');
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const { name, email, phone, company, address, notes, status } = req.body;

  const customer = await Customer.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }

  // If email is changing, check uniqueness within merchant account
  if (email && email.toLowerCase() !== customer.email) {
    const existing = await Customer.findOne({
      user: req.user._id,
      email: email.toLowerCase(),
      _id: { $ne: customer._id },
    });

    if (existing) {
      throw new ApiError(409, 'A customer with this email address already exists in your account.');
    }

    customer.email = email.toLowerCase();
  }

  if (name !== undefined) customer.name = name;
  if (phone !== undefined) customer.phone = phone;
  if (company !== undefined) customer.company = company;
  if (address !== undefined) customer.address = { ...customer.address.toObject(), ...address };
  if (notes !== undefined) customer.notes = notes;
  if (status !== undefined) customer.status = status;

  await customer.save();

  return ApiResponse.success(res, { customer }, 'Customer updated successfully');
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }

  return ApiResponse.success(res, null, 'Customer deleted successfully');
});
