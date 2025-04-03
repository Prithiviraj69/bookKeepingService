const Book = require("../models/Book")
const User = require("../models/User")
const Library = require("../models/Library")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/async")
const cloudinary = require("../utils/cloudinary")
const localFileStorage = require("../utils/localFileStorage")
const translations = require("../utils/translations")

// @desc    Get all books
// @route   GET /api/books
// @access  Private
exports.getBooks = asyncHandler(async (req, res, next) => {
  const books = await Book.find()
    .populate({
      path: "author",
      select: "name email",
    })
    .populate({
      path: "library",
      select: "name address",
    })
    .populate({
      path: "borrower",
      select: "name email",
    })

  // Get user's preferred language
  const lang = req.user.preferredLanguage || "en"
  console.log(`Using language: ${lang} for books response`)

  res.status(200).json({
    success: true,
    message: translations[lang].success,
    count: books.length,
    data: books,
  })
})

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Private
exports.getBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id)
    .populate({
      path: "author",
      select: "name email",
    })
    .populate({
      path: "library",
      select: "name address",
    })
    .populate({
      path: "borrower",
      select: "name email",
    })

  if (!book) {
    const lang = req.user.preferredLanguage
    return next(new ErrorResponse(translations[lang].resourceNotFound, 404))
  }

  const lang = req.user.preferredLanguage

  res.status(200).json({
    success: true,
    message: translations[lang].success,
    data: book,
  })
})

// @desc    Create new book
// @route   POST /api/books
// @access  Private (Authors only)
exports.createBook = asyncHandler(async (req, res, next) => {
  // Add author to req.body
  req.body.author = req.user.id

  // Check if user is an author
  if (req.user.role !== "author" && req.user.role !== "admin") {
    const lang = req.user.preferredLanguage
    return next(new ErrorResponse(translations[lang].unauthorized, 403))
  }

  // Check if library exists
  const library = await Library.findById(req.body.library)
  if (!library) {
    const lang = req.user.preferredLanguage
    return next(new ErrorResponse(translations[lang].resourceNotFound, 404))
  }

  // Handle file upload
  if (req.file) {
    try {
      // Try Cloudinary first
      try {
        console.log("Attempting Cloudinary upload...")
        const imageUrl = await cloudinary.uploadFile(req.file)
        console.log("Cloudinary upload successful:", imageUrl)
        req.body.image = imageUrl
      } catch (cloudinaryError) {
        console.error("Cloudinary upload failed, falling back to local storage:", cloudinaryError)
        // Fall back to local storage
        const imageUrl = await localFileStorage.uploadFile(req.file)
        console.log("Local storage upload successful:", imageUrl)
        req.body.image = imageUrl
      }
    } catch (error) {
      console.error("All file upload methods failed:", error)
      const lang = req.user.preferredLanguage
      return next(new ErrorResponse("Failed to upload image. Please try again.", 500))
    }
  } else if (!req.body.image) {
    const lang = req.user.preferredLanguage
    return next(new ErrorResponse("Please add a book cover image", 400))
  }

  const book = await Book.create(req.body)

  const lang = req.user.preferredLanguage

  res.status(201).json({
    success: true,
    message: translations[lang].created,
    data: book,
  })
})

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private (Author of the book or Admin)
exports.updateBook = asyncHandler(async (req, res, next) => {
  let book = await Book.findById(req.params.id)
  const lang = req.user.preferredLanguage

  if (!book) {
    return next(new ErrorResponse(translations[lang].resourceNotFound, 404))
  }

  // Make sure user is book author or admin
  if (book.author.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(translations[lang].unauthorized, 403))
  }

  // Handle file upload
  if (req.file) {
    try {
      // Try to delete old image if it exists
      if (book.image) {
        if (book.image.includes("cloudinary")) {
          await cloudinary
            .deleteFile(book.image)
            .catch((err) => console.error("Error deleting old image from Cloudinary:", err))
        } else if (book.image.startsWith("/uploads/")) {
          await localFileStorage
            .deleteFile(book.image)
            .catch((err) => console.error("Error deleting old image from local storage:", err))
        }
      }

      // Try Cloudinary first
      try {
        console.log("Attempting Cloudinary upload...")
        const imageUrl = await cloudinary.uploadFile(req.file)
        console.log("Cloudinary upload successful:", imageUrl)
        req.body.image = imageUrl
      } catch (cloudinaryError) {
        console.error("Cloudinary upload failed, falling back to local storage:", cloudinaryError)
        // Fall back to local storage
        const imageUrl = await localFileStorage.uploadFile(req.file)
        console.log("Local storage upload successful:", imageUrl)
        req.body.image = imageUrl
      }
    } catch (error) {
      console.error("All file upload methods failed:", error)
      return next(new ErrorResponse("Failed to upload image. Please try again.", 500))
    }
  }

  book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    message: translations[lang].updated,
    data: book,
  })
})

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private (Author of the book or Admin)
exports.deleteBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id)
  const lang = req.user.preferredLanguage || "en"

  if (!book) {
    return next(new ErrorResponse(translations[lang].resourceNotFound, 404))
  }

  // Make sure user is book author or admin
  if (book.author.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(translations[lang].unauthorized, 403))
  }

  // Check if the book is currently borrowed
  if (book.isBorrowed) {
    // Use translation for this error message
    return next(new ErrorResponse(translations[lang].bookNotAvailable, 400))
  }

  // Delete image
  if (book.image) {
    try {
      if (book.image.includes("cloudinary")) {
        await cloudinary
          .deleteFile(book.image)
          .catch((err) => console.error("Error deleting image from Cloudinary:", err))
      } else if (book.image.startsWith("/uploads/")) {
        await localFileStorage
          .deleteFile(book.image)
          .catch((err) => console.error("Error deleting image from local storage:", err))
      }
    } catch (error) {
      console.error("Error deleting image:", error)
      // Continue with book deletion even if image deletion fails
    }
  }

  await Book.deleteOne({ _id: req.params.id })

  res.status(200).json({
    success: true,
    message: translations[lang].deleted,
    data: {},
  })
})

