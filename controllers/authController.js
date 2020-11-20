const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const Users = require('../models/userSchema');
const asyncCatchWrapper = require('./../utils/asyncCatchWrapper');

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
