const multer = require('multer');

const storage = multer.memoryStorage(); // Use memory storage

const upload = multer({ storage: storage });

module.exports = { upload };