import { diskStorage } from 'multer';
import { extname, join } from 'path';

export const avatarStorage = diskStorage({
  destination: join(process.cwd(), '../uploads/avatars'),

  filename: (req, file, cb) => {
    const imageName = Date.now() + '-' + Math.floor(Math.random() * 1000);
    const ext = extname(file.originalname);

    cb(null, `avatar-${imageName}${ext}`);
  },
});

export const imageFilter = (req, file, cb) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
    cb(new Error('File Is not supported'));
  }

  return cb(null, true);
};
