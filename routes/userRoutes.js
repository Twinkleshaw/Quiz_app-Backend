import express from "express";
import UserController from "../controllers/UserController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/profile", UserController.getProfile);
router.put("/profile", UserController.updateProfile);
router.post("/profile/picture", UserController.uploadProfilePicture);

export default router;
