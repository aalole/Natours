const User = require('./../models/userModel');
const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const handlerFactory = require('./handlerFactory');

// multer configuration (for storage and filter)
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('invalid file type, please upload an image!!', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

// photo resize middleware
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  // step 1) Check if there is a file on the req object
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

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

  const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  };
  //2) filter out all unwanted fields from req.body
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

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
// get currently logged in user
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
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
