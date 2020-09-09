const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const handlerFactory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// update authenticated and valid user data
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) create error if user post password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'You cannot change your password in this route. Use /updateMyPassword.',
        400
      )
    );
  }

  //2) filter out all unwanted fields from rer.body
  const filteredBody = filterObj(req.body, 'name', 'email');

  //3) update user document
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
exports.getMe = (req, res, next) => { 
  req.params.id = req.user.id;
  next();
}
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    message: 'success',
    data: null,
  });
});

exports.postUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route does not exist. Please use /sign up instead',
  });
};

exports.getAllUsers = handlerFactory.getAll(User);
exports.getSingleUser = handlerFactory.getOne(User);

// NOTE: DO NOT CHANGE PASSWORD HERE!
exports.updateUser = handlerFactory.updateOne(User);
exports.deleteUser = handlerFactory.deleteOne(User);
