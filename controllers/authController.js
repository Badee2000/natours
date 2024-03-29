/* eslint-disable import/no-extraneous-dependencies */
//To do most of the user-related stuff here: creating new users, logging users in or updating passwords.
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

//TOKEN
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

//The concept of logging a user in, means to sign a JSON web token and send it back to the client
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) Check if email and password exist

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  //2) Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');
  // console.log(user);
  // correctPassword is an async function
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect emai or password', 401));
  }
  //3) If everything is ok, send token to the client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // console.log(token);
  if (!token) {
    return next(
      new AppError('You are not logged in! Please login to access.', 401)
    );
  }

  //2) Verification token "So if the token is validate and the payload hasn't changed" Or token expired.
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) Check if user still exist.
  const currentUser = await User.findById(decoded.id);
  // console.log(currentUser);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token is no longer available!',
        401
      )
    );
  }
  // console.log(currentUser);
  //4) Check if user changed password after the token was issued.
  //'iat': Issued At.
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again', 401)
    );
  }
  // console.log(currentUser);
  //GRANT ACCESS TO PROTECTED ROUTE.
  req.user = currentUser;
  // console.log(req.user);
  next();
});
//After authenticating the user, We should know that not every user can delete a Tour for example.
//So, he should have authorization to do it
//We can't use arguments in middleware functions.
//So, we need to put the middleware function in a wrapper function.
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have permission to perform this action", 403)
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1)Get user based on POSTED email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }
  //2)Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  //Now we save the modified data in the function that we used.
  await user.save({ validateBeforeSave: false });
  // console.log(resetToken);

  //3)send it to user's email
  //We are preparing it to work in development and production.
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and
    passwordConfirm to: ${resetURL}.\nIf you didn't forget your password please ignore this email!`;

  //Sending email is an asynchronous function
  //We won't use only the regular error handling function because we are not only going to send and error,
  //We will set back the reset token and the expire date.
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});
exports.resetPassword = (req, res, next) => {
  console.log('asdfasdf');
  next();
};
