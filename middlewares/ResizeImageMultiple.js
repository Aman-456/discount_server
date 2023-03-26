const sharp = require("sharp");
const fs = require("fs");
exports.ResizeImageMultiple = async (req, res, next) => {
  try {
    console.log(req.files);

    console.log(req.body.image.split("/")[2]);

    // console.log("fields" + JSON.stringify(req.files.image[0].path));
    // console.log("fieldsCover" + req.files.imageCover[0]);
    if (req.files.image) {
      const filepath = req.files.image[0].path;
      const filename = req.files.image[0].originalname;
      const newPath = "assets/resized_" + filename;
      const process = await sharp(filepath)
        .resize(250, 200, {
          kernel: sharp.kernel.nearest,
          fit: "contain",
        })
        .toFile(newPath);
      sharp.cache({ files: 0 });
      if (process) {
        fs.unlinkSync(filepath);
        fs.renameSync(newPath, filepath);
      } else {
        res.json({
          type: "failure",
          result: "Server not responding. Try Again",
        });
      }
    }
    next();
  } catch (error) {
    console.log("Resize Error :", error);
  }
};
