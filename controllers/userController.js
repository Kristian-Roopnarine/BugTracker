const Users = require('../models/userSchema');
const asyncCatchWrapper = require('./../utils/asyncCatchWrapper');
const AppError = require('./../utils/appError.js');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newobj[el] = obj[el];
  });
  return newObj;
};
exports.getAllUsers = asyncCatchWrapper(async (req, res, next) => {
  const users = await Users.find();
  res.status(200).json({
    status: 'success',
    data: { users },
  });
});

exports.updateMe = asyncCatchWrapper(async (req, res, next) => {
  // 1) if user POSTs password data throw error
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassowrd',
        400
      )
    );
  }
  // filtered out unwanted fields name
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
