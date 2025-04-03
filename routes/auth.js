const express = require("express")
const { register, login, updateLanguage } = require("../controllers/auth")
const { protect } = require("../middleware/auth")

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.put("/language", protect, updateLanguage)

module.exports = router

