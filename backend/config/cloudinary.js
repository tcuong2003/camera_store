const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

const isCloudinaryConfigured = () => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  if (!name || !key || !secret) return false;
  if (
    name.includes('your_') ||
    key.includes('your_') ||
    secret.includes('your_') ||
    name.trim() === '' ||
    key.trim() === '' ||
    secret.trim() === ''
  ) {
    return false;
  }
  return true;
};

module.exports = { cloudinary, isCloudinaryConfigured };
