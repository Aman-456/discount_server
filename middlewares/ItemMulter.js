const multer = require('multer');
const fs = require('fs');

const destination = 'assets/items';

if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
} 

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file) {
            cb(null, destination);
        } else {
            cb(null, ''); // Ignore the image upload if no file is sent
        }
    },
    filename: function (req, file, cb) {
        if (file) {
            var filename = Date.now() + '-' + file.originalname;
            req.body.image = "assets/items/" + filename;
            cb(null, filename);
        } else {
            cb(null, ''); // Ignore the image upload if no file is sent
        }
    }
});

exports.upload = multer({ storage: storage });
