import { Router } from 'express';
import { isDbConnected } from '../config/db.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { config } from '../config/env.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const dbStatus = isDbConnected() ? 'connected' : 'disconnected';
    const uptimeInSeconds = Math.floor(process.uptime());

    const healthData = {
      status: 'ok',
      service: 'PayFlow API',
      version: '1.0.0',
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
      uptime: `${uptimeInSeconds}s`,
      database: {
        status: dbStatus,
      },
    };

    return ApiResponse.success(res, healthData, 'PayFlow API is healthy and operational');
  })
);

export default router;
