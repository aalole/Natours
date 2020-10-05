const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Users = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const signInToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_WHEN,
  });
};
// fuction to generate token, response and statusCode
const createSendToken = (user, statusCode, res) => {
  const token = signInToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_JWT_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure : true,
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.securrOnly = true;

  res.cookie('jwt', token, cookieOptions);
  //remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res) => {
  const NewUser = await Users.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    passwordResetToken: req.body.passwordResetToken,
    passwordResetExpires: req.body.passwordResetExpires,
    active: req.body.active,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  // console.log(url);
  await new Email(NewUser, url).sendWelcome();
  // our createSendToken in action
  createSendToken(NewUser, 201, res);
});

// login function
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //CASE1 check if there is email and password in the paramenters
  if (!email || !password) {
    return next(new AppError('please enter yor email and password', 400));
  }
  //CASE2 check if user exists and password is correct
  const user = await Users.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('incorrect email or password', 401));
  }

  //CASE3 if everything is okay, send a 200 response
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'logged out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};
exports.protect = catchAsync(async (req, res, next) => {
  // 1) check if there is token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to have access!!', 401)
    );
  }
  // 2) token verification
  const tokenDecoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );
  // 3) check if user with this token still existss
  const freshUser = await Users.findById(tokenDecoded.id);
  if (!freshUser) {
    return next(
      new AppError('This user no longer exists!!. Sign up again', 401)
    );
  }
  // 4) check if user changes the password after token is issued
  if (freshUser.passwordChangedAfter(tokenDecoded.iat)) {
    return next(
      new AppError('User recently change password!! Please log in await', 401)
    );
  }
  // GRANT ACCESS TO PROTECTED ROUTES
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) check if there is token
      const tokenDecoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET_KEY
      );
      // 2) check if user with this token still existss
      const freshUser = await Users.findById(tokenDecoded.id);
      if (!freshUser) {
        return next();
      }
      // 4) check if user changes the password after token is issued
      if (freshUser.passwordChangedAfter(tokenDecoded.iat)) {
        return next();
      }
      // THERE IS A LOGGED IN USER
      res.locals.user = freshUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // note:: roles =["admin", "lead-guide"], role === user
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'Permission denied!!. You cannot perform this operation',
          403
        )
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get the user based on the posted email
  const user = await Users.findOne({ email: req.body.email });
  // console.log(user);
  if (!user) {
    return next(new AppError('invalid email address', 404));
  }
  // 2) generate a random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // return resetToken;
  // 3  ) send it back to user email
  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: `Your password reset token (Valid for 10 minutes)`,
    //   message,
    // });
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetUrl).sendPasswordReset()

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });  
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log('ERROR', err);
    return next(
      new AppError('There was an error sending the email. Try again later', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const harshedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await Users.findOne({
    passwordResetToken: harshedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid or expired token ', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) check if user exists in the user collection
  const user = await Users.findById(req.user.id).select('+password');

  // 2) check if the current posted password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  // 3) if so, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // 4) login the user by sending back the JWT
  createSendToken(user, 200, res);
});
