// cloudinaryUpload.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file (image or video) to Cloudinary.
 * @param {string} filePath - Local path to the file.
 * @param {'image'|'video'} resourceType - Type of resource.
 * @returns {Promise<object>} - Cloudinary upload response.
 */
export function uploadToCloudinary(filePath, resourceType = 'image') {
  return cloudinary.uploader.upload(filePath, {
    resource_type: resourceType,
    folder: 'uploads', // Optional
  });
}
