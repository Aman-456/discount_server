const multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/vendors/' + req.query.vendorId)
    },
    filename: function (req, file, cb) {
        var filename = Date.now() + '-' + file.originalname;
        req.body[file.fieldname] = 'assets/vendors/' + req.query.vendorId + '/' + filename;
        if (req.body.newFiles) {
            req.body.newFiles.push(file.fieldname);
        } else {
            req.body.newFiles = [];
            req.body.newFiles.push(file.fieldname);
        }
        cb(null, filename);
    }
});

exports.upload = multer({ storage: storage }).fields([
    { name: "image" },
    { name: "banner" },
    { name: "publicLiability" },
    { name: "employerLiability" },
    { name: "riskAssesments" },
    { name: "fhiCertificate" },
    { name: "gasSafetyCertificate" },
    { name: "NVQ" },
    { name: "businessRegistration" },
    { name: "fireBlanket" }
]);