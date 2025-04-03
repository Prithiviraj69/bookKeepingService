const cloudinary = require("cloudinary").v2
const { Readable } = require("stream")

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Helper function to convert buffer to stream
const bufferToStream = (buffer) => {
  const readable = new Readable({
    read() {
      this.push(buffer)
      this.push(null)
    },
  })
  return readable
}

// Upload file to Cloudinary
exports.uploadFile = async (file, folder = "books") => {
  try {
    console.log(`Attempting to upload file: ${file.originalname} to Cloudinary folder: ${folder}`)

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: "auto",
          public_id: `${Date.now()}-${file.originalname.split(".")[0]}`, // Remove file extension
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error)
            reject(error)
          } else {
            console.log(`File uploaded successfully to Cloudinary. URL: ${result.secure_url}`)
            resolve(result.secure_url)
          }
        },
      )

      bufferToStream(file.buffer).pipe(uploadStream)
    })
  } catch (error) {
    console.error("Could not upload file to Cloudinary:", error)
    throw new Error(`Cloudinary upload failed: ${error.message}`)
  }
}

// Delete file from Cloudinary
exports.deleteFile = async (fileUrl) => {
  try {
    // Extract the public_id from the URL
    // Cloudinary URLs look like: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
    const urlParts = fileUrl.split("/")
    const publicIdWithExtension = urlParts[urlParts.length - 1]
    const publicIdParts = publicIdWithExtension.split(".")

    // Remove the file extension
    publicIdParts.pop()

    // Get the folder path and public ID
    const folderIndex = urlParts.indexOf("upload") + 1
    const folderAndPublicId = urlParts.slice(folderIndex).join("/")

    // Remove file extension from the path
    const publicId = folderAndPublicId.substring(0, folderAndPublicId.lastIndexOf("."))

    console.log(`Attempting to delete file with public_id: ${publicId}`)

    const result = await cloudinary.uploader.destroy(publicId)

    if (result.result === "ok") {
      console.log("File deleted successfully from Cloudinary")
      return true
    } else {
      console.error("Cloudinary delete error:", result)
      return false
    }
  } catch (error) {
    console.error("Could not delete file from Cloudinary:", error)
    throw new Error(`Cloudinary delete failed: ${error.message}`)
  }
}

