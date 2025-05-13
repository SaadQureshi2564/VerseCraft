const multer = require('multer');
const path = require('path');

// Setting up the storage for the uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './server/uploads'); // Directory to store uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Save with unique timestamp
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
