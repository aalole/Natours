const express = require('express');
const morgan = require('morgan');

const app = express();
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.static(`${__dirname}/public`));

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

//1) MIDDLEWARE
app.use((req, res, next) => {
  console.log('hello from middelware');
  next();
});
app.use((req, res, next) => {
  req.getReqTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//TOUROUTER
module.exports = app;