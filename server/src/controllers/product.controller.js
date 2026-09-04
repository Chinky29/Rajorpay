import { Product } from '../models/product.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const { search, status, category, type, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  // Base filter enforces multi-tenant isolation
  const query = { user: req.user._id };

  if (status && ['active', 'inactive', 'archived'].includes(status)) {
    query.status = status;
  }

  if (type && ['one_time', 'recurring'].includes(type)) {
    query.type = type;
  }

  if (category && category.trim() !== '') {
    query.category = category.trim();
  }

  if (search && search.trim() !== '') {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { sku: searchRegex },
      { category: searchRegex },
    ];
  }

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [products, totalItems] = await Promise.all([
    Product.find(query).sort(sort).skip(skip).limit(limit),
    Product.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return ApiResponse.success(
    res,
    {
      products,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
    'Products retrieved successfully'
  );
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return ApiResponse.success(res, { product }, 'Product retrieved successfully');
});

export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, sku, price, currency, category, type, status } = req.body;

  const product = await Product.create({
    user: req.user._id,
    name,
    description: description || '',
    sku: sku ? sku.toUpperCase() : '',
    price,
    currency: currency || 'INR',
    category: category || 'General',
    type: type || 'one_time',
    status: status || 'active',
  });

  return ApiResponse.created(res, { product }, 'Product created successfully');
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, sku, price, currency, category, type, status } = req.body;

  const product = await Product.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (sku !== undefined) product.sku = sku.toUpperCase();
  if (price !== undefined) product.price = price;
  if (currency !== undefined) product.currency = currency;
  if (category !== undefined) product.category = category;
  if (type !== undefined) product.type = type;
  if (status !== undefined) product.status = status;

  await product.save();

  return ApiResponse.success(res, { product }, 'Product updated successfully');
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return ApiResponse.success(res, null, 'Product deleted successfully');
});
