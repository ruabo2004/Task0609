// File upload middleware using multer
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { ErrorFactory } = require("../utils/errors");

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads");
const roomImagesDir = path.join(uploadsDir, "rooms");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(roomImagesDir)) {
  fs.mkdirSync(roomImagesDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine destination based on upload type
    const uploadType = req.body.uploadType || req.query.uploadType || "rooms";

    let destPath = roomImagesDir;

    if (uploadType === "profile") {
      destPath = path.join(uploadsDir, "profiles");
    } else if (uploadType === "services") {
      destPath = path.join(uploadsDir, "services");
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }

    cb(null, destPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const sanitizedBasename = basename.replace(/[^a-zA-Z0-9]/g, "-");
    cb(null, `${sanitizedBasename}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types - check extension and mimetype
  const allowedExtensions = /\.(jpeg|jpg|png|gif|webp)$/i;
  const allowedMimetypes = /^image\/(jpeg|jpg|png|gif|webp)$/i;

  const extname = allowedExtensions.test(file.originalname.toLowerCase());
  const mimetype = allowedMimetypes.test(file.mimetype.toLowerCase());

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(
      ErrorFactory.validation(
        "Only image files are allowed (jpeg, jpg, png, gif, webp)"
      ),
      false
    );
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter,
});

// Middleware for single file upload
const uploadSingle = (fieldName = "image") => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(ErrorFactory.validation("File size exceeds 5MB limit"));
        }
        return next(ErrorFactory.validation(`Upload error: ${err.message}`));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

// Middleware for multiple files upload
const uploadMultiple = (fieldName = "images", maxCount = 10) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(ErrorFactory.validation("File size exceeds 5MB limit"));
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return next(
            ErrorFactory.validation(`Maximum ${maxCount} files allowed`)
          );
        }
        return next(ErrorFactory.validation(`Upload error: ${err.message}`));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

// Middleware for multiple fields
const uploadFields = (fields) => {
  return (req, res, next) => {
    upload.fields(fields)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(ErrorFactory.validation("File size exceeds 5MB limit"));
        }
        return next(ErrorFactory.validation(`Upload error: ${err.message}`));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

// Helper function to delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};

// Helper function to get file URL
const getFileUrl = (req, filename, uploadType = "rooms") => {
  if (!filename) return null;
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/uploads/${uploadType}/${filename}`;
};

// Alias for backward compatibility with existing routes
const uploadUserAvatar = uploadSingle("avatar");
const uploadRoomImages = uploadMultiple("images", 10);

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  deleteFile,
  getFileUrl,
  // Backward compatibility exports
  uploadUserAvatar,
  uploadRoomImages,
};
