import { cloudinary } from './cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'banners',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      transformation: [{ width: 1280, height: 720, crop: 'limit' }, { quality: 'auto' }, { fetch_format: 'auto' }],
    };
  },
});

const memoryStorage = multer.memoryStorage();

// Uploader para banners de projeto (Cloudinary)
export const uploadBanner = multer({ storage: cloudinaryStorage });

// Uploader para anexos de tarefa (salvar localmente via service)
export const uploadAttachment = multer({ storage: memoryStorage });
