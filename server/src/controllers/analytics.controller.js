import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as analyticsService from '../services/analytics.service.js';

export const getOverview = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const metrics = await analyticsService.getOverviewMetrics(req.user._id, startDate, endDate);
  return ApiResponse.success(res, metrics, 'Analytics overview retrieved successfully');
});

export const getRevenue = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const timeline = await analyticsService.getRevenueTimeline(req.user._id, days);
  return ApiResponse.success(res, { timeline }, 'Revenue timeline retrieved successfully');
});

export const getPaymentHealth = asyncHandler(async (req, res) => {
  const metrics = await analyticsService.getOverviewMetrics(req.user._id);
  const health = metrics.paymentHealth;

  const recommendations = [];
  if (health.failureRate > 15) {
    recommendations.push('High failure rate detected: review gateway timeouts and enable automated retry workflows.');
  }
  if (health.pendingRate > 20) {
    recommendations.push('Elevated pending transactions: ensure webhooks are actively synchronizing payment states.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Payment pipeline is running optimally with healthy conversion rates.');
  }

  return ApiResponse.success(
    res,
    {
      ...health,
      recommendations,
    },
    'Payment health metrics retrieved'
  );
});
