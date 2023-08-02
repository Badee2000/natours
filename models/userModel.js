const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: [8],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //This only works on CREATE and SAVE !!!
      validator: function (el) {
        return el === this.password;
      },
    },
    message: 'Passwords are not the same!',
  },
  passwordChangedAt: { type: Date, select: true },

  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified.
  if (!this.isModified('password')) return next();

  // We use the cost to make a better password encryption, the higher the number the more cpu intensive.
  // Hash the password with cost of 12.
  this.password = await bcrypt.hash(this.password, 12);
  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

//this.password doesn't work anymore because "select: false" won't let it show anymore.

//'methods' we can do it with any User object so:
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  //If it is exist
  if (this.passwordChangedAt) {
    //We need to change the type from date to seconds SO:
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(changedTimeStamp, JWTTimestamp);
    return JWTTimestamp < changedTimeStamp;
  }

  //False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  //This token is what we are going to send to the user Then the user can use it to create a new password
  //It needs to be encrypted because we are going to store it in the database.
  //"We will compare this token with the token that the user will provide when we want to reset password!!".
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);
  //So this random token will work for only 10 minutes, but don't forget to convert it to milliseconds!.
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  //we sent the unencrypted reset token via email.
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

//Authentication and authorization is all about users signing up, logging in
//and accessing pages or routes that we grant them premission to do so.
