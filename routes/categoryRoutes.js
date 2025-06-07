import express from "express";
import CategoryController from "../controllers/CategoryController.js";

const router = express.Router();

router.get("/", CategoryController.getAllCategories);
router.get("/with-count", CategoryController.getCategoriesWithCount);
router.get("/:categoryId/questions", CategoryController.getQuestionsByCategory);
router.post("/", CategoryController.createCategory);

export default router;
