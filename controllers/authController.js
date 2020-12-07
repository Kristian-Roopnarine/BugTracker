const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const Users = require('../models/userSchema');
const asyncCatchWrapper = require('./../utils/asyncCatchWrapper');
const sendEmail = require('./../utils/email.js');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

exports.signup = asyncCatchWrapper(async (req, res, next) => {
  const { body } = req;
  const data = await Users.create(body);
  const token = signToken(data._id);
  res.status(200).json({
    status: 'created',
    token,
    data,
  });
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
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
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
