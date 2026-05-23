import { diskStorage } from 'multer';
import { extname, join } from 'path';
import e from 'express';

export const avatarStorage = diskStorage({
  destination: join(process.cwd(), 'uploads/avatars'),

  filename: (req, file, cb) => {
    const imageName = Date.now() + '-' + Math.floor(Math.random() * 1000);
    const ext = extname(file.originalname);

    cb(null, `avatar-${imageName}${ext}`);
  },
});

export const productStorage = diskStorage({
  destination: join(process.cwd(), 'uploads/products'),
  filename(req: e.Request, file: Express.Multer.File, callback) {
    const productImgName = Date.now() + '-' + Math.floor(Math.random() * 1000);
    const ext = extname(file.originalname);
    callback(null, `product-${productImgName}-${ext}`);
  },
});

export const imageFilter = (req, file, cb) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
    cb(new Error('File Is not supported'));
  }

  return cb(null, true);
};
