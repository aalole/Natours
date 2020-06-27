const express = require('express');
const morgan = require('morgan');

const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.getReqTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//Handling wrong url errors
app.all('*', (req, res, next) => {
  next(new appError(`Can't find ${req.originalUrl} on this server`), 404);
});

//GENERAL ERROR HANDLING FUNCTION
app.use(globalErrorHandler);

//TOUROUTER
module.exports = app;
