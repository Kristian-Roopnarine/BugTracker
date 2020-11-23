const mongoose = require('mongoose');

exports.connectDB = function (dbString) {
  return mongoose.connect(dbString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
};
