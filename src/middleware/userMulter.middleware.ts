import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    return cb(null, __dirname + '/../public/images/users');
  },
  filename: (_req, file, cb) => {
    cb(null, `${new Date().getTime() + path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage, limits: { fieldSize: 800000 } });

export default upload;
