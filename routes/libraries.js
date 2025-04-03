const express = require("express")
const multer = require("multer")
const {
  getLibraries,
  getLibrary,
  createLibrary,
  updateLibrary,
  deleteLibrary,
  getLibraryInventory,
  addBookToInventory,
  removeBookFromInventory,
} = require("../controllers/libraries")

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

router.route("/").get(protect, getLibraries).post(protect, createLibrary)

router.route("/:id").get(protect, getLibrary).put(protect, updateLibrary).delete(protect, deleteLibrary)

router
  .route("/:id/inventory")
  .get(protect, getLibraryInventory)
  .post(protect, upload.single("image"), addBookToInventory)

router.route("/:id/inventory/:bookId").delete(protect, removeBookFromInventory)

module.exports = router

