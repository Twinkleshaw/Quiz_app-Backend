import express from "express";
import QuestionController from "../controllers/QuestionController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.use(authMiddleware);

router.post("/", QuestionController.addQuestion);
router.post(
  "/bulk",
  upload.single("file"),
  QuestionController.bulkAddQuestions
);
router.post("/:questionId/answer", QuestionController.submitAnswer);
router.get("/search", QuestionController.searchQuestionsWithAnswers);

export default router;
