import path from 'path';
import * as fs from 'fs';

export const uploadFile = async (file: Express.Multer.File): Promise<string> => {
  try {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    file.originalname = file.originalname.replace(/\s/g, '_');

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    const fileUrl = `${fileName}`;

    return fileUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return '';
  }
};

export const deleteFile = async (url: string): Promise<boolean> => {
  try {
    const fileName = path.basename(url);
    const fullPath = path.join(process.cwd(), 'uploads', fileName);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error removing file:', error);
    return false;
  }
};
