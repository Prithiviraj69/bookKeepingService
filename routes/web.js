const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const Book = require("../models/Book")
const Library = require("../models/Library")
const multer = require("multer")
// Remove the Firebase import
// const firebase = require("../utils/firebase")

// Middleware to check if user is authenticated
const isAuthenticated = async (req, res, next) => {
  try {
    let token = null

    // Check for token in cookies
    if (req.cookies.token) {
      token = req.cookies.token
    }

    // Check for token in localStorage (sent in request header)
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }

    if (!token) {
      return next()
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      return next()
    }

    // Set user in request
    req.user = user
    res.locals.user = user
    next()
  } catch (error) {
    next()
  }
}

// Apply authentication middleware to all routes
router.use(isAuthenticated)

// Set default values for all routes
router.use((req, res, next) => {
  res.locals.user = req.user || null
  res.locals.path = req.path
  res.locals.messages = []
  next()
})

// Home page
router.get("/", (req, res) => {
  res.render("index", { title: "Home" })
})

// Login page
router.get("/login", (req, res) => {
  if (req.user) {
    return res.redirect("/")
  }
  res.render("login", { title: "Login" })
})

// Register page
router.get("/register", (req, res) => {
  if (req.user) {
    return res.redirect("/")
  }
  res.render("register", { title: "Register" })
})

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token")
  res.redirect("/login")
})

// Books routes
router.get("/books", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = 12
    const skip = (page - 1) * limit

    const booksCount = await Book.countDocuments()
    const books = await Book.find()
      .populate("author", "name")
      .populate("library", "name")
      .populate("borrower", "name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const libraries = await Library.find().sort({ name: 1 })

    res.render("books/index", {
      title: "Books",
      books,
      libraries,
      page,
      pages: Math.ceil(booksCount / limit),
    })
  } catch (error) {
    console.error(error)
    res.render("books/index", {
      title: "Books",
      books: [],
      libraries: [],
      page: 1,
      pages: 1,
      messages: [{ type: "danger", text: "Error fetching books" }],
    })
  }
})

// Add book page
router.get("/books/add", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login")
  }

  if (req.user.role !== "author" && req.user.role !== "admin") {
    return res.redirect("/books")
  }

  try {
    const libraries = await Library.find().sort({ name: 1 })
    res.render("books/add", { title: "Add Book", libraries })
  } catch (error) {
    console.error(error)
    res.render("books/add", {
      title: "Add Book",
      libraries: [],
      messages: [{ type: "danger", text: "Error fetching libraries" }],
    })
  }
})

// Book details page
router.get("/books/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("author", "name")
      .populate("library", "name")
      .populate("borrower", "name")

    if (!book) {
      return res.redirect("/books")
    }

    res.render("books/show", { title: book.title, book })
  } catch (error) {
    console.error(error)
    res.redirect("/books")
  }
})

// Edit book page
router.get("/books/:id/edit", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login")
  }

  try {
    const book = await Book.findById(req.params.id).populate("author", "name").populate("library", "name")

    if (!book) {
      return res.redirect("/books")
    }

    // Check if user is the author or admin
    if (book.author._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.redirect(`/books/${req.params.id}`)
    }

    const libraries = await Library.find().sort({ name: 1 })

    res.render("books/edit", { title: "Edit Book", book, libraries })
  } catch (error) {
    console.error(error)
    res.redirect("/books")
  }
})

// Libraries routes
router.get("/libraries", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = 12
    const skip = (page - 1) * limit

    const librariesCount = await Library.countDocuments()
    const libraries = await Library.find().skip(skip).limit(limit).sort({ name: 1 })

    res.render("libraries/index", {
      title: "Libraries",
      libraries,
      page,
      pages: Math.ceil(librariesCount / limit),
    })
  } catch (error) {
    console.error(error)
    res.render("libraries/index", {
      title: "Libraries",
      libraries: [],
      page: 1,
      pages: 1,
      messages: [{ type: "danger", text: "Error fetching libraries" }],
    })
  }
})

// Add library page
router.get("/libraries/add", (req, res) => {
  if (!req.user) {
    return res.redirect("/login")
  }

  res.render("libraries/add", { title: "Add Library" })
})

// Library details page
router.get("/libraries/:id", async (req, res) => {
  try {
    const library = await Library.findById(req.params.id)

    if (!library) {
      return res.redirect("/libraries")
    }

    const books = await Book.find({ library: req.params.id })
      .populate("author", "name")
      .populate("borrower", "name")
      .sort({ title: 1 })

    res.render("libraries/show", { title: library.name, library, books })
  } catch (error) {
    console.error(error)
    res.redirect("/libraries")
  }
})

// Edit library page
router.get("/libraries/:id/edit", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login")
  }

  try {
    const library = await Library.findById(req.params.id)

    if (!library) {
      return res.redirect("/libraries")
    }

    res.render("libraries/edit", { title: "Edit Library", library })
  } catch (error) {
    console.error(error)
    res.redirect("/libraries")
  }
})

// Add book to inventory page
router.get("/libraries/:id/inventory/add", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login")
  }

  if (req.user.role !== "admin") {
    return res.redirect(`/libraries/${req.params.id}`)
  }

  try {
    const library = await Library.findById(req.params.id)

    if (!library) {
      return res.redirect("/libraries")
    }

    res.render("libraries/add-to-inventory", { title: "Add to Inventory", library })
  } catch (error) {
    console.error(error)
    res.redirect("/libraries")
  }
})

// Profile page
router.get("/profile", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login")
  }

  try {
    let borrowedBooks = []
    let authoredBooks = []

    if (req.user.role === "borrower") {
      borrowedBooks = await Book.find({ borrower: req.user._id, isBorrowed: true })
        .populate("author", "name")
        .populate("library", "name")
        .sort({ borrowedAt: -1 })
    } else if (req.user.role === "author") {
      authoredBooks = await Book.find({ author: req.user._id }).populate("library", "name").sort({ createdAt: -1 })
    }

    res.render("profile", {
      title: "Profile",
      borrowedBooks,
      authoredBooks,
    })
  } catch (error) {
    console.error(error)
    res.render("profile", {
      title: "Profile",
      borrowedBooks: [],
      authoredBooks: [],
      messages: [{ type: "danger", text: "Error fetching user data" }],
    })
  }
})

// My borrowed books page
router.get("/my-books", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login")
  }

  if (req.user.role !== "borrower") {
    return res.redirect("/profile")
  }

  try {
    const borrowedBooks = await Book.find({ borrower: req.user._id, isBorrowed: true })
      .populate("author", "name")
      .populate("library", "name")
      .sort({ borrowedAt: -1 })

    res.render("my-books", {
      title: "My Borrowed Books",
      borrowedBooks,
    })
  } catch (error) {
    console.error(error)
    res.render("my-books", {
      title: "My Borrowed Books",
      borrowedBooks: [],
      messages: [{ type: "danger", text: "Error fetching borrowed books" }],
    })
  }
})

module.exports = router

