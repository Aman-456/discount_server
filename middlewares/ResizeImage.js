const sharp = require("sharp");
const fs = require("fs");
exports.ResizeImage = async (req, res, next) => {
  try {
    if (!req.body.image) next()
    console.log(req.file);
    console.log(req.body.image.split("/")[2]);
    console.log(req.file.filename);

    // console.log("fields" + JSON.stringify(req.files.image[0].path));
    // console.log("fieldsCover" + req.files.imageCover[0]);
    const filepath = req.file.path;
    const filename = req.body.image.split("/")[2];
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
      next();
    } else {
      res.json({ type: "failure", result: "Server not responding. Try Again" });
    }
  } catch (error) {
    console.log("Resize Error :", error);
  }
};
