import multer from 'multer';
import path from 'path';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const path = __dirname + '/../public/images/posts';
    return cb(null, path);
  },
  filename: (req, file, cb) => {
    cb(null, `${new Date().getTime() + path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage: storage,
  limits: { fieldSize: 800000 },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(null, false);
    const err = new Error('Only .png, .jpg and .jpeg format allowed!');
    err.name = 'ExtensionError';
    return cb(err);
  },
});
export default upload;
