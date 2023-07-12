module.exports = (err, req, res, next) => {
  //THIS IS STACK TRACE AND IT TELLS WHERE IS THE ERROR HAPPENING
  //console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
