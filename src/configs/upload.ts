import { cloudinary } from './cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'banners',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      transformation: [{ width: 1280, height: 720, crop: 'limit' }, { quality: 'auto' }, { fetch_format: 'auto' }],
    };
  },
});

export const upload = multer({ storage });
