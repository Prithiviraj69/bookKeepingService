const Book = require("../models/Book")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/async")
const translations = require("../utils/translations")

// @desc    Borrow a book
// @route   POST /api/borrow
// @access  Private (Borrowers only)
exports.borrowBook = asyncHandler(async (req, res, next) => {
  const { bookId } = req.body
  const lang = req.user.preferredLanguage || "en"
  console.log(`Using language: ${lang} for borrow book response`)

  // Check if book exists
  const book = await Book.findById(bookId)

  if (!book) {
    return next(new ErrorResponse(translations[lang].resourceNotFound, 404))
  }

  // Check if book is already borrowed
  if (book.isBorrowed) {
    return next(new ErrorResponse(translations[lang].bookNotAvailable, 400))
  }

  // Set borrower and borrowing details
  book.borrower = req.user.id
  book.isBorrowed = true
  book.borrowedAt = Date.now()

  // Set return date (e.g., 14 days from now)
  const returnDate = new Date()
  returnDate.setDate(returnDate.getDate() + 14)
  book.returnDate = returnDate

  await book.save()

  res.status(200).json({
    success: true,
    message: translations[lang].bookBorrowed,
    data: book,
  })
})

// @desc    Return a book
// @route   PUT /api/return/:id
// @access  Private (Borrower of the book or Admin)
exports.returnBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id)
  const lang = req.user.preferredLanguage || "en"
  console.log(`Using language: ${lang} for return book response`)

  if (!book) {
    return next(new ErrorResponse(translations[lang].resourceNotFound, 404))
  }

  // Check if book is borrowed
  if (!book.isBorrowed) {
    // Use translation for this error message
    return next(new ErrorResponse(translations[lang].bookNotAvailable, 400))
  }

  // Check if user is the borrower or admin
  if (book.borrower.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(translations[lang].unauthorized, 403))
  }

  // Reset borrowing details
  book.borrower = null
  book.isBorrowed = false
  book.borrowedAt = null
  book.returnDate = null

  await book.save()

  res.status(200).json({
    success: true,
    message: translations[lang].bookReturned,
    data: book,
  })
})

