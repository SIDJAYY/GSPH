export const errorHandler = (error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  // Default error response
  const errorResponse = {
    error: 'Internal server error',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  };

  // In development, include more error details
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
    errorResponse.details = error.message;
  }

  res.status(500).json(errorResponse);
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: 'The requested endpoint does not exist',
    path: req.path,
    timestamp: new Date().toISOString()
  });
}; 