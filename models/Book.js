const mongoose = require("mongoose")

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a title"],
    trim: true,
    maxlength: [100, "Title cannot be more than 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
    maxlength: [500, "Description cannot be more than 500 characters"],
  },
  image: {
    type: String,
    required: [true, "Please add a book cover image"],
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  library: {
    type: mongoose.Schema.ObjectId,
    ref: "Library",
    required: true,
  },
  borrower: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    default: null,
  },
  isBorrowed: {
    type: Boolean,
    default: false,
  },
  borrowedAt: {
    type: Date,
    default: null,
  },
  returnDate: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Book", BookSchema)

