const multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/items')
    },
    filename: function (req, file, cb) {
        var filename = Date.now() + '-' + file.originalname;
        req.body.image = "assets/items/" + filename;
        cb(null, filename);
    }
});

exports.upload = multer({ storage: storage });