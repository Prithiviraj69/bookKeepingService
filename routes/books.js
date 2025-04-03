const express = require("express")
const multer = require("multer")
const { getBooks, getBook, createBook, updateBook, deleteBook } = require("../controllers/books")

const router = express.Router()

const { protect, authorize } = require("../middleware/auth")

// Set up multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed!"), false)
    }
  },
})

router.route("/").get(protect, getBooks).post(protect, authorize("author", "admin"), upload.single("image"), createBook)

router
  .route("/:id")
  .get(protect, getBook)
  .put(protect, authorize("author", "admin"), upload.single("image"), updateBook)
  .delete(protect, authorize("author", "admin"), deleteBook)

module.exports = router

