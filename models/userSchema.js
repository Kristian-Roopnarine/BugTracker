const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please enter your first name'],
  },
  lastName: {
    type: String,
    required: [true, 'Please enter your last name'],
  },
  email: {
    type: String,
    required: [true, 'Your account needs an email address'],
    unique: true,
  },
  password: {
    type: String,
    select: false,
    required: [true, 'Enter a password for your account'],
  },
  passwordConfirm: {
    type: String,
    required: true,
    select: false,
    validate: {
      validator: function (val) {
        return this.password === val;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordLastChangedAt: {
    type: Date,
    default: Date.now(),
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.isPasswordCorrect = async function (
  enteredPass,
  actualPass
) {
  return await bcrypt.compare(enteredPass, actualPass);
};

const Users = mongoose.model('Users', userSchema);

module.exports = Users;
