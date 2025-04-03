const express = require("express")
const { borrowBook, returnBook } = require("../controllers/borrowing")

const router = express.Router()

const { protect, authorize } = require("../middleware/auth")

router.post("/borrow", protect, authorize("borrower", "admin"), borrowBook)
router.put("/return/:id", protect, returnBook)

module.exports = router

