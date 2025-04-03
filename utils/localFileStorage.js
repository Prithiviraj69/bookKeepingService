const fs = require("fs")
const path = require("path")

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../public/uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log(`Created local uploads directory: ${uploadsDir}`)
}

// Upload file to local storage
exports.uploadFile = async (file, folder = "books") => {
  try {
    console.log(`Uploading file to local storage: ${file.originalname}`)

    // Create folder if it doesn't exist
    const folderPath = path.join(uploadsDir, folder)
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true })
    }

    const fileName = `${Date.now()}-${file.originalname}`
    const filePath = path.join(folderPath, fileName)

    // Write file to disk
    fs.writeFileSync(filePath, file.buffer)

    // Return public URL
    const publicUrl = `/uploads/${folder}/${fileName}`
    console.log(`File uploaded to local storage. Public URL: ${publicUrl}`)
    return publicUrl
  } catch (error) {
    console.error("Could not upload file to local storage:", error)
    throw new Error(`Could not upload file to local storage: ${error.message}`)
  }
}

// Delete file from local storage
exports.deleteFile = async (fileUrl) => {
  try {
    // Extract the file path from the URL
    const filePath = path.join(__dirname, "../public", fileUrl)

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`File deleted from local storage: ${filePath}`)
      return true
    } else {
      console.warn(`File not found for deletion: ${filePath}`)
      return false
    }
  } catch (error) {
    console.error("Could not delete file from local storage:", error)
    throw new Error(`Could not delete file from local storage: ${error.message}`)
  }
}

