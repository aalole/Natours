const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

// MIDDLEWARES
// SET security http headers
app.use(helmet());

// loggin in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// setting rate limit from the same IP ADDRESS
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many request from this IP address. Try again in an hour',
});

app.use('/api', limiter);
// body parser, reading data from body to req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against noSql query injection attack
app.use(mongoSanitize());

// Data sanitization against cross site scripting
app.use(xss());
// serving static files
app.use(express.static(`${__dirname}/public`));

// preventing parameter solution
app.use(
  hpp({
    whitelist: [
      'ratingsAverage',
      'ratingsQuantity',
      'price',
      'difficulty',
      'duration',
      'maxGroupSize',
    ],
  })
);

// testing middleware
app.use((req, res, next) => {
  req.getReqTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//Handling wrong url errors
app.all('*', (req, res, next) => {
  next(new appError(`Can't find ${req.originalUrl} on this server`), 404);
});

//GENERAL ERROR HANDLING FUNCTION
app.use(globalErrorHandler);

//TOUROUTER
module.exports = app;
