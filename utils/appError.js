//THIS CLASS IS FOR OPERATIONAL ERRORS

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    //IN THIS WAY WHEN A NEW OBJECT IS CREATED AND A CONSTRUCTION FUNCTION IS CALLED, THEN THAT FUNCTION CALL IS NOT GOING TO APPEAR IN THE STACK TRACE, AND WILL NOT POLLUTE IT.
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
