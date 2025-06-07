import express from "express";
import AuthController from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", AuthController.signup);
router.get("/verify-email/:token", AuthController.verifyEmail);
router.post("/login", AuthController.login);

export default router;
