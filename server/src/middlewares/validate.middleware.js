import { ApiError } from '../utils/apiError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const validatedData = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // Attach validated values to request if available
    if (validatedData.body) req.body = validatedData.body;
    if (validatedData.query) req.query = validatedData.query;
    if (validatedData.params) req.params = validatedData.params;

    next();
  } catch (error) {
    if (error.errors) {
      const formattedErrors = error.errors.map((err) => ({
        path: err.path.join('.').replace(/^(body|query|params)\.?/, ''),
        message: err.message,
      }));
      return next(new ApiError(422, 'Request validation failed', formattedErrors));
    }
    next(new ApiError(422, error.message || 'Validation error'));
  }
};
