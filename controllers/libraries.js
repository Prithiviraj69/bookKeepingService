const Library = require("../models/Library")
const Book = require("../models/Book")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/async")
const translations = require("../utils/translations")
const cloudinary = require("../utils/cloudinary")
const localFileStorage = require("../utils/localFileStorage")

// @desc    Get all libraries
// @route   GET /api/libraries
// @access  Private
exports.getLibraries = asyncHandler(async (req, res, next) => {
  const libraries = await Library.find()
  const lang = req.user.preferredLanguage || "en"
  console.log(`Using language: ${lang} for libraries response`)

  res.status(200).json({
    success: true,
    message: translations[lang].success,
    count: libraries.length,
    data: libraries,
  })
})

// @desc    Get single library with books
// @route   GET /api/libraries/:id
// @access  Private
exports.getLibrary = asyncHandler(async (req, res, next) => {
  const library = await Library.findById(req.params.id)
  const lang = req.user.preferredLanguage

  if (!library) {
    return next(new ErrorResponse(translations[lang].resourceNotFound, 404))
  }

  // Get all books in this library
  const books = await Book.find({ library: req.params.id })
    .populate({
      path: "author",
      select: "name email",
    })
    .populate({
      path: "borrower",
      select: "name email",
    })

  res.status(200).json({
    success: true,
    message: translations[lang].success,
    data: {
      ...library._doc,
      books,
    },
  })
})

// @desc    Create new library
// @route   POST /api/libraries
// @access  Private (Admin only)
exports.createLibrary = asyncHandler(async (req, res, next) => {
  const library = await Library.create(req.body)
  const lang = req.user.preferredLanguage

  res.status(201).json({
    success: true,
    message: translations[lang].created,
    data: library,
  })
})

// @desc    Update library
// @route   PUT /api/libraries/:id
// @access  Private (Admin only)
exports.updateLibrary = asyncHandler(async (req, res, next) => {
  let library = await Library.findById(req.params.id)
  const lang = req.user.preferredLanguage

  if (!library) {
    return next(new ErrorResponse(translations[lang].resourceNotFound, 404))
  }

  library = await Library.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    message: translations[lang].updated,
    data: library,
  })
})

// @desc    Delete library
// @route   DELETE /api/libraries/:id
// @access  Private (Admin only)
exports.deleteLibrary = asyncHandler(async (req, res, next) => {
  const library = await Library.findById(req.params.id)
  const lang = req.user.preferredLanguage

  if (!library) {
    return next(new ErrorResponse(translations[lang].resourceNotFound, 404))
  }

  // Check if there are any books in this library
  const books = await Book.find({ library: req.params.id })

  if (books.length > 0) {
    return next(new ErrorResponse("Cannot delete library that contains books. Remove all books first.", 400))
  }

  await Library.deleteOne({ _id: req.params.id })

  res.status(200).json({
    success: true,
    message: translations[lang].deleted,
    data: {},
  })
})

// @desc    Get library inventory
// @route   GET /api/libraries/:id/inventory
// @access  Private
exports.getLibraryInventory = asyncHandler(async (req, res, next) => {
  const library = await Library.findById(req.params.id)
  const lang = req.user.preferredLanguage

  if (!library) {
    return next(new ErrorResponse(translations[lang].resourceNotFound, 404))
  }

  // Get all available books in this library
  const books = await Book.find({
    library: req.params.id,
    isBorrowed: false,
  }).populate({
    path: "author",
    select: "name email",
  })

  res.status(200).json({
    success: true,
    message: translations[lang].success,
    count: books.length,
    data: books,
  })
})

// @desc    Add book to library inventory
// @route   POST /api/libraries/:id/inventory
// @access  Private (Admin only)
exports.addBookToInventory = asyncHandler(async (req, res, next) => {
  const library = await Library.findById(req.params.id)
  const lang = req.user.preferredLanguage

  if (!library) {
    return next(new ErrorResponse(translations[lang].resourceNotFound, 404))
  }

  // Add library id to book
  req.body.library = req.params.id

  // Add author to req.body
  req.body.author = req.user.id

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
      return next(new ErrorResponse("Failed to upload image. Please try again.", 500))
    }
  } else if (!req.body.image) {
    return next(new ErrorResponse("Please add a book cover image", 400))
  }

  const book = await Book.create(req.body)

  res.status(201).json({
    success: true,
    message: translations[lang].bookAddedToInventory,
    data: book,
  })
})

// @desc    Remove book from library inventory
// @route   DELETE /api/libraries/:id/inventory/:bookId
// @access  Private (Admin only)
exports.removeBookFromInventory = asyncHandler(async (req, res, next) => {
  const { id, bookId } = req.params
  const lang = req.user.preferredLanguage || "en"
  console.log(`Using language: ${lang} for remove book response`)

  // Check if library exists
  const library = await Library.findById(id)

  if (!library) {
    return next(new ErrorResponse(translations[lang].resourceNotFound, 404))
  }

  // Check if book exists and belongs to this library
  const book = await Book.findOne({
    _id: bookId,
    library: id,
  })

  if (!book) {
    return next(new ErrorResponse(translations[lang].resourceNotFound, 404))
  }

  // Check if book is currently borrowed
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

  await Book.deleteOne({ _id: bookId })

  res.status(200).json({
    success: true,
    message: translations[lang].bookRemovedFromInventory,
    data: {},
  })
})

