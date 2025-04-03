const User = require("../models/User")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/async")
const translations = require("../utils/translations")

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, preferredLanguage } = req.body

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
    preferredLanguage,
  })

  sendTokenResponse(user, 200, res, preferredLanguage || "en")
})

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body
  const preferredLanguage = req.body.preferredLanguage || "en"

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400))
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password")

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401))
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password)

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401))
  }

  // Update preferred language if provided
  if (preferredLanguage && user.preferredLanguage !== preferredLanguage) {
    user.preferredLanguage = preferredLanguage
    await user.save()
  }

  sendTokenResponse(user, 200, res, user.preferredLanguage)
})

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, lang) => {
  // Create token
  const token = user.getSignedJwtToken()

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
  }

  if (process.env.NODE_ENV === "production") {
    options.secure = true
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      message: user._id ? translations[lang].loggedIn : translations[lang].registered,
      token,
    })
}

// @desc    Update user language preference
// @route   PUT /api/users/language
// @access  Private
exports.updateLanguage = asyncHandler(async (req, res, next) => {
  const { preferredLanguage } = req.body
  const lang = req.user.preferredLanguage || "en"

  // Validate language
  if (!preferredLanguage || !["en", "hi"].includes(preferredLanguage)) {
    return next(new ErrorResponse(translations[lang].invalidLanguage || "Invalid language selection", 400))
  }

  // Update user language preference
  const user = await User.findByIdAndUpdate(req.user.id, { preferredLanguage }, { new: true })

  res.status(200).json({
    success: true,
    message: translations[preferredLanguage].updated,
    data: {
      preferredLanguage: user.preferredLanguage,
    },
  })
})

