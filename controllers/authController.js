const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const Users = require('../models/userSchema');
const asyncCatchWrapper = require('./../utils/asyncCatchWrapper');
const sendEmail = require('./../utils/email.js');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = asyncCatchWrapper(async (req, res, next) => {
  const { body } = req;
  const data = await Users.create(body);
  createSendToken(data, 201, res);
});

exports.login = asyncCatchWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please enter email or password', 404));
  }

  const user = await Users.findOne({ email: email }).select('+password');

  if (!user || !(await user.isPasswordCorrect(password, user.password))) {
    return next(new AppError('Incorrect email or password', 404));
  }
  createSendToken(user, 200, res);
});

exports.forgotPassword = asyncCatchWrapper(async (req, res, next) => {
  const { email } = req.body;
  const user = await Users.findOne({ email });
  if (!user) return next(AppError('User with that email does not exist', 404));

  // generate user token
  const resetToken = user.createPasswordResetToken();
  // saves changes to password reset field to db
  await user.save();
  //res.status(201).json({ status: 'Token created', resetToken });

  // send email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and password confirm to: ${resetURL}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 mins)',
      message,
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email',
  });
});

exports.resetPassword = asyncCatchWrapper(async (req, res, next) => {
  // 1) Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  // 2) if token has not expired, and there is a user, set the new password
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  // 3) update changedPasswordAt property for the user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 4) log user in and send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = asyncCatchWrapper(async (req, res, next) => {
  // 1) Get user from collection
  // create middleware to transform JWT to user id
  const user = await User.findById(req.user.id).select('+password');
  // 2) check if POSTed current pasword is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  // 3) if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // 4) log user in, send new JWT
  createSendToken(user, 200, res);
});
