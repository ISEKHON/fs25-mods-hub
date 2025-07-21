import multer from 'multer'
import path from 'path'
import sharp from 'sharp'
import { Client, Storage, ID } from 'node-appwrite'
import { validateFileType } from '../utils/helpers.js'

// Initialize Appwrite for file storage
const client = new Client()
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const storage = new Storage(client)

// Configure multer for different file types
const memoryStorage = multer.memoryStorage()

// File filters for different upload types
const modFileFilter = (req, file, cb) => {
  const allowedTypes = ['application/zip', 'application/x-rar-compressed']
  if (validateFileType(file.originalname, allowedTypes)) {
    cb(null, true)
  } else {
    cb(new Error('Only ZIP and RAR files are allowed for mod files'), false)
  }
}

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (validateFileType(file.originalname, allowedTypes)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false)
  }
}

// Avatar upload configuration
const uploadAvatar = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB for avatars
  },
  fileFilter: imageFileFilter
}).single('avatar')

// Process and upload avatar to Appwrite
const processAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next()
    }

    // Process image with Sharp
    const processedImage = await sharp(req.file.buffer)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer()

    // Upload to Appwrite Storage
    const file = await storage.createFile(
      'avatars', // bucket ID
      ID.unique(),
      new File([processedImage], `avatar-${Date.now()}.jpg`, {
        type: 'image/jpeg'
      })
    )

    // Add file info to request
    req.uploadedFile = {
      id: file.$id,
      url: `${process.env.APPWRITE_ENDPOINT}/storage/buckets/avatars/files/${file.$id}/view?project=${process.env.APPWRITE_PROJECT_ID}`
    }

    next()
  } catch (error) {
    console.error('Avatar processing error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to process avatar image'
    })
  }
}

// Upload configuration for mod files
const uploadModFiles = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB for mod files
    files: 10 // Max 10 files (1 mod + 1 thumbnail + 8 screenshots)
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'mod_file') {
      modFileFilter(req, file, cb)
    } else if (file.fieldname === 'thumbnail' || file.fieldname === 'screenshots') {
      imageFileFilter(req, file, cb)
    } else {
      cb(new Error('Unexpected field name'), false)
    }
  }
}).fields([
  { name: 'mod_file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
  { name: 'screenshots', maxCount: 8 }
])

// Upload configuration for images only (thumbnails, screenshots, etc.)
const uploadImages = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per image
    files: 10
  },
  fileFilter: imageFileFilter
}).array('images', 10)

// Upload configuration for single image
const uploadSingleImage = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: imageFileFilter
}).single('image')

// Process mod images and upload to Appwrite
const processModImages = async (req, res, next) => {
  try {
    if (!req.files || (!req.files.thumbnail && !req.files.screenshots)) {
      return next()
    }

    const processedImages = {}

    // Process thumbnail
    if (req.files.thumbnail && req.files.thumbnail[0]) {
      const thumbnailBuffer = await sharp(req.files.thumbnail[0].buffer)
        .resize(800, 600, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 })
        .toBuffer()

      const thumbnailFile = await storage.createFile(
        'mod-images',
        ID.unique(),
        new File([thumbnailBuffer], `thumbnail-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        })
      )

      processedImages.thumbnail = {
        id: thumbnailFile.$id,
        url: `${process.env.APPWRITE_ENDPOINT}/storage/buckets/mod-images/files/${thumbnailFile.$id}/view?project=${process.env.APPWRITE_PROJECT_ID}`
      }
    }

    // Process screenshots
    if (req.files.screenshots && req.files.screenshots.length > 0) {
      processedImages.screenshots = []

      for (const screenshot of req.files.screenshots) {
        const screenshotBuffer = await sharp(screenshot.buffer)
          .resize(1200, 800, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 85 })
          .toBuffer()

        const screenshotFile = await storage.createFile(
          'mod-images',
          ID.unique(),
          new File([screenshotBuffer], `screenshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`, {
            type: 'image/jpeg'
          })
        )

        processedImages.screenshots.push({
          id: screenshotFile.$id,
          url: `${process.env.APPWRITE_ENDPOINT}/storage/buckets/mod-images/files/${screenshotFile.$id}/view?project=${process.env.APPWRITE_PROJECT_ID}`
        })
      }
    }

    req.uploadedImages = processedImages
    next()
  } catch (error) {
    console.error('Mod images processing error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to process mod images'
    })
  }
}

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 500MB for mod files and 10MB for images.'
      })
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 1 mod file, 1 thumbnail, and 8 screenshots.'
      })
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      })
    }
  }
  
  if (error.message) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
  
  next(error)
}

export { uploadModFiles, uploadImages, uploadSingleImage, uploadAvatar, processAvatar, processModImages, handleUploadError }
