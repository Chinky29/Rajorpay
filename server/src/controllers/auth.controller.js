import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { config } from '../config/env.js';

// Helper to set secure auth cookie
const sendAuthCookie = (res, token) => {
  const isProduction = config.nodeEnv === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  };

  res.cookie('token', token, cookieOptions);
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, businessName } = req.body;

  // Check if email already registered
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email address already exists.');
  }

  // Create new user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    businessName,
  });

  // Generate auth token
  const token = user.generateAuthToken();
  sendAuthCookie(res, token);

  const sanitizedUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    businessName: user.businessName,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };

  return ApiResponse.created(
    res,
    {
      user: sanitizedUser,
    },
    'Account registered successfully'
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email and explicitly select password
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  // Generate auth token
  const token = user.generateAuthToken();
  sendAuthCookie(res, token);

  const sanitizedUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    businessName: user.businessName,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };

  return ApiResponse.success(
    res,
    {
      user: sanitizedUser,
    },
    'Logged in successfully'
  );
});

export const logout = asyncHandler(async (req, res) => {
  const isProduction = config.nodeEnv === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
  });

  return ApiResponse.success(res, null, 'Logged out successfully');
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('name email businessName role avatar isVerified createdAt updatedAt')
    .lean();

  if (!user) {
    throw new ApiError(404, 'User account no longer exists.');
  }

  return ApiResponse.success(
    res,
    {
      user,
    },
    'Current user profile retrieved successfully'
  );
});
