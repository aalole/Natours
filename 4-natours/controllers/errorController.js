const AppError = require('./../utils/appError');

//NOTE DB error handlings not working yet
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path} : ${err.value}.`;
  return new AppError(message, 400);
}

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid Input data ${errors.join('. ')}`;
  return new AppError(message, 400);
}
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);
  const message = `Duplicate fields value~~ ${value}. Try another one`;
  return new AppError(message, 400)
  
}
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // send error to the client
  if(err.isOperational){
    console.log("production mode")
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // programming or other, log to console 
  }else{
    console.error("Error", err)
    res.status(500).json({
      status: 'Error',
      message: "Something went wrong"
    })
  }
};

module.exports = (err, req, res, next) => {
  console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = {...err};
    if(error.name === "CastError") error = handleCastErrorDB(error);
    if(error.code === 11000) error = handleDuplicateFieldsDB(error);
    if(error.name === "ValidationError") error = handleValidationErrorDB(error)

    sendErrorProd(error, res);
  }
};

// res.status(404).json({
//   status: "failed",
//   message : `Can't finf ${req.originalUrl} on this server`
// })
// const err = new Error(`Can't finf ${req.originalUrl} on this server`);
// err.status = "'fail";
// err.statusCode = 404;
