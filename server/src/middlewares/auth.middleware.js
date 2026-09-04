import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { config } from '../config/env.js';

export const requireAuth = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check cookies first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Check Authorization Bearer header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Authentication required. Please log in.');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Attach decoded JWT payload directly to request context
    req.user = {
      _id: decoded.id,
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      businessName: decoded.businessName,
    };

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid authentication token');
    }
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Authentication token has expired. Please log in again.');
    }
    throw err;
  }
});
