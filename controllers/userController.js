const Users = require('../models/userSchema');
const asyncCatchWrapper = require('./../utils/asyncCatchWrapper');

exports.getAllUsers = asyncCatchWrapper(async (req, res, next) => {
  const users = await Users.find();
  res.status(200).json({
    status: 'success',
    data: { users },
  });
});
