const express = require('express');
const app = express();
const morgan = require('morgan');

const globalErrorHandler = require('./controllers/errorController');

const authRouter = require('./routes/authRoutes.js');
const AppError = require('./utils/appError');

app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'Congrats!',
    message: 'Testing',
  });
});

app.use('/api/v1/auth', authRouter);

// undefined route handler
app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Could not find the requested url ${req.protocol}://${req.hostname}${req.url}`,
      404
    )
  );
});

// global error handling middle ware for development
app.use(globalErrorHandler);
module.exports = app;
