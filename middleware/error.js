const ErrorResponse = require("../utils/errorResponse")
const translations = require("../utils/translations")

const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // Log to console for dev
  console.log(err.stack.red)

  // Get user's preferred language
  // Default to 'en' if user is not authenticated or language not set
  const lang = req.user ? req.user.preferredLanguage : "en"
  console.log(`Using language: ${lang} for error response`)

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = translations[lang].resourceNotFound
    error = new ErrorResponse(message, 404)
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = translations[lang].duplicateField
    error = new ErrorResponse(message, 400)
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ")
    error = new ErrorResponse(message, 400)
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || translations[lang].serverError,
  })
}

module.exports = errorHandler

