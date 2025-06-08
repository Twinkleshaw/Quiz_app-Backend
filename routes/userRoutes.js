import express from "express";
import UserController from "../controllers/UserController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js"; 

const router = express.Router();

router.use(authMiddleware);

router.get("/profile", UserController.getProfile);
router.put("/profile", UserController.updateProfile);
router.post(
  "/profile/picture",
  upload.single("profilePicture"), 
  UserController.uploadProfilePicture
);

export default router;
