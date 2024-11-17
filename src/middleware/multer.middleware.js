const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

//filter image cheching whether user uploaded image or not
// const checkFilterImage = (req, file, cb) => {
//   if (file.mimetype.startWith("avatar")) {
//     cb(null, true);
//   } else {
//     cb(new Error("Not an image! upload only images"));
//   }
// };

const upload = multer({
  storage,
  //   fileFilter: checkFilterImage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5mb file size limit
  },
});
module.exports = upload;
