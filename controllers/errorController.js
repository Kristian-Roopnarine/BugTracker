const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: `${err.message}`,
    stack: err.stack,
  });
};

module.exports = {
  handleCastErrorDB,
  sendDevError,
};
