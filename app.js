const express = require("express")
const dotenv = require("dotenv")
const morgan = require("morgan")
const colors = require("colors")
const cookieParser = require("cookie-parser")
const path = require("path")
const fs = require("fs")
const connectDB = require("./config/db")
const errorHandler = require("./middleware/error")
const expressLayouts = require("express-ejs-layouts")

// Load env vars
dotenv.config()

// Connect to database
connectDB()

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "public/uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log(`Created uploads directory: ${uploadsDir}`)
}

// Ensure uploads/books directory exists
const booksUploadsDir = path.join(uploadsDir, "books")
if (!fs.existsSync(booksUploadsDir)) {
  fs.mkdirSync(booksUploadsDir, { recursive: true })
  console.log(`Created books uploads directory: ${booksUploadsDir}`)
}

// Route files
const auth = require("./routes/auth")
const books = require("./routes/books")
const borrowing = require("./routes/borrowing")
const libraries = require("./routes/libraries")
const webRoutes = require("./routes/web")

const app = express()

// Body parser
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Cookie parser
app.use(cookieParser())

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

// Set static folder
app.use(express.static(path.join(__dirname, "public")))

// Set up EJS and layouts
app.use(expressLayouts)
app.set("view engine", "ejs")
app.set("layout", "layouts/main")
app.set("layout extractScripts", true)
app.set("layout extractStyles", true)

// Mount routers
app.use("/api/users", auth)
app.use("/api/books", books)
app.use("/api", borrowing)
app.use("/api/libraries", libraries)
app.use("/", webRoutes)

// Error handler
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold),
)

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red)
  // Close server & exit process
  server.close(() => process.exit(1))
})

