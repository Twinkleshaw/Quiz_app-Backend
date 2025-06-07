import UserService from "../services/userService.js";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profile-pictures/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user-${req.user.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single("profilePicture");

class UserController {
  static async getProfile(req, res) {
    try {
      const user = await UserService.getUserProfile(req.user.id);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async updateProfile(req, res) {
    try {
      const user = await UserService.updateUserProfile(req.user.id, req.body);
      res.json({
        success: true,
        data: user,
        message: "Profile updated successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async uploadProfilePicture(req, res) {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      try {
        const filePath = `/profile-pictures/${req.file.filename}`;
        const user = await UserService.updateProfilePicture(
          req.user.id,
          filePath
        );

        res.json({
          success: true,
          data: user,
          message: "Profile picture updated successfully",
        });
      } catch (error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    });
  }
}

export default UserController;
