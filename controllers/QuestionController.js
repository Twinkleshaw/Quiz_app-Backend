import fs from "fs";
import QuestionService from "../services/questionService.js";

class QuestionController {
  static async addQuestion(req, res) {
    try {
      const question = await QuestionService.addQuestion(req.body, req.user);
      res.status(201).json({
        success: true,
        data: question,
        message: "Question added successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async bulkAddQuestions(req, res) {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No CSV file uploaded",
      });
    }
    try {
      // Explicitly pass the user object from the request
      const results = await QuestionService.addQuestionsFromCSV(
        req.file.path,
        req.user // ← Ensure this is passed
      );

      // Clean up the uploaded file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting CSV file:", err);
      });

      res.json({
        success: true,
        data: results,
        message: "Questions processed (some may have failed)",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async submitAnswer(req, res) {
    try {
      const result = await QuestionService.submitAnswer(
        req.user.id,
        req.params.questionId,
        req.body.selectedOptionId,
        req.body.timezone
      );
      res.json({
        success: true,
        data: result,
        message: "Answer submitted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async searchQuestionsWithAnswers(req, res) {
    try {
      const questions = await QuestionService.searchQuestionsWithAnswers(
        req.user.id,
        req.query.q,
        req.query.timezone
      );
      res.json({
        success: true,
        data: questions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default QuestionController;
