// utils/response.js

const successResponse = (
  data,
  message = "Request was successful",
  statusCode = 200
) => {
  return {
    success: true,
    message,
    data,
    statusCode,
  };
};

const errorResponse = (
  error,
  message = "An error occurred",
  statusCode = 500
) => {
  return {
    success: false,
    message,
    error,
    statusCode,
  };
};

module.exports = {
  successResponse,
  errorResponse,
};
