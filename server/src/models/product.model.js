import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Product must be associated with a user/merchant'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
      maxlength: [150, 'Product name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    sku: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: [0, 'Price must be greater than or equal to 0'],
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      enum: ['INR', 'USD', 'EUR', 'GBP'],
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    type: {
      type: String,
      enum: ['one_time', 'recurring'],
      default: 'one_time',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ user: 1, name: 1 });
productSchema.index({ user: 1, status: 1 });
productSchema.index({ user: 1, createdAt: -1 });

export const Product = mongoose.model('Product', productSchema);
