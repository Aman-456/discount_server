const multer = require('multer');
const fs = require('fs');

const destination = 'assets/vendor';

// Create destination directory if it doesn't exist
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
        if (!file) {
            cb(null, ''); // Ignore the image upload if no file is sent
        }
        else {
            var filename = Date.now() + '-' + file.originalname;
            req.body.image = "assets/vendor/" + filename;
            cb(null, filename);
        }
    }
});

exports.upload = multer({ storage: storage });
