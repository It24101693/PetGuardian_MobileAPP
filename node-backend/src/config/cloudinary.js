const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Check if Cloudinary is configured with real keys
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'your_cloudinary_api_key';

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.log('⚠️  Cloudinary not configured. Falling back to local storage.');
}

// Storage configurations
let petImageStorage, scanImageStorage, profileImageStorage, communityImageStorage;

if (isCloudinaryConfigured) {
  petImageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'petguardian/pets',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
    },
  });

  scanImageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'petguardian/scans',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1024, height: 1024, crop: 'limit', quality: 'auto' }],
    },
  });

  profileImageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'petguardian/profiles',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }],
    },
  });

  communityImageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'petguardian/community',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [{ width: 1080, crop: 'limit', quality: 'auto' }],
    },
  });
} else {
  // Local Disk Storage
  const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '../../public/uploads');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });

  petImageStorage = localStorage;
  scanImageStorage = localStorage;
  profileImageStorage = localStorage;
  communityImageStorage = localStorage;
}

const uploadPetImage = multer({
  storage: petImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadScanImage = multer({
  storage: scanImageStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: { fileSize: 3 * 1024 * 1024 },
});

const uploadCommunityImage = multer({
  storage: communityImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadPetImage,
  uploadScanImage,
  uploadProfileImage,
  uploadCommunityImage,
};
